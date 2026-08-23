using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using LifeOS.Application.Abstractions;

namespace LifeOS.Api.Infrastructure;

public sealed class SupabaseStorage(HttpClient http, IConfiguration configuration) : IPrivateFileStorage
{
    private string Url => Required("Supabase:Url").TrimEnd('/');
    private string Key => Required("Supabase:ServiceRoleKey");
    private string Bucket => configuration["Supabase:StorageBucket"] ?? "documents";
    private string Required(string key) => string.IsNullOrWhiteSpace(configuration[key]) ? throw new InvalidOperationException($"{key} ausente.") : configuration[key]!;

    public async Task UploadAsync(string path, Stream content, string mimeType, CancellationToken ct)
    {
        using var request = Create(HttpMethod.Post, $"{Url}/storage/v1/object/{Bucket}/{EncodePath(path)}");
        request.Headers.Add("x-upsert", "false");
        request.Content = new StreamContent(content);
        request.Content.Headers.ContentType = MediaTypeHeaderValue.Parse(mimeType);
        using var response = await http.SendAsync(request, ct);
        await EnsureSuccess(response, ct);
    }

    public async Task<string> CreateSignedUrlAsync(string path, TimeSpan validity, CancellationToken ct)
    {
        using var request = Create(HttpMethod.Post, $"{Url}/storage/v1/object/sign/{Bucket}/{EncodePath(path)}");
        request.Content = new StringContent(JsonSerializer.Serialize(new { expiresIn = (int)validity.TotalSeconds }), Encoding.UTF8, "application/json");
        using var response = await http.SendAsync(request, ct);
        await EnsureSuccess(response, ct);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct));
        var signed = json.RootElement.GetProperty("signedURL").GetString() ?? throw new InvalidOperationException("Storage não retornou URL assinada.");
        return signed.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? signed : $"{Url}/storage/v1{signed}";
    }

    public async Task DeleteAsync(string path, CancellationToken ct)
    {
        using var request = Create(HttpMethod.Delete, $"{Url}/storage/v1/object/{Bucket}/{EncodePath(path)}");
        using var response = await http.SendAsync(request, ct);
        await EnsureSuccess(response, ct);
    }

    private HttpRequestMessage Create(HttpMethod method, string url)
    {
        var request = new HttpRequestMessage(method, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", Key);
        request.Headers.Add("apikey", Key);
        return request;
    }

    private static string EncodePath(string path) => string.Join('/', path.Split('/').Select(Uri.EscapeDataString));

    private static async Task EnsureSuccess(HttpResponseMessage response, CancellationToken ct)
    {
        if (response.IsSuccessStatusCode) return;
        var body = await response.Content.ReadAsStringAsync(ct);
        throw new HttpRequestException($"Operação de storage falhou com status {(int)response.StatusCode}: {body[..Math.Min(body.Length, 300)]}");
    }
}
