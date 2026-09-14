namespace OfflineRequests.Domain;

public class Request
{
    public Guid Id { get; }
    public string Name { get; }
    public string Payload { get; }
    public DateTime CreatedAt { get; }

    public Request(
        Guid id,
        string name,
        string payload,
        DateTime createdAt)
    {
        Id = id;
        Name = name;
        Payload = payload;
        CreatedAt = createdAt;
    }

    public bool HasSameContentAs(Request other)
    {
        return Id == other.Id
            && Name == other.Name
            && Payload == other.Payload
            && CreatedAt == other.CreatedAt;
    }
}
