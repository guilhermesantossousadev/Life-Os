using LifeOS.Api.Auth;
using LifeOS.Domain;
using LifeOS.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using LifeOS.Application;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Api.Controllers;

[Route("api/v1/tasks")] public sealed class TasksController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<LifeTask>(db, user);
[Route("api/v1/subtasks")] public sealed class SubtasksController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Subtask>(db, user);
[Route("api/v1/inbox")] public sealed class InboxController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<InboxItem>(db, user);
[Route("api/v1/events")] public sealed class EventsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<CalendarEvent>(db, user);
[Route("api/v1/goals")] public sealed class GoalsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Goal>(db, user);
[Route("api/v1/goal-actions")] public sealed class GoalActionsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<GoalAction>(db, user);
[Route("api/v1/projects")] public sealed class ProjectsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Project>(db, user);
[Route("api/v1/notes")] public sealed class NotesController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Note>(db, user);
[Route("api/v1/categories")] public sealed class CategoriesController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Category>(db, user);
[Route("api/v1/tags")] public sealed class TagsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Tag>(db, user)
{
    [HttpPost("ensure")]
    public async Task<ActionResult<Tag>> Ensure([FromBody] EnsureTagRequest request, CancellationToken ct)
    {
        var name = request.Name.Trim().ToLowerInvariant();
        if (name.Length is 0 or > 80) return BadRequest();
        var tag = await Db.Tags.SingleOrDefaultAsync(x => x.UserId == UserId && x.Name == name, ct);
        if (tag is null) { tag = new Tag { UserId = UserId, Name = name }; Db.Tags.Add(tag); await Db.SaveChangesAsync(ct); }
        return Ok(tag);
    }
}
public sealed record EnsureTagRequest(string Name);
[Route("api/v1/finances/accounts")] public sealed class AccountsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<FinancialAccount>(db, user);
[Route("api/v1/finances/transactions")] public sealed class TransactionsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<FinancialTransaction>(db, user);
[Route("api/v1/finances/cards")] public sealed class CardsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<CreditCard>(db, user);
[Route("api/v1/finances/installment-purchases")] public sealed class InstallmentPurchasesController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<InstallmentPurchase>(db, user)
{
    public override async Task<ActionResult<InstallmentPurchase>> Create(InstallmentPurchase input, CancellationToken cancellationToken)
    {
        await using var transaction = await Db.Database.BeginTransactionAsync(cancellationToken);
        var result = await base.Create(input, cancellationToken);
        if (result.Result is not CreatedAtActionResult) return result;
        var amounts = FinanceMath.SplitInstallments(input.TotalAmount, input.InstallmentCount);
        for (var number = 1; number <= input.InstallmentCount; number++)
        {
            Db.Installments.Add(new Installment
            {
                UserId = UserId, PurchaseId = input.Id, Number = number, Amount = amounts[number - 1],
                DueDate = input.PurchaseDate.AddMonths(number - 1)
            });
        }
        await Db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return result;
    }
}
[Route("api/v1/finances/installments")] public sealed class InstallmentsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Installment>(db, user);
[Route("api/v1/finances/debts")] public sealed class DebtsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Debt>(db, user);
[Route("api/v1/finances/budgets")] public sealed class BudgetsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Budget>(db, user);
[Route("api/v1/studies/subjects")] public sealed class SubjectsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<StudySubject>(db, user);
[Route("api/v1/studies/assignments")] public sealed class AssignmentsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Assignment>(db, user);
[Route("api/v1/studies/courses")] public sealed class CoursesController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Course>(db, user);
[Route("api/v1/studies/topics")] public sealed class TopicsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<StudyTopic>(db, user);
[Route("api/v1/career/positions")] public sealed class PositionsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<CareerPosition>(db, user);
[Route("api/v1/career/goals")] public sealed class CareerGoalsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<CareerGoal>(db, user);
[Route("api/v1/career/skills")] public sealed class SkillsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Skill>(db, user);
[Route("api/v1/career/certifications")] public sealed class CertificationsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Certification>(db, user);
[Route("api/v1/assets")] public sealed class AssetsController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<Asset>(db, user);
[Route("api/v1/assets/maintenances")] public sealed class AssetMaintenancesController(LifeOsDbContext db, ICurrentUser user) : UserOwnedCrudController<AssetMaintenance>(db, user);
