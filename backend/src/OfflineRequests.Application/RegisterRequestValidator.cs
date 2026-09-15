namespace OfflineRequests.Application;

public static class RegisterRequestValidator
{
    public static void Validate(RegisterRequestCommand command)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.Ordinal);

        if (command.Id == Guid.Empty)
            errors["id"] = ["El Id es obligatorio."];

        if (string.IsNullOrWhiteSpace(command.Name))
            errors["name"] = ["El nombre es obligatorio."];

        if (command.Payload is null)
            errors["payload"] = ["El payload es obligatorio."];

        if (command.CreatedAt == default)
            errors["createdAt"] = ["La fecha de creación es obligatoria."];
        else if (command.CreatedAt.Kind == DateTimeKind.Unspecified)
            errors["createdAt"] =
            ["La fecha de creación debe incluir una zona horaria u offset, por ejemplo 2026-09-14T14:00:00Z."];

        if (errors.Count > 0)
            throw new RequestValidationException(errors);
    }
}
