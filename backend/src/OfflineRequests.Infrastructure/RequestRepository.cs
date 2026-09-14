using Microsoft.EntityFrameworkCore;
using OfflineRequests.Application;
using OfflineRequests.Domain;

namespace OfflineRequests.Infrastructure;

public class RequestRepository : IRequestRepository
{
    private readonly RequestsDbContext _dbContext;

    public RequestRepository(RequestsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Request?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Requests
            .SingleOrDefaultAsync(x => x.Id == id);
    }

    public async Task AddAsync(Request request)
    {
        _dbContext.Requests.Add(request);
        await _dbContext.SaveChangesAsync();
    }
}