namespace LifeOS.Domain;

public abstract class Entity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public interface IUserOwned { Guid UserId { get; set; } }

public abstract class UserOwnedEntity : Entity, IUserOwned
{
    public Guid UserId { get; set; }
}

public sealed class Profile : Entity
{
    public Guid AuthUserId { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string? AvatarUrl { get; set; }
}

public sealed class UserPreference : UserOwnedEntity
{
    public string Theme { get; set; } = "system";
    public string DateFormat { get; set; } = "dd/MM/yyyy";
    public string FirstPage { get; set; } = "dashboard";
    public string TimeZone { get; set; } = "America/Sao_Paulo";
    public bool TaskDueNotifications { get; set; } = true;
    public bool FinanceDueNotifications { get; set; } = true;
    public bool StudyDueNotifications { get; set; } = true;
    public bool AssetMaintenanceNotifications { get; set; } = true;
    public bool WeeklySummary { get; set; } = true;
}

public sealed class Category : UserOwnedEntity
{
    public string Name { get; set; } = "";
    public string Domain { get; set; } = "";
    public string? Color { get; set; }
}

public sealed class Tag : UserOwnedEntity
{
    public string Name { get; set; } = "";
}

public sealed class Project : UserOwnedEntity
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Status { get; set; } = "planned";
    public DateOnly? StartDate { get; set; }
    public DateOnly? Deadline { get; set; }
}

public sealed class ProjectTag
{
    public Guid ProjectId { get; set; }
    public Guid TagId { get; set; }
}

public sealed class LifeTask : UserOwnedEntity
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Status { get; set; } = "pending";
    public string Priority { get; set; } = "normal";
    public Guid? CategoryId { get; set; }
    public Guid? ProjectId { get; set; }
    public DateOnly? DueDate { get; set; }
    public TimeOnly? DueTime { get; set; }
    public DateTimeOffset? ReminderAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
}

public sealed class Subtask : UserOwnedEntity
{
    public Guid TaskId { get; set; }
    public string Title { get; set; } = "";
    public bool IsCompleted { get; set; }
    public int Position { get; set; }
}

public sealed class InboxItem : UserOwnedEntity
{
    public string Content { get; set; } = "";
    public DateTimeOffset? ArchivedAt { get; set; }
    public string? ConvertedToType { get; set; }
    public Guid? ConvertedToId { get; set; }
}

public sealed class CalendarEvent : UserOwnedEntity
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string? Location { get; set; }
    public Guid? CategoryId { get; set; }
    public DateTimeOffset StartAt { get; set; }
    public DateTimeOffset EndAt { get; set; }
    public bool AllDay { get; set; }
    public DateTimeOffset? ReminderAt { get; set; }
}

public sealed class Goal : UserOwnedEntity
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public Guid? CategoryId { get; set; }
    public string Unit { get; set; } = "%";
    public decimal TargetValue { get; set; }
    public decimal CurrentValue { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? Deadline { get; set; }
    public string Status { get; set; } = "active";

    public decimal Progress => TargetValue <= 0 ? 0 : Math.Min(100, decimal.Round(CurrentValue / TargetValue * 100, 2));
}

public sealed class GoalAction : UserOwnedEntity
{
    public Guid GoalId { get; set; }
    public string Title { get; set; } = "";
    public bool IsCompleted { get; set; }
    public int Position { get; set; }
}

public sealed class Note : UserOwnedEntity
{
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public Guid? CategoryId { get; set; }
    public bool IsFavorite { get; set; }
}

public sealed class NoteTag
{
    public Guid NoteId { get; set; }
    public Guid TagId { get; set; }
}

public sealed class FinancialAccount : UserOwnedEntity
{
    public string Name { get; set; } = "";
    public string Type { get; set; } = "checking";
    public decimal InitialBalance { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Color { get; set; }
}

public sealed class CreditCard : UserOwnedEntity
{
    public string Name { get; set; } = "";
    public decimal LimitAmount { get; set; }
    public int ClosingDay { get; set; }
    public int DueDay { get; set; }
    public Guid AccountId { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Color { get; set; }
}

public sealed class FinancialTransaction : UserOwnedEntity
{
    public Guid AccountId { get; set; }
    public Guid? CardId { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? TransferId { get; set; }
    public string Description { get; set; } = "";
    public string Type { get; set; } = "expense";
    public decimal Amount { get; set; }
    public DateOnly TransactionDate { get; set; }
    public DateOnly? CompetencyDate { get; set; }
    public string? Notes { get; set; }
}

public sealed class Transfer : UserOwnedEntity
{
    public Guid FromAccountId { get; set; }
    public Guid ToAccountId { get; set; }
    public decimal Amount { get; set; }
    public DateOnly TransferDate { get; set; }
    public string? Description { get; set; }
}

public sealed class InstallmentPurchase : UserOwnedEntity
{
    public Guid CardId { get; set; }
    public string Description { get; set; } = "";
    public decimal TotalAmount { get; set; }
    public int InstallmentCount { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public string Status { get; set; } = "active";
}

public sealed class Installment : UserOwnedEntity
{
    public Guid PurchaseId { get; set; }
    public int Number { get; set; }
    public decimal Amount { get; set; }
    public DateOnly DueDate { get; set; }
    public string Status { get; set; } = "pending";
    public DateTimeOffset? PaidAt { get; set; }
}

public sealed class Debt : UserOwnedEntity
{
    public string Creditor { get; set; } = "";
    public string? Description { get; set; }
    public decimal OriginalAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public decimal InstallmentAmount { get; set; }
    public int InstallmentsTotal { get; set; }
    public int InstallmentsRemaining { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? ExpectedEndDate { get; set; }
    public string Status { get; set; } = "active";
}

public sealed class Budget : UserOwnedEntity
{
    public Guid CategoryId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal LimitAmount { get; set; }
}

public sealed class StudySubject : UserOwnedEntity
{
    public string Name { get; set; } = "";
    public string? Semester { get; set; }
    public string? Professor { get; set; }
    public string? Schedule { get; set; }
    public string Status { get; set; } = "active";
}

public sealed class Assignment : UserOwnedEntity
{
    public Guid SubjectId { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Type { get; set; } = "assignment";
    public DateOnly DueDate { get; set; }
    public decimal? Grade { get; set; }
    public decimal? MaxGrade { get; set; }
    public string Status { get; set; } = "pending";
}

public sealed class Course : UserOwnedEntity
{
    public string Title { get; set; } = "";
    public string? Provider { get; set; }
    public decimal Progress { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? CompletionDate { get; set; }
    public string? CertificateUrl { get; set; }
    public string Status { get; set; } = "active";
}

public sealed class StudyTopic : UserOwnedEntity
{
    public Guid? SubjectId { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Status { get; set; } = "pending";
}

public sealed class CareerPosition : UserOwnedEntity
{
    public string Company { get; set; } = "";
    public string Role { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Description { get; set; }
    public bool CurrentPosition { get; set; }
}

public sealed class CareerGoal : UserOwnedEntity
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public DateOnly? Deadline { get; set; }
    public string Status { get; set; } = "planned";
    public int Position { get; set; }
}

public sealed class Skill : UserOwnedEntity
{
    public string Name { get; set; } = "";
    public string Level { get; set; } = "learning";
    public string? Category { get; set; }
    public string? Notes { get; set; }
}

public sealed class Certification : UserOwnedEntity
{
    public string Name { get; set; } = "";
    public string Institution { get; set; } = "";
    public DateOnly? IssuedAt { get; set; }
    public DateOnly? ExpiresAt { get; set; }
    public string? CredentialId { get; set; }
    public string? CredentialUrl { get; set; }
    public string? StoragePath { get; set; }
    public string Status { get; set; } = "planned";
}

public sealed class Asset : UserOwnedEntity
{
    public string Name { get; set; } = "";
    public string Type { get; set; } = "other";
    public DateOnly? PurchaseDate { get; set; }
    public decimal? PurchaseValue { get; set; }
    public decimal EstimatedValue { get; set; }
    public string? Notes { get; set; }
}

public sealed class Vehicle
{
    public Guid AssetId { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public int? Year { get; set; }
    public string? LicensePlate { get; set; }
    public int? Mileage { get; set; }
    public DateOnly? InsuranceExpiration { get; set; }
    public DateOnly? RegistrationExpiration { get; set; }
}

public sealed class AssetMaintenance : UserOwnedEntity
{
    public Guid AssetId { get; set; }
    public string Description { get; set; } = "";
    public DateOnly MaintenanceDate { get; set; }
    public decimal Cost { get; set; }
    public DateOnly? NextDueDate { get; set; }
    public int? Mileage { get; set; }
}

public sealed class Document : UserOwnedEntity
{
    public string Name { get; set; } = "";
    public string OriginalFilename { get; set; } = "";
    public string StoragePath { get; set; } = "";
    public string MimeType { get; set; } = "application/octet-stream";
    public long SizeBytes { get; set; }
    public Guid? CategoryId { get; set; }
}

public sealed class DocumentTag
{
    public Guid DocumentId { get; set; }
    public Guid TagId { get; set; }
}
