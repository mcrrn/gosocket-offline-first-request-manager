using Microsoft.EntityFrameworkCore;
using OfflineRequests.Api;
using OfflineRequests.Application;
using OfflineRequests.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<RequestsDbContext>(options =>
    options.UseSqlite("Data Source=requests.db"));

builder.Services.AddScoped<IRequestRepository, RequestRepository>();
builder.Services.AddScoped<RegisterRequestHandler>();

var app = builder.Build();

app.MapPost("/requests", async (
    RegisterRequestDto dto,
    RegisterRequestHandler handler) =>
{
    var command = new RegisterRequestCommand(
        dto.Id,
        dto.Name,
        dto.Payload,
        dto.CreatedAt
    );

    try
    {
        var result = await handler.Handle(command);

        return result switch
        {
            RegisterRequestResult.Registered =>
                Results.Created($"/requests/{dto.Id}", new
                {
                    dto.Id,
                    Received = true
                }),

            RegisterRequestResult.AlreadyRegistered =>
                Results.Ok(new
                {
                    dto.Id,
                    Received = true
                }),

            _ => Results.StatusCode(500)
        };
    }
    catch (RequestConflictException)
    {
        return Results.Conflict(new
        {
            dto.Id,
            Error = "Una solicitud con el mismo ID ya existe, pero con contenido diferente."
        });
    }
});

app.Run();