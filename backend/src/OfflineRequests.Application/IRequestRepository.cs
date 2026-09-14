using OfflineRequests.Domain;

namespace OfflineRequests.Application;

public interface IRequestRepository
{
    Task<Request?> GetByIdAsync(Guid id);
    Task AddAsync(Request request);
}