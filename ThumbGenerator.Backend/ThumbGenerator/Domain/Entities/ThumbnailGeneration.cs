namespace ThumbGenerator.Domain.Entities;

public class ThumbnailGeneration
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string TemplateId { get; set; } = string.Empty; // "faixa-vermelha" or "prompt"
    public string? Prompt { get; set; }
    public string? Title { get; set; }
    public bool EnhancedWithAi { get; set; }
    public string GeneratedImagePath { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
