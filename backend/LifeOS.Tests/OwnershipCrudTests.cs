using LifeOS.Api.Controllers;
using LifeOS.Application;
using LifeOS.Application.Abstractions;
using LifeOS.Domain;
using LifeOS.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Tests;

public sealed class OwnershipCrudTests
{
    [Fact]
    public async Task List_never_returns_another_users_tasks()
    {
        await using var db = Database();
        var owner = Guid.NewGuid(); var other = Guid.NewGuid();
        db.Tasks.AddRange(new LifeTask { UserId = owner, Title = "Minha" }, new LifeTask { UserId = other, Title = "Outra" });
        await db.SaveChangesAsync();
        var controller = new TasksController(db, new FakeUser(owner));

        var result = await controller.List(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var rows = Assert.IsAssignableFrom<IReadOnlyList<LifeTask>>(ok.Value);
        Assert.Single(rows);
        Assert.Equal("Minha", rows[0].Title);
    }

    [Fact]
    public async Task Create_overwrites_spoofed_user_id()
    {
        await using var db = Database();
        var owner = Guid.NewGuid();
        var controller = new TasksController(db, new FakeUser(owner));

        await controller.Create(new LifeTask { UserId = Guid.NewGuid(), Title = "Segura" }, CancellationToken.None);

        Assert.Equal(owner, (await db.Tasks.SingleAsync()).UserId);
    }

    [Fact]
    public async Task Related_project_must_belong_to_current_user()
    {
        await using var db = Database();
        var owner = Guid.NewGuid(); var other = Guid.NewGuid();
        var project = new Project { UserId = other, Title = "Privado" };
        db.Projects.Add(project); await db.SaveChangesAsync();
        var controller = new TasksController(db, new FakeUser(owner));

        await Assert.ThrowsAsync<DomainValidationException>(() => controller.Create(new LifeTask { Title = "Ataque", ProjectId = project.Id }, CancellationToken.None));
    }

    private static LifeOsDbContext Database() => new(new DbContextOptionsBuilder<LifeOsDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
    private sealed record FakeUser(Guid Id) : ICurrentUser;
}
