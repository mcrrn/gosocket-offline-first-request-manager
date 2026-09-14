namespace OfflineRequests.Domain;

public class Request
{
    public Guid Id { get; }
    public string Name { get; }
    public string Payload { get; }
    public string Type { get; }
    public DateTime CreatedAt { get; }

    public Request(
        Guid id,
        string name,
        string payload,
        string type,
        DateTime createdAt)
    {
        Id = id;
        Name = name;
        Payload = payload;
        Type = type;
        CreatedAt = createdAt;
    }

    public bool HasSameContentAs(Request other)
    {
        return Id == other.Id
            && Name == other.Name
            && Payload == other.Payload
            && Type == other.Type
            && CreatedAt == other.CreatedAt;
    }
}