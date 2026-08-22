using LifeOS.Api.Auth;
using LifeOS.Domain;
using LifeOS.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Api.Controllers;

[ApiController, Authorize, Route("api/v1")]
public sealed class RelationsController(LifeOsDbContext db, ICurrentUser currentUser) : ControllerBase
{
    [HttpPut("assets/{assetId:guid}/vehicle")]
    public async Task<ActionResult<Vehicle>> UpsertVehicle(Guid assetId, [FromBody] Vehicle input, CancellationToken ct)
    {
        if (!await db.Assets.AnyAsync(x => x.Id == assetId && x.UserId == currentUser.Id && x.Type == "vehicle", ct)) return NotFound();
        var vehicle = await db.Vehicles.SingleOrDefaultAsync(x => x.AssetId == assetId, ct);
        if (vehicle is null) { vehicle = input; vehicle.AssetId = assetId; db.Vehicles.Add(vehicle); }
        else db.Entry(vehicle).CurrentValues.SetValues(input);
        vehicle.AssetId = assetId;
        await db.SaveChangesAsync(ct);
        return Ok(vehicle);
    }

    [HttpGet("assets/{assetId:guid}/vehicle")]
    public async Task<ActionResult<Vehicle>> Vehicle(Guid assetId, CancellationToken ct)
    {
        if (!await db.Assets.AnyAsync(x => x.Id == assetId && x.UserId == currentUser.Id, ct)) return NotFound();
        var vehicle = await db.Vehicles.AsNoTracking().SingleOrDefaultAsync(x => x.AssetId == assetId, ct);
        return vehicle is null ? NotFound() : Ok(vehicle);
    }

    [HttpPost("{resource:regex(^(projects|notes|documents)$)}/{resourceId:guid}/tags/{tagId:guid}")]
    public async Task<IActionResult> AddTag(string resource, Guid resourceId, Guid tagId, CancellationToken ct)
    {
        if (!await db.Tags.AnyAsync(x => x.Id == tagId && x.UserId == currentUser.Id, ct) || !await OwnsResource(resource, resourceId, ct)) return NotFound();
        switch (resource)
        {
            case "projects": if (!await db.ProjectTags.AnyAsync(x => x.ProjectId == resourceId && x.TagId == tagId, ct)) db.ProjectTags.Add(new ProjectTag { ProjectId = resourceId, TagId = tagId }); break;
            case "notes": if (!await db.NoteTags.AnyAsync(x => x.NoteId == resourceId && x.TagId == tagId, ct)) db.NoteTags.Add(new NoteTag { NoteId = resourceId, TagId = tagId }); break;
            case "documents": if (!await db.DocumentTags.AnyAsync(x => x.DocumentId == resourceId && x.TagId == tagId, ct)) db.DocumentTags.Add(new DocumentTag { DocumentId = resourceId, TagId = tagId }); break;
        }
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{resource:regex(^(projects|notes|documents)$)}/{resourceId:guid}/tags/{tagId:guid}")]
    public async Task<IActionResult> RemoveTag(string resource, Guid resourceId, Guid tagId, CancellationToken ct)
    {
        if (!await OwnsResource(resource, resourceId, ct)) return NotFound();
        object? link = resource switch
        {
            "projects" => await db.ProjectTags.SingleOrDefaultAsync(x => x.ProjectId == resourceId && x.TagId == tagId, ct),
            "notes" => await db.NoteTags.SingleOrDefaultAsync(x => x.NoteId == resourceId && x.TagId == tagId, ct),
            "documents" => await db.DocumentTags.SingleOrDefaultAsync(x => x.DocumentId == resourceId && x.TagId == tagId, ct),
            _ => null
        };
        if (link is null) return NotFound();
        db.Remove(link); await db.SaveChangesAsync(ct); return NoContent();
    }

    private Task<bool> OwnsResource(string resource, Guid id, CancellationToken ct) => resource switch
    {
        "projects" => db.Projects.AnyAsync(x => x.Id == id && x.UserId == currentUser.Id, ct),
        "notes" => db.Notes.AnyAsync(x => x.Id == id && x.UserId == currentUser.Id, ct),
        "documents" => db.Documents.AnyAsync(x => x.Id == id && x.UserId == currentUser.Id, ct),
        _ => Task.FromResult(false)
    };
}
