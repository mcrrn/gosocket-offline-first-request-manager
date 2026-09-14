namespace OfflineRequests.Application;

public class RequestConflictException : Exception
{
    public RequestConflictException(Guid id)
        : base($"Una solicitud con el mismo ID ({id}) ya existe pero con contenido diferente.")
    {
    }
}