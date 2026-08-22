namespace LifeOS.Application;

public static class LifeClock
{
    public const string DefaultTimeZone = "America/Sao_Paulo";
    public static DateTimeOffset InSaoPaulo(DateTimeOffset instant) => TimeZoneInfo.ConvertTime(instant, TimeZoneInfo.FindSystemTimeZoneById(DefaultTimeZone));
    public static DateOnly Today() => DateOnly.FromDateTime(InSaoPaulo(DateTimeOffset.UtcNow).DateTime);
}
