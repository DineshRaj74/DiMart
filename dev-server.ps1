param(
    [int]$Port = 8080
)

$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "src\main\resources\static"))
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css" = "text/css; charset=utf-8"
    ".js" = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".jpg" = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png" = "image/png"
    ".svg" = "image/svg+xml"
    ".webp" = "image/webp"
    ".ico" = "image/x-icon"
}

function Send-Text {
    param(
        [System.Net.HttpListenerResponse]$Response,
        [int]$StatusCode,
        [string]$Text
    )

    $body = [System.Text.Encoding]::UTF8.GetBytes($Text)
    $Response.StatusCode = $StatusCode
    $Response.ContentType = "text/plain; charset=utf-8"
    $Response.ContentLength64 = $body.Length
    $Response.OutputStream.Write($body, 0, $body.Length)
}

try {
    $listener.Start()
    Write-Host "Dimart is running at http://localhost:$Port/"
    Write-Host "Press Ctrl+C to stop."

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $response = $context.Response
        $response.Headers.Add("Cache-Control", "no-store")

        try {
            $urlPath = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath)

            if ($urlPath -eq "/") {
                $urlPath = "/index.html"
            }

            $relativePath = $urlPath.TrimStart("/") -replace "/", "\"
            $filePath = [System.IO.Path]::GetFullPath((Join-Path $root $relativePath))

            if (-not $filePath.StartsWith($root)) {
                Send-Text $response 403 "Forbidden"
                continue
            }

            if (-not [System.IO.File]::Exists($filePath)) {
                Send-Text $response 404 "Page not found"
                continue
            }

            $body = [System.IO.File]::ReadAllBytes($filePath)
            $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
            $response.StatusCode = 200
            $response.ContentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { "application/octet-stream" }
            $response.ContentLength64 = $body.Length
            $response.OutputStream.Write($body, 0, $body.Length)
        }
        catch {
            Send-Text $response 500 "Server error"
        }
        finally {
            $response.OutputStream.Close()
        }
    }
}
finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
