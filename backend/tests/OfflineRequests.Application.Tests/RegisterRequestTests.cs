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

    [Fact]
    public async Task Register_new_request_should_return_registered()
    {
        var repository = new FakeRequestRepository();
        var handler = new RegisterRequestHandler(repository);

        var command = new RegisterRequestCommand(
            Guid.NewGuid(),
            "My request",
            "hello",
            DateTime.UtcNow
        );

        var result = await handler.Handle(command);

        Assert.Equal(RegisterRequestResult.Registered, result);
    }

    [Fact]
    public async Task Register_same_request_twice_should_return_already_registered()
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

        var result = await handler.Handle(command);

        Assert.Equal(RegisterRequestResult.AlreadyRegistered, result);
    }

    [Fact]
    public async Task Register_invalid_request_should_return_all_validation_errors()
    {
        var repository = new FakeRequestRepository();
        var handler = new RegisterRequestHandler(repository);

        var command = new RegisterRequestCommand(
            Guid.Empty,
            " ",
            null!,
            new DateTime(2026, 9, 14, 10, 0, 0, DateTimeKind.Unspecified)
        );

        var exception = await Assert.ThrowsAsync<RequestValidationException>(
            () => handler.Handle(command)
        );

        Assert.Equal(
            ["id", "name", "payload", "createdAt"],
            exception.Errors.Keys
        );
        Assert.Empty(repository.Requests);
    }

    [Fact]
    public async Task Register_request_should_normalize_created_at_to_utc()
    {
        var repository = new FakeRequestRepository();
        var handler = new RegisterRequestHandler(repository);
        var createdAt = new DateTime(
            2026,
            9,
            14,
            10,
            0,
            0,
            DateTimeKind.Local
        );

        await handler.Handle(new RegisterRequestCommand(
            Guid.NewGuid(),
            "My request",
            "hello",
            createdAt
        ));

        var registered = Assert.Single(repository.Requests);

        Assert.Equal(DateTimeKind.Utc, registered.CreatedAt.Kind);
        Assert.Equal(createdAt.ToUniversalTime(), registered.CreatedAt);
    }
}
