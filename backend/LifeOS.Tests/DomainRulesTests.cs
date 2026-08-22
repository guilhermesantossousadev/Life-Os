using LifeOS.Application;
using LifeOS.Domain;

namespace LifeOS.Tests;

public sealed class DomainRulesTests
{
    [Fact]
    public void Goal_progress_is_normalized_and_never_exceeds_one_hundred()
    {
        var goal = new Goal { Title = "Reserva", TargetValue = 100, CurrentValue = 130 };
        Assert.Equal(100, goal.Progress);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(-1, 0)]
    [InlineData(100, -1)]
    public void Goal_rejects_invalid_values(decimal target, decimal current)
    {
        Assert.Throws<DomainValidationException>(() => EntityRules.Validate(new Goal { Title = "Meta", TargetValue = target, CurrentValue = current }));
    }

    [Fact]
    public void Money_transaction_requires_positive_amount_and_explicit_type()
    {
        Assert.Throws<DomainValidationException>(() => EntityRules.Validate(new FinancialTransaction { Description = "Mercado", Amount = -10, Type = "expense" }));
        Assert.Throws<DomainValidationException>(() => EntityRules.Validate(new FinancialTransaction { Description = "Mercado", Amount = 10, Type = "unknown" }));
    }

    [Fact]
    public void Transfer_rejects_same_account()
    {
        var id = Guid.NewGuid();
        Assert.Throws<DomainValidationException>(() => EntityRules.Validate(new Transfer { FromAccountId = id, ToAccountId = id, Amount = 10 }));
    }

    [Fact]
    public void Sao_paulo_clock_returns_a_civil_date()
    {
        var date = LifeClock.Today();
        Assert.InRange(date.Year, 2020, 2100);
    }

    [Fact]
    public void Installment_rounding_preserves_the_exact_total()
    {
        var installments = FinanceMath.SplitInstallments(100m, 3);
        Assert.Equal(3, installments.Count);
        Assert.Equal(100m, installments.Sum());
        Assert.Equal(33.34m, installments[^1]);
    }

    [Fact]
    public void Transfers_move_balance_without_becoming_income_or_expense()
    {
        var source = FinanceMath.Balance(100m, [("transfer", 25m, "out")]);
        var target = FinanceMath.Balance(10m, [("transfer", 25m, "in")]);
        Assert.Equal(75m, source);
        Assert.Equal(35m, target);
    }
}
