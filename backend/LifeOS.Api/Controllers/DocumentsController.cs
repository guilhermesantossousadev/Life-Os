using LifeOS.Api.Auth;
using LifeOS.Api.Storage;
using LifeOS.Domain;
using LifeOS.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Api.Controllers;

[ApiController, Authorize, Route("api/v1/documents")]
public sealed class DocumentsController(LifeOsDbContext db, ICurrentUser currentUser, IPrivateFileStorage storage) : ControllerBase
{
    private const long MaxSize = 20 * 1024 * 1024;
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase) { ".pdf", ".png", ".jpg", ".jpeg", ".webp", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".csv" };
    private static readonly HashSet<string> AllowedMimes = new(StringComparer.OrdinalIgnoreCase) { "application/pdf", "image/png", "image/jpeg", "image/webp", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/plain", "text/csv" };

    [HttpGet]
    public async Task<ActionResult<object>> List([FromQuery] string? q, CancellationToken ct)
    {
        var query = db.Documents.AsNoTracking().Where(x => x.UserId == currentUser.Id);
        if (!string.IsNullOrWhiteSpace(q)) query = query.Where(x => x.Name.ToLower().Contains(q.Trim().ToLower()));
        return Ok(await query.OrderByDescending(x => x.UpdatedAt).ToListAsync(ct));
    }

    [HttpPost, RequestSizeLimit(MaxSize)]
    public async Task<ActionResult<LifeOS.Domain.Document>> Upload([FromForm] IFormFile file, [FromForm] string? name, [FromForm] Guid? categoryId, [FromForm] string? categoryName, CancellationToken ct)
    {
        var error = Validate(file);
        if (error is not null) return BadRequest(new HttpValidationProblemDetails(new Dictionary<string, string[]> { ["file"] = [error] }));
        if (categoryId.HasValue && !await db.Categories.AnyAsync(x => x.Id == categoryId && x.UserId == currentUser.Id, ct))
            return BadRequest(new HttpValidationProblemDetails(new Dictionary<string, string[]> { ["categoryId"] = ["Categoria inválida."] }));
        if (!categoryId.HasValue && !string.IsNullOrWhiteSpace(categoryName)) categoryId = await db.Categories.Where(x => x.UserId == currentUser.Id && x.Name == categoryName).Select(x => (Guid?)x.Id).FirstOrDefaultAsync(ct);

        var id = Guid.NewGuid();
        var safeFilename = Path.GetFileName(file.FileName).Replace("..", "", StringComparison.Ordinal);
        var storagePath = $"{currentUser.Id:D}/{id:D}/{safeFilename}";
        await using var stream = file.OpenReadStream();
        await storage.UploadAsync(storagePath, stream, file.ContentType, ct);
        var document = new LifeOS.Domain.Document
        {
            Id = id, UserId = currentUser.Id, Name = string.IsNullOrWhiteSpace(name) ? Path.GetFileNameWithoutExtension(safeFilename) : name.Trim(),
            OriginalFilename = safeFilename, StoragePath = storagePath, MimeType = file.ContentType, SizeBytes = file.Length, CategoryId = categoryId
        };
        db.Documents.Add(document);
        try { await db.SaveChangesAsync(ct); }
        catch { await storage.DeleteAsync(storagePath, ct); throw; }
        return CreatedAtAction(nameof(Download), new { id }, document);
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id, CancellationToken ct)
    {
        var document = await db.Documents.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.Id, ct);
        if (document is null) return NotFound();
        return Redirect(await storage.CreateSignedUrlAsync(document.StoragePath, TimeSpan.FromMinutes(2), ct));
    }

    [HttpGet("{id:guid}/signed-url")]
    public async Task<ActionResult<object>> SignedUrl(Guid id, CancellationToken ct)
    {
        var document = await db.Documents.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.Id, ct);
        if (document is null) return NotFound();
        return Ok(new { url = await storage.CreateSignedUrlAsync(document.StoragePath, TimeSpan.FromMinutes(2), ct) });
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<LifeOS.Domain.Document>> Rename(Guid id, [FromBody] RenameDocumentRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 200)
            return BadRequest(new HttpValidationProblemDetails(new Dictionary<string, string[]> { ["name"] = ["Nome obrigatório, com até 200 caracteres."] }));
        var document = await db.Documents.SingleOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.Id, ct);
        if (document is null) return NotFound();
        document.Name = request.Name.Trim();
        if (request.CategoryId.HasValue) document.CategoryId = await db.Categories.AnyAsync(x => x.Id == request.CategoryId && x.UserId == currentUser.Id, ct) ? request.CategoryId : document.CategoryId;
        else if (!string.IsNullOrWhiteSpace(request.CategoryName)) document.CategoryId = await db.Categories.Where(x => x.UserId == currentUser.Id && x.Name == request.CategoryName).Select(x => (Guid?)x.Id).FirstOrDefaultAsync(ct);
        if (request.Tags is not null)
        {
            var existingLinks = await db.DocumentTags.Where(x => x.DocumentId == id).ToListAsync(ct);
            db.DocumentTags.RemoveRange(existingLinks);
            foreach (var name in request.Tags.Select(x => x.Trim().ToLowerInvariant()).Where(x => x.Length is > 0 and <= 80).Distinct())
            {
                var tag = await db.Tags.SingleOrDefaultAsync(x => x.UserId == currentUser.Id && x.Name == name, ct);
                if (tag is null) { tag = new Tag { UserId = currentUser.Id, Name = name }; db.Tags.Add(tag); }
                db.DocumentTags.Add(new DocumentTag { DocumentId = id, TagId = tag.Id });
            }
        }
        await db.SaveChangesAsync(ct);
        return Ok(document);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var document = await db.Documents.SingleOrDefaultAsync(x => x.Id == id && x.UserId == currentUser.Id, ct);
        if (document is null) return NotFound();
        await storage.DeleteAsync(document.StoragePath, ct);
        db.Documents.Remove(document);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static string? Validate(IFormFile file)
    {
        if (file.Length == 0) return "Arquivo vazio.";
        if (file.Length > MaxSize) return "O limite é 20 MB.";
        if (!AllowedExtensions.Contains(Path.GetExtension(file.FileName))) return "Extensão não permitida.";
        if (!AllowedMimes.Contains(file.ContentType)) return "Tipo MIME não permitido.";
        return null;
    }
}

public sealed record RenameDocumentRequest(string Name, Guid? CategoryId, string? CategoryName, string[]? Tags);
