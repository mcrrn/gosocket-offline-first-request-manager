using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using OfflineRequests.Domain;
using OfflineRequests.Infrastructure;

namespace OfflineRequests.Infrastructure.Tests;

public class RequestRepositoryTests
{
    [Fact]
    public async Task Added_request_can_be_retrieved_by_id()
    {
        using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<RequestsDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var context = new RequestsDbContext(options);
        await context.Database.EnsureCreatedAsync();

        var repository = new RequestRepository(context);

        var request = new Request(
            Guid.NewGuid(),
            "My request",
            "hello",
            DateTime.UtcNow
        );

        await repository.AddAsync(request);

        var retrieved = await repository.GetByIdAsync(request.Id);

        Assert.NotNull(retrieved);
        Assert.Equal(request.Id, retrieved.Id);
        Assert.True(request.HasSameContentAs(retrieved));
    }
}