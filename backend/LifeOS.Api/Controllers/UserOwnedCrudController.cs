using System.Reflection;
using LifeOS.Application.Abstractions;
using LifeOS.Application;
using LifeOS.Domain;
using LifeOS.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Api.Controllers;

[ApiController]
[Authorize]
public abstract class UserOwnedCrudController<TEntity>(LifeOsDbContext db, ICurrentUser currentUser) : ControllerBase
    where TEntity : UserOwnedEntity, new()
{
    protected LifeOsDbContext Db { get; } = db;
    protected Guid UserId => currentUser.Id;

    [HttpGet]
    public virtual async Task<ActionResult<IReadOnlyList<TEntity>>> List(CancellationToken cancellationToken)
        => Ok(await Db.Set<TEntity>().AsNoTracking().Where(x => x.UserId == UserId).OrderByDescending(x => x.UpdatedAt).ToListAsync(cancellationToken));

    [HttpGet("{id:guid}")]
    public virtual async Task<ActionResult<TEntity>> Get(Guid id, CancellationToken cancellationToken)
    {
        var entity = await Db.Set<TEntity>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.UserId == UserId, cancellationToken);
        return entity is null ? NotFound() : Ok(entity);
    }

    [HttpPost]
    public virtual async Task<ActionResult<TEntity>> Create([FromBody] TEntity input, CancellationToken cancellationToken)
    {
        input.Id = Guid.NewGuid();
        input.UserId = UserId;
        input.CreatedAt = input.UpdatedAt = DateTimeOffset.UtcNow;
        EntityRules.Validate(input);
        await ValidateReferences(input, cancellationToken);
        Db.Add(input);
        await Db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = input.Id }, input);
    }

    [HttpPut("{id:guid}")]
    public virtual async Task<ActionResult<TEntity>> Update(Guid id, [FromBody] TEntity input, CancellationToken cancellationToken)
    {
        var entity = await Db.Set<TEntity>().SingleOrDefaultAsync(x => x.Id == id && x.UserId == UserId, cancellationToken);
        if (entity is null) return NotFound();
        CopyEditable(input, entity);
        EntityRules.Validate(entity);
        await ValidateReferences(entity, cancellationToken);
        await Db.SaveChangesAsync(cancellationToken);
        return Ok(entity);
    }

    [HttpDelete("{id:guid}")]
    public virtual async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var entity = await Db.Set<TEntity>().SingleOrDefaultAsync(x => x.Id == id && x.UserId == UserId, cancellationToken);
        if (entity is null) return NotFound();
        Db.Remove(entity);
        await Db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static void CopyEditable(TEntity source, TEntity target)
    {
        var excluded = new HashSet<string>(StringComparer.Ordinal) { nameof(Entity.Id), nameof(IUserOwned.UserId), nameof(Entity.CreatedAt), nameof(Entity.UpdatedAt) };
        foreach (var property in typeof(TEntity).GetProperties(BindingFlags.Public | BindingFlags.Instance).Where(x => x.CanRead && x.CanWrite && !excluded.Contains(x.Name)))
            property.SetValue(target, property.GetValue(source));
    }

    private async Task ValidateReferences(TEntity entity, CancellationToken ct)
    {
        var valid = entity switch
        {
            LifeTask x => await OwnsOptional<Category>(x.CategoryId, ct) && await OwnsOptional<Project>(x.ProjectId, ct),
            Subtask x => await Owns<LifeTask>(x.TaskId, ct),
            CalendarEvent x => await OwnsOptional<Category>(x.CategoryId, ct),
            Goal x => await OwnsOptional<Category>(x.CategoryId, ct),
            GoalAction x => await Owns<Goal>(x.GoalId, ct),
            Note x => await OwnsOptional<Category>(x.CategoryId, ct),
            CreditCard x => await Owns<FinancialAccount>(x.AccountId, ct),
            FinancialTransaction x => await Owns<FinancialAccount>(x.AccountId, ct) && await OwnsOptional<CreditCard>(x.CardId, ct) && await OwnsOptional<Category>(x.CategoryId, ct),
            InstallmentPurchase x => await Owns<CreditCard>(x.CardId, ct),
            Installment x => await Owns<InstallmentPurchase>(x.PurchaseId, ct),
            Budget x => await Owns<Category>(x.CategoryId, ct),
            Assignment x => await Owns<StudySubject>(x.SubjectId, ct),
            StudyTopic x => await OwnsOptional<StudySubject>(x.SubjectId, ct),
            AssetMaintenance x => await Owns<Asset>(x.AssetId, ct),
            _ => true
        };
        if (!valid) throw new DomainValidationException(new Dictionary<string, string[]> { ["relationship"] = ["O recurso relacionado é inválido ou não pertence ao usuário."] });
    }

    private Task<bool> Owns<T>(Guid id, CancellationToken ct) where T : UserOwnedEntity
        => Db.Set<T>().AnyAsync(x => x.Id == id && x.UserId == UserId, ct);

    private Task<bool> OwnsOptional<T>(Guid? id, CancellationToken ct) where T : UserOwnedEntity
        => id.HasValue ? Owns<T>(id.Value, ct) : Task.FromResult(true);
}
