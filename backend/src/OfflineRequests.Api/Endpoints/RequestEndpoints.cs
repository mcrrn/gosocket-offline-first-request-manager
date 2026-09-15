using OfflineRequests.Api.Dtos;
using OfflineRequests.Application;

namespace OfflineRequests.Api.Endpoints;

public static class RequestEndpoints
{
    public static IEndpointRouteBuilder MapRequestEndpoints(
        this IEndpointRouteBuilder app)
    {
        app.MapPost("/requests", Register);

        return app;
    }

    private static async Task<IResult> Register(
        RegisterRequestDto dto,
        RegisterRequestHandler handler)
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

            IResult response = result switch
            {
                RegisterRequestResult.Registered =>
                    Results.Created($"/requests/{dto.Id}", new RequestReceivedResponseDto(
                        dto.Id,
                        Received: true
                    )),

                RegisterRequestResult.AlreadyRegistered =>
                    Results.Ok(new RequestReceivedResponseDto(
                        dto.Id,
                        Received: true
                    )),

                _ => Results.StatusCode(500)
            };

            return response;
        }
        catch (RequestConflictException)
        {
            return Results.Conflict(new
            {
                dto.Id,
                Error = "Una solicitud con el mismo ID ya existe, pero con contenido diferente."
            });
        }
        catch (RequestValidationException exception)
        {
            return Results.ValidationProblem(exception.Errors);
        }
    }
}
