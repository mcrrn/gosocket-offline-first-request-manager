using OfflineRequests.Application;
using OfflineRequests.Domain;

namespace OfflineRequests.Application.Tests;

public class RegisterRequestTests
{
    [Fact]
    public async Task Register_new_request_should_add_it_to_repository()
    {
        var repository = new FakeRequestRepository();
        var handler = new RegisterRequestHandler(repository);

        var command = new RegisterRequestCommand(
            Guid.NewGuid(),
            "My request",
            "hello",
            DateTime.UtcNow
        );

        await handler.Handle(command);

        Assert.Single(repository.Requests);
    }
}
