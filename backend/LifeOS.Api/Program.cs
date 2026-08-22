using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using LifeOS.Api;
using LifeOS.Api.Auth;
using LifeOS.Api.Middleware;
using LifeOS.Api.Storage;
using LifeOS.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole(options => options.IncludeScopes = true);

builder.Services.AddProblemDetails(options => options.CustomizeProblemDetails = context =>
{
    context.ProblemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
});
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHttpClient<IPrivateFileStorage, SupabaseStorage>();
builder.Services.AddControllers().AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

var configuredSupabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseUrl = string.IsNullOrWhiteSpace(configuredSupabaseUrl) ? null : configuredSupabaseUrl.Trim().TrimEnd('/');
var configuredIssuer = builder.Configuration["Supabase:JwtIssuer"];
var issuer = string.IsNullOrWhiteSpace(configuredIssuer)
    ? (supabaseUrl is null ? null : $"{supabaseUrl}/auth/v1")
    : configuredIssuer.Trim().TrimEnd('/');
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    if (!string.IsNullOrWhiteSpace(issuer)) options.Authority = issuer;
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidIssuer = issuer,
        ValidateAudience = true, ValidAudience = builder.Configuration["Supabase:JwtAudience"] ?? "authenticated",
        ValidateLifetime = true, ValidateIssuerSigningKey = true, ClockSkew = TimeSpan.FromSeconds(30),
        NameClaimType = "sub",
        IssuerValidator = (tokenIssuer, _, _) =>
        {
            if (string.IsNullOrWhiteSpace(issuer) ||
                !string.Equals(tokenIssuer?.TrimEnd('/'), issuer, StringComparison.Ordinal))
            {
                throw new SecurityTokenInvalidIssuerException("O emissor do token não corresponde ao projeto Supabase configurado.");
            }

            return issuer;
        }
    };
});
builder.Services.AddAuthorization();

var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddPolicy("frontend", policy =>
{
    if (origins.Length > 0) policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
}));
builder.Services.AddRateLimiter(options => options.AddPolicy("uploads", context => RateLimitPartition.GetFixedWindowLimiter(
    context.User.FindFirst("sub")?.Value ?? context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
    _ => new FixedWindowRateLimiterOptions { PermitLimit = 20, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 })));

builder.Services.AddHealthChecks().AddCheck<DatabaseHealthCheck>("database");
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Life OS API", Version = "v1", Description = "API privada e multiusuário do Life OS." });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme { Type = SecuritySchemeType.Http, Scheme = "bearer", BearerFormat = "JWT", Description = "JWT de sessão emitido pelo Supabase Auth." });
});

var app = builder.Build();
app.Logger.LogInformation("Supabase JWT issuer configured as {Issuer}", issuer);
app.UseExceptionHandler();
app.UseMiddleware<CorrelationIdMiddleware>();
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    await next();
});
if (!app.Environment.IsDevelopment()) app.UseHsts();
app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors("frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();
app.MapHealthChecks("/health", new HealthCheckOptions { ResponseWriter = HealthResponseWriter.Write }).AllowAnonymous();
app.MapFallbackToFile("index.html");

if (builder.Configuration.GetValue<bool>("Database:MigrateOnStartup"))
{
    await using var scope = app.Services.CreateAsyncScope();
    var database = scope.ServiceProvider.GetRequiredService<LifeOsDbContext>();
    await database.Database.MigrateAsync();
}

app.Run();

public partial class Program;
