using System.Security.Claims;
using LifeOS.Api.Auth;
using LifeOS.Api.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace LifeOS.Tests;

public sealed class SecurityTests
{
    [Fact]
    public void Current_user_comes_from_the_verified_subject_claim()
    {
        var id = Guid.NewGuid();
        var context = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("sub", id.ToString())], "test")) };
        var current = new CurrentUser(new HttpContextAccessor { HttpContext = context });
        Assert.Equal(id, current.Id);
    }

    [Fact]
    public void Crud_and_sensitive_controllers_require_authorization()
    {
        Assert.NotEmpty(typeof(UserOwnedCrudController<>).GetCustomAttributes(typeof(AuthorizeAttribute), true));
        Assert.NotEmpty(typeof(DocumentsController).GetCustomAttributes(typeof(AuthorizeAttribute), true));
        Assert.NotEmpty(typeof(FinancesController).GetCustomAttributes(typeof(AuthorizeAttribute), true));
        Assert.NotEmpty(typeof(WorkspaceController).GetCustomAttributes(typeof(AuthorizeAttribute), true));
    }
}
