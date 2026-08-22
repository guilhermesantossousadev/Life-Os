using LifeOS.Api.Auth;
using LifeOS.Application;
using LifeOS.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Api.Controllers;

[ApiController, Authorize, Route("api/v1")]
public sealed class WorkspaceController(LifeOsDbContext db, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet("workspace")]
    public async Task<ActionResult<object>> Workspace(CancellationToken ct)
    {
        var userId = currentUser.Id;
        return Ok(new
        {
            profile = await db.Profiles.AsNoTracking().SingleOrDefaultAsync(x => x.AuthUserId == userId, ct),
            preferences = await db.UserPreferences.AsNoTracking().SingleOrDefaultAsync(x => x.UserId == userId, ct),
            categories = await db.Categories.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            tags = await db.Tags.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            projectTags = await db.ProjectTags.AsNoTracking().Where(x => db.Projects.Any(project => project.Id == x.ProjectId && project.UserId == userId)).ToListAsync(ct),
            noteTags = await db.NoteTags.AsNoTracking().Where(x => db.Notes.Any(note => note.Id == x.NoteId && note.UserId == userId)).ToListAsync(ct),
            documentTags = await db.DocumentTags.AsNoTracking().Where(x => db.Documents.Any(document => document.Id == x.DocumentId && document.UserId == userId)).ToListAsync(ct),
            tasks = await db.Tasks.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            subtasks = await db.Subtasks.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            inbox = await db.InboxItems.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            events = await db.Events.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            goals = await db.Goals.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            goalActions = await db.GoalActions.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            projects = await db.Projects.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            notes = await db.Notes.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            accounts = await db.FinancialAccounts.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            transactions = await db.Transactions.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            cards = await db.CreditCards.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            installmentPurchases = await db.InstallmentPurchases.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            installments = await db.Installments.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            debts = await db.Debts.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            budgets = await db.Budgets.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            subjects = await db.StudySubjects.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            assignments = await db.Assignments.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            courses = await db.Courses.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            topics = await db.StudyTopics.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            positions = await db.CareerPositions.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            careerGoals = await db.CareerGoals.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            skills = await db.Skills.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            certifications = await db.Certifications.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            assets = await db.Assets.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            vehicles = await db.Vehicles.AsNoTracking().Where(x => db.Assets.Any(a => a.Id == x.AssetId && a.UserId == userId)).ToListAsync(ct),
            maintenances = await db.AssetMaintenances.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct),
            documents = await db.Documents.AsNoTracking().Where(x => x.UserId == userId).ToListAsync(ct)
        });
    }

    [HttpGet("search")]
    public async Task<ActionResult<object>> Search([FromQuery] string q, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(q)) return Ok(Array.Empty<object>());
        var userId = currentUser.Id;
        var term = q.Trim().ToLower();
        var results = new List<object>();
        results.AddRange((await db.Tasks.AsNoTracking().Where(x => x.UserId == userId && x.Title.ToLower().Contains(term)).Take(10).ToListAsync(ct)).Select(x => new { type = "task", x.Id, title = x.Title, route = $"/tasks/{x.Id}" }));
        results.AddRange((await db.Events.AsNoTracking().Where(x => x.UserId == userId && x.Title.ToLower().Contains(term)).Take(10).ToListAsync(ct)).Select(x => new { type = "event", x.Id, title = x.Title, route = $"/calendar?event={x.Id}" }));
        results.AddRange((await db.Goals.AsNoTracking().Where(x => x.UserId == userId && x.Title.ToLower().Contains(term)).Take(10).ToListAsync(ct)).Select(x => new { type = "goal", x.Id, title = x.Title, route = $"/goals/{x.Id}" }));
        results.AddRange((await db.Projects.AsNoTracking().Where(x => x.UserId == userId && x.Title.ToLower().Contains(term)).Take(10).ToListAsync(ct)).Select(x => new { type = "project", x.Id, title = x.Title, route = $"/projects/{x.Id}" }));
        results.AddRange((await db.Notes.AsNoTracking().Where(x => x.UserId == userId && (x.Title.ToLower().Contains(term) || x.Content.ToLower().Contains(term))).Take(10).ToListAsync(ct)).Select(x => new { type = "note", x.Id, title = x.Title, route = $"/notes/{x.Id}" }));
        results.AddRange((await db.Documents.AsNoTracking().Where(x => x.UserId == userId && x.Name.ToLower().Contains(term)).Take(10).ToListAsync(ct)).Select(x => new { type = "document", x.Id, title = x.Name, route = $"/documents?document={x.Id}" }));
        results.AddRange((await db.StudySubjects.AsNoTracking().Where(x => x.UserId == userId && x.Name.ToLower().Contains(term)).Take(10).ToListAsync(ct)).Select(x => new { type = "study", x.Id, title = x.Name, route = $"/studies?subject={x.Id}" }));
        results.AddRange((await db.Skills.AsNoTracking().Where(x => x.UserId == userId && x.Name.ToLower().Contains(term)).Take(10).ToListAsync(ct)).Select(x => new { type = "career", x.Id, title = x.Name, route = $"/career?skill={x.Id}" }));
        results.AddRange((await db.Assets.AsNoTracking().Where(x => x.UserId == userId && x.Name.ToLower().Contains(term)).Take(10).ToListAsync(ct)).Select(x => new { type = "asset", x.Id, title = x.Name, route = $"/assets/{x.Id}" }));
        return Ok(results.Take(50));
    }

    [HttpGet("notifications")]
    public async Task<ActionResult<object>> Notifications(CancellationToken ct)
    {
        var userId = currentUser.Id;
        var today = LifeClock.Today();
        var limit = today.AddDays(7);
        var notifications = new List<object>();
        notifications.AddRange((await db.Tasks.AsNoTracking().Where(x => x.UserId == userId && x.Status != "completed" && x.DueDate <= limit).OrderBy(x => x.DueDate).Take(10).ToListAsync(ct)).Select(x => new { type = x.DueDate < today ? "overdue_task" : "due_task", title = x.Title, dueDate = x.DueDate, route = $"/tasks/{x.Id}" }));
        notifications.AddRange((await db.Assignments.AsNoTracking().Where(x => x.UserId == userId && x.Status != "completed" && x.DueDate <= limit).OrderBy(x => x.DueDate).Take(10).ToListAsync(ct)).Select(x => new { type = "assignment", title = x.Title, dueDate = (DateOnly?)x.DueDate, route = $"/studies?assignment={x.Id}" }));
        notifications.AddRange((await db.Goals.AsNoTracking().Where(x => x.UserId == userId && x.Status == "active" && x.Deadline <= limit).OrderBy(x => x.Deadline).Take(10).ToListAsync(ct)).Select(x => new { type = "goal", title = x.Title, dueDate = x.Deadline, route = $"/goals/{x.Id}" }));
        return Ok(notifications.Take(20));
    }
}
