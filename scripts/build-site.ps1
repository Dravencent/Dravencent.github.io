Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path -LiteralPath (Split-Path -Parent $PSScriptRoot)).Path
if (-not $RepoRoot.StartsWith("D:\", [StringComparison]::OrdinalIgnoreCase)) {
  throw "The CV build is restricted to the D: drive."
}

Push-Location -LiteralPath $RepoRoot
try {
  . (Join-Path $PSScriptRoot "set-local-env.ps1")

  $Python = "E:\python 3.10.9\python.exe"
  if (-not (Test-Path -LiteralPath $Python -PathType Leaf)) {
    throw "Expected D-safe Python runtime was not found at $Python"
  }
  & $Python (Join-Path $PSScriptRoot "optimize_profile_image.py") "images/My.png" "images/yu-zhan-illustration.webp"
  if ($LASTEXITCODE -ne 0) { throw "Profile illustration optimization failed." }

  $Ruby = Join-Path $RepoRoot ".local-tools\ruby\bin\ruby.exe"
  $Bundler = Join-Path $RepoRoot ".local-tools\gems\bin\bundle"
  $Jekyll = Join-Path $RepoRoot ".local-tools\bundle\ruby\3.2.0\bin\jekyll"
  foreach ($Executable in @($Ruby, $Bundler, $Jekyll)) {
    if (-not (Test-Path -LiteralPath $Executable -PathType Leaf)) {
      throw "Required D-local build entry point is missing: $Executable"
    }
  }

  $Destination = Join-Path $RepoRoot ".test-output\site"
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Destination) | Out-Null
  # Windows has no IANA zoneinfo database. Keep Asia/Shanghai in the public
  # configuration and neutralize it only for this local build invocation.
  $LocalConfig = Join-Path $RepoRoot ".test-output\local-jekyll.yml"
  [IO.File]::WriteAllText($LocalConfig, "timezone: false`n", [Text.UTF8Encoding]::new($false))
  $ConfigFiles = "$(Join-Path $RepoRoot '_config.yml'),$LocalConfig"
  & $Ruby $Bundler "_2.5.23_" exec $Ruby $Jekyll build --config $ConfigFiles --strict_front_matter --trace --destination $Destination
  if ($LASTEXITCODE -ne 0) { throw "Strict Jekyll build failed." }
  # jekyll-sitemap always emits robots.txt. The public site does not need a
  # crawler policy, so keep the reviewed local artifact set intentionally small.
  $GeneratedRobots = Join-Path $Destination "robots.txt"
  if (Test-Path -LiteralPath $GeneratedRobots -PathType Leaf) {
    Remove-Item -LiteralPath $GeneratedRobots -Force
  }
}
finally {
  Pop-Location
}
