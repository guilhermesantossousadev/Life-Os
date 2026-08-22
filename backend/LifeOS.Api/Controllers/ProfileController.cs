using System.Security.Claims;
using LifeOS.Api.Auth;
using LifeOS.Domain;
using LifeOS.Infrastructure;
using LifeOS.Api.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Api.Controllers;

[ApiController, Authorize, Route("api/v1/profile")]
public sealed class ProfileController(LifeOsDbContext db, ICurrentUser currentUser, IPrivateFileStorage storage) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<Profile>> Get(CancellationToken ct) => Ok(await GetOrCreate(ct));

    [HttpPatch]
    public async Task<ActionResult<Profile>> Update([FromBody] UpdateProfileRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 150)
            return BadRequest(new HttpValidationProblemDetails(new Dictionary<string, string[]> { ["name"] = ["Nome obrigatório, com até 150 caracteres."] }));
        var profile = await GetOrCreate(ct);
        profile.Name = request.Name.Trim();
        await db.SaveChangesAsync(ct);
        return Ok(profile);
    }

    [HttpPost("avatar"), RequestSizeLimit(2 * 1024 * 1024)]
    public async Task<ActionResult<object>> UploadAvatar([FromForm] IFormFile file, CancellationToken ct)
    {
        if (file.Length is 0 or > 2 * 1024 * 1024 || !new[] { "image/png", "image/jpeg", "image/webp" }.Contains(file.ContentType))
            return BadRequest(new HttpValidationProblemDetails(new Dictionary<string, string[]> { ["file"] = ["Envie PNG, JPEG ou WebP de até 2 MB."] }));
        var profile = await GetOrCreate(ct);
        var extension = file.ContentType switch { "image/png" => ".png", "image/webp" => ".webp", _ => ".jpg" };
        var path = $"{currentUser.Id:D}/profile/avatar-{Guid.NewGuid():N}{extension}";
        await using var stream = file.OpenReadStream();
        await storage.UploadAsync(path, stream, file.ContentType, ct);
        var previous = profile.AvatarUrl;
        profile.AvatarUrl = path;
        await db.SaveChangesAsync(ct);
        if (!string.IsNullOrWhiteSpace(previous)) { try { await storage.DeleteAsync(previous, ct); } catch { /* old avatar is cleaned asynchronously by storage lifecycle */ } }
        return Ok(new { path, url = await storage.CreateSignedUrlAsync(path, TimeSpan.FromHours(1), ct) });
    }

    [HttpGet("avatar-url")]
    public async Task<ActionResult<object>> AvatarUrl(CancellationToken ct)
    {
        var profile = await GetOrCreate(ct);
        if (string.IsNullOrWhiteSpace(profile.AvatarUrl)) return NotFound();
        return Ok(new { url = await storage.CreateSignedUrlAsync(profile.AvatarUrl, TimeSpan.FromHours(1), ct) });
    }

    private async Task<Profile> GetOrCreate(CancellationToken ct)
    {
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email") ?? "";
        var profile = await db.Profiles.SingleOrDefaultAsync(x => x.AuthUserId == currentUser.Id, ct);
        if (profile is not null)
        {
            if (!string.IsNullOrWhiteSpace(email) && profile.Email != email) { profile.Email = email; await db.SaveChangesAsync(ct); }
            return profile;
        }
        var name = User.FindFirstValue("user_name") ?? User.FindFirstValue("name") ?? email.Split('@')[0];
        profile = new Profile { AuthUserId = currentUser.Id, Name = name, Email = email };
        db.Profiles.Add(profile);
        db.Categories.AddRange(new[] { "Pessoal", "Trabalho", "Estudos", "Finanças", "Saúde", "Carreira", "Faculdade", "Outros" }.Select(category => new Category { UserId = currentUser.Id, Name = category, Domain = "general" }));
        await db.SaveChangesAsync(ct);
        return profile;
    }
}

public sealed record UpdateProfileRequest(string Name);

[ApiController, Authorize, Route("api/v1/preferences")]
public sealed class PreferencesController(LifeOsDbContext db, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<UserPreference>> Get(CancellationToken ct)
    {
        var preferences = await db.UserPreferences.SingleOrDefaultAsync(x => x.UserId == currentUser.Id, ct);
        if (preferences is not null) return Ok(preferences);
        preferences = new UserPreference { UserId = currentUser.Id };
        db.UserPreferences.Add(preferences); await db.SaveChangesAsync(ct);
        return Ok(preferences);
    }

    [HttpPut]
    public async Task<ActionResult<UserPreference>> Update([FromBody] UserPreference input, CancellationToken ct)
    {
        if (!new[] { "light", "dark", "system", "claro", "escuro", "sistema" }.Contains(input.Theme))
            return BadRequest(new HttpValidationProblemDetails(new Dictionary<string, string[]> { ["theme"] = ["Tema inválido."] }));
        var current = await db.UserPreferences.SingleOrDefaultAsync(x => x.UserId == currentUser.Id, ct);
        if (current is null) { current = input; current.Id = Guid.NewGuid(); current.UserId = currentUser.Id; db.Add(current); }
        else
        {
            var id = current.Id;
            db.Entry(current).CurrentValues.SetValues(input);
            current.Id = id;
            current.UserId = currentUser.Id;
        }
        await db.SaveChangesAsync(ct);
        return Ok(current);
    }
}
