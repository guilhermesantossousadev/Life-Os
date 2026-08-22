using System.Text;
using LifeOS.Domain;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Infrastructure;

public sealed class LifeOsDbContext(DbContextOptions<LifeOsDbContext> options) : DbContext(options)
{
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<UserPreference> UserPreferences => Set<UserPreference>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTag> ProjectTags => Set<ProjectTag>();
    public DbSet<LifeTask> Tasks => Set<LifeTask>();
    public DbSet<Subtask> Subtasks => Set<Subtask>();
    public DbSet<InboxItem> InboxItems => Set<InboxItem>();
    public DbSet<CalendarEvent> Events => Set<CalendarEvent>();
    public DbSet<Goal> Goals => Set<Goal>();
    public DbSet<GoalAction> GoalActions => Set<GoalAction>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<NoteTag> NoteTags => Set<NoteTag>();
    public DbSet<FinancialAccount> FinancialAccounts => Set<FinancialAccount>();
    public DbSet<CreditCard> CreditCards => Set<CreditCard>();
    public DbSet<FinancialTransaction> Transactions => Set<FinancialTransaction>();
    public DbSet<Transfer> Transfers => Set<Transfer>();
    public DbSet<InstallmentPurchase> InstallmentPurchases => Set<InstallmentPurchase>();
    public DbSet<Installment> Installments => Set<Installment>();
    public DbSet<Debt> Debts => Set<Debt>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<StudySubject> StudySubjects => Set<StudySubject>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<StudyTopic> StudyTopics => Set<StudyTopic>();
    public DbSet<CareerPosition> CareerPositions => Set<CareerPosition>();
    public DbSet<CareerGoal> CareerGoals => Set<CareerGoal>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<Certification> Certifications => Set<Certification>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<AssetMaintenance> AssetMaintenances => Set<AssetMaintenance>();
    public DbSet<LifeOS.Domain.Document> Documents => Set<LifeOS.Domain.Document>();
    public DbSet<DocumentTag> DocumentTags => Set<DocumentTag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        Table<Profile>(modelBuilder, "profiles");
        Table<UserPreference>(modelBuilder, "user_preferences");
        Table<Category>(modelBuilder, "categories");
        Table<Tag>(modelBuilder, "tags");
        Table<Project>(modelBuilder, "projects");
        Table<LifeTask>(modelBuilder, "tasks");
        Table<Subtask>(modelBuilder, "subtasks");
        Table<InboxItem>(modelBuilder, "inbox_items");
        Table<CalendarEvent>(modelBuilder, "events");
        Table<Goal>(modelBuilder, "goals");
        Table<GoalAction>(modelBuilder, "goal_actions");
        Table<Note>(modelBuilder, "notes");
        Table<FinancialAccount>(modelBuilder, "financial_accounts");
        Table<CreditCard>(modelBuilder, "credit_cards");
        Table<FinancialTransaction>(modelBuilder, "transactions");
        Table<Transfer>(modelBuilder, "transfers");
        Table<InstallmentPurchase>(modelBuilder, "installment_purchases");
        Table<Installment>(modelBuilder, "installments");
        Table<Debt>(modelBuilder, "debts");
        Table<Budget>(modelBuilder, "budgets");
        Table<StudySubject>(modelBuilder, "study_subjects");
        Table<Assignment>(modelBuilder, "assignments");
        Table<Course>(modelBuilder, "courses");
        Table<StudyTopic>(modelBuilder, "study_topics");
        Table<CareerPosition>(modelBuilder, "career_positions");
        Table<CareerGoal>(modelBuilder, "career_goals");
        Table<Skill>(modelBuilder, "skills");
        Table<Certification>(modelBuilder, "certifications");
        Table<Asset>(modelBuilder, "assets");
        Table<AssetMaintenance>(modelBuilder, "asset_maintenances");
        Table<LifeOS.Domain.Document>(modelBuilder, "documents");

        modelBuilder.Entity<ProjectTag>().ToTable("project_tags").HasKey(x => new { x.ProjectId, x.TagId });
        modelBuilder.Entity<NoteTag>().ToTable("note_tags").HasKey(x => new { x.NoteId, x.TagId });
        modelBuilder.Entity<DocumentTag>().ToTable("document_tags").HasKey(x => new { x.DocumentId, x.TagId });
        modelBuilder.Entity<Vehicle>().ToTable("vehicles").HasKey(x => x.AssetId);

        modelBuilder.Entity<Profile>().HasIndex(x => x.AuthUserId).IsUnique();
        modelBuilder.Entity<UserPreference>().HasIndex(x => x.UserId).IsUnique();
        modelBuilder.Entity<Category>().HasIndex(x => new { x.UserId, x.Domain, x.Name }).IsUnique();
        modelBuilder.Entity<Tag>().HasIndex(x => new { x.UserId, x.Name }).IsUnique();
        modelBuilder.Entity<Budget>().HasIndex(x => new { x.UserId, x.CategoryId, x.Year, x.Month }).IsUnique();
        modelBuilder.Entity<Subtask>().HasIndex(x => new { x.TaskId, x.Position });
        modelBuilder.Entity<GoalAction>().HasIndex(x => new { x.GoalId, x.Position });
        modelBuilder.Entity<Installment>().HasIndex(x => new { x.PurchaseId, x.Number }).IsUnique();
        modelBuilder.Entity<LifeTask>().HasIndex(x => new { x.UserId, x.DueDate, x.Status });
        modelBuilder.Entity<CalendarEvent>().HasIndex(x => new { x.UserId, x.StartAt });
        modelBuilder.Entity<FinancialTransaction>().HasIndex(x => new { x.UserId, x.TransactionDate });

        modelBuilder.Entity<ProjectTag>().HasOne<Project>().WithMany().HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<ProjectTag>().HasOne<Tag>().WithMany().HasForeignKey(x => x.TagId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<NoteTag>().HasOne<Note>().WithMany().HasForeignKey(x => x.NoteId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<NoteTag>().HasOne<Tag>().WithMany().HasForeignKey(x => x.TagId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<DocumentTag>().HasOne<LifeOS.Domain.Document>().WithMany().HasForeignKey(x => x.DocumentId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<DocumentTag>().HasOne<Tag>().WithMany().HasForeignKey(x => x.TagId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<LifeTask>().HasOne<Project>().WithMany().HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<LifeTask>().HasOne<Category>().WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<Subtask>().HasOne<LifeTask>().WithMany().HasForeignKey(x => x.TaskId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<CalendarEvent>().HasOne<Category>().WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<Goal>().HasOne<Category>().WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<GoalAction>().HasOne<Goal>().WithMany().HasForeignKey(x => x.GoalId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Note>().HasOne<Category>().WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<CreditCard>().HasOne<FinancialAccount>().WithMany().HasForeignKey(x => x.AccountId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<FinancialTransaction>().HasOne<FinancialAccount>().WithMany().HasForeignKey(x => x.AccountId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<FinancialTransaction>().HasOne<CreditCard>().WithMany().HasForeignKey(x => x.CardId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<FinancialTransaction>().HasOne<Category>().WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<Transfer>().HasOne<FinancialAccount>().WithMany().HasForeignKey(x => x.FromAccountId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Transfer>().HasOne<FinancialAccount>().WithMany().HasForeignKey(x => x.ToAccountId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<InstallmentPurchase>().HasOne<CreditCard>().WithMany().HasForeignKey(x => x.CardId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Installment>().HasOne<InstallmentPurchase>().WithMany().HasForeignKey(x => x.PurchaseId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Budget>().HasOne<Category>().WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Assignment>().HasOne<StudySubject>().WithMany().HasForeignKey(x => x.SubjectId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<StudyTopic>().HasOne<StudySubject>().WithMany().HasForeignKey(x => x.SubjectId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<Vehicle>().HasOne<Asset>().WithOne().HasForeignKey<Vehicle>(x => x.AssetId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<AssetMaintenance>().HasOne<Asset>().WithMany().HasForeignKey(x => x.AssetId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<LifeOS.Domain.Document>().HasOne<Category>().WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Goal>().ToTable(t => t.HasCheckConstraint("ck_goals_values", "target_value > 0 AND current_value >= 0"));
        modelBuilder.Entity<FinancialTransaction>().ToTable(t => t.HasCheckConstraint("ck_transactions_amount", "amount > 0"));
        modelBuilder.Entity<Transfer>().ToTable(t => t.HasCheckConstraint("ck_transfers_accounts", "from_account_id <> to_account_id AND amount > 0"));
        modelBuilder.Entity<CreditCard>().ToTable(t => t.HasCheckConstraint("ck_credit_cards_days", "closing_day BETWEEN 1 AND 31 AND due_day BETWEEN 1 AND 31 AND limit_amount >= 0"));
        modelBuilder.Entity<Budget>().ToTable(t => t.HasCheckConstraint("ck_budgets_period", "month BETWEEN 1 AND 12 AND year >= 2000 AND limit_amount > 0"));

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties()) property.SetColumnName(ToSnakeCase(property.Name));
            foreach (var key in entityType.GetKeys()) key.SetName($"pk_{entityType.GetTableName()}");
            foreach (var foreignKey in entityType.GetForeignKeys())
                foreignKey.SetConstraintName($"fk_{entityType.GetTableName()}_{foreignKey.PrincipalEntityType.GetTableName()}_{string.Join('_', foreignKey.Properties.Select(x => ToSnakeCase(x.Name)))}");
        }

        foreach (var property in modelBuilder.Model.GetEntityTypes().SelectMany(x => x.GetProperties()).Where(x => x.ClrType == typeof(decimal) || x.ClrType == typeof(decimal?)))
        {
            property.SetPrecision(18);
            property.SetScale(2);
        }
        foreach (var property in modelBuilder.Model.GetEntityTypes().SelectMany(x => x.GetProperties()).Where(x => x.ClrType == typeof(string)))
        {
            var limit = property.Name switch
            {
                "Content" => 1_000_000,
                "Description" or "Notes" => 20_000,
                "StoragePath" or "AvatarUrl" or "CertificateUrl" or "CredentialUrl" => 2_000,
                "OriginalFilename" => 255,
                _ => 300
            };
            property.SetMaxLength(limit);
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in ChangeTracker.Entries<Entity>())
        {
            if (entry.State == EntityState.Added) entry.Entity.CreatedAt = now;
            if (entry.State is EntityState.Added or EntityState.Modified) entry.Entity.UpdatedAt = now;
        }
        return base.SaveChangesAsync(cancellationToken);
    }

    private static void Table<T>(ModelBuilder builder, string name) where T : class => builder.Entity<T>().ToTable(name);

    private static string ToSnakeCase(string value)
    {
        var output = new StringBuilder(value.Length + 8);
        for (var i = 0; i < value.Length; i++)
        {
            var current = value[i];
            if (char.IsUpper(current) && i > 0) output.Append('_');
            output.Append(char.ToLowerInvariant(current));
        }
        return output.ToString();
    }
}
