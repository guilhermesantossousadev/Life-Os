using System.Security.Claims;

namespace LifeOS.Api.Auth;

public interface ICurrentUser { Guid Id { get; } }

public sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public Guid Id
    {
        get
        {
            var value = accessor.HttpContext?.User.FindFirstValue("sub")
                ?? accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out var id) ? id : throw new UnauthorizedAccessException("Token sem identificador de usuário válido.");
        }
    }
}
