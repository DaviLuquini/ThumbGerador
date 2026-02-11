namespace ThumbGenerator.Services;

public interface IAiImageService
{
    Task<byte[]> GenerateImageFromPromptAsync(string prompt);
    Task<byte[]> EnhanceImageAsync(byte[] sourceImage, string enhancementPrompt);
}
