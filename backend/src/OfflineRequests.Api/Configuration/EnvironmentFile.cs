namespace OfflineRequests.Api.Configuration;

public static class EnvironmentFile
{
    public static void LoadFromCurrentDirectory()
    {
        var directory = new DirectoryInfo(Directory.GetCurrentDirectory());

        while (directory is not null)
        {
            var path = Path.Combine(directory.FullName, ".env");
            if (File.Exists(path))
            {
                Load(path);
                return;
            }

            directory = directory.Parent;
        }
    }

    public static void Load(string path)
    {
        if (!File.Exists(path)) return;

        foreach (var line in File.ReadLines(path))
        {
            var value = line.Trim();
            if (value.Length == 0 || value.StartsWith('#')) continue;

            var separatorIndex = value.IndexOf('=');
            if (separatorIndex <= 0) continue;

            var key = value[..separatorIndex].Trim();
            var environmentValue = value[(separatorIndex + 1)..].Trim().Trim('"', '\'');

            if (Environment.GetEnvironmentVariable(key) is null)
                Environment.SetEnvironmentVariable(key, environmentValue);
        }
    }
}
