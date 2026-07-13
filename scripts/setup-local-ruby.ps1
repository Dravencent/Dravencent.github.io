Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

trap {
  [Console]::Error.WriteLine($_.Exception.Message)
  exit 1
}

. (Join-Path $PSScriptRoot "set-local-env.ps1")

$repoRoot = (Resolve-Path -LiteralPath (Split-Path -Parent $PSScriptRoot)).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
if (-not $repoRoot.StartsWith("D:\", [StringComparison]::OrdinalIgnoreCase)) {
  throw "Portable Ruby setup is restricted to the D: drive."
}
$topLevelText = git rev-parse --show-toplevel
if ($LASTEXITCODE -ne 0 -or -not $topLevelText) {
  throw "Unable to resolve the current Git top level."
}
$topLevel = (Resolve-Path -LiteralPath $topLevelText.Trim()).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
if ($topLevel -ne $repoRoot) {
  throw "Unexpected repository root: $topLevel"
}

$runtimeRoot = Join-Path $repoRoot ".local-tools"
$downloadsRoot = Join-Path $runtimeRoot "downloads"
$rubyRoot = Join-Path $runtimeRoot "ruby"
$gemRoot = Join-Path $runtimeRoot "gems"
$archiveName = "rubyinstaller-3.2.11-1-x64.7z"
$archivePath = Join-Path $downloadsRoot $archiveName
$partialArchivePath = "$archivePath.partial"
$rubyUrl = "https://github.com/oneclick/rubyinstaller2/releases/download/RubyInstaller-3.2.11-1/rubyinstaller-3.2.11-1-x64.7z"
$expectedSha256 = "20e56be307ae5576c024c97a7d8784c2033e676ea8c67477dda602b8e97fe69c"

Push-Location -LiteralPath $repoRoot
try {
  @(
    $downloadsRoot,
    $rubyRoot,
    $gemRoot,
    (Join-Path $runtimeRoot "bundle-cache"),
    (Join-Path $runtimeRoot "bundle-home"),
    (Join-Path $runtimeRoot "npm-cache"),
    (Join-Path $runtimeRoot "tmp")
  ) | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ | Out-Null }

  $env:HOME = Join-Path $runtimeRoot "home"
  $env:USERPROFILE = $env:HOME
  $env:APPDATA = Join-Path $runtimeRoot "appdata"
  $env:LOCALAPPDATA = Join-Path $runtimeRoot "localappdata"
  $env:PSModuleAnalysisCachePath = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\PowerShell\ModuleAnalysisCache"
  $env:TEMP = Join-Path $runtimeRoot "tmp"
  $env:TMP = $env:TEMP
  $env:TMPDIR = $env:TEMP
  $env:XDG_CACHE_HOME = Join-Path $runtimeRoot "cache"
  $env:GEM_HOME = $gemRoot
  $portableDefaultGemPath = Join-Path $runtimeRoot "ruby\lib\ruby\gems\3.2.0"
  $env:GEM_PATH = @($env:GEM_HOME, $portableDefaultGemPath) -join [IO.Path]::PathSeparator
  $env:GEM_SPEC_CACHE = Join-Path $runtimeRoot "gem-spec-cache"
  $env:BUNDLE_USER_HOME = Join-Path $runtimeRoot "bundle-home"
  $env:BUNDLE_APP_CONFIG = Join-Path $runtimeRoot "bundle-config"
  $env:BUNDLE_PATH = Join-Path $runtimeRoot "bundle"
  $env:BUNDLE_CACHE_PATH = Join-Path $runtimeRoot "bundle-cache"
  $env:BUNDLE_IGNORE_CONFIG = "1"
  $env:JEKYLL_CACHE_DIR = Join-Path $runtimeRoot "jekyll-cache"
  $env:npm_config_cache = Join-Path $runtimeRoot "npm-cache"

  if (Test-Path -LiteralPath $archivePath -PathType Leaf) {
    $cachedHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($cachedHash -ne $expectedSha256) {
      Remove-Item -LiteralPath $archivePath -Force
    }
  }

  if (-not (Test-Path -LiteralPath $archivePath -PathType Leaf)) {
    if (Test-Path -LiteralPath $partialArchivePath) {
      Remove-Item -LiteralPath $partialArchivePath -Force
    }
    Invoke-WebRequest -Uri $rubyUrl -OutFile $partialArchivePath
    $downloadedHash = (Get-FileHash -LiteralPath $partialArchivePath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($downloadedHash -ne $expectedSha256) {
      Remove-Item -LiteralPath $partialArchivePath -Force
      throw "Portable Ruby archive SHA-256 mismatch."
    }
    Move-Item -LiteralPath $partialArchivePath -Destination $archivePath
  }

  $verifiedHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($verifiedHash -ne $expectedSha256) {
    Remove-Item -LiteralPath $archivePath -Force
    throw "Portable Ruby archive SHA-256 mismatch."
  }

  $rubyExecutable = Join-Path $rubyRoot "bin\ruby.exe"
  if (-not (Test-Path -LiteralPath $rubyExecutable -PathType Leaf)) {
    $extractRoot = Join-Path $runtimeRoot "ruby.partial"
    if (Test-Path -LiteralPath $extractRoot) {
      $resolvedExtractRoot = (Resolve-Path -LiteralPath $extractRoot).Path
      if (-not $resolvedExtractRoot.StartsWith($runtimeRoot, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove an extraction directory outside the local runtime."
      }
      Remove-Item -LiteralPath $resolvedExtractRoot -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path $extractRoot | Out-Null
    tar.exe -xf $archivePath -C $extractRoot
    if ($LASTEXITCODE -ne 0) {
      throw "Portable Ruby archive extraction failed."
    }
    $extractedRoots = @(Get-ChildItem -LiteralPath $extractRoot -Directory)
    if ($extractedRoots.Count -ne 1) {
      throw "Portable Ruby archive must contain exactly one top-level directory."
    }
    $extractedRubyRoot = $extractedRoots[0].FullName
    if (-not $extractedRubyRoot.StartsWith($extractRoot, [StringComparison]::OrdinalIgnoreCase)) {
      throw "Portable Ruby archive escaped the extraction directory."
    }
    $extractedRuby = Join-Path $extractedRubyRoot "bin\ruby.exe"
    if (-not (Test-Path -LiteralPath $extractedRuby -PathType Leaf)) {
      throw "Portable Ruby archive did not contain bin\\ruby.exe."
    }
    $resolvedRubyRoot = (Resolve-Path -LiteralPath $rubyRoot).Path
    if (-not $resolvedRubyRoot.StartsWith($runtimeRoot, [StringComparison]::OrdinalIgnoreCase)) {
      throw "Refusing to replace a Ruby directory outside the local runtime."
    }
    Remove-Item -LiteralPath $resolvedRubyRoot -Recurse -Force
    Move-Item -LiteralPath $extractedRubyRoot -Destination $rubyRoot
    Remove-Item -LiteralPath $extractRoot -Force
  }

  $rubyBin = Join-Path $rubyRoot "bin"
  $gemBin = Join-Path $gemRoot "bin"
  $env:MSYS2_PATH = Join-Path $rubyRoot "msys64"
  $localPathEntries = @($gemBin, $rubyBin)
  $remainingPathEntries = @($env:PATH -split [IO.Path]::PathSeparator | Where-Object {
    $_ -and $_ -notin $localPathEntries
  })
  $env:PATH = (@($localPathEntries) + $remainingPathEntries) -join [IO.Path]::PathSeparator

  $rubyVersion = ruby --version
  if ($LASTEXITCODE -ne 0 -or -not $rubyVersion -or $rubyVersion -notmatch '^ruby 3\.2\.11\b') {
    throw "Portable Ruby 3.2.11 is required."
  }

  $msys2ComponentPath = Join-Path $rubyRoot "lib\ruby\site_ruby\3.2.0\ruby_installer\runtime\components\01_msys2.rb"
  $msys2Component = Get-Content -LiteralPath $msys2ComponentPath -Raw
  if ($msys2Component -notmatch 'MSYS2_VERSION[^\r\n]*20251213' -or
      $msys2Component -notmatch 'd0ff26a909c7ba4b7b1b5b4f5fab057b624549ab4f77811794c2076e8786ac53') {
    throw "RubyInstaller MSYS2_VERSION 20251213 integrity metadata is missing."
  }
  $gccExecutable = Join-Path $env:MSYS2_PATH "ucrt64\bin\gcc.exe"
  if (-not (Test-Path -LiteralPath $gccExecutable -PathType Leaf)) {
    ridk.cmd install 1 3
    if ($LASTEXITCODE -ne 0) {
      throw "D-local RubyInstaller MSYS2 development toolchain installation failed."
    }
  }
  if (-not (Test-Path -LiteralPath $gccExecutable -PathType Leaf)) {
    throw "D-local MSYS2 ucrt64\\bin\\gcc.exe is unavailable."
  }

  $bundlerList = gem.cmd list --local bundler --exact
  if ($LASTEXITCODE -ne 0) {
    throw "Unable to inspect the D-local Bundler installation."
  }
  if ($bundlerList -notmatch '\b2\.5\.23\b') {
    gem.cmd install bundler --version 2.5.23 --no-document
    if ($LASTEXITCODE -ne 0) {
      throw "D-local Bundler 2.5.23 installation failed."
    }
  }

  $bundlerVersion = bundle _2.5.23_ --version
  if ($LASTEXITCODE -ne 0 -or -not $bundlerVersion -or $bundlerVersion.Trim() -ne "Bundler version 2.5.23") {
    throw "D-local Bundler 2.5.23 is required."
  }

  $rubyVersion
  $bundlerVersion
  "GEM_HOME=$env:GEM_HOME"
  "BUNDLE_USER_HOME=$env:BUNDLE_USER_HOME"
}
finally {
  Pop-Location
}

exit 0
