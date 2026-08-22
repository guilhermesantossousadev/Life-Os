namespace LifeOS.Application;

public static class FinanceMath
{
    public static IReadOnlyList<decimal> SplitInstallments(decimal total, int count)
    {
        if (total <= 0 || count <= 0) throw new ArgumentOutOfRangeException(nameof(total));
        var regular = decimal.Round(total / count, 2, MidpointRounding.ToEven);
        var values = Enumerable.Repeat(regular, count).ToArray();
        values[^1] = total - values.Take(count - 1).Sum();
        return values;
    }

    public static decimal Balance(decimal initialBalance, IEnumerable<(string Type, decimal Amount, string? Direction)> movements)
        => initialBalance + movements.Sum(item => item.Type switch
        {
            "income" => item.Amount,
            "expense" => -item.Amount,
            "transfer" when item.Direction == "in" => item.Amount,
            "transfer" => -item.Amount,
            _ => 0
        });
}
