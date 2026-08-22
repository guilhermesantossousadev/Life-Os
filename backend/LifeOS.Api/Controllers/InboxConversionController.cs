using LifeOS.Api.Auth;
using LifeOS.Domain;
using LifeOS.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Api.Controllers;

[ApiController, Authorize, Route("api/v1/inbox")]
public sealed class InboxConversionController(LifeOsDbContext db, ICurrentUser currentUser) : ControllerBase
{
    [HttpPost("{id:guid}/archive")]
    public Task<ActionResult<InboxItem>> Archive(Guid id, CancellationToken ct) => SetArchived(id, DateTimeOffset.UtcNow, ct);

    [HttpPost("{id:guid}/restore")]
    public Task<ActionResult<InboxItem>> Restore(Guid id, CancellationToken ct) => SetArchived(id, null, ct);

    [HttpPost("{id:guid}/convert")]
    public async Task<ActionResult<object>> Convert(Guid id, [FromBody] ConvertInboxRequest request, CancellationToken ct)
    {
        var item = await db.InboxItems.SingleOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.Id, ct);
        if (item is null) return NotFound();
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        Entity created = request.Type.ToLowerInvariant() switch
        {
            "task" => new LifeTask { UserId = currentUser.Id, Title = item.Content, DueDate = request.Date },
            "event" => new CalendarEvent { UserId = currentUser.Id, Title = item.Content, StartAt = request.StartAt ?? DateTimeOffset.UtcNow, EndAt = (request.StartAt ?? DateTimeOffset.UtcNow).AddHours(1) },
            "note" => new Note { UserId = currentUser.Id, Title = item.Content, Content = "" },
            "goal" => new Goal { UserId = currentUser.Id, Title = item.Content, TargetValue = request.TargetValue ?? 100, CurrentValue = 0 },
            "project" => new Project { UserId = currentUser.Id, Title = item.Content },
            _ => throw new ArgumentException("Tipo de conversão inválido.", nameof(request.Type))
        };
        db.Add(created);
        item.ArchivedAt = DateTimeOffset.UtcNow;
        item.ConvertedToType = request.Type.ToLowerInvariant();
        item.ConvertedToId = created.Id;
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Ok(new { item, created });
    }

    private async Task<ActionResult<InboxItem>> SetArchived(Guid id, DateTimeOffset? archivedAt, CancellationToken ct)
    {
        var item = await db.InboxItems.SingleOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.Id, ct);
        if (item is null) return NotFound();
        item.ArchivedAt = archivedAt;
        await db.SaveChangesAsync(ct);
        return Ok(item);
    }
}

public sealed record ConvertInboxRequest(string Type, DateOnly? Date, DateTimeOffset? StartAt, decimal? TargetValue);
