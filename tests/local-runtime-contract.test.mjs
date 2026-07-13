import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const loaderPath = "scripts/set-local-env.ps1";
const rubySetupPath = "scripts/setup-local-ruby.ps1";

function assertStrictPrelude(source, label) {
  const strictIndex = source.indexOf("Set-StrictMode -Version Latest");
  const stopIndex = source.indexOf('$ErrorActionPreference = "Stop"');
  const scriptRootIndex = source.indexOf("$PSScriptRoot");

  assert.ok(strictIndex >= 0, `${label} enables strict mode`);
  assert.ok(stopIndex >= 0, `${label} makes PowerShell errors terminating`);
  assert.ok(scriptRootIndex >= 0, `${label} derives paths from PSScriptRoot`);
  assert.ok(strictIndex < scriptRootIndex, `${label} enables strict mode before path setup`);
  assert.ok(stopIndex < scriptRootIndex, `${label} enables terminating errors before path setup`);
}

test("local tooling keeps every mutable path on the approved D-drive checkout", async () => {
  const [envSetup, setup] = await Promise.all([
    readFile(loaderPath, "utf8"),
    readFile(rubySetupPath, "utf8"),
  ]);

  assertStrictPrelude(envSetup, "environment loader");
  assertStrictPrelude(setup, "Ruby setup");

  for (const source of [envSetup, setup]) {
    assert.match(source, /git rev-parse --show-toplevel/);
    assert.doesNotMatch(source, /C:\\/i);
    assert.doesNotMatch(source, /safe\.directory[^\r\n]*\*/i);
  }

  assert.match(envSetup, /D:\\Doctor\\Code\\CV/);
  assert.match(envSetup, /\.worktrees\\bilingual-academic-cv/);
  assert.match(envSetup, /approvedRoots/);
  assert.match(envSetup, /Unexpected repository root/);
  assert.match(envSetup, /\.local-tools/);

  const requiredEnvironmentNames = [
    "HOME",
    "USERPROFILE",
    "APPDATA",
    "LOCALAPPDATA",
    "TEMP",
    "TMP",
    "TMPDIR",
    "XDG_CACHE_HOME",
    "GIT_CONFIG_GLOBAL",
    "GIT_CONFIG_NOSYSTEM",
    "GEM_HOME",
    "GEM_PATH",
    "GEM_SPEC_CACHE",
    "BUNDLE_USER_HOME",
    "BUNDLE_APP_CONFIG",
    "BUNDLE_PATH",
    "BUNDLE_CACHE_PATH",
    "BUNDLE_IGNORE_CONFIG",
    "JEKYLL_CACHE_DIR",
    "npm_config_cache",
    "PIP_CACHE_DIR",
    "PYTHONPYCACHEPREFIX",
    "PLAYWRIGHT_BROWSERS_PATH",
    "MSYS2_PATH",
    "PSModuleAnalysisCachePath",
  ];
  for (const name of requiredEnvironmentNames) {
    assert.match(envSetup, new RegExp(`\\$env:${name}\\s*=`), `${name} is explicitly assigned`);
  }

  assert.match(envSetup, /GIT_CONFIG_COUNT\s*=\s*"4"/);
  assert.match(envSetup, /GIT_CONFIG_KEY_0\s*=\s*"safe\.directory"/);
  assert.match(envSetup, /GIT_CONFIG_KEY_1\s*=\s*"safe\.directory"/);
  assert.match(envSetup, /GIT_CONFIG_KEY_2\s*=\s*"core\.hooksPath"/);
  assert.match(envSetup, /GIT_CONFIG_KEY_3\s*=\s*"commit\.gpgsign"/);
  assert.match(envSetup, /GIT_CONFIG_VALUE_3\s*=\s*"false"/);
  assert.match(envSetup, /empty-git-hooks/);
  assert.match(envSetup, /GIT_CONFIG_NOSYSTEM\s*=\s*"1"/);

  assert.match(envSetup, /GIT_AUTHOR_NAME\s*=\s*"Dravencent"/);
  assert.match(envSetup, /GIT_AUTHOR_EMAIL\s*=\s*"Dravencent@users\.noreply\.github\.com"/);
  assert.match(envSetup, /GIT_COMMITTER_NAME\s*=\s*\$env:GIT_AUTHOR_NAME/);
  assert.match(envSetup, /GIT_COMMITTER_EMAIL\s*=\s*\$env:GIT_AUTHOR_EMAIL/);

  assert.match(envSetup, /node --version/);
  assert.match(envSetup, /v22\.14\.0/);
  assert.match(envSetup, /npm\.cmd --version/);
  assert.match(envSetup, /10\.9\.2/);
  assert.match(envSetup, /BUNDLE_IGNORE_CONFIG\s*=\s*"1"/);
  assert.match(envSetup, /ruby\\bin/);
  assert.match(envSetup, /gems\\bin/);
  assert.match(envSetup, /ruby\\lib\\ruby\\gems\\3\.2\.0/);
  assert.match(envSetup, /2\.5\.23/);

  assert.match(setup, /Push-Location -LiteralPath \$repoRoot/);
  assert.match(setup, /try\s*\{/);
  assert.match(setup, /finally[\s\S]*Pop-Location/);
  assert.match(
    setup,
    /https:\/\/github\.com\/oneclick\/rubyinstaller2\/releases\/download\/RubyInstaller-3\.2\.11-1\/rubyinstaller-3\.2\.11-1-x64\.7z/,
  );
  assert.match(setup, /20e56be307ae5576c024c97a7d8784c2033e676ea8c67477dda602b8e97fe69c/);
  assert.match(setup, /\.partial/);
  assert.match(setup, /Get-FileHash/);
  assert.match(setup, /tar\.exe/);
  assert.match(setup, /Get-ChildItem -LiteralPath \$extractRoot -Directory/);
  assert.match(setup, /\$extractedRoots\.Count -ne 1/);
  assert.match(setup, /\$extractedRubyRoot = \$extractedRoots\[0\]\.FullName/);
  assert.match(setup, /Join-Path \$extractedRubyRoot "bin\\ruby\.exe"/);
  assert.match(setup, /Move-Item -LiteralPath \$extractedRubyRoot -Destination \$rubyRoot/);
  assert.match(setup, /MSYS2_VERSION[^\r\n]*20251213/);
  assert.match(setup, /d0ff26a909c7ba4b7b1b5b4f5fab057b624549ab4f77811794c2076e8786ac53/);
  assert.match(setup, /ridk\.cmd install 1 3/);
  assert.match(setup, /ucrt64\\bin\\gcc\.exe/);
  assert.match(setup, /ruby\\lib\\ruby\\gems\\3\.2\.0/);
  assert.match(setup, /gem\.cmd install bundler --version 2\.5\.23 --no-document/);
  assert.match(setup, /bundle _2\.5\.23_ --version/);
  assert.match(setup, /exit 0/);
  assert.match(setup, /exit 1/);
});
