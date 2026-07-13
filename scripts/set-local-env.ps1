Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$candidateRoot = (Resolve-Path -LiteralPath (Split-Path -Parent $PSScriptRoot)).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
$canonicalRoot = (Resolve-Path -LiteralPath "D:\Doctor\Code\CV").Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
$featureWorktreeRoot = Join-Path $canonicalRoot ".worktrees\bilingual-academic-cv"
$approvedRoots = @($canonicalRoot, $featureWorktreeRoot)
if ($candidateRoot -notin $approvedRoots) {
  throw "Unexpected repository root: $candidateRoot"
}

$runtimeRoot = Join-Path $candidateRoot ".local-tools"
$runtimeDirectories = @(
  "tmp",
  "home",
  "appdata",
  "localappdata",
  "cache",
  "git-config",
  "empty-git-hooks",
  "downloads",
  "ruby",
  "gems",
  "gem-spec-cache",
  "bundle-home",
  "bundle-config",
  "bundle",
  "bundle-cache",
  "jekyll-cache",
  "npm-cache",
  "pip-cache",
  "python-cache",
  "playwright-browsers"
)
foreach ($directory in $runtimeDirectories) {
  New-Item -ItemType Directory -Force -Path (Join-Path $runtimeRoot $directory) | Out-Null
}

$gitConfigPath = Join-Path $runtimeRoot "git-config\config"
if (-not (Test-Path -LiteralPath $gitConfigPath -PathType Leaf)) {
  New-Item -ItemType File -Path $gitConfigPath | Out-Null
}
$emptyHooksPath = Join-Path $runtimeRoot "empty-git-hooks"

$env:GIT_CONFIG_GLOBAL = $gitConfigPath
$env:GIT_CONFIG_NOSYSTEM = "1"
$env:GIT_CONFIG_COUNT = "4"
$env:GIT_CONFIG_KEY_0 = "safe.directory"
$env:GIT_CONFIG_VALUE_0 = $canonicalRoot.Replace('\', '/')
$env:GIT_CONFIG_KEY_1 = "safe.directory"
$env:GIT_CONFIG_VALUE_1 = $featureWorktreeRoot.Replace('\', '/')
$env:GIT_CONFIG_KEY_2 = "core.hooksPath"
$env:GIT_CONFIG_VALUE_2 = $emptyHooksPath
$env:GIT_CONFIG_KEY_3 = "commit.gpgsign"
$env:GIT_CONFIG_VALUE_3 = "false"

$topLevelText = git rev-parse --show-toplevel
if ($LASTEXITCODE -ne 0 -or -not $topLevelText) {
  throw "Unable to resolve the current Git top level."
}
$topLevel = (Resolve-Path -LiteralPath $topLevelText.Trim()).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
if ($topLevel -ne $candidateRoot) {
  throw "Unexpected repository root: $topLevel"
}

$env:HOME = Join-Path $runtimeRoot "home"
$env:USERPROFILE = $env:HOME
$env:APPDATA = Join-Path $runtimeRoot "appdata"
$env:LOCALAPPDATA = Join-Path $runtimeRoot "localappdata"
$env:PSModuleAnalysisCachePath = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\PowerShell\ModuleAnalysisCache"
$env:TEMP = Join-Path $runtimeRoot "tmp"
$env:TMP = $env:TEMP
$env:TMPDIR = $env:TEMP
$env:XDG_CACHE_HOME = Join-Path $runtimeRoot "cache"
$env:GEM_HOME = Join-Path $runtimeRoot "gems"
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
$env:PIP_CACHE_DIR = Join-Path $runtimeRoot "pip-cache"
$env:PYTHONPYCACHEPREFIX = Join-Path $runtimeRoot "python-cache"
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $runtimeRoot "playwright-browsers"
$env:MSYS2_PATH = Join-Path $runtimeRoot "ruby\msys64"

$env:GIT_AUTHOR_NAME = "Dravencent"
$env:GIT_AUTHOR_EMAIL = "Dravencent@users.noreply.github.com"
$env:GIT_COMMITTER_NAME = $env:GIT_AUTHOR_NAME
$env:GIT_COMMITTER_EMAIL = $env:GIT_AUTHOR_EMAIL

$nodeVersion = node --version
if ($LASTEXITCODE -ne 0 -or -not $nodeVersion -or $nodeVersion.Trim() -ne "v22.14.0") {
  throw "Node.js v22.14.0 is required."
}
$npmVersion = npm.cmd --version
if ($LASTEXITCODE -ne 0 -or -not $npmVersion -or $npmVersion.Trim() -ne "10.9.2") {
  throw "npm 10.9.2 is required."
}

$localRubyBin = Join-Path $runtimeRoot "ruby\bin"
$localGemBin = Join-Path $runtimeRoot "gems\bin"
$localPathEntries = @($localGemBin, $localRubyBin)
$remainingPathEntries = @($env:PATH -split [IO.Path]::PathSeparator | Where-Object {
  $_ -and $_ -notin $localPathEntries
})
$env:PATH = (@($localPathEntries) + $remainingPathEntries) -join [IO.Path]::PathSeparator
$env:LOCAL_BUNDLER_VERSION = "2.5.23"

Set-Location -LiteralPath $topLevel
