using OfflineRequests.Domain;

namespace OfflineRequests.Application;

public class RegisterRequestHandler
{
    private readonly IRequestRepository _repository;

    public RegisterRequestHandler(IRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(RegisterRequestCommand command)
    {
        var request = new Request(
            command.Id,
            command.Name,
            command.Payload,
            command.CreatedAt
        );

        var existing = await _repository.GetByIdAsync(command.Id);

        if (existing is not null)
        {
            if (existing.HasSameContentAs(request))
                return;

            throw new RequestConflictException(command.Id);
        }

        await _repository.AddAsync(request);
    }
}