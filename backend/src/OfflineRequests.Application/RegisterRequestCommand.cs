namespace OfflineRequests.Application;

public record RegisterRequestCommand(
    Guid Id,
    string Name,
    string Payload,
    DateTime CreatedAt
);
