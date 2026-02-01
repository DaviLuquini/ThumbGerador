using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThumbGenerator.Data;
using ThumbGenerator.Domain.Entities;
using ThumbGenerator.DTOs;
using ThumbGenerator.Services;

namespace ThumbGenerator.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ThumbnailController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAiImageService _aiImageService;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ThumbnailController> _logger;

    public ThumbnailController(
        AppDbContext context,
        IAiImageService aiImageService,
        IWebHostEnvironment environment,
        ILogger<ThumbnailController> logger)
    {
        _context = context;
        _aiImageService = aiImageService;
        _environment = environment;
        _logger = logger;
    }

    /// <summary>
    /// Generate a thumbnail using AI
    /// </summary>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(GenerateThumbnailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    public async Task<ActionResult<GenerateThumbnailResponse>> Generate([FromForm] GenerateThumbnailRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId.Value);
        if (user == null)
        {
            return Unauthorized();
        }

        if (user.Credits < 1)
        {
            return StatusCode(StatusCodes.Status402PaymentRequired, new { error = "Insufficient credits" });
        }

        try
        {
            byte[] generatedImage;

            if (request.TemplateId == "prompt" && !string.IsNullOrWhiteSpace(request.Prompt))
            {
                // Generate image from prompt
                generatedImage = await _aiImageService.GenerateImageFromPromptAsync(request.Prompt);
            }
            else if (request.EnhanceWithAi && (request.VideoImage != null || request.PersonImage != null))
            {
                // Enhance existing images
                var imageToEnhance = request.VideoImage ?? request.PersonImage;
                using var ms = new MemoryStream();
                await imageToEnhance!.CopyToAsync(ms);
                var sourceBytes = ms.ToArray();

                var enhancePrompt = $"Create a professional YouTube thumbnail with title: {request.Title ?? "No title"}";
                generatedImage = await _aiImageService.EnhanceImageAsync(sourceBytes, enhancePrompt);
            }
            else
            {
                return BadRequest(new { error = "Please provide a prompt or images to generate a thumbnail" });
            }

            // Save image locally
            var imagePath = await SaveImageLocallyAsync(generatedImage, userId.Value);
            var imageUrl = $"/generated/{userId}/{Path.GetFileName(imagePath)}";

            // Create generation record
            var generation = new ThumbnailGeneration
            {
                Id = Guid.NewGuid(),
                UserId = userId.Value,
                TemplateId = request.TemplateId,
                Prompt = request.Prompt,
                Title = request.Title,
                EnhancedWithAi = request.EnhanceWithAi,
                GeneratedImagePath = imagePath,
                CreatedAt = DateTime.UtcNow
            };

            _context.ThumbnailGenerations.Add(generation);

            // Deduct credit
            user.Credits -= 1;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new GenerateThumbnailResponse(generation.Id, imageUrl, user.Credits));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate thumbnail");
            return StatusCode(500, new { error = "Failed to generate thumbnail. Please try again." });
        }
    }

    /// <summary>
    /// Get generation history for current user
    /// </summary>
    [HttpGet("history")]
    [ProducesResponseType(typeof(List<ThumbnailHistoryItem>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ThumbnailHistoryItem>>> GetHistory()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var generations = await _context.ThumbnailGenerations
            .Where(g => g.UserId == userId.Value)
            .OrderByDescending(g => g.CreatedAt)
            .Take(50)
            .Select(g => new ThumbnailHistoryItem(
                g.Id,
                g.TemplateId,
                g.Title,
                $"/generated/{userId}/{Path.GetFileName(g.GeneratedImagePath)}",
                g.CreatedAt
            ))
            .ToListAsync();

        return Ok(generations);
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }

    private async Task<string> SaveImageLocallyAsync(byte[] imageData, Guid userId)
    {
        var uploadsFolder = Path.Combine(_environment.ContentRootPath, "generated", userId.ToString());
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}.png";
        var filePath = Path.Combine(uploadsFolder, fileName);

        await System.IO.File.WriteAllBytesAsync(filePath, imageData);

        return filePath;
    }
}

public class GenerateThumbnailRequest
{
    public string TemplateId { get; set; } = "faixa-vermelha";
    public IFormFile? VideoImage { get; set; }
    public IFormFile? PersonImage { get; set; }
    public string? Title { get; set; }
    public string? Prompt { get; set; }
    public bool EnhanceWithAi { get; set; }
}
