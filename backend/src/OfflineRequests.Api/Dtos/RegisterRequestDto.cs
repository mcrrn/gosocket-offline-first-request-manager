namespace OfflineRequests.Api.Dtos;

public record RegisterRequestDto(
    Guid Id,
    string Name,
    string Payload,
    DateTime CreatedAt
);
