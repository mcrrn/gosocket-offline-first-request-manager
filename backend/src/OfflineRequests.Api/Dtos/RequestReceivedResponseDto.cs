namespace OfflineRequests.Api.Dtos;

public record RequestReceivedResponseDto(
    Guid Id,
    bool Received
);
