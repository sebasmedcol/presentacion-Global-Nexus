param(
  [int]$Port = 8000,
  [string]$Root = "."
)

Add-Type -AssemblyName System.Net.HttpListener

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Static server running at $prefix (root: $Root)"

function Get-ContentType($path) {
  switch ([System.IO.Path]::GetExtension($path).ToLower()) {
    ".html" { return "text/html" }
    ".css"  { return "text/css" }
    ".js"   { return "application/javascript" }
    ".json" { return "application/json" }
    ".png"  { return "image/png" }
    ".jpg"  { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".svg"  { return "image/svg+xml" }
    default  { return "application/octet-stream" }
  }
}

while ($true) {
  $context = $listener.GetContext()
  $req = $context.Request
  $res = $context.Response

  $path = $req.Url.AbsolutePath.TrimStart('/')
  if ([string]::IsNullOrWhiteSpace($path)) { $path = "index.html" }
  $fsPath = Join-Path $Root $path

  if (Test-Path $fsPath) {
    try {
      $bytes = [System.IO.File]::ReadAllBytes($fsPath)
      $res.ContentType = Get-ContentType $fsPath
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      $res.StatusCode = 200
    } catch {
      $res.StatusCode = 500
      $msg = [System.Text.Encoding]::UTF8.GetBytes($_.ToString())
      $res.OutputStream.Write($msg, 0, $msg.Length)
    }
  } else {
    $res.StatusCode = 404
    $msg = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
    $res.OutputStream.Write($msg, 0, $msg.Length)
  }

  $res.OutputStream.Close()
}