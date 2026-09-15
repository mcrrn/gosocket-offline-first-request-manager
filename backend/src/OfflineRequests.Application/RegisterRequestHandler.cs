using OfflineRequests.Domain;

namespace OfflineRequests.Application;

public class RegisterRequestHandler
{
    private readonly IRequestRepository _repository;

    public RegisterRequestHandler(IRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<RegisterRequestResult> Handle(
        RegisterRequestCommand command)
    {
        RegisterRequestValidator.Validate(command);

        var request = new Request(
            command.Id,
            command.Name,
            command.Payload,
            command.CreatedAt.ToUniversalTime()
        );

        var existing = await _repository.GetByIdAsync(command.Id);

        if (existing is not null)
        {
            if (existing.HasSameContentAs(request))
                return RegisterRequestResult.AlreadyRegistered;

            throw new RequestConflictException(command.Id);
        }

        await _repository.AddAsync(request);

        return RegisterRequestResult.Registered;
    }
}
