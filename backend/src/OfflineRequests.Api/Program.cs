using Microsoft.EntityFrameworkCore;
using OfflineRequests.Application;
using OfflineRequests.Api.Configuration;
using OfflineRequests.Api.Endpoints;
using OfflineRequests.Infrastructure;

EnvironmentFile.LoadFromCurrentDirectory();

var builder = WebApplication.CreateBuilder(args);

var environment = RequireEnvironmentVariables(
    "OFFLINE_REQUESTS_CONNECTION_STRING",
    "OFFLINE_REQUESTS_CORS_ORIGINS");

var connectionString = environment["OFFLINE_REQUESTS_CONNECTION_STRING"];
var corsOrigins = environment["OFFLINE_REQUESTS_CORS_ORIGINS"]
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddDbContext<RequestsDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddScoped<IRequestRepository, RequestRepository>();
builder.Services.AddScoped<RegisterRequestHandler>();

var app = builder.Build();

app.UseCors("Frontend");
app.MapRequestEndpoints();

app.Run();

static IReadOnlyDictionary<string, string> RequireEnvironmentVariables(params string[] names)
{
    var values = names.ToDictionary(
        name => name,
        Environment.GetEnvironmentVariable);
    var missing = values
        .Where(pair => string.IsNullOrWhiteSpace(pair.Value))
        .Select(pair => pair.Key)
        .ToArray();

    if (missing.Length > 0)
        throw new InvalidOperationException(
            $"Faltan definir las variables de entorno: {string.Join(", ", missing)}.");

    return values.ToDictionary(pair => pair.Key, pair => pair.Value!);
}

public partial class Program { }
