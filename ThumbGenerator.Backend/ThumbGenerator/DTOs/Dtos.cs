namespace ThumbGenerator.DTOs;

// Auth DTOs
public record RegisterRequest(string Name, string Email, string Password);

public record LoginRequest(string Email, string Password);

public record AuthResponse(string Token, UserDto User);

public record UserDto(Guid Id, string Name, string Email, int Credits, DateTime CreatedAt);

// Thumbnail DTOs
public record GenerateThumbnailResponse(Guid Id, string ImageUrl, int CreditsRemaining);

public record ThumbnailHistoryItem(Guid Id, string TemplateId, string? Title, string ImageUrl, DateTime CreatedAt);
