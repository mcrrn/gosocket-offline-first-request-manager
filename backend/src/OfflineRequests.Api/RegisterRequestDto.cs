namespace OfflineRequests.Api;

public record RegisterRequestDto(
    Guid Id,
    string Name,
    string Payload,
    DateTime CreatedAt
);