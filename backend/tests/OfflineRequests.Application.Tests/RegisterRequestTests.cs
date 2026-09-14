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

    [Fact]
    public async Task Register_same_request_twice_should_not_duplicate_it()
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
        await handler.Handle(command);

        Assert.Single(repository.Requests);
    }

    [Fact]
    public async Task Register_same_id_with_different_content_should_fail()
    {
        var repository = new FakeRequestRepository();
        var handler = new RegisterRequestHandler(repository);

        var id = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;

        var first = new RegisterRequestCommand(
            id,
            "My request",
            "hello",
            createdAt
        );

        var second = new RegisterRequestCommand(
            id,
            "My request",
            "different payload",
            createdAt
        );

        await handler.Handle(first);

        await Assert.ThrowsAsync<RequestConflictException>(
            () => handler.Handle(second)
        );
    }
}
