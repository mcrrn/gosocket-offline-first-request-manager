using OfflineRequests.Application;
using OfflineRequests.Domain;

namespace OfflineRequests.Application.Tests;

public class FakeRequestRepository : IRequestRepository
{
    public List<Request> Requests { get; } = new();

    public Task<Request?> GetByIdAsync(Guid id)
    {
        var request = Requests.FirstOrDefault(x => x.Id == id);
        return Task.FromResult(request);
    }

    public Task AddAsync(Request request)
    {
        Requests.Add(request);
        return Task.CompletedTask;
    }
}