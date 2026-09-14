using Microsoft.EntityFrameworkCore;
using OfflineRequests.Application;
using OfflineRequests.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<RequestsDbContext>(options =>
    options.UseSqlite("Data Source=requests.db"));

builder.Services.AddScoped<IRequestRepository, RequestRepository>();
builder.Services.AddScoped<RegisterRequestHandler>();

var app = builder.Build();

app.Run();