namespace LifeOS.Application.Abstractions;

/// <summary>Identifies the authenticated owner without coupling use cases to ASP.NET Core.</summary>
public interface ICurrentUser
{
    Guid Id { get; }
}
