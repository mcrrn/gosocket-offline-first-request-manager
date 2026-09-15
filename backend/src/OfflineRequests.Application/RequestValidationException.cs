namespace OfflineRequests.Application;

public sealed class RequestValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public RequestValidationException(IDictionary<string, string[]> errors)
        : base("La solicitud contiene datos inválidos.")
    {
        Errors = errors;
    }
}
