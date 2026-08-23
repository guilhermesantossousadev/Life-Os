using System.Text.Json;
using LifeOS.Application;
using LifeOS.Infrastructure;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace LifeOS.Api.Presentation;

public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct)
    {
        ProblemDetails problem;
        if (exception is DomainValidationException validation)
        {
            problem = new HttpValidationProblemDetails(validation.Errors) { Status = StatusCodes.Status400BadRequest, Title = "Validation failed" };
        }
        else if (exception is UnauthorizedAccessException)
        {
            problem = new ProblemDetails { Status = StatusCodes.Status401Unauthorized, Title = "Unauthorized" };
        }
        else if (exception is ArgumentException argument)
        {
            problem = new ProblemDetails { Status = StatusCodes.Status400BadRequest, Title = "Invalid request", Detail = argument.Message };
        }
        else
        {
            logger.LogError(exception, "Unhandled API error for {Method} {Path}", context.Request.Method, context.Request.Path);
            problem = new ProblemDetails { Status = StatusCodes.Status500InternalServerError, Title = "Internal server error", Detail = "Não foi possível concluir a operação." };
        }
        problem.Extensions["traceId"] = context.TraceIdentifier;
        context.Response.StatusCode = problem.Status ?? 500;
        await context.Response.WriteAsJsonAsync(problem, ct);
        return true;
    }
}

public sealed class DatabaseHealthCheck(LifeOsDbContext db) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try { return await db.Database.CanConnectAsync(cancellationToken) ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy(); }
        catch { return HealthCheckResult.Unhealthy(); }
    }
}

public static class HealthResponseWriter
{
    public static Task Write(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json";
        return context.Response.WriteAsync(JsonSerializer.Serialize(new { status = report.Status.ToString().ToLowerInvariant() }));
    }
}
