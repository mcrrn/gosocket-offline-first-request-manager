using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using OfflineRequests.Infrastructure;

namespace OfflineRequests.Api.Tests;

public class RequestEndpointsTests
{
    [Fact]
    public async Task New_request_returns_created()
    {
        await using var application =
            new CustomWebApplicationFactory();

        using var scope = application.Services.CreateScope();

        var dbContext =
            scope.ServiceProvider.GetRequiredService<RequestsDbContext>();

        await dbContext.Database.EnsureCreatedAsync();

        var client = application.CreateClient();

        var body = new
        {
            id = Guid.NewGuid(),
            name = "My request",
            payload = "hello",
            createdAt = DateTime.UtcNow
        };

        var response =
            await client.PostAsJsonAsync("/requests", body);

        Assert.Equal(
            HttpStatusCode.Created,
            response.StatusCode
        );
    }

    [Fact]
    public async Task Same_request_twice_returns_ok_on_second_request()
    {
        await using var application =
            new CustomWebApplicationFactory();

        using var scope = application.Services.CreateScope();

        var dbContext =
            scope.ServiceProvider.GetRequiredService<RequestsDbContext>();

        await dbContext.Database.EnsureCreatedAsync();

        var client = application.CreateClient();

        var body = new
        {
            id = Guid.NewGuid(),
            name = "My request",
            payload = "hello",
            createdAt = DateTime.UtcNow
        };

        var firstResponse =
            await client.PostAsJsonAsync("/requests", body);

        var secondResponse =
            await client.PostAsJsonAsync("/requests", body);

        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, secondResponse.StatusCode);
    }

    [Fact]
    public async Task Same_id_with_different_content_returns_conflict()
    {
        await using var application =
            new CustomWebApplicationFactory();

        using var scope = application.Services.CreateScope();

        var dbContext =
            scope.ServiceProvider.GetRequiredService<RequestsDbContext>();

        await dbContext.Database.EnsureCreatedAsync();

        var client = application.CreateClient();

        var id = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;

        var first = new
        {
            id,
            name = "My request",
            payload = "hello",
            createdAt
        };

        var second = new
        {
            id,
            name = "My request",
            payload = "different",
            createdAt
        };

        var firstResponse =
            await client.PostAsJsonAsync("/requests", first);

        var secondResponse =
            await client.PostAsJsonAsync("/requests", second);

        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);
    }

    [Fact]
    public async Task Invalid_request_returns_all_validation_errors()
    {
        await using var application =
            new CustomWebApplicationFactory();

        using var scope = application.Services.CreateScope();

        var dbContext =
            scope.ServiceProvider.GetRequiredService<RequestsDbContext>();

        await dbContext.Database.EnsureCreatedAsync();

        var response = await application.CreateClient().PostAsJsonAsync(
            "/requests",
            new
            {
                id = Guid.Empty,
                name = " ",
                payload = (string?)null,
                createdAt = new DateTime(
                    2026,
                    9,
                    14,
                    10,
                    0,
                    0,
                    DateTimeKind.Unspecified
                )
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var body = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync()
        );
        var errors = body.RootElement.GetProperty("errors");

        Assert.True(errors.TryGetProperty("id", out _));
        Assert.True(errors.TryGetProperty("name", out _));
        Assert.True(errors.TryGetProperty("payload", out _));
        Assert.True(errors.TryGetProperty("createdAt", out _));
    }
}
