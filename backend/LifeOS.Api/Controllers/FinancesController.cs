using LifeOS.Application.Abstractions;
using LifeOS.Application;
using LifeOS.Domain;
using LifeOS.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Api.Controllers;

[ApiController, Authorize, Route("api/v1/finances")]
public sealed class FinancesController(LifeOsDbContext db, ICurrentUser currentUser) : ControllerBase
{
    [HttpPost("transfers")]
    public async Task<ActionResult<Transfer>> Transfer([FromBody] Transfer input, CancellationToken ct)
    {
        input.Id = Guid.NewGuid(); input.UserId = currentUser.Id;
        EntityRules.Validate(input);
        var accounts = await db.FinancialAccounts.Where(x => x.UserId == currentUser.Id && (x.Id == input.FromAccountId || x.Id == input.ToAccountId)).CountAsync(ct);
        if (accounts != 2) return BadRequest(new HttpValidationProblemDetails(new Dictionary<string, string[]> { ["accounts"] = ["Uma ou mais contas não pertencem ao usuário."] }));
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        db.Transfers.Add(input);
        db.Transactions.AddRange(
            new FinancialTransaction { UserId = currentUser.Id, AccountId = input.FromAccountId, TransferId = input.Id, Description = input.Description ?? "Transferência", Type = "transfer", Amount = input.Amount, TransactionDate = input.TransferDate, Notes = "out" },
            new FinancialTransaction { UserId = currentUser.Id, AccountId = input.ToAccountId, TransferId = input.Id, Description = input.Description ?? "Transferência", Type = "transfer", Amount = input.Amount, TransactionDate = input.TransferDate, Notes = "in" });
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Created($"/api/v1/finances/transfers/{input.Id}", input);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<object>> Summary([FromQuery] int? month, [FromQuery] int? year, CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var selectedMonth = month ?? today.Month;
        var selectedYear = year ?? today.Year;
        if (selectedMonth is < 1 or > 12) return BadRequest(new HttpValidationProblemDetails(new Dictionary<string, string[]> { ["month"] = ["Mês inválido."] }));
        var start = new DateOnly(selectedYear, selectedMonth, 1);
        var end = start.AddMonths(1);
        var rows = await db.Transactions.AsNoTracking().Where(x => x.UserId == currentUser.Id && x.TransactionDate >= start && x.TransactionDate < end).ToListAsync(ct);
        var incomes = rows.Where(x => x.Type == "income").Sum(x => x.Amount);
        var expenses = rows.Where(x => x.Type == "expense").Sum(x => x.Amount);
        var accounts = await db.FinancialAccounts.AsNoTracking().Where(x => x.UserId == currentUser.Id && x.IsActive).ToListAsync(ct);
        var allMovements = await db.Transactions.AsNoTracking().Where(x => x.UserId == currentUser.Id).ToListAsync(ct);
        var balances = accounts.Select(account => new
        {
            account.Id, account.Name,
            Balance = FinanceMath.Balance(account.InitialBalance, allMovements.Where(x => x.AccountId == account.Id).Select(x => (x.Type, x.Amount, x.Notes)))
        });
        var categories = await db.Categories.AsNoTracking().Where(x => x.UserId == currentUser.Id).ToDictionaryAsync(x => x.Id, x => x.Name, ct);
        return Ok(new
        {
            month = selectedMonth, year = selectedYear, incomes, expenses, result = incomes - expenses,
            balance = balances.Sum(x => x.Balance), accounts = balances,
            spendingByCategory = rows.Where(x => x.Type == "expense").GroupBy(x => x.CategoryId).Select(g => new { category = g.Key.HasValue && categories.TryGetValue(g.Key.Value, out var name) ? name : "Sem categoria", amount = g.Sum(x => x.Amount) })
        });
    }

    [HttpPost("debts/{id:guid}/payments")]
    public async Task<ActionResult<Debt>> PayDebt(Guid id, [FromBody] DebtPayment request, CancellationToken ct)
    {
        if (request.Amount <= 0) return BadRequest(new HttpValidationProblemDetails(new Dictionary<string, string[]> { ["amount"] = ["O valor deve ser maior que zero."] }));
        var debt = await db.Debts.SingleOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.Id, ct);
        if (debt is null) return NotFound();
        if (request.AccountId.HasValue && !await db.FinancialAccounts.AnyAsync(x => x.Id == request.AccountId && x.UserId == currentUser.Id, ct))
            return BadRequest(new HttpValidationProblemDetails(new Dictionary<string, string[]> { ["accountId"] = ["Conta inválida."] }));
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        debt.RemainingAmount = Math.Max(0, debt.RemainingAmount - request.Amount);
        if (debt.InstallmentsRemaining > 0) debt.InstallmentsRemaining--;
        if (debt.RemainingAmount == 0) { debt.Status = "paid"; debt.InstallmentsRemaining = 0; }
        if (request.AccountId.HasValue) db.Transactions.Add(new FinancialTransaction { UserId = currentUser.Id, AccountId = request.AccountId.Value, Description = $"Pagamento: {debt.Creditor}", Type = "expense", Amount = request.Amount, TransactionDate = request.Date ?? LifeClock.Today(), Notes = "debt_payment" });
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Ok(debt);
    }

    [HttpGet("cards/{id:guid}/invoices")]
    public async Task<ActionResult<object>> CardInvoices(Guid id, CancellationToken ct)
    {
        var card = await db.CreditCards.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.Id, ct);
        if (card is null) return NotFound();
        var purchases = await db.InstallmentPurchases.AsNoTracking().Where(x => x.UserId == currentUser.Id && x.CardId == id).Select(x => x.Id).ToListAsync(ct);
        var installments = await db.Installments.AsNoTracking().Where(x => x.UserId == currentUser.Id && purchases.Contains(x.PurchaseId)).ToListAsync(ct);
        var charges = await db.Transactions.AsNoTracking().Where(x => x.UserId == currentUser.Id && x.CardId == id && x.Type == "expense").ToListAsync(ct);
        var invoices = installments.Select(x => new { month = new DateOnly(x.DueDate.Year, x.DueDate.Month, 1), amount = x.Amount, paid = x.Status == "paid" })
            .Concat(charges.Select(x => { var invoiceDate = x.TransactionDate.Day > card.ClosingDay ? x.TransactionDate.AddMonths(1) : x.TransactionDate; return new { month = new DateOnly(invoiceDate.Year, invoiceDate.Month, 1), amount = x.Amount, paid = false }; }))
            .GroupBy(x => x.month).OrderBy(x => x.Key).Select(group => new { month = group.Key, total = group.Sum(x => x.amount), paid = group.All(x => x.paid) });
        var used = charges.Sum(x => x.Amount) + installments.Where(x => x.Status != "paid").Sum(x => x.Amount);
        return Ok(new { card.Id, card.Name, limit = card.LimitAmount, used, available = Math.Max(0, card.LimitAmount - used), invoices });
    }

    [HttpPost("installments/{id:guid}/pay")]
    public async Task<ActionResult<Installment>> PayInstallment(Guid id, CancellationToken ct)
    {
        var installment = await db.Installments.SingleOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.Id, ct);
        if (installment is null) return NotFound();
        installment.Status = "paid"; installment.PaidAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct); return Ok(installment);
    }

    [HttpPost("installment-purchases/{id:guid}/settle")]
    public async Task<IActionResult> SettlePurchase(Guid id, CancellationToken ct)
    {
        var purchase = await db.InstallmentPurchases.SingleOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.Id, ct);
        if (purchase is null) return NotFound();
        var installments = await db.Installments.Where(x => x.PurchaseId == id && x.UserId == currentUser.Id && x.Status != "paid").ToListAsync(ct);
        foreach (var installment in installments) { installment.Status = "paid"; installment.PaidAt = DateTimeOffset.UtcNow; }
        purchase.Status = "settled"; await db.SaveChangesAsync(ct); return NoContent();
    }
}

public sealed record DebtPayment(decimal Amount, Guid? AccountId, DateOnly? Date);
