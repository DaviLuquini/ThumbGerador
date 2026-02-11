namespace ThumbGenerator.API.DTOs
{
    public record GenerateThumbnailResponse(Guid Id, string ImageUrl, int CreditsRemaining);

    public record ThumbnailHistoryItem(Guid Id, string TemplateId, string? Title, string ImageUrl, DateTime CreatedAt);
}