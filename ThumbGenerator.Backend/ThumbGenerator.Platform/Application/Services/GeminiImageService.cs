using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ThumbGenerator.Services;

/// <summary>
/// Gemini AI Image Service using direct HTTP calls to the Gemini API
/// Uses gemini-2.0-flash-exp model which supports image generation
/// </summary>
public class GeminiImageService : IAiImageService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GeminiImageService> _logger;
    private readonly string? _apiKey;
    private const string BaseUrl = "https://generativelanguage.googleapis.com/v1beta";
    private const string Model = "gemini-2.0-flash-exp";

    public GeminiImageService(IConfiguration configuration, ILogger<GeminiImageService> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient("GeminiApi");
        _apiKey = configuration["AiProvider:GeminiApiKey"];

        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("Gemini API key not configured. Set 'AiProvider:GeminiApiKey' in appsettings.json");
        }
    }

    public async Task<byte[]> GenerateImageFromPromptAsync(string prompt)
    {
        ValidateApiKey();

        var thumbnailPrompt = $"""
            Generate a professional YouTube thumbnail image based on this description:
            {prompt}
            
            Requirements:
            - Vibrant, eye-catching colors
            - High contrast and bold visuals
            - Professional quality suitable for YouTube
            - 16:9 aspect ratio (1280x720 or similar)
            """;

        _logger.LogInformation("Generating image with Gemini. Prompt: {Prompt}", prompt[..Math.Min(100, prompt.Length)]);

        var requestBody = new GeminiRequest
        {
            Contents = new[]
            {
                new GeminiContent
                {
                    Parts = new object[]
                    {
                        new GeminiTextPart { Text = thumbnailPrompt }
                    }
                }
            },
            GenerationConfig = new GeminiGenerationConfig
            {
                ResponseMimeType = "image/png"
            }
        };

        var imageBytes = await SendGeminiRequestAsync(requestBody);
        return imageBytes;
    }

    public async Task<byte[]> EnhanceImageAsync(byte[] sourceImage, string enhancementPrompt)
    {
        ValidateApiKey();

        var base64Image = Convert.ToBase64String(sourceImage);

        var prompt = $"""
            Enhance and improve this image for use as a YouTube thumbnail.
            Instructions: {enhancementPrompt}
            
            Requirements:
            - Make it more vibrant and eye-catching
            - Increase visual impact
            - Maintain the original composition
            - Professional quality output
            """;

        _logger.LogInformation("Enhancing image with Gemini. Prompt: {Prompt}", enhancementPrompt[..Math.Min(100, enhancementPrompt.Length)]);

        var requestBody = new GeminiRequest
        {
            Contents = new[]
            {
                new GeminiContent
                {
                    Parts = new object[]
                    {
                        new GeminiTextPart { Text = prompt },
                        new GeminiInlineDataPart
                        {
                            InlineData = new GeminiBlob
                            {
                                MimeType = "image/png",
                                Data = base64Image
                            }
                        }
                    }
                }
            },
            GenerationConfig = new GeminiGenerationConfig
            {
                ResponseMimeType = "image/png"
            }
        };

        try
        {
            var imageBytes = await SendGeminiRequestAsync(requestBody);
            return imageBytes;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Image enhancement failed, returning original image");
            return sourceImage;
        }
    }

    private async Task<byte[]> SendGeminiRequestAsync(GeminiRequest request)
    {
        var url = $"{BaseUrl}/models/{Model}:generateContent?key={_apiKey}";

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var jsonContent = JsonSerializer.Serialize(request, jsonOptions);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        _logger.LogDebug("Sending request to Gemini API: {Url}", url.Replace(_apiKey!, "[REDACTED]"));

        var response = await _httpClient.PostAsync(url, content);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Gemini API error: {StatusCode} - {Response}", response.StatusCode, responseBody);
            throw new HttpRequestException($"Gemini API returned {response.StatusCode}: {responseBody}");
        }

        // Parse the response
        var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseBody, jsonOptions);

        if (geminiResponse?.Candidates == null || geminiResponse.Candidates.Length == 0)
        {
            throw new InvalidOperationException("Gemini API returned no candidates");
        }

        // Look for image data in the response
        foreach (var candidate in geminiResponse.Candidates)
        {
            if (candidate?.Content?.Parts == null) continue;

            foreach (var part in candidate.Content.Parts)
            {
                if (part.InlineData?.Data != null && 
                    part.InlineData.MimeType?.StartsWith("image/") == true)
                {
                    _logger.LogInformation("Successfully received image from Gemini API");
                    return Convert.FromBase64String(part.InlineData.Data);
                }
            }
        }

        // If no image found, check if there's text (error message)
        var textResponse = geminiResponse.Candidates[0]?.Content?.Parts?
            .FirstOrDefault(p => p.Text != null)?.Text;

        throw new InvalidOperationException(
            $"Gemini API did not return an image. Response: {textResponse ?? "No response text"}");
    }

    private void ValidateApiKey()
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new InvalidOperationException(
                "Gemini API key not configured. Add to appsettings.json: " +
                "\"AiProvider\": { \"GeminiApiKey\": \"your-key\" }");
        }
    }
}

#region Gemini API DTOs

public class GeminiRequest
{
    public GeminiContent[] Contents { get; set; } = Array.Empty<GeminiContent>();
    public GeminiGenerationConfig? GenerationConfig { get; set; }
}

public class GeminiContent
{
    public object[] Parts { get; set; } = Array.Empty<object>();
    public string? Role { get; set; }
}

public class GeminiTextPart
{
    public string Text { get; set; } = string.Empty;
}

public class GeminiInlineDataPart
{
    public GeminiBlob InlineData { get; set; } = new();
}

public class GeminiBlob
{
    public string MimeType { get; set; } = string.Empty;
    public string Data { get; set; } = string.Empty;
}

public class GeminiGenerationConfig
{
    public string? ResponseMimeType { get; set; }
    public int? MaxOutputTokens { get; set; }
}

public class GeminiResponse
{
    public GeminiCandidate[]? Candidates { get; set; }
}

public class GeminiCandidate
{
    public GeminiResponseContent? Content { get; set; }
}

public class GeminiResponseContent
{
    public GeminiResponsePart[]? Parts { get; set; }
}

public class GeminiResponsePart
{
    public string? Text { get; set; }
    public GeminiBlob? InlineData { get; set; }
}

#endregion
