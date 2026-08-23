namespace LifeOS.Application.Abstractions;

/// <summary>Port used by the application to manage private user files.</summary>
public interface IPrivateFileStorage
{
    Task UploadAsync(string path, Stream content, string mimeType, CancellationToken cancellationToken);
    Task<string> CreateSignedUrlAsync(string path, TimeSpan validity, CancellationToken cancellationToken);
    Task DeleteAsync(string path, CancellationToken cancellationToken);
}
