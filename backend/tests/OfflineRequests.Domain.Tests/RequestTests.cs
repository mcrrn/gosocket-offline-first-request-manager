using OfflineRequests.Domain;

namespace OfflineRequests.Domain.Tests;

public class RequestTests
{
    [Fact]
    public void Request_should_store_its_data()
    {
        var id = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;

        var request = new Request(
            id,
            "My request",
            "hello",
            createdAt
        );

        Assert.Equal(id, request.Id);
        Assert.Equal("My request", request.Name);
        Assert.Equal("hello", request.Payload);
        Assert.Equal(createdAt, request.CreatedAt);
    }

    [Fact]
    public void Requests_with_same_content_should_be_equal()
    {
        var id = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;

        var first = new Request(
            id,
            "My request",
            "hello",
            createdAt
        );

        var second = new Request(
            id,
            "My request",
            "hello",
            createdAt
        );

        Assert.True(first.HasSameContentAs(second));
    }

    [Fact]
    public void Requests_with_different_content_should_not_be_equal()
    {
        var id = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;

        var first = new Request(
            id,
            "My request",
            "hello",
            createdAt
        );

        var second = new Request(
            id,
            "My request",
            "different",
            createdAt
        );

        Assert.False(first.HasSameContentAs(second));
    }
}
