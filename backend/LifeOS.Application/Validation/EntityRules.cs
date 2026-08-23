using LifeOS.Domain;

namespace LifeOS.Application;

public sealed class DomainValidationException(IDictionary<string, string[]> errors) : Exception("Validation failed")
{
    public IDictionary<string, string[]> Errors { get; } = errors;
}

public static class EntityRules
{
    public static void Validate(object entity)
    {
        var errors = new Dictionary<string, string[]>();
        void Required(string key, string? value, int max = 200)
        {
            if (string.IsNullOrWhiteSpace(value)) errors[key] = ["Campo obrigatório."];
            else if (value.Length > max) errors[key] = [$"Máximo de {max} caracteres."];
        }

        switch (entity)
        {
            case LifeTask x:
                Required(nameof(x.Title), x.Title);
                Allowed(errors, nameof(x.Priority), x.Priority, "low", "normal", "high", "baixa", "alta");
                Allowed(errors, nameof(x.Status), x.Status, "pending", "completed", "cancelled");
                break;
            case InboxItem x: Required(nameof(x.Content), x.Content, 4000); break;
            case CalendarEvent x:
                Required(nameof(x.Title), x.Title);
                if (x.EndAt <= x.StartAt) errors[nameof(x.EndAt)] = ["O fim deve ser posterior ao início."];
                break;
            case Goal x:
                Required(nameof(x.Title), x.Title);
                if (x.TargetValue <= 0) errors[nameof(x.TargetValue)] = ["A meta deve ser maior que zero."];
                if (x.CurrentValue < 0) errors[nameof(x.CurrentValue)] = ["O progresso não pode ser negativo."];
                break;
            case Project x: Required(nameof(x.Title), x.Title); DateOrder(errors, x.StartDate, x.Deadline); break;
            case Note x: Required(nameof(x.Title), x.Title); break;
            case FinancialAccount x:
                Required(nameof(x.Name), x.Name);
                Allowed(errors, nameof(x.Type), x.Type, "checking", "savings", "cash", "investment", "other");
                break;
            case FinancialTransaction x:
                Required(nameof(x.Description), x.Description);
                if (x.Amount <= 0) errors[nameof(x.Amount)] = ["O valor deve ser maior que zero."];
                Allowed(errors, nameof(x.Type), x.Type, "income", "expense", "transfer");
                break;
            case Transfer x:
                if (x.Amount <= 0) errors[nameof(x.Amount)] = ["O valor deve ser maior que zero."];
                if (x.FromAccountId == x.ToAccountId) errors[nameof(x.ToAccountId)] = ["As contas devem ser diferentes."];
                break;
            case CreditCard x:
                Required(nameof(x.Name), x.Name);
                if (x.LimitAmount < 0) errors[nameof(x.LimitAmount)] = ["O limite não pode ser negativo."];
                if (x.ClosingDay is < 1 or > 31) errors[nameof(x.ClosingDay)] = ["Dia inválido."];
                if (x.DueDay is < 1 or > 31) errors[nameof(x.DueDay)] = ["Dia inválido."];
                break;
            case InstallmentPurchase x:
                Required(nameof(x.Description), x.Description);
                if (x.TotalAmount <= 0) errors[nameof(x.TotalAmount)] = ["O valor deve ser maior que zero."];
                if (x.InstallmentCount is < 1 or > 240) errors[nameof(x.InstallmentCount)] = ["Quantidade entre 1 e 240."];
                break;
            case Debt x:
                Required(nameof(x.Creditor), x.Creditor);
                if (x.OriginalAmount <= 0 || x.RemainingAmount < 0 || x.RemainingAmount > x.OriginalAmount)
                    errors[nameof(x.RemainingAmount)] = ["Valores da dívida são inconsistentes."];
                break;
            case Budget x:
                if (x.Month is < 1 or > 12) errors[nameof(x.Month)] = ["Mês inválido."];
                if (x.LimitAmount <= 0) errors[nameof(x.LimitAmount)] = ["O limite deve ser maior que zero."];
                break;
            case StudySubject x: Required(nameof(x.Name), x.Name); break;
            case Assignment x: Required(nameof(x.Title), x.Title); break;
            case Course x:
                Required(nameof(x.Title), x.Title);
                if (x.Progress is < 0 or > 100) errors[nameof(x.Progress)] = ["Progresso entre 0 e 100."];
                break;
            case CareerPosition x: Required(nameof(x.Company), x.Company); Required(nameof(x.Role), x.Role); DateOrder(errors, x.StartDate, x.EndDate); break;
            case Skill x:
                Required(nameof(x.Name), x.Name);
                Allowed(errors, nameof(x.Level), x.Level, "learning", "basic", "intermediate", "advanced");
                break;
            case Certification x: Required(nameof(x.Name), x.Name); Required(nameof(x.Institution), x.Institution); DateOrder(errors, x.IssuedAt, x.ExpiresAt); break;
            case Asset x: Required(nameof(x.Name), x.Name); if (x.EstimatedValue < 0) errors[nameof(x.EstimatedValue)] = ["Valor inválido."]; break;
            case LifeOS.Domain.Document x: Required(nameof(x.Name), x.Name); Required(nameof(x.StoragePath), x.StoragePath, 1000); break;
            case Category x: Required(nameof(x.Name), x.Name); Required(nameof(x.Domain), x.Domain, 40); break;
            case Tag x: Required(nameof(x.Name), x.Name, 80); break;
        }

        if (errors.Count > 0) throw new DomainValidationException(errors);
    }

    private static void Allowed(Dictionary<string, string[]> errors, string key, string value, params string[] accepted)
    {
        if (!accepted.Contains(value, StringComparer.OrdinalIgnoreCase)) errors[key] = ["Valor inválido."];
    }

    private static void DateOrder(Dictionary<string, string[]> errors, DateOnly? start, DateOnly? end)
    {
        if (start.HasValue && end.HasValue && end < start) errors["deadline"] = ["A data final deve ser posterior à inicial."];
    }
}
