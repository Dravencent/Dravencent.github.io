# Bilingual Academic CV Website Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Academic Pages demonstration site with a rigorous, maintainable English/Chinese academic CV for Yu Zhan, validate it locally without writing to C:, and publish the verified result from `master` to `https://dravencent.github.io/`.

**Architecture:** Keep Jekyll and the existing Academic Pages theme foundation, but render ten explicit bilingual routes from three canonical YAML data files. Add small single-purpose Liquid includes, a dedicated academic layout, a Node-based pre-build contract validator, a generated-site checker, and a D-drive-only portable Ruby build wrapper. Continue using the repository's confirmed classic GitHub Pages deployment from `master` and the repository root.

**Tech Stack:** Jekyll/GitHub Pages, Liquid, YAML, SCSS, Node.js `22.14.0`/npm `10.9.2` with `node:test`, `js-yaml`, `cheerio`, and the locked Playwright Node library, PowerShell, Python `3.10.9` x64 with Pillow and PyMuPDF, Git, and release-only D-local GitHub CLI `2.94.0`.

---

## Implementation guardrails

- Work only in the main checkout `D:\Doctor\Code\CV` or its project-local feature worktree `D:\Doctor\Code\CV\.worktrees\bilingual-academic-cv`; abort if the Git top level is elsewhere or not on `D:`.
- Create `.worktrees/` as an ignored project-local directory before feature implementation. Plan work is committed on `master`; Tasks 1-13 run only from branch `feature/bilingual-academic-cv` in that worktree. Task 14 alone returns to the main checkout after explicit release approval.
- Direct every mutable runtime location (`HOME`, `USERPROFILE`, `APPDATA`, `LOCALAPPDATA`, `TEMP`, `TMP`, `TMPDIR`, `XDG_CACHE_HOME`, a blank `GIT_CONFIG_GLOBAL`, npm/pip caches, Python bytecode, `GEM_HOME`, `GEM_PATH`, `GEM_SPEC_CACHE`, `BUNDLE_USER_HOME`, `BUNDLE_APP_CONFIG`, `BUNDLE_PATH`, `BUNDLE_CACHE_PATH`, `JEKYLL_CACHE_DIR`, Playwright browsers, and browser output) into ignored directories under the current worktree; set `GIT_CONFIG_NOSYSTEM=1` plus process-only exact `safe.directory`, empty D-local `core.hooksPath`, and `commit.gpgsign=false` entries so sandbox ownership checks pass without user/system Git hooks, signing, credential helpers, wildcard trust, or global configuration changes.
- Never copy award certificates, QR codes, signatures, certificate numbers, publisher PDFs, or the QQ email into the tracked tree.
- Treat the approved design at `docs/superpowers/specs/2026-07-13-bilingual-academic-cv-design.md` as the content authority.
- Use UTF-8 explicitly when reading Chinese text in PowerShell.
- Keep `images/My.png` as the original illustration; the public pages will use a generated optimized derivative.
- Use `Dravencent <Dravencent@users.noreply.github.com>` for every new task commit so new public metadata does not disclose the QQ address. Do not rewrite Git history; erasing an address from existing commits would require separate authorization.

Known local-only release blocker: unpublished design commit `20e0ff2` currently has a QQ-domain author email in its commit metadata. Tasks 1-12 may proceed locally, but Task 13 must detect and report this blocker. Task 14 is forbidden until the user makes a separate explicit decision about that unpublished metadata; this plan does not authorize amending, rebasing, squashing, or otherwise rewriting it.

Every task command block is a fresh PowerShell process; no task may inherit environment state from another agent or earlier block. Before Task 1 creates the shared environment loader, the following bootstrap is a literal same-process prelude: concatenate it with the Task 1 Step 2 command suffix and execute both in one fresh PowerShell invocation, never as two shells. After `scripts/set-local-env.ps1` exists, every Tasks 1-13 block must instead begin by dot-sourcing it (`. .\scripts\set-local-env.ps1`), which repeats the same root check and D-only redirects for the current worktree. Task 14 intentionally starts each fresh block with the stricter `scripts/set-release-env.ps1 -RepositoryRoot ...` flow (or its inline equivalent before integration). The pre-implementation worktree handoff below is the sole pre-loader exception and establishes its own D-only environment before checked Git writes.

```powershell
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$canonicalRoot = (Resolve-Path -LiteralPath D:\Doctor\Code\CV).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
$featureWorktreeRoot = Join-Path $canonicalRoot ".worktrees\bilingual-academic-cv"
$executionRoot = (Resolve-Path -LiteralPath (Get-Location)).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
if (-not ($executionRoot -eq $canonicalRoot -or $executionRoot -eq $featureWorktreeRoot)) {
  throw "Run the bootstrap only from an approved repository root: $executionRoot"
}
$bootstrapGitDir = Join-Path $executionRoot ".local-tools\git-config"
$bootstrapHooksDir = Join-Path $executionRoot ".local-tools\empty-git-hooks"
New-Item -ItemType Directory -Force -Path $bootstrapGitDir | Out-Null
New-Item -ItemType Directory -Force -Path $bootstrapHooksDir | Out-Null
$env:GIT_CONFIG_GLOBAL = Join-Path $bootstrapGitDir "config"
$env:GIT_CONFIG_NOSYSTEM = "1"
$env:GIT_CONFIG_COUNT = "4"
$env:GIT_CONFIG_KEY_0 = "safe.directory"
$env:GIT_CONFIG_VALUE_0 = $canonicalRoot.Replace('\', '/')
$env:GIT_CONFIG_KEY_1 = "safe.directory"
$env:GIT_CONFIG_VALUE_1 = $featureWorktreeRoot.Replace('\', '/')
$env:GIT_CONFIG_KEY_2 = "core.hooksPath"
$env:GIT_CONFIG_VALUE_2 = $bootstrapHooksDir
$env:GIT_CONFIG_KEY_3 = "commit.gpgsign"
$env:GIT_CONFIG_VALUE_3 = "false"
$topLevelText = git rev-parse --show-toplevel
if ($LASTEXITCODE -ne 0 -or -not $topLevelText) { throw "Unable to resolve the current Git top level." }
$topLevel = (Resolve-Path -LiteralPath $topLevelText.Trim()).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
if ($topLevel -ne $executionRoot) {
  throw "Unexpected repository root: $topLevel"
}
$runtimeRoot = Join-Path $topLevel ".local-tools"
$runtimeDirs = @("tmp", "home", "appdata", "localappdata", "cache", "git-config", "empty-git-hooks", "gems", "gem-spec-cache", "bundle-home", "bundle-config", "bundle", "bundle-cache", "jekyll-cache", "npm-cache", "pip-cache", "python-cache", "playwright-browsers")
$runtimeDirs | ForEach-Object { New-Item -ItemType Directory -Force -Path (Join-Path $runtimeRoot $_) | Out-Null }
$env:HOME = Join-Path $runtimeRoot "home"
$env:USERPROFILE = $env:HOME
$env:APPDATA = Join-Path $runtimeRoot "appdata"
$env:LOCALAPPDATA = Join-Path $runtimeRoot "localappdata"
$env:TEMP = Join-Path $runtimeRoot "tmp"
$env:TMP = $env:TEMP
$env:TMPDIR = $env:TEMP
$env:XDG_CACHE_HOME = Join-Path $runtimeRoot "cache"
$env:GIT_CONFIG_GLOBAL = Join-Path $runtimeRoot "git-config\config"
$env:GIT_CONFIG_NOSYSTEM = "1"
$env:GIT_CONFIG_COUNT = "4"
$env:GIT_CONFIG_KEY_0 = "safe.directory"
$env:GIT_CONFIG_VALUE_0 = $canonicalRoot.Replace('\', '/')
$env:GIT_CONFIG_KEY_1 = "safe.directory"
$env:GIT_CONFIG_VALUE_1 = $featureWorktreeRoot.Replace('\', '/')
$env:GIT_CONFIG_KEY_2 = "core.hooksPath"
$env:GIT_CONFIG_VALUE_2 = Join-Path $runtimeRoot "empty-git-hooks"
$env:GIT_CONFIG_KEY_3 = "commit.gpgsign"
$env:GIT_CONFIG_VALUE_3 = "false"
$env:GEM_HOME = Join-Path $runtimeRoot "gems"
$env:GEM_PATH = $env:GEM_HOME
$env:GEM_SPEC_CACHE = Join-Path $runtimeRoot "gem-spec-cache"
$env:BUNDLE_USER_HOME = Join-Path $runtimeRoot "bundle-home"
$env:BUNDLE_APP_CONFIG = Join-Path $runtimeRoot "bundle-config"
$env:BUNDLE_PATH = Join-Path $runtimeRoot "bundle"
$env:BUNDLE_CACHE_PATH = Join-Path $runtimeRoot "bundle-cache"
$env:JEKYLL_CACHE_DIR = Join-Path $runtimeRoot "jekyll-cache"
$env:npm_config_cache = Join-Path $runtimeRoot "npm-cache"
$env:PIP_CACHE_DIR = Join-Path $runtimeRoot "pip-cache"
$env:PYTHONPYCACHEPREFIX = Join-Path $runtimeRoot "python-cache"
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $runtimeRoot "playwright-browsers"
$env:GIT_AUTHOR_NAME = "Dravencent"
$env:GIT_AUTHOR_EMAIL = "Dravencent@users.noreply.github.com"
$env:GIT_COMMITTER_NAME = $env:GIT_AUTHOR_NAME
$env:GIT_COMMITTER_EMAIL = $env:GIT_AUTHOR_EMAIL
Set-Location -LiteralPath $topLevel
```

All build commands use `.test-output/site`; `_site` remains ignored only as a defensive legacy path and is never an active build destination. All Bundler commands use the repo-local locked Bundler `2.5.23` (`bundle _2.5.23_ ...`), never a user/global bundle.

### Pre-implementation worktree handoff

After this plan and `.worktrees/` ignore rule are reviewed and committed locally on `master`, the root agent—not a task subagent—creates the only implementation worktree with:

```powershell
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$repoRoot = (Resolve-Path -LiteralPath D:\Doctor\Code\CV).Path
$handoffRuntime = Join-Path $repoRoot ".worktrees\.handoff-runtime"
@("tmp", "home", "appdata", "localappdata", "cache", "empty-git-hooks") | ForEach-Object { New-Item -ItemType Directory -Force (Join-Path $handoffRuntime $_) | Out-Null }
$env:HOME = Join-Path $handoffRuntime "home"
$env:USERPROFILE = $env:HOME
$env:APPDATA = Join-Path $handoffRuntime "appdata"
$env:LOCALAPPDATA = Join-Path $handoffRuntime "localappdata"
$env:TEMP = Join-Path $handoffRuntime "tmp"
$env:TMP = $env:TEMP
$env:TMPDIR = $env:TEMP
$env:XDG_CACHE_HOME = Join-Path $handoffRuntime "cache"
$env:GIT_CONFIG_GLOBAL = Join-Path $handoffRuntime "gitconfig"
$env:GIT_CONFIG_NOSYSTEM = "1"
$env:GIT_CONFIG_COUNT = "4"
$env:GIT_CONFIG_KEY_0 = "safe.directory"
$env:GIT_CONFIG_VALUE_0 = $repoRoot.Replace('\', '/')
$env:GIT_CONFIG_KEY_1 = "safe.directory"
$env:GIT_CONFIG_VALUE_1 = (Join-Path $repoRoot ".worktrees\bilingual-academic-cv").Replace('\', '/')
$env:GIT_CONFIG_KEY_2 = "core.hooksPath"
$env:GIT_CONFIG_VALUE_2 = Join-Path $handoffRuntime "empty-git-hooks"
$env:GIT_CONFIG_KEY_3 = "commit.gpgsign"
$env:GIT_CONFIG_VALUE_3 = "false"
$env:GIT_TERMINAL_PROMPT = "0"
$env:GCM_INTERACTIVE = "Never"
Set-Location -LiteralPath $repoRoot
$topText = git rev-parse --show-toplevel
if ($LASTEXITCODE -ne 0 -or -not $topText -or (Resolve-Path -LiteralPath $topText.Trim()).Path -ne $repoRoot) { throw "Unexpected Git top level." }
$mainStatus = @(git status --porcelain=v1 --untracked-files=all)
if ($LASTEXITCODE -ne 0 -or $mainStatus.Count -ne 0) { throw "Commit the reviewed plan before creating the worktree." }
$branchText = git branch --show-current
if ($LASTEXITCODE -ne 0 -or -not $branchText -or $branchText.Trim() -ne "master") { throw "Main checkout is not on master." }
$originText = git remote get-url origin
if ($LASTEXITCODE -ne 0 -or -not $originText -or $originText.Trim() -ne "https://github.com/Dravencent/Dravencent.github.io.git") { throw "Unexpected origin." }
$reviewedHeadText = git rev-parse HEAD
if ($LASTEXITCODE -ne 0 -or -not $reviewedHeadText) { throw "Unable to resolve reviewed HEAD." }
$reviewedHead = $reviewedHeadText.Trim()
$planCommitText = git log -1 --format=%H -- docs/superpowers/plans/2026-07-13-bilingual-academic-cv.md
if ($LASTEXITCODE -ne 0 -or -not $planCommitText) { throw "Unable to resolve the plan commit." }
$planCommit = $planCommitText.Trim()
if ($planCommit -ne $reviewedHead) { throw "HEAD is not the reviewed plan commit." }
$reviewedFiles = @(git diff-tree --no-commit-id --name-only -r HEAD)
if ($LASTEXITCODE -ne 0) { throw "Unable to inspect the reviewed plan commit." }
if ($reviewedFiles -notcontains ".gitignore" -or $reviewedFiles -notcontains "docs/superpowers/plans/2026-07-13-bilingual-academic-cv.md") { throw "Reviewed plan commit lacks the plan or worktree ignore rule." }
git check-ignore --quiet --no-index .worktrees/probe
if ($LASTEXITCODE -ne 0) { throw ".worktrees is not ignored." }
git show-ref --verify --quiet refs/heads/feature/bilingual-academic-cv
$featureRefExit = $LASTEXITCODE
if ($featureRefExit -eq 0) { throw "Feature branch already exists; inspect rather than overwrite it." }
if ($featureRefExit -ne 1) { throw "Unable to inspect the feature branch ref." }
New-Item -ItemType Directory -Force .worktrees | Out-Null
git worktree add .worktrees\bilingual-academic-cv -b feature/bilingual-academic-cv
if ($LASTEXITCODE -ne 0) { throw "Worktree creation failed." }
git worktree list
if ($LASTEXITCODE -ne 0) { throw "Unable to list worktrees after creation." }
git -C .worktrees\bilingual-academic-cv status --short --branch
if ($LASTEXITCODE -ne 0) { throw "Unable to inspect the feature worktree." }
```

Expected: the feature worktree is clean, is on `feature/bilingual-academic-cv`, and is based on the reviewed plan commit. All implementation subagents receive this exact worktree as their working directory; none may edit the main checkout during Tasks 1-13.

## Chunk 1: Deterministic local tooling and canonical academic data

### Task 1: Establish a D-drive-only, reproducible local toolchain

**Files:**
- Create: `scripts/set-local-env.ps1`
- Create: `scripts/setup-local-ruby.ps1`
- Create: `tests/local-runtime-contract.test.mjs`
- Create: `tests/dependency-contract.test.mjs`
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `Gemfile`
- Create: `package-lock.json`
- Create: `Gemfile.lock`

- [ ] **Step 1: Write the failing runtime-isolation contract test**

  Add `tests/local-runtime-contract.test.mjs` with Node's built-in test runner. It must read both environment scripts and assert that:

  - both derive the current repository/worktree root from `$PSScriptRoot` plus Git;
  - both enable strict mode and terminating PowerShell errors before path or environment setup;
  - setup accepts only `D:\Doctor\Code\CV` or exact worktree `D:\Doctor\Code\CV\.worktrees\bilingual-academic-cv` and rejects every other root, including any other `D:` checkout/worktree;
  - it uses `Push-Location -LiteralPath $repoRoot` inside `try/finally` and restores the caller location with `Pop-Location`;
  - no literal `C:\` path appears;
  - every mutable environment variable named in the implementation guardrails is assigned below the current worktree's `.local-tools` directory, including `GEM_PATH`, `BUNDLE_APP_CONFIG`, `JEKYLL_CACHE_DIR`, and a blank `GIT_CONFIG_GLOBAL`; `GIT_CONFIG_NOSYSTEM=1` prevents ambient system Git configuration, while process-only config contains only the two exact main/feature `safe.directory` values, an empty D-local `core.hooksPath`, and `commit.gpgsign=false`—never `safe.directory=*`;
  - every new commit gets the exact GitHub noreply author/committer identity `Dravencent <Dravencent@users.noreply.github.com>` without modifying global Git configuration;
  - the loader fails unless local `node --version` is exactly `v22.14.0` and `npm.cmd --version` is exactly `10.9.2`;
  - `BUNDLE_IGNORE_CONFIG` prevents user/global Bundler configuration, the local Ruby/gem bin directories are prepended to `PATH`, and Bundler is pinned to `2.5.23`;
  - the Ruby archive URL is the official `RubyInstaller-3.2.11-1` x64 `.7z` release;
  - the expected SHA-256 is `20e56be307ae5576c024c97a7d8784c2033e676ea8c67477dda602b8e97fe69c`;

  Core assertion shape:

  ```js
  import test from "node:test";
  import assert from "node:assert/strict";
  import { readFile } from "node:fs/promises";

  test("local tooling keeps every mutable path on the D-drive checkout", async () => {
    const envSetup = await readFile("scripts/set-local-env.ps1", "utf8");
    const setup = await readFile("scripts/setup-local-ruby.ps1", "utf8");
    assert.match(envSetup, /\.worktrees/);
    assert.match(envSetup, /BUNDLE_APP_CONFIG/);
    assert.match(envSetup, /JEKYLL_CACHE_DIR/);
    assert.match(envSetup, /GIT_CONFIG_GLOBAL/);
    assert.match(envSetup, /GIT_CONFIG_NOSYSTEM/);
    assert.match(envSetup, /safe\.directory/);
    assert.match(setup, /\$PSScriptRoot/);
    assert.match(setup, /20e56be307ae5576c024c97a7d8784c2033e676ea8c67477dda602b8e97fe69c/);
    assert.match(setup, /Push-Location/);
    assert.match(setup, /finally[\s\S]*Pop-Location/);
    assert.doesNotMatch(setup, /C:\\/i);
  });
  ```

- [ ] **Step 2: Run the focused test and confirm the red state**

  Run:

  In one fresh PowerShell process, execute the complete pre-helper bootstrap in the implementation guardrails and immediately append this suffix without closing or restarting the shell:

  ```powershell
  node --test tests\local-runtime-contract.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Runtime-isolation contract unexpectedly passed before implementation." }
  ```

  Expected: FAIL with `ENOENT` for `scripts/set-local-env.ps1` (or the Ruby setup script if the loader was created first).

- [ ] **Step 3: Implement the isolated Ruby setup script**

  `scripts/set-local-env.ps1` must be safe to dot-source repeatedly: enable `Set-StrictMode -Version Latest` and `$ErrorActionPreference = "Stop"`, derive the allowed candidate root from `$PSScriptRoot` before Git, create its blank D-local Git config and empty hooks directory, then set `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_NOSYSTEM=1`, the two exact main/feature process-only `safe.directory` entries, D-local `core.hooksPath`, and `commit.gpgsign=false` before its first Git invocation. It then verifies the Git top level equals that candidate, completes the D-only environment and noreply Git identity, requires exact Node `v22.14.0`/npm `10.9.2`, sets `BUNDLE_IGNORE_CONFIG=1`, and prepends only this worktree's portable Ruby/gem bins to `PATH`. It must never use wildcard safe-directory trust or modify any Git config file. `scripts/setup-local-ruby.ps1` must expose a reliable caller status (explicit success/nonzero exit in addition to terminating errors), dot-source that loader, and then:

  1. enable strict mode and stop on errors;
  2. resolve the repository root from the script directory and reject non-`D:` roots;
  3. use `Push-Location` and `try/finally` so all relative commands execute at the resolved repository root and the caller's location is restored;
  4. create `.local-tools/{downloads,ruby,gems,bundle-cache,bundle-home,npm-cache,tmp}`;
  5. set all mutable environment variables before any download or package command;
  6. download `https://github.com/oneclick/rubyinstaller2/releases/download/RubyInstaller-3.2.11-1/rubyinstaller-3.2.11-1-x64.7z` to a `.partial` file when the verified archive is absent, then atomically rename it;
  7. verify the exact SHA-256 above before extraction and delete a corrupt cached archive so the next run can recover;
  8. extract with the existing `tar.exe` into `.local-tools/ruby`;
  9. prepend the portable Ruby and gem executable directories to `PATH`;
  10. install exact Bundler `2.5.23` without documentation into `GEM_HOME` when absent and invoke it as `bundle _2.5.23_`;
  11. never resolve a Bundler executable or config from the user's home/global gem set;
  12. print `ruby --version`, `bundle _2.5.23_ --version`, and the resolved gem/bundle homes.

- [ ] **Step 4: Re-run the runtime-isolation test immediately**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\local-runtime-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Runtime-isolation contract failed after implementation." }
  ```

  Expected: PASS before any manifest or dependency change is made.

- [ ] **Step 5: Write the failing dependency-manifest contract test**

  Add `tests/dependency-contract.test.mjs`. It must assert:

  - `.gitignore` contains exactly named local outputs `.local-tools/`, `.bundle/`, `.test-output/`, `.worktrees/`, `_site/`, `.superpowers/`, and `node_modules/`;
  - `.gitignore` does not ignore `package-lock.json` or `Gemfile.lock`;
  - `package.json` is private, pins engines to Node `22.14.0`/npm `10.9.2`, has only `test` and `validate:data`, has `js-yaml` as its sole development dependency, and contains no old minification dependencies;
  - `Gemfile` contains only the source, `github-pages`, and `webrick` declarations shown below;
  - `package-lock.json` exists and locks `js-yaml`;
  - `Gemfile.lock` exists, its `PLATFORMS` section contains a Windows platform and `x86_64-linux`, and `BUNDLED WITH` is exactly `2.5.23`.

- [ ] **Step 6: Confirm the dependency contract is red**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\dependency-contract.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Dependency contract unexpectedly passed before deterministic manifests." }
  ```

  Expected: FAIL on the current template manifests and missing lock files.

- [ ] **Step 7: Make dependency manifests deterministic**

  Preserve the already-committed `.worktrees/` rule and update `.gitignore` to ignore `.local-tools/`, `.bundle/`, `.test-output/`, `.worktrees/`, `_site/`, `.superpowers/`, and `node_modules/`, while no longer ignoring `package-lock.json` or `Gemfile.lock`.

  Replace template-only npm metadata with a private project manifest retaining no unused minification dependencies. Use:

  ```json
  {
    "name": "yu-zhan-academic-cv",
    "private": true,
    "engines": {
      "node": "22.14.0",
      "npm": "10.9.2"
    },
    "scripts": {
      "test": "node --test tests/*.test.mjs",
      "validate:data": "node scripts/validate-cv.mjs"
    },
    "devDependencies": {
      "js-yaml": "^4.1.0"
    }
  }
  ```

  Simplify `Gemfile` to the GitHub Pages runtime plus the local server dependency:

  ```ruby
  source "https://rubygems.org"

  gem "github-pages", group: :jekyll_plugins
  gem "webrick", "~> 1.8"
  ```

  Bootstrap the D-only environment in the current PowerShell process before npm or Bundler. Then create locks containing both Windows and Linux platforms:

  ```powershell
  . .\scripts\set-local-env.ps1
  & .\scripts\setup-local-ruby.ps1
  if ($LASTEXITCODE -ne 0) { throw "Portable Ruby setup failed." }
  npm.cmd install --cache $env:npm_config_cache
  if ($LASTEXITCODE -ne 0) { throw "D-local npm install failed." }
  bundle _2.5.23_ install
  if ($LASTEXITCODE -ne 0) { throw "Locked Bundler install failed." }
  bundle _2.5.23_ lock --add-platform x86_64-linux
  if ($LASTEXITCODE -ne 0) { throw "Unable to add the Linux lockfile platform." }
  ```

  Expected: tracked `package-lock.json` and `Gemfile.lock`; all downloaded runtimes and caches remain ignored below `.local-tools/`.

- [ ] **Step 8: Run both contracts and runtime smoke checks**

  Run:

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\local-runtime-contract.test.mjs tests\dependency-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Toolchain contracts failed." }
  & .\scripts\setup-local-ruby.ps1
  if ($LASTEXITCODE -ne 0) { throw "Portable Ruby smoke setup failed." }
  bundle _2.5.23_ platform
  if ($LASTEXITCODE -ne 0) { throw "Locked Bundler platform check failed." }
  $toolchainStatus = @(git status --short)
  if ($LASTEXITCODE -ne 0) { throw "Unable to inspect toolchain worktree status." }
  $toolchainStatus
  ```

  Expected: both tests pass; Node/npm report `v22.14.0`/`10.9.2`; Ruby reports `3.2.11`; `bundle _2.5.23_ platform` lists Windows and `x86_64-linux`; `git status` lists only intended scripts, manifests, and locks, never `.local-tools/`, `.bundle/`, or `.test-output/`.

- [ ] **Step 9: Commit the toolchain foundation**

  ```powershell
  . .\scripts\set-local-env.ps1
  git add .gitignore Gemfile Gemfile.lock package.json package-lock.json scripts/set-local-env.ps1 scripts/setup-local-ruby.ps1 tests/local-runtime-contract.test.mjs tests/dependency-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Unable to stage the toolchain foundation." }
  git commit -m "build: add isolated academic site toolchain"
  if ($LASTEXITCODE -ne 0) { throw "Toolchain foundation commit failed." }
  ```

### Task 2: Build the structured-data validator with TDD

**Files:**
- Create: `scripts/lib/cv-validation.mjs`
- Create: `scripts/validate-cv.mjs`
- Create: `tests/cv-validation.test.mjs`
- Create: `tests/validate-cv-cli.test.mjs`

- [ ] **Step 1: Write failing unit tests against in-memory fixtures**

  `tests/cv-validation.test.mjs` must import pure validation functions and cover:

  - a valid profile with all required English/Chinese strings and exactly three research directions;
  - missing bilingual values;
  - wrong publication, award, and direction counts;
  - duplicate publication and award IDs;
  - non-kebab-case or empty IDs;
  - malformed DOI values and exact DOI ordering;
  - absence of `Yu Zhan` from an ordered author list;
  - `first_author` disagreeing with `authors[0] === "Yu Zhan"`;
  - a total number of first-author records other than two;
  - a selected publication set other than the first four;
  - a `related_publication_ids` reference to an unknown record;
  - missing required publication, profile, education, contact, direction, or award fields;
  - a U+FFFD character or representative mojibake fragment in any public string;
  - an award with an invalid `date`, a mismatched `year`, or missing official title/level/role/English descriptor;
  - an award with `issuing_body: null`, an empty string, or only one language;
  - incorrect award reverse-chronological ordering.

  Exported functions under test:

  ```js
  validateProfile(profile, publicationIds)
  validatePublications(publications)
  validateAwards(awards)
  validateAcademicData({ profile, publications, awards })
  ```

- [ ] **Step 2: Confirm the validator is red before implementation**

  Run:

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\cv-validation.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Pure CV validator tests unexpectedly passed before implementation." }
  ```

  Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/lib/cv-validation.mjs`.

- [ ] **Step 3: Implement only the pure validation functions**

  `scripts/lib/cv-validation.mjs` must return a complete array of actionable errors rather than stopping at the first record. It must enforce:

  - exact counts: 8 publications, 6 awards, 3 directions;
  - unique, kebab-case stable IDs;
  - DOI syntax `^10\.\d{4,9}/\S+$` and the approved eight-DOI sequence;
  - publication fields `id`, `title`, ordered non-empty `authors`, `journal`, integer `year`, `doi`, boolean `selected`, and boolean `first_author`;
  - every ordered author array contains `Yu Zhan`;
  - `first_author` equality with the derived author position and exactly two `true` values;
  - exactly four selected records, all in positions 1-4;
  - all bilingual fields are non-empty UTF-8 strings without U+FFFD or common mojibake fragments;
  - all research-direction publication references resolve;
  - profile identity, institutional contact, academic links, supervisor/team, three education records, five exact skills, and all direction fields are present;
  - each award contains `id`, `date` (`YYYY-MM`), integer `year` matching the date, `official_title_zh`, bilingual `award_level`, bilingual `role`, and non-empty `english_descriptor`;
  - awards are reverse chronological, optional `project_title` and `issuing_body` values are complete bilingual objects when present, and unconfirmed issuers are omitted rather than null.

- [ ] **Step 4: Run the pure validator tests green**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\cv-validation.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Pure CV validator tests failed." }
  ```

  Expected: every pure-function case passes before the CLI exists.

- [ ] **Step 5: Write a failing CLI integration test with injected I/O**

  `tests/validate-cv-cli.test.mjs` must import `main` from `scripts/validate-cv.mjs` and inject an in-memory `loadData`, `stdout`, and `stderr`. It must prove that:

  - multiple invalid records produce all diagnostics rather than only the first;
  - every diagnostic includes a data path such as `publications[2].authors`;
  - invalid input returns exit code 1;
  - valid input returns 0 and prints exactly `Validated 8 publications, 6 awards, and 3 research directions.`;
  - importing the module does not execute the CLI as a side effect.

- [ ] **Step 6: Confirm the CLI test is red**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\validate-cv-cli.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "CV validator CLI tests unexpectedly passed before implementation." }
  ```

  Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/validate-cv.mjs`.

- [ ] **Step 7: Implement the thin CLI**

  `scripts/validate-cv.mjs` must load `_data/profile.yml`, `_data/publications.yml`, and `_data/awards.yml` with `js-yaml`, then delegate all rules to `validateAcademicData`. Export an injectable `main` function, print all errors to stderr, and set the process exit code only inside an `import.meta.url` direct-execution guard.

  The exact success output is:

  ```text
  Validated 8 publications, 6 awards, and 3 research directions.
  ```

- [ ] **Step 8: Run all validator tests green**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\cv-validation.test.mjs tests\validate-cv-cli.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Complete CV validator suite failed." }
  ```

  Expected: all pure and CLI tests pass.

- [ ] **Step 9: Commit the validator independently**

  ```powershell
  . .\scripts\set-local-env.ps1
  git add scripts/lib/cv-validation.mjs scripts/validate-cv.mjs tests/cv-validation.test.mjs tests/validate-cv-cli.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Unable to stage the CV validator." }
  git commit -m "test: validate canonical academic CV data"
  if ($LASTEXITCODE -ne 0) { throw "CV validator commit failed." }
  ```

### Task 3: Add the canonical bilingual profile, publications, and awards

**Files:**
- Create: `_data/profile.yml`
- Create: `_data/publications.yml`
- Create: `_data/awards.yml`
- Create: `tests/fixtures/approved-academic-data.mjs`
- Create: `tests/academic-data-contract.test.mjs`

- [ ] **Step 1: Freeze the approved values in a test oracle and write the failing repository-data contract**

  `tests/fixtures/approved-academic-data.mjs` must contain exact frozen expected objects transcribed from spec Sections 6-10: full bilingual identity/biography/direction text, every link, all three education records, the five skills, all eight complete publication records including ordered author arrays, and all six complete award records including official Chinese wording, role, level, descriptor, and approved project titles.

  `tests/academic-data-contract.test.mjs` must load the three actual YAML files, call `validateAcademicData`, then use `assert.deepStrictEqual` against that oracle. This makes a changed author order, title, journal, bibliographic field, profile link, education range, award title, role, or project title fail even if the record remains structurally valid.

  The oracle must preserve these stable publication IDs, DOI order, and flags:

  | Position | ID | DOI | First author | Selected |
  | --- | --- | --- | --- | --- |
  | 1 | `zhan-2026-ai-high-voltage-electrolytes` | `10.1039/D4CS01250J` | true | true |
  | 2 | `zhan-2024-dual-layer-sei` | `10.1016/j.cej.2024.151974` | true | true |
  | 3 | `yang-2026-interphase-activators` | `10.1016/j.scib.2026.06.039` | false | true |
  | 4 | `zhai-2026-coulometric-screening` | `10.1016/j.jcis.2026.140359` | false | true |
  | 5 | `long-2026-deep-eutectic-interlayer` | `10.1002/adfm.202513024` | false | false |
  | 6 | `chen-2025-nicotinamide-zinc-air` | `10.1021/acs.nanolett.5c01562` | false | false |
  | 7 | `ge-2021-green-polymer-electrolyte` | `10.1002/app.50945` | false | false |
  | 8 | `liu-2020-waterborne-polyurethane` | `10.3390/polym12071513` | false | false |

  It must preserve these award IDs, dates, official titles, and roles:

  | ID | Date | Official Chinese title | Level | Role | Exact English descriptor |
  | --- | --- | --- | --- | --- | --- |
  | `bit-student-honoree-2026` | `2026-04` | `北京理工大学第十五届“青年盛典”暨2026年学生表彰大会` | University Honor / 校级荣誉 | Student Honoree / 获表彰学生 | `University student honoree; April 2026.` |
  | `zero-carbon-future-second-prize-2025` | `2025-11` | `第五届零碳未来创新大赛二等奖` | Second Prize / 二等奖 | Team Member / 团队成员 | `Second Prize; Team Member; November 2025.` |
  | `beijing-student-innovation-third-2025` | `2025-09` | `第四届北京大学生创新创业大赛科技创新赛道三等奖` | Third Prize / 三等奖 | Team Member / 团队成员 | `Third Prize, Science and Technology Innovation Track; Team Member; September 2025.` |
  | `energy-equipment-design-third-2025` | `2025-09` | `第十二届中国研究生能源装备创新设计大赛三等奖` | Third Prize / 三等奖 | Team Member / 团队成员 | `Third Prize; Team Member; September 2025.` |
  | `national-ai-innovation-grand-2025` | `2025-06` | `首届全国人工智能应用创新大赛通用赛道全国赛研究生组特等奖` | Grand Prize / 特等奖 | Co-recipient / 共同获奖人 | `National Finals Grand Prize, Graduate Division; Co-recipient; June 2025.` |
  | `china-international-innovation-2024` | `2024-09` | `中国国际大学生创新大赛（2024）北京赛区二等奖` | Second Prize / 二等奖 | Team Member / 团队成员 | `Beijing Regional Second Prize; Team Member; September 2024.` |

  The oracle must include these exact project-title pairs:

  - `冷能引擎--为“锂”定制的极寒电解液` / `Cryogenic Energy Engine—A Low-Temperature Electrolyte Tailored for Lithium`;
  - `自选主题的大模型Agent创新应用设计` / `Innovative Application Design of a Large-Model Agent for a Self-Selected Topic`;
  - `高比能、宽温域的固态电池在新能源汽车领域的研发与应用` / `Research and Application of High-Specific-Energy, Wide-Temperature-Range Solid-State Batteries in New Energy Vehicles`.

- [ ] **Step 2: Confirm the actual-data test fails**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\academic-data-contract.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Academic-data contract unexpectedly passed before canonical YAML existed." }
  ```

  Expected: FAIL because the three canonical YAML files do not yet exist.

- [ ] **Step 3: Populate `_data/profile.yml`**

  Store one canonical identity record with nested `en` and `zh` values for:

  - `name` (`Yu Zhan` / `湛煜`), current role, institution, biography, and the approved research headline;
  - institutional email `3120245693@bit.edu.cn`, GitHub, ORCID, supervisor profile, and team website;
  - supervisor `Associate Professor Nan Chen / 陈楠副教授` and the team name;
  - all three education records and date ranges;
  - skills exactly `Python`, `Gaussian`, `ORCA`, `CP2K`, and `GROMACS`;
  - the three approved doctoral directions with bilingual title, one bilingual `description`, status, and `related_publication_ids`.

  Do not invent a second expanded narrative. Use the exact English and Chinese direction paragraphs already approved in spec Section 6 as each direction's single `description`; the Research pages will reuse that text and add only the separately approved methods/tools line.

  Use these research reference sets:

  ```yaml
  data-driven-electrolyte-screening:
    - zhan-2026-ai-high-voltage-electrolytes
    - zhai-2026-coulometric-screening
  novel-lithium-salt-design: []
  electrolyte-interfaces-and-stability:
    - zhan-2024-dual-layer-sei
    - yang-2026-interphase-activators
    - zhai-2026-coulometric-screening
    - long-2026-deep-eutectic-interlayer
    - ge-2021-green-polymer-electrolyte
    - liu-2020-waterborne-polyurethane
  ```

  Mark novel lithium-salt design as `ongoing` in both languages and include no unpublished numerical result.

- [ ] **Step 4: Populate `_data/publications.yml` and `_data/awards.yml`**

  Copy the exact titles, ordered author lists, journals, bibliographic fields, and official award/project wording from Sections 9-10 of the approved spec and the already-written test oracle. Preserve the table order above. Store DOI values without a URL prefix; Liquid will derive `https://doi.org/<doi>`.

  Every award record must use this complete schema:

  ```yaml
  id: stable-kebab-case-id
  date: YYYY-MM
  year: 2025
  official_title_zh: 官方中文名称
  award_level:
    en: Second Prize
    zh: 二等奖
  role:
    en: Team Member
    zh: 团队成员
  english_descriptor: "Short factual scope, role, and date explanation."
  project_title:           # omit when the approved record has no project title
    en: "Conservative English rendering"
    zh: "官方中文项目名"
  issuing_body:           # omit unless confirmed from the supplied certificate
    en: "Confirmed issuer"
    zh: "经证书确认的颁发单位"
  ```

  English display retains each official Chinese title and adds only the short factual descriptor. Omit `project_title` or `issuing_body` rather than storing null/empty values. Do not store certificate image paths, certificate numbers, signatures, QR content, or unrelated team-member names.

- [ ] **Step 5: Run the data tests and CLI**

  ```powershell
  . .\scripts\set-local-env.ps1
  npm.cmd test
  if ($LASTEXITCODE -ne 0) { throw "Academic-data test suite failed." }
  npm.cmd run validate:data
  if ($LASTEXITCODE -ne 0) { throw "Canonical academic-data CLI validation failed." }
  ```

  Expected: all tests pass and the CLI prints `Validated 8 publications, 6 awards, and 3 research directions.`

- [ ] **Step 6: Commit canonical content**

  ```powershell
  . .\scripts\set-local-env.ps1
  git add _data/profile.yml _data/publications.yml _data/awards.yml tests/fixtures/approved-academic-data.mjs tests/academic-data-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Unable to stage canonical academic data." }
  git commit -m "content: add verified bilingual academic data"
  if ($LASTEXITCODE -ne 0) { throw "Canonical academic-data commit failed." }
  ```

## Chunk 2: Bilingual route contracts and shared Jekyll rendering

### Task 4: Implement route, counterpart, and navigation validation with TDD

**Files:**
- Create: `scripts/lib/site-contract-validation.mjs`
- Create: `scripts/validate-site-contract.mjs`
- Create: `tests/site-contract-validation.test.mjs`
- Create: `tests/validate-site-contract-cli.test.mjs`

- [ ] **Step 1: Write failing pure-function tests for bilingual site contracts**

  `tests/site-contract-validation.test.mjs` must use in-memory page metadata and navigation fixtures. Cover:

  - the exact ten-route set and no duplicate permalink;
  - required `layout`, `lang`, `permalink`, `counterpart`, `title`, `description`, `page_type`, and `body_class` fields on each of the ten formal bilingual pages;
  - `en` only on root English routes and `zh` only on `/zh/` routes;
  - existing and mutual counterpart mappings;
  - exactly four stable navigation keys in the order `research`, `publications`, `honors`, `cv`;
  - matching keys/order between `main_en` and `main_zh`;
  - English navigation targeting English routes and Chinese navigation targeting `/zh/` routes;
  - navigation targets resolving to declared pages;
  - failure on an extra formal route, an orphan counterpart, a one-way mapping, or language mixing.
  - `/404.html` as the only permitted auxiliary page, with exact fields `layout: academic`, `lang: en`, `permalink: /404.html`, `title: Page not found`, `description: The requested page could not be found.`, `page_type: error`, `body_class: academic-site error-page`, and `sitemap: false`;
  - absence of `counterpart` on 404 and exclusion of 404 from formal-route, counterpart-pair, and navigation counts.

  Export and test these pure functions:

  ```js
  parseFrontMatter(source, filePath)
  validatePages(pages)
  validateNavigation(navigation, pages)
  validateSiteContract({ pages, navigation })
  ```

- [ ] **Step 2: Confirm the route validator is red**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\site-contract-validation.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Route-validator tests unexpectedly passed before implementation." }
  ```

  Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/lib/site-contract-validation.mjs`.

- [ ] **Step 3: Implement the pure validator and run it green**

  Implement complete error collection with source-file paths. Define the exact route set in one exported constant:

  ```js
  export const REQUIRED_ROUTES = [
    "/", "/zh/",
    "/research/", "/zh/research/",
    "/publications/", "/zh/publications/",
    "/honors/", "/zh/honors/",
    "/cv/", "/zh/cv/"
  ];
  ```

  Run:

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\site-contract-validation.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Pure route-validator tests failed." }
  ```

  Expected: all pure route-contract tests pass.

- [ ] **Step 4: Write the failing CLI contract**

  `tests/validate-site-contract-cli.test.mjs` must inject page/navigation loaders and output streams into an exported CLI `main`, verifying aggregated path-aware errors, exit code 1 on invalid input, exit code 0 on valid input, and this exact success line:

  ```text
  Validated 10 bilingual routes, 5 mutual counterpart pairs, and 2 language-specific menus.
  ```

  Run:

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\validate-site-contract-cli.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Route-validator CLI tests unexpectedly passed before implementation." }
  ```

  Expected: FAIL because the CLI does not exist.

- [ ] **Step 5: Implement the CLI**

  `scripts/validate-site-contract.mjs` must recursively read Markdown/HTML files below `_pages`, parse strict YAML front matter, load `_data/navigation.yml`, delegate to the pure validator, and use the same injectable/direct-execution pattern as `validate-cv.mjs`.

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\site-contract-validation.test.mjs tests\validate-site-contract-cli.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Focused route-validator suite failed." }
  ```

  Expected: all focused tests pass. This task tests the pure/injectable contract independently; Task 5 will later activate it against the real route set.

- [ ] **Step 6: Commit the independently green route validator**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\site-contract-validation.test.mjs tests\validate-site-contract-cli.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Pre-commit route-validator suite failed." }
  git add scripts/lib/site-contract-validation.mjs scripts/validate-site-contract.mjs tests/site-contract-validation.test.mjs tests/validate-site-contract-cli.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Unable to stage the route validator." }
  git commit -m "test: validate bilingual route contracts"
  if ($LASTEXITCODE -ne 0) { throw "Route-validator commit failed." }
  ```

  Expected: the focused suite is green and the commit contains only the validator plus its pure/CLI tests.

### Task 5: Declare the ten complete bilingual pages and menus

**Atomic execution rule:** Assign Tasks 5 and 6 together to one implementation subagent and keep that same subagent through Task 6's green build and commit. Task 5 deliberately introduces page references to not-yet-created includes, so it is not a standalone handoff or completion checkpoint.

**Files:**
- Modify: `_data/navigation.yml`
- Create: `_pages/home-en.md`
- Create: `_pages/home-zh.md`
- Create: `_pages/research-en.md`
- Create: `_pages/research-zh.md`
- Create: `_pages/publications-en.md`
- Create: `_pages/publications-zh.md`
- Create: `_pages/honors-en.md`
- Create: `_pages/honors-zh.md`
- Create: `_pages/cv-en.md`
- Create: `_pages/cv-zh.md`
- Create: `tests/bilingual-route-contract.test.mjs`
- Create: `tests/page-composition-contract.test.mjs`
- Create: `tests/fixtures/approved-page-copy.mjs`
- Modify: `tests/dependency-contract.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `_pages/404.md`
- Delete: `_pages/about.md`
- Delete: `_pages/publications.html`
- Delete: `_pages/cv.md`
- Delete: `_pages/archive-layout-with-content.md`
- Delete: `_pages/category-archive.html`
- Delete: `_pages/collection-archive.html`
- Delete: `_pages/cv-json.md`
- Delete: `_pages/markdown.md`
- Delete: `_pages/non-menu-page.md`
- Delete: `_pages/page-archive.html`
- Delete: `_pages/portfolio.html`
- Delete: `_pages/sitemap.md`
- Delete: `_pages/tag-archive.html`
- Delete: `_pages/talkmap.html`
- Delete: `_pages/talks.html`
- Delete: `_pages/teaching.html`
- Delete: `_pages/terms.md`
- Delete: `_pages/year-archive.html`
- Delete: `_publications/*.md`
- Delete: `_talks/*.md`
- Delete: `_teaching/*.md`
- Delete: `_portfolio/*`
- Delete: `_posts/*.md`
- Delete: `_drafts/post-draft.md`

- [ ] **Step 1: Write failing actual-route and exact page-composition contracts**

  `tests/bilingual-route-contract.test.mjs` must load the real `_pages` and `_data/navigation.yml`, call `validateSiteContract`, and deep-compare the ten route records to this mapping:

  | Page type | English | Chinese | Layout | Body class |
  | --- | --- | --- | --- | --- |
  | home | `/` | `/zh/` | `home` | `academic-site home-page` |
  | research | `/research/` | `/zh/research/` | `academic` | `academic-site research-page` |
  | publications | `/publications/` | `/zh/publications/` | `academic` | `academic-site publications-page` |
  | honors | `/honors/` | `/zh/honors/` | `academic` | `academic-site honors-page` |
  | cv | `/cv/` | `/zh/cv/` | `academic` | `academic-site cv-page` |

  It must also assert that no content file remains under `_publications`, `_talks`, `_teaching`, `_portfolio`, `_posts`, or `_drafts`. `tests/fixtures/approved-page-copy.mjs` deep-freezes the following conservative title/description pairs, and the route contract compares every page exactly rather than accepting arbitrary non-empty marketing copy:

  | Route | Title | Description |
  | --- | --- | --- |
  | `/` | `Yu Zhan` | `Ph.D. student researching the intelligent design of lithium-battery electrolytes.` |
  | `/zh/` | `湛煜` | `北京理工大学材料科学与工程专业博士研究生，研究方向为锂电池电解液智能设计。` |
  | `/research/` | `Research` | `Research directions in data-driven electrolyte screening, novel lithium-salt design, and electrolyte interfaces and stability.` |
  | `/zh/research/` | `研究方向` | `围绕数据驱动的电解液筛选、新型锂盐设计以及电解液界面与稳定性开展研究。` |
  | `/publications/` | `Publications` | `Complete verified publication record in the approved author and bibliographic order.` |
  | `/zh/publications/` | `论文发表` | `经核验的完整论文列表，按已批准顺序展示作者与书目信息。` |
  | `/honors/` | `Honors & Awards` | `Verified honors with official Chinese titles and factual role descriptions.` |
  | `/zh/honors/` | `荣誉奖励` | `经核验的荣誉记录，保留官方中文名称并如实说明获奖角色。` |
  | `/cv/` | `Academic CV` | `Education, research interests, skills, publications, and verified honors.` |
  | `/zh/cv/` | `学术简历` | `教育经历、研究方向、专业技能、论文发表与经核验的荣誉记录。` |

  `tests/page-composition-contract.test.mjs` must parse the body of every formal page and deep-compare include name, mode, filter, and order against this matrix:

  | Page pair | Required ordered composition | Forbidden composition |
  | --- | --- | --- |
  | home | `hero`; `research-directions compact`; `publication-list selected_only=true`; `education-list compact=true`; `academic-links` | `award-list`; full publication mode |
  | research | `research-directions expanded`; `skills-list`; `academic-links` | `publication-list selected_only=true`; `award-list` |
  | publications | `publication-list selected_only=false` | `award-list` |
  | honors | `award-list` | `publication-list` |
  | cv | `identity-summary`; `profile-links`; `research-directions compact`; `education-list compact=false`; `skills-list`; `publication-list selected_only=false`; `award-list`; `academic-links` | `hero`; selected-only publications |

  The test must also verify localized non-empty section headings in matching order for both languages and prove that the homepages contain no Honors heading.

  Run:

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\bilingual-route-contract.test.mjs tests\page-composition-contract.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Bilingual route/page-composition tests unexpectedly passed against the template." }
  ```

  Expected: FAIL because the current template lacks the route set/compositions and still tracks demonstration content.

- [ ] **Step 2: Replace navigation with two stable language menus**

  `_data/navigation.yml` must contain only `main_en` and `main_zh`. Each item has `key`, `title`, and `url`; keys are `research`, `publications`, `honors`, `cv` in that order. English titles are `Research`, `Publications`, `Honors`, `CV`; Chinese titles are `研究方向`, `论文发表`, `荣誉奖励`, `学术简历`.

- [ ] **Step 3: Create all ten pages with complete front matter and composition**

  Every page must declare the exact mapping and frozen copy above plus `lang` and a mutual `counterpart`. Use no redirects from former demo routes.

  Replace `_pages/404.md` with exactly the auxiliary front matter specified in Task 4 and a concise link back to `/`; omit `counterpart`. Delete every other template page and all demonstration collection/post records listed above so the only content-backed HTML routes are the ten formal routes plus the error page.

  Page bodies must implement these complete section sets:

  - both homepages: `hero`, three compact research cards, selected publication list, compact education, and supervisor/team affiliations; no honors section;
  - both Research pages: research headline, three expanded directions using the approved single description, an ongoing label only on novel lithium-salt design, methods/tools, and affiliations;
  - both Publications pages: introductory sentence and all eight publications;
  - both Honors pages: introductory sentence and all six awards;
  - both CV pages: identity/contact/profile links, three doctoral interests, Education, Skills, all Publications, all Honors & Awards, supervisor, and team in the approved order.

  Reference the planned includes exactly:

  ```liquid
  {% include hero.html lang=page.lang %}
  {% include research-directions.html lang=page.lang mode="compact" %}
  {% include publication-list.html lang=page.lang selected_only=true %}
  {% include education-list.html lang=page.lang compact=true %}
  {% include academic-links.html lang=page.lang %}
  ```

  Use localized semantic `<section>` headings directly in each page. CV pages must compose the same shared includes instead of duplicating publication or award records.

- [ ] **Step 4: Activate site validation with a red-first package contract**

  First update `tests/dependency-contract.test.mjs` to require these additional scripts, then run it before changing `package.json`:

  ```text
  "validate:site": "node scripts/validate-site-contract.mjs",
  "validate": "npm run validate:data && npm run validate:site"
  ```

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\dependency-contract.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Dependency contract unexpectedly passed before site scripts were added." }
  ```

  Expected: FAIL because the two scripts are absent from `package.json`.

  Add both scripts, refresh the lock without changing dependency versions, and rerun the contract:

  ```powershell
  . .\scripts\set-local-env.ps1
  npm.cmd install --package-lock-only --cache $env:npm_config_cache
  if ($LASTEXITCODE -ne 0) { throw "Unable to refresh the site-script lockfile." }
  node --test tests\dependency-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Dependency contract failed after site scripts were added." }
  ```

  Expected: PASS.

- [ ] **Step 5: Run route/composition validation green and capture the rendering red state**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\bilingual-route-contract.test.mjs tests\page-composition-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Bilingual route/page-composition contracts failed." }
  npm.cmd run validate
  if ($LASTEXITCODE -ne 0) { throw "Real source contract validation failed." }
  & .\scripts\setup-local-ruby.ps1
  if ($LASTEXITCODE -ne 0) { throw "Portable Ruby setup failed before rendering red check." }
  bundle _2.5.23_ exec jekyll build --strict_front_matter --trace --destination .test-output/site
  $renderRedExit = $LASTEXITCODE
  if ($renderRedExit -eq 0) { throw "Jekyll unexpectedly rendered before the shared includes/layout existed." }
  ```

  Expected: page composition, data, and route validation pass with the exact success messages; Jekyll fails on the first not-yet-created shared include. Do not commit this intentionally red rendering state.

### Task 6: Implement the multilingual shell and single-purpose rendering components

**Files:**
- Modify: `_config.yml`
- Modify: `_layouts/default.html`
- Create: `_layouts/home.html`
- Create: `_layouts/academic.html`
- Modify: `_includes/masthead.html`
- Create: `_includes/language-switch.html`
- Modify: `_includes/seo.html`
- Modify: `_includes/head.html`
- Modify: `_includes/head/custom.html`
- Modify: `_includes/footer.html`
- Create: `_includes/hero.html`
- Create: `_includes/identity-summary.html`
- Create: `_includes/profile-links.html`
- Create: `_includes/research-directions.html`
- Create: `_includes/author-list.html`
- Create: `_includes/publication-list.html`
- Create: `_includes/education-list.html`
- Create: `_includes/skills-list.html`
- Create: `_includes/award-list.html`
- Create: `_includes/academic-links.html`
- Create: `tests/liquid-rendering-contract.test.mjs`

- [ ] **Step 1: Write the failing Liquid source contract**

  `tests/liquid-rendering-contract.test.mjs` must assert before implementation that:

  - the default layout derives `<html lang>` from `page.lang`, applies `page.body_class`, and exposes a skip link to `#main-content`;
  - the home and academic layouts each define one `<main id="main-content">` and never include the sidebar/author profile;
  - masthead chooses `main_en` or `main_zh`, sends the Chinese brand to `/zh/`, marks the current route with `aria-current`, and uses semantic `<details>/<summary>` for a no-JavaScript mobile menu;
  - language switching uses only `page.counterpart` and includes `hreflang` plus a localized accessible label;
  - SEO emits one canonical URL plus current, counterpart, and `x-default` alternates with `en_US`/`zh_CN` Open Graph locales;
  - the head, custom head, and default layout contain no feed link, remote script, remote stylesheet/image/iframe, analytics, theme-toggle, or MathJax reference;
  - publication rendering derives `https://doi.org/` links, bolds only `Yu Zhan`, preserves ordered authors, supports selected/all modes, and has no authorship badge;
  - award rendering keeps `official_title_zh` visible on English pages, uses `english_descriptor`, and never references certificate assets;
  - research rendering resolves `related_publication_ids` through the canonical publication data and displays `ongoing` only from the stored status.
  - `identity-summary.html` renders the localized name, current appointment, and institution for CV pages, while contact/profile anchors remain solely in `profile-links.html`.

- [ ] **Step 2: Confirm the rendering contract is red**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\liquid-rendering-contract.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Liquid rendering contract unexpectedly passed before shared rendering existed." }
  ```

  Expected: FAIL on the current default layout and missing academic includes.

- [ ] **Step 3: Rewrite `_config.yml` as a minimal personal-site configuration**

  Set exact metadata:

  ```yaml
  locale: en-US
  title: Yu Zhan
  name: Yu Zhan
  description: Ph.D. student researching the intelligent design of lithium-battery electrolytes.
  url: https://dravencent.github.io
  baseurl: ""
  repository: Dravencent/Dravencent.github.io
  future: false
  timezone: Asia/Shanghai
  analytics:
    provider: false
  ```

  Keep `_pages` included, UTF-8, Kramdown, compressed Sass, sitemap, and GitHub Pages-compatible settings. Remove all publication/talk/teaching/portfolio collections, posts defaults, author/sidebar data, comments, feeds, archives, pagination, theme switching, and unused plugin declarations. Page defaults use `layout: academic` and `author_profile: false`. The exclusion list must explicitly cover `.github`, `.gitignore`, `.worktrees`, `docs`, `tests`, `scripts`, `README.md`, `LICENSE`, `Gemfile`, `Gemfile.lock`, `package.json`, `package-lock.json`, `requirements-tools.txt`, `requirements-pdf-tools.txt`, `.local-tools`, `.test-output`, `_site`, and `images/My.png`. This supports Task 10's exact nineteen-file generated-output allowlist rather than relying on Jekyll defaults.

- [ ] **Step 4: Implement the semantic bilingual page shell**

  - `_layouts/default.html`: page-level language, body class, skip link, masthead, page content, minimal footer, and no JavaScript include.
  - `_layouts/home.html`: extend default and render content in a full-width research-first main container.
  - `_layouts/academic.html`: extend default and render localized page title/description above the page content.
  - `_includes/masthead.html`: one desktop list and one `<details>` mobile list using the selected language menu; the language switch remains reachable in both.
  - `_includes/language-switch.html`: direct page-to-page counterpart only; no generic-home fallback.
  - `_includes/seo.html`: escaped deterministic title/description, canonical, bilingual alternates, correct locale, and no third-party script. Home uses its localized `page.title` verbatim; other formal pages use `<page.title> | Yu Zhan`; 404 uses `Page not found | Yu Zhan` and emits no counterpart alternate.
  - `_includes/head.html`: local metadata and `{{ '/assets/css/main.css' | relative_url }}` only; remove the inactive feed link and absolute `site.url` asset path so local preview loads styles.
  - `_includes/head/custom.html`: local PNG/ICO favicon links through `relative_url` only; remove the stale OOjs SVG/manifest, Academic Pages' Academicons link, and the Polyfill/MathJax CDNs. Academic profile links use accessible text, not an icon-font dependency.
  - `_includes/footer.html`: localized copyright plus HTTPS repository link only; remove feed and template credits.

- [ ] **Step 5: Implement the data-rendering includes**

  Keep each include single-purpose:

  - `hero.html`: localized identity, headline, biography, `images/yu-zhan-illustration.webp` with meaningful localized alt text, and a call to `profile-links.html` rather than duplicate link markup;
  - `identity-summary.html`: localized name, current appointment, and institution only, for the opening section of both CV pages;
  - `profile-links.html`: Email, GitHub, and ORCID only;
  - `research-directions.html`: compact or expanded rendering from profile data, related-publication links, and ongoing status;
  - `author-list.html`: exact ordered punctuation and `<strong>` only for `Yu Zhan`;
  - `publication-list.html`: selected or complete list, bibliographic fields with empty values omitted, canonical DOI URL, no role badges, and a call to `author-list.html` for every author sequence;
  - `education-list.html`: compact or full education rendering;
  - `skills-list.html`: the five approved tools only;
  - `award-list.html`: official Chinese title plus English descriptor on English pages; official title, level, role, and project on Chinese pages; no empty issuer/project label;
  - `academic-links.html`: supervisor profile and team website.

  Internal routes must use `relative_url`; canonical external URLs must be HTTPS.

- [ ] **Step 6: Run the rendering tests and strict Jekyll build green**

  ```powershell
  . .\scripts\set-local-env.ps1
  npm.cmd test
  if ($LASTEXITCODE -ne 0) { throw "Complete Node suite failed after shared rendering." }
  npm.cmd run validate
  if ($LASTEXITCODE -ne 0) { throw "Complete source validation failed after shared rendering." }
  & .\scripts\setup-local-ruby.ps1
  if ($LASTEXITCODE -ne 0) { throw "Portable Ruby setup failed before green build." }
  bundle _2.5.23_ exec jekyll build --strict_front_matter --trace --destination .test-output/site
  if ($LASTEXITCODE -ne 0) { throw "Strict bilingual Jekyll build failed." }
  ```

  Then assert the eleven content-backed HTML outputs exist and former demo routes do not:

  ```powershell
  . .\scripts\set-local-env.ps1
  $expectedHtml = @(
    "index.html", "zh/index.html",
    "research/index.html", "zh/research/index.html",
    "publications/index.html", "zh/publications/index.html",
    "honors/index.html", "zh/honors/index.html",
    "cv/index.html", "zh/cv/index.html", "404.html"
  )
  $expectedHtml | ForEach-Object { if (-not (Test-Path (Join-Path ".test-output/site" $_))) { throw "Missing output: $_" } }
  $legacy = @("talks", "teaching", "portfolio", "year-archive", "markdown", "cv-json", "talkmap.html")
  $legacy | ForEach-Object { if (Test-Path (Join-Path ".test-output/site" $_)) { throw "Unexpected demo route: $_" } }
  ```

  Expected: all Node tests pass; validation reports 8 publications, 6 awards, 3 directions, 10 routes, 5 counterpart pairs, and 2 menus; Jekyll exits 0; all ten bilingual pages plus `/404.html` exist; no former demonstration route exists.

- [ ] **Step 7: Commit the complete bilingual rendering layer**

  ```powershell
  . .\scripts\set-local-env.ps1
  git add package.json package-lock.json _config.yml _data/navigation.yml _pages _layouts/default.html _layouts/home.html _layouts/academic.html _includes/masthead.html _includes/language-switch.html _includes/seo.html _includes/head.html _includes/head/custom.html _includes/footer.html _includes/hero.html _includes/identity-summary.html _includes/profile-links.html _includes/research-directions.html _includes/author-list.html _includes/publication-list.html _includes/education-list.html _includes/skills-list.html _includes/award-list.html _includes/academic-links.html scripts/lib/site-contract-validation.mjs scripts/validate-site-contract.mjs tests/fixtures/approved-page-copy.mjs tests/site-contract-validation.test.mjs tests/validate-site-contract-cli.test.mjs tests/bilingual-route-contract.test.mjs tests/page-composition-contract.test.mjs tests/liquid-rendering-contract.test.mjs tests/dependency-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Unable to stage bilingual route/rendering files." }
  git add -A _publications _talks _teaching _portfolio _posts _drafts
  if ($LASTEXITCODE -ne 0) { throw "Unable to stage demonstration-content removals." }
  git commit -m "feat: render the bilingual academic CV site"
  if ($LASTEXITCODE -ne 0) { throw "Bilingual academic CV rendering commit failed." }
  ```

## Chunk 3: Optimized assets, academic visual system, cleanup, and generated-site validation

### Task 7: Pin the D-local Python toolchain and generate the web illustration with TDD

**Files:**
- Create: `requirements-tools.txt`
- Create: `scripts/setup-local-python.ps1`
- Create: `scripts/optimize_profile_image.py`
- Create: `tests/python-toolchain-contract.test.mjs`
- Create: `tests/test_optimize_profile_image.py`
- Create: `tests/test_optimize_profile_image_cli.py`
- Create: `images/yu-zhan-illustration.webp`
- Modify: `tests/liquid-rendering-contract.test.mjs`

- [ ] **Step 1: Write the failing Python-toolchain isolation contract**

  `tests/python-toolchain-contract.test.mjs` must require exactly `Pillow==12.1.1` and require `scripts/setup-local-python.ps1` to dot-source `scripts/set-local-env.ps1`, derive the repo from `$PSScriptRoot`, reject roots outside the D-drive CV workspace, accept only exact CPython `3.10.9` x64, use `Push-Location` with `try/finally` and `Pop-Location`, and place the venv, pip cache, temp, and bytecode cache below `.local-tools/`. It must set `TEMP`, `TMP`, `PIP_CACHE_DIR`, `PIP_DISABLE_PIP_VERSION_CHECK`, `PYTHONPYCACHEPREFIX`, and `PYTHONNOUSERSITE` before Python/pip, install only a binary wheel with `--only-binary=:all:`, assert exact embedded libwebp `1.6.0`, establish an explicit process exit status for callers, and contain no literal `C:\` path.

- [ ] **Step 2: Confirm the Python-toolchain contract is red**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\python-toolchain-contract.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Python-toolchain contract unexpectedly passed before implementation." }
  ```

  Expected: FAIL because the requirements file and setup script do not exist.

- [ ] **Step 3: Implement and bootstrap the pinned D-local Python environment**

  Create `requirements-tools.txt` with exactly `Pillow==12.1.1`. The strict setup script must select an existing CPython `3.10.9` x64 interpreter without installing anything globally, reject every other version/architecture, create `.local-tools/python-venv`, and invoke pip only as `& $venvPython -m pip install --only-binary=:all: -r requirements-tools.txt` after every mutable Python/pip path has been redirected below `.local-tools/`. It must reject a source build or missing WebP feature, print the base/venv Python and Pillow versions, and assert `PIL.features.version("webp")` is exactly `1.6.0` for the official Pillow 12.1.1 Windows x64 wheel. Run the setup, verify Python `3.10.9` x64, `Pillow 12.1.1`, and `libwebp 1.6.0`, then rerun the contract green:

  ```powershell
  . .\scripts\set-local-env.ps1
  & .\scripts\setup-local-python.ps1
  if ($LASTEXITCODE -ne 0) { throw "Pinned D-local Python setup failed." }
  node --test tests\python-toolchain-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Python-toolchain contract failed after implementation." }
  ```

- [ ] **Step 4: Write failing pure image-optimizer tests**

  `tests/test_optimize_profile_image.py` must create Pillow images in memory without `tempfile` or the system temporary directory:

  - the active runtime is Pillow 12.1.1 with WebP support backed by libwebp 1.6.0;
  - `resize_for_web(image, max_dimension=640)` preserves aspect ratio, never upscales, and leaves both dimensions at or below 640;
  - `encode_webp(image, max_bytes=250_000)` strips metadata and selects the highest quality from 86 down to 68 whose output is strictly below 250,000 bytes;
  - opaque input becomes RGB and transparent input remains RGBA;
  - `inspect_web_image(path)` reports format, dimensions, and bytes and rejects a non-WebP, oversize dimension, or file at/above 250,000 bytes.

- [ ] **Step 5: Confirm the pure optimizer is red, then implement only pure functions**

  ```powershell
  . .\scripts\set-local-env.ps1
  & .\.local-tools\python-venv\Scripts\python.exe -m unittest tests.test_optimize_profile_image -v
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Pure image-optimizer tests unexpectedly passed before implementation." }
  ```

  Expected: FAIL with `ModuleNotFoundError` for `scripts.optimize_profile_image`.

  Implement EXIF transpose, LANCZOS resizing, mode normalization, WebP `method=6` encoding, and inspection. Re-run fail-closed:

  ```powershell
  . .\scripts\set-local-env.ps1
  & .\.local-tools\python-venv\Scripts\python.exe -m unittest tests.test_optimize_profile_image -v
  if ($LASTEXITCODE -ne 0) { throw "Pure image-optimizer tests failed after implementation." }
  ```

- [ ] **Step 6: Write and confirm failing optimizer CLI tests**

  `tests/test_optimize_profile_image_cli.py` uses only `.test-output/image-optimizer/` and covers success/check modes, rejection outside the repo, strict `<250000`, unchanged source bytes, unchanged existing destination after decode/encode/validation/replacement failure, partial-file cleanup, and deterministic exit/message prefixes.

  Run the CLI unittest through the pinned virtual environment:

  ```powershell
  . .\scripts\set-local-env.ps1
  & .\.local-tools\python-venv\Scripts\python.exe -m unittest tests.test_optimize_profile_image_cli -v
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Image-optimizer CLI tests unexpectedly passed before implementation." }
  ```

  Expected: FAIL because argument parsing and atomic CLI behavior are absent.

- [ ] **Step 7: Implement the confined atomic CLI and run focused tests green**

  Expose `SOURCE DESTINATION` and `--check DESTINATION` through `argparse`. Resolve paths, require the destination below the repo, write a unique same-directory `.partial` candidate, validate it, call `os.replace` only after success, and remove leftovers in `finally`. Run both Python test modules:

  ```powershell
  . .\scripts\set-local-env.ps1
  & .\.local-tools\python-venv\Scripts\python.exe -m unittest tests.test_optimize_profile_image tests.test_optimize_profile_image_cli -v
  if ($LASTEXITCODE -ne 0) { throw "Focused image-optimizer suites failed." }
  ```

- [ ] **Step 8: Generate the derivative, verify it, and run the current quality gate**

  ```powershell
  . .\scripts\set-local-env.ps1
  & .\.local-tools\python-venv\Scripts\python.exe scripts\optimize_profile_image.py images\My.png images\yu-zhan-illustration.webp
  if ($LASTEXITCODE -ne 0) { throw "Profile-image derivative generation failed." }
  & .\.local-tools\python-venv\Scripts\python.exe scripts\optimize_profile_image.py --check images\yu-zhan-illustration.webp
  if ($LASTEXITCODE -ne 0) { throw "Profile-image derivative validation failed." }
  npm.cmd test
  if ($LASTEXITCODE -ne 0) { throw "Node suite failed after image generation." }
  npm.cmd run validate
  if ($LASTEXITCODE -ne 0) { throw "Source validation failed after image generation." }
  ```

  Expected: all checks pass; the image is WebP, at most 640 px, and strictly below 250,000 bytes. Compare pre/post SHA-256 for `images/My.png`; it must be identical.

- [ ] **Step 9: Strengthen the rendering contract and commit the asset**

  Extend `tests/liquid-rendering-contract.test.mjs` to require `hero.html` to reference only `images/yu-zhan-illustration.webp` for the portrait and to provide localized non-empty alt text. Run:

  ```powershell
  . .\scripts\set-local-env.ps1
  npm.cmd test
  if ($LASTEXITCODE -ne 0) { throw "Rendering contract suite failed for the optimized image." }
  npm.cmd run validate
  if ($LASTEXITCODE -ne 0) { throw "Source validation failed for the optimized image." }
  ```

  Expected: all tests and validators pass.

  ```powershell
  . .\scripts\set-local-env.ps1
  git add requirements-tools.txt scripts/setup-local-python.ps1 scripts/optimize_profile_image.py tests/python-toolchain-contract.test.mjs tests/test_optimize_profile_image.py tests/test_optimize_profile_image_cli.py images/yu-zhan-illustration.webp tests/liquid-rendering-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Unable to stage the optimized image/toolchain." }
  git commit -m "perf: add optimized academic profile illustration"
  if ($LASTEXITCODE -ne 0) { throw "Optimized image/toolchain commit failed." }
  ```

### Task 8: Implement the Research-First visual, responsive, accessibility, and print system

**Files:**
- Create: `_sass/layout/_academic-cv.scss`
- Modify: `assets/css/main.scss`
- Modify: `_sass/theme/_default.scss`
- Modify: `_sass/_themes.scss`
- Create: `tests/style-contract.test.mjs`

- [ ] **Step 1: Write the failing visual-system contract**

  `tests/style-contract.test.mjs` must read the SCSS and verify:

  - exact palette variables: navy `#132238`, charcoal `#242a33`, accent red `#8f1d2c`, warm white `#faf7f2`, white `#ffffff`, and border `#d8d1c7`;
  - computed contrast is at least 4.5:1 for charcoal/warm-white body text and accent-red/warm-white links, and at least 3:1 for focus/control boundaries;
  - system-only serif heading, sans-serif body, Chinese Song heading, and Chinese Hei body stacks;
  - hero grid, three-card research grid, publication/award/timeline blocks, and a readable maximum content width;
  - `overflow-wrap: anywhere` on long links/titles and a visible `:focus-visible` outline;
  - base mobile behavior below 768 px, an explicit `48rem` to `63.9375rem` tablet band, and a `64rem` desktop breakpoint;
  - desktop navigation hidden on mobile and `<details>` navigation hidden on desktop;
  - no gradient, keyframe animation, decorative transform animation, or externally loaded font;
  - an explicit `prefers-reduced-motion: reduce` branch that removes nonessential motion;
  - `@media print`, `@page { size: A4; }`, millimeter margins, hidden navigation/footer/illustration, black readable text/links, and `break-inside: avoid` for CV sections, publication entries, award entries, and education entries.

- [ ] **Step 2: Confirm the style contract is red**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\style-contract.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Style contract unexpectedly passed before the visual system existed." }
  ```

  Expected: FAIL because `_academic-cv.scss` and the selected palette do not exist.

- [ ] **Step 3: Implement the focused SCSS layer**

  - Set the six palette variables in `_sass/theme/_default.scss` and map them to the existing CSS custom properties.
  - In `_sass/_themes.scss`, use system stacks only: Georgia/Times/Song for headings and Segoe UI/Arial/Microsoft YaHei/Hei for body text, with explicit `[lang="zh"]` fallbacks.
  - Add `_sass/layout/_academic-cv.scss` for the masthead, hero, research cards, shared lists, timeline, CV layout, focus, three responsive ranges, and A4 print rules.
  - Remove the unused Font Awesome and Magnific Popup imports, then import `layout/academic-cv` last in `assets/css/main.scss` so it can deliberately override retained upstream primitives without editing vendor/Susy files.
  - Disable inherited intro animations and global decorative transitions for `.academic-site`; honor `prefers-reduced-motion` globally.

- [ ] **Step 4: Run style, content, and build checks green**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\style-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Focused style contract failed." }
  npm.cmd test
  if ($LASTEXITCODE -ne 0) { throw "Complete Node suite failed after visual-system work." }
  npm.cmd run validate
  if ($LASTEXITCODE -ne 0) { throw "Source validation failed after visual-system work." }
  & .\scripts\setup-local-ruby.ps1
  if ($LASTEXITCODE -ne 0) { throw "Portable Ruby setup failed before visual build." }
  bundle _2.5.23_ exec jekyll build --strict_front_matter --trace --destination .test-output/site
  if ($LASTEXITCODE -ne 0) { throw "Strict visual-system Jekyll build failed." }
  ```

  Expected: all tests/validators pass, Sass compiles without warning/error, and Jekyll exits 0.

- [ ] **Step 5: Commit the visual system**

  ```powershell
  . .\scripts\set-local-env.ps1
  git add _sass/layout/_academic-cv.scss _sass/theme/_default.scss _sass/_themes.scss assets/css/main.scss tests/style-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Unable to stage the visual system." }
  git commit -m "style: add research-first academic CV design"
  if ($LASTEXITCODE -ne 0) { throw "Visual-system commit failed." }
  ```

### Task 9: Remove inactive template material and enforce source/privacy hygiene

**Files:**
- Create: `scripts/lib/source-hygiene.mjs`
- Create: `scripts/validate-source-hygiene.mjs`
- Create: `tests/source-hygiene.test.mjs`
- Create: `tests/validate-source-hygiene-cli.test.mjs`
- Modify: `_config.yml`
- Modify: `tests/dependency-contract.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `README.md`
- Delete: `CONTRIBUTING.md`
- Delete: `_data/cv.json`
- Delete: `_data/authors.yml`
- Delete: `_data/comments/**`
- Delete: `scripts/cv_markdown_to_json.py`
- Delete: `scripts/update_cv_json.sh`
- Delete: `markdown_generator/**`
- Delete: `talkmap/**`
- Delete: `talkmap.py`
- Delete: `talkmap.ipynb`
- Delete: `talkmap_out.ipynb`
- Delete: `.github/workflows/scrape_talks.yml`
- Delete: `files/**`
- Delete: `assets/js/**`
- Delete: `assets/fonts/**`
- Delete: `assets/webfonts/**`
- Delete: `assets/css/academicons.css`
- Delete: `assets/css/academicons.min.css`
- Delete: `assets/css/collapse.css`
- Delete: `assets/css/cv-layout.css`
- Delete: `assets/css/cv-style.css`
- Delete: `images/manifest.json`
- Delete: `images/favicon.svg`
- Delete: `Dockerfile`
- Delete: `docker-compose.yaml`
- Delete: `_config_docker.yml`
- Delete: template-only images listed below

- [ ] **Step 1: Write failing pure source-hygiene tests**

  `tests/source-hygiene.test.mjs` must test tracked-path, whole-tree privacy, and active-rendering checks against in-memory maps. Assemble synthetic QQ-address and certificate-label/serial negative fixtures from string fragments at runtime so the tracked test source itself contains no literal pattern that the repository-wide privacy gate would reject. Detect:

  - tracked paths containing `.superpowers`, `.local-tools`, `_site`, `node_modules`, `获奖证书`, `certificate`, `qr`/`qrcode`, `signature`, or `签名`;
  - a tracked certificate-like PDF/image even when outside `files/`;
  - any `files/` artifact in the final tree;
  - across all tracked UTF-8 text, generic QQ addresses via `\b\d{5,}@qq\.com\b`, certificate-number labels followed by serial values, U+FFFD, and known mojibake fragments;
  - template strings such as `Your Name`, `Academic Pages is a ready-to-fork`, `Paper Title Number`, `Journal 1`, `Lorem ipsum`, `Teaching experience`, `Portfolio item`, and `John Doe`;
  - public-source references to analytics, cookies, forms, Staticman, Disqus, remote scripts/styles/images/iframes, or inactive demo routes;
  - allowed HTTPS anchors for DOI, ORCID, GitHub, supervisor, and team links without treating them as remote assets.

  `validateTrackedPaths` covers the complete staged index. `validateRepositoryPrivacy` covers every tracked text file but matches actual secrets/serial values, not policy words. `validateActiveSources` scans only the active rendering closure: four canonical data files, ten pages plus 404, three active layouts, Task 6's active includes, active SCSS entry/theme files, and `_config.yml`. It also asserts that no active head source references the removed OOjs SVG/manifest or an icon-font stylesheet. Task 10 separately checks all generated output.

- [ ] **Step 2: Confirm source hygiene is red**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\source-hygiene.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Source-hygiene tests unexpectedly passed before implementation." }
  ```

  Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/lib/source-hygiene.mjs`.

- [ ] **Step 3: Implement the pure scanner and run focused tests green**

  Export `validateTrackedPaths(paths)`, `validateRepositoryPrivacy(textMap)`, `validateActiveSources(sourceMap)`, and `validateSourceHygiene(input)`. Run:

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\source-hygiene.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Pure source-hygiene tests failed." }
  ```

  Expected: PASS before the CLI exists.

- [ ] **Step 4: Write and confirm failing source-hygiene CLI tests**

  `tests/validate-source-hygiene-cli.test.mjs` injects the staged-path loader, tracked-text reader, active-source reader, stdout, and stderr. It verifies aggregation, exit 0/1, path-aware errors, and exact success text:

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\validate-source-hygiene-cli.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Source-hygiene CLI tests unexpectedly passed before implementation." }
  ```

  Expected: FAIL because the CLI does not exist.

- [ ] **Step 5: Implement the injectable CLI and run both focused suites green**

  `scripts/validate-source-hygiene.mjs` obtains staged paths with `git ls-files -z`, loads whole-tree text plus the explicit active closure, delegates to the pure functions, and prints exactly on success:

  ```text
  Source hygiene passed: no private artifacts, template content, remote assets, or legacy routes detected.
  ```

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\source-hygiene.test.mjs tests\validate-source-hygiene-cli.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Focused source-hygiene suites failed." }
  ```

- [ ] **Step 6: Add a red-first package contract for source validation**

  First update `tests/dependency-contract.test.mjs` to require:

  ```text
  "validate:source": "node scripts/validate-source-hygiene.mjs",
  "validate": "npm run validate:data && npm run validate:site && npm run validate:source"
  ```

  Before modifying `package.json`, confirm red:

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\dependency-contract.test.mjs tests\validate-source-hygiene-cli.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Source-validation package contract unexpectedly passed before scripts were added." }
  ```

  Then add the scripts, refresh `package-lock.json` with the D-only cache, and rerun green:

  ```powershell
  . .\scripts\set-local-env.ps1
  npm.cmd install --package-lock-only --cache $env:npm_config_cache
  if ($LASTEXITCODE -ne 0) { throw "Unable to refresh the source-validation lockfile." }
  node --test tests\dependency-contract.test.mjs tests\validate-source-hygiene-cli.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Source-validation package/CLI contracts failed." }
  ```

- [ ] **Step 7: Delete inactive template files and public legacy assets**

  Delete the listed files, `CONTRIBUTING.md`, all `assets/js/**`, `assets/fonts/**`, `assets/webfonts/**`, both Academicons stylesheets, the three legacy CSS files, `images/manifest.json`, `images/favicon.svg`, and these template-only images. Preserve `images/My.png`, the optimized WebP, the PNG/ICO favicon assets, and no certificate image:

  ```text
  images/themes/
  images/site-logo.png
  images/profile.png
  images/paragraph-no-indent.png
  images/paragraph-indent.png
  images/image-alignment-*.jpg
  images/homepage.png
  images/foo-bar-identity.jpg
  images/foo-bar-identity-th.jpg
  images/editing-talk.png
  images/bio-photo.jpg
  images/bio-photo-2.jpg
  images/500x300.png
  images/3953273590_704e3899d5_m.jpg
  ```

  Add `images/My.png` and the explicit source-only paths listed in Task 6 to `_config.yml` exclusions so the original illustration and tooling never enter `.test-output/site`. Retain unreachable upstream include/layout/Sass primitives; Task 10 must prove they do not enter generated HTML or forbidden assets.

- [ ] **Step 8: Rewrite the repository README as a maintenance guide**

  Document the site's purpose, the ten routes, the three canonical data files, how to update publications/awards/profile, how to run the D-only setup and checks, the `master` classic Pages deployment model, privacy rules, and the rule that new awards are entered as text without certificate uploads. Do not include local personal paths, template badges/screenshots, or unverified research claims.

- [ ] **Step 9: Stage the prospective final tree before index-based hygiene**

  Stage all Task 9 additions, edits, and deletions before invoking `git ls-files`-based validation:

  ```powershell
  . .\scripts\set-local-env.ps1
  git add -A -- _config.yml _data scripts tests package.json package-lock.json README.md CONTRIBUTING.md markdown_generator talkmap talkmap.py talkmap.ipynb talkmap_out.ipynb files images assets/js assets/css assets/fonts assets/webfonts .github/workflows Dockerfile docker-compose.yaml _config_docker.yml
  if ($LASTEXITCODE -ne 0) { throw "Unable to stage the prospective cleanup tree." }
  git diff --cached --check
  if ($LASTEXITCODE -ne 0) { throw "Prospective cleanup diff check failed." }
  git diff --cached --name-status
  if ($LASTEXITCODE -ne 0) { throw "Unable to inspect prospective cleanup paths." }
  ```

  Expected: only intended cleanup/hygiene changes are staged; no local runtime, generated site, certificate, or unrelated user file appears.

- [ ] **Step 10: Run source hygiene and the complete current quality gate**

  ```powershell
  . .\scripts\set-local-env.ps1
  npm.cmd test
  if ($LASTEXITCODE -ne 0) { throw "Node suite failed during cleanup gate." }
  npm.cmd run validate
  if ($LASTEXITCODE -ne 0) { throw "Source validation failed during cleanup gate." }
  & .\scripts\setup-local-ruby.ps1
  if ($LASTEXITCODE -ne 0) { throw "Portable Ruby setup failed during cleanup gate." }
  bundle _2.5.23_ exec jekyll build --strict_front_matter --trace --destination .test-output/site
  if ($LASTEXITCODE -ne 0) { throw "Strict cleanup-gate Jekyll build failed." }
  $cleanupStatus = @(git status --short)
  if ($LASTEXITCODE -ne 0) { throw "Unable to inspect cleanup worktree status." }
  $cleanupStatus
  $trackedPaths = @(git ls-files)
  if ($LASTEXITCODE -ne 0 -or $trackedPaths.Count -eq 0) { throw "Unable to inspect tracked paths after cleanup." }
  $trackedPaths
  ```

  Expected: tests and all three validators pass; Jekyll exits 0; tracked files contain no certificate, QR/signature, local runtime, `_site`, `files/` artifact, QQ address in the current public source, or demonstration record.

- [ ] **Step 11: Commit the cleanup and hygiene gate**

  ```powershell
  . .\scripts\set-local-env.ps1
  git add -A -- _config.yml _data scripts tests package.json package-lock.json README.md CONTRIBUTING.md markdown_generator talkmap talkmap.py talkmap.ipynb talkmap_out.ipynb files images assets/js assets/css assets/fonts assets/webfonts .github/workflows Dockerfile docker-compose.yaml _config_docker.yml
  if ($LASTEXITCODE -ne 0) { throw "Unable to restage cleanup/hygiene changes." }
  git diff --cached --check
  if ($LASTEXITCODE -ne 0) { throw "Final cleanup staged diff check failed." }
  git diff --cached --name-status
  if ($LASTEXITCODE -ne 0) { throw "Unable to inspect final cleanup staged paths." }
  git commit -m "chore: remove template content and enforce privacy"
  if ($LASTEXITCODE -ne 0) { throw "Cleanup/hygiene commit failed." }
  ```

### Task 10: Validate the generated site and all internal links with TDD

**Files:**
- Create: `scripts/lib/built-site-validation.mjs`
- Create: `scripts/check-built-site.mjs`
- Create: `tests/fixtures/expected-built-files.mjs`
- Create: `tests/built-site-validation.test.mjs`
- Create: `tests/check-built-site-cli.test.mjs`
- Modify: `_includes/publication-list.html`
- Modify: `_includes/author-list.html`
- Modify: `_includes/award-list.html`
- Modify: `tests/liquid-rendering-contract.test.mjs`
- Modify: `tests/dependency-contract.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add Cheerio and the package script red-first**

  Update `tests/dependency-contract.test.mjs` first to require exactly `cheerio: "1.0.0"` and:

  ```text
  "check:built": "node scripts/check-built-site.mjs .test-output/site"
  ```

  Confirm red before changing the manifest:

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\dependency-contract.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Built-site dependency contract unexpectedly passed before Cheerio/script were added." }
  ```

  Add the exact dependency/script, refresh `package-lock.json` using the D-only npm cache, and rerun green:

  ```powershell
  . .\scripts\set-local-env.ps1
  npm.cmd install --package-lock-only --cache $env:npm_config_cache
  if ($LASTEXITCODE -ne 0) { throw "Unable to refresh the built-site validation lockfile." }
  node --test tests\dependency-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Built-site dependency contract failed after manifest update." }
  ```

- [ ] **Step 2: Write the failing pure generated-site validator tests and exact file oracle**

  `tests/fixtures/expected-built-files.mjs` must deep-freeze this complete normalized output-file set; no glob or catch-all entry is permitted:

  ```text
  404.html
  index.html
  zh/index.html
  research/index.html
  zh/research/index.html
  publications/index.html
  zh/publications/index.html
  honors/index.html
  zh/honors/index.html
  cv/index.html
  zh/cv/index.html
  sitemap.xml
  assets/css/main.css
  images/apple-touch-icon-180x180.png
  images/favicon-192x192.png
  images/favicon-32x32.png
  images/favicon-512x512.png
  images/favicon.ico
  images/yu-zhan-illustration.webp
  ```

  `tests/built-site-validation.test.mjs` uses in-memory HTML/file maps, source page metadata, and the approved academic-data fixture. It must fail on any missing or extra output and cover:

  - exact `html[lang]`, one `<h1>`, localized deterministic `<title>` and exact source-page meta description;
  - exact canonical, `en`, `zh`, `x-default`, `og:locale`, and `og:locale:alternate` values on ten formal pages; 404 has canonical/error metadata but no language switch or counterpart/alternate locale;
  - language-pure navigation, five direct mutual counterpart pairs, and resolution of every internal file/directory/query/fragment target;
  - exact identity/current appointment/institution/contact/profile links, three education records, five skills, three research directions, the ongoing label only on novel lithium-salt design, supervisor/team links, and the approved bilingual biography/research wording wherever the composition matrix requires them;
  - publication IDs, titles, ordered authors, canonical DOI anchors, and flags exactly matching the approved eight-record order; both home routes show exactly the selected first four; only `Yu Zhan` is bold and no authorship badge appears;
  - award IDs, reverse-chronological order, official titles, language-appropriate levels/roles, English descriptors, and optional projects exactly matching all six approved records; no certificate link/image/number appears;
  - no remote active asset, analytics/form/cookie text, generic QQ address, certificate serial, placeholder, U+FFFD, or known mojibake fragment.

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\built-site-validation.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Pure built-site tests unexpectedly passed before implementation." }
  ```

  Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/lib/built-site-validation.mjs`.

- [ ] **Step 3: Implement only the pure generated-site validator and run it green**

  Use Cheerio only to parse supplied HTML strings. Export pure validators accepting `{ fileMap, pages, profile, publications, awards, expectedFiles }`, collect every path-aware error, and perform no filesystem or process access. Run:

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\built-site-validation.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Pure built-site validator tests failed." }
  ```

- [ ] **Step 4: Add the stable Liquid-hook contract red-first**

  Extend `tests/liquid-rendering-contract.test.mjs` to require non-presentational `data-publication-id`, per-author `data-author`, and `data-award-id` hooks on the existing shared includes:

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\liquid-rendering-contract.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Liquid-hook contract unexpectedly passed before stable hooks were added." }
  ```

  Expected: FAIL on the absent hooks.

- [ ] **Step 5: Implement the rendering hooks and run the source contract green**

  Add the three stable hooks without changing visible text or adding presentation logic:

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\liquid-rendering-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Liquid-hook source contract failed after implementation." }
  ```

- [ ] **Step 6: Write the failing injectable CLI tests**

  `tests/check-built-site-cli.test.mjs` injects the site/page/data loader and output streams. It must prove that an outside-repository root is rejected before loading, recursive file loading is normalized, all diagnostics are aggregated with paths, return values are 1/0, import has no side effect, and success prints exactly:

  ```text
  Built site passed: 11 content routes, bilingual metadata, internal links, publications, honors, and privacy checks are valid.
  ```

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\check-built-site-cli.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Built-site CLI tests unexpectedly passed before implementation." }
  ```

  Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/check-built-site.mjs`.

- [ ] **Step 7: Implement the confined filesystem CLI and run focused suites green**

  The CLI recursively maps the requested site root, parses the eleven source page records, loads the three canonical YAML files and exact output oracle, and delegates to the pure validator. It resolves the candidate and current worktree root, rejects candidates outside that root before reading, reports every finding, and sets process exit state only inside a direct-execution guard.

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\built-site-validation.test.mjs tests\check-built-site-cli.test.mjs tests\liquid-rendering-contract.test.mjs tests\dependency-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Focused built-site validation suites failed." }
  ```

  Expected: all pure, CLI, rendering, and dependency contracts pass before relying on a real generated site.

- [ ] **Step 8: Build and run the complete generated-site checker**

  ```powershell
  . .\scripts\set-local-env.ps1
  npm.cmd test
  if ($LASTEXITCODE -ne 0) { throw "Node suite failed before generated-site validation." }
  npm.cmd run validate
  if ($LASTEXITCODE -ne 0) { throw "Source validation failed before generated-site validation." }
  & .\scripts\setup-local-ruby.ps1
  if ($LASTEXITCODE -ne 0) { throw "Portable Ruby setup failed before generated-site validation." }
  bundle _2.5.23_ exec jekyll build --strict_front_matter --trace --destination .test-output/site
  if ($LASTEXITCODE -ne 0) { throw "Strict generated-site Jekyll build failed." }
  npm.cmd run check:built
  if ($LASTEXITCODE -ne 0) { throw "Exact built-site checker failed." }
  & .\.local-tools\python-venv\Scripts\python.exe scripts\optimize_profile_image.py --check images\yu-zhan-illustration.webp
  if ($LASTEXITCODE -ne 0) { throw "Generated illustration budget check failed." }
  ```

  Expected: all tests/validators pass, Jekyll exits 0, the checker deep-compares the exact nineteen-file output/content contract and prints its exact success line, and the pinned image checker confirms the size/dimension budget.

- [ ] **Step 9: Commit generated-site validation**

  ```powershell
  . .\scripts\set-local-env.ps1
  git add _includes/publication-list.html _includes/author-list.html _includes/award-list.html tests/liquid-rendering-contract.test.mjs package.json package-lock.json scripts/lib/built-site-validation.mjs scripts/check-built-site.mjs tests/fixtures/expected-built-files.mjs tests/built-site-validation.test.mjs tests/check-built-site-cli.test.mjs tests/dependency-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Unable to stage generated-site validation." }
  git commit -m "test: validate generated bilingual CV site"
  if ($LASTEXITCODE -ne 0) { throw "Generated-site validation commit failed." }
  ```

## Chunk 4: One-command verification, D-only browser QA, and gated release

### Task 11: Add a complete local validation runner and validation-only CI

**Files:**
- Create: `scripts/run-full-validation.ps1`
- Create: `scripts/set-release-env.ps1`
- Create: `scripts/setup-local-gh.ps1`
- Create: `tests/full-validation-runner-contract.test.mjs`
- Create: `tests/release-runtime-contract.test.mjs`
- Create: `tests/gh-toolchain-contract.test.mjs`
- Create: `.github/workflows/validate.yml`
- Create: `tests/validate-workflow-contract.test.mjs`
- Modify: `README.md`

- [ ] **Step 1: Write the failing full-runner contract**

  `tests/full-validation-runner-contract.test.mjs` must require the runner to:

  - dot-source `scripts/set-local-env.ps1`, derive the current checkout/worktree root from `$PSScriptRoot` and Git, accept only a root on `D:` inside the canonical `D:\Doctor\Code\CV` workspace, and never require the feature worktree root to equal the main checkout;
  - create and use only `<current-root>/.local-tools/**` for every mutable environment path in the implementation guardrails and only `<current-root>/.test-output/site` for the build;
  - call the pinned Ruby and Python setup scripts, use the pinned venv interpreter explicitly, and treat every native non-zero exit code as fatal;
  - terminate with an explicit process exit code so redirected callers can capture success/failure without a pipeline masking native status;
  - run, in order: `npm ci`, all Node tests, both image-optimizer Python unittest modules, all source validators, `bundle _2.5.23_ install`, strict Jekyll build, exact built-site validation, WebP validation, `git diff --check`, and `git diff --cached --check`; Task 12 separately adds and runs the local-only PDF QA module;
  - contain no bare `python`, system temporary path, `git push`, merge, Pages deployment, GitHub-setting mutation, or literal `C:\` path;
  - print exactly `Full validation passed: tests, source data, Jekyll build, generated site, image budget, and diff checks are clean.` on success.

  In the same red phase, `tests/release-runtime-contract.test.mjs` must require `scripts/set-release-env.ps1 -RepositoryRoot <absolute-root>` to enable strict mode and terminating errors, accept only an explicit main/feature root inside `D:\Doctor\Code\CV`, require a pre-supplied non-empty `GH_TOKEN` without ever invoking `gh auth token`, redirect `HOME`, `USERPROFILE`, `APPDATA`, `LOCALAPPDATA`, `TEMP`, `TMP`, `TMPDIR`, `XDG_CACHE_HOME`, `GH_CONFIG_DIR`, a blank `GIT_CONFIG_GLOBAL`, and all other mutable paths below `<selected-root>/.local-tools/release`, set `GIT_CONFIG_NOSYSTEM=1`, the two exact main/feature process-only `safe.directory` values, D-local empty hooks, `commit.gpgsign=false`, `GH_PROMPT_DISABLED=1`, `GH_NO_UPDATE_NOTIFIER=1`, `GH_TELEMETRY=false`, `DO_NOT_TRACK=true`, `GCM_INTERACTIVE=Never`, and `GIT_TERMINAL_PROMPT=0`, contain no literal `C:\` or wildcard safe-directory trust, and make no network/tool call before redirection.

  `tests/gh-toolchain-contract.test.mjs` must require `scripts/setup-local-gh.ps1 -RepositoryRoot <absolute-root>` to dot-source the release loader first, accept only the exact main/feature roots, require telemetry disabled before any `gh` execution, and provision only official immutable GitHub CLI `2.94.0` for Windows x64 from `https://github.com/cli/cli/releases/download/v2.94.0/gh_2.94.0_windows_amd64.zip`. It downloads to a D-local `.partial` archive, verifies SHA-256 `c0766af54195dfa0bcd9a0cb63a45c313fbaffdebb9f736f666e9ba4be8c91e8` before atomic rename/extraction, rejects every other architecture/version/hash/path, confines archive/staging/binary paths below `<selected-root>/.local-tools/release`, verifies `gh version 2.94.0`, sets absolute `GH_EXE`, prepends only its D-local bin directory to `PATH`, and establishes explicit caller status. Cached use must re-verify the archive/binary/version; no MSI, package manager, global install, user-profile config, or `C:\` path is allowed. The script is implemented and statically tested in Task 11 but is first executed only inside separately authorized Task 14.

- [ ] **Step 2: Confirm the runner contract is red**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\full-validation-runner-contract.test.mjs tests\release-runtime-contract.test.mjs tests\gh-toolchain-contract.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Runner/release contracts unexpectedly passed before implementation." }
  ```

  Expected: FAIL with `ENOENT` for the runner, release loader, and D-local GitHub CLI setup script.

- [ ] **Step 3: Implement the checked D-only runner**

  Implement small helpers for checked native invocation and current-root path creation. Do not rely on environment variables from a previous shell or agent. The runner must establish the complete D-only environment itself before its first package/runtime command, then execute the equivalent of:

  ```powershell
  . .\scripts\set-local-env.ps1
  & .\scripts\setup-local-ruby.ps1
  if ($LASTEXITCODE -ne 0) { throw "Pinned D-local Ruby setup failed." }
  & .\scripts\setup-local-python.ps1
  if ($LASTEXITCODE -ne 0) { throw "Pinned D-local Python setup failed." }
  $repoRootText = git rev-parse --show-toplevel
  if ($LASTEXITCODE -ne 0 -or -not $repoRootText) { throw "Unable to resolve the current repository root." }
  $repoRoot = (Resolve-Path -LiteralPath $repoRootText.Trim()).Path
  $venvPython = Join-Path $repoRoot ".local-tools\python-venv\Scripts\python.exe"
  if (-not (Test-Path -LiteralPath $venvPython -PathType Leaf)) { throw "Pinned venv interpreter is missing: $venvPython" }
  npm.cmd ci --cache $env:npm_config_cache
  if ($LASTEXITCODE -ne 0) { throw "Locked Node dependency installation failed." }
  npm.cmd test
  if ($LASTEXITCODE -ne 0) { throw "Node test suite failed." }
  & $venvPython -m unittest tests.test_optimize_profile_image tests.test_optimize_profile_image_cli -v
  if ($LASTEXITCODE -ne 0) { throw "Image-optimizer Python tests failed." }
  npm.cmd run validate
  if ($LASTEXITCODE -ne 0) { throw "Source validation failed." }
  bundle _2.5.23_ install
  if ($LASTEXITCODE -ne 0) { throw "Locked Ruby dependency installation failed." }
  bundle _2.5.23_ exec jekyll build --strict_front_matter --trace --destination .test-output/site
  if ($LASTEXITCODE -ne 0) { throw "Strict Jekyll build failed." }
  npm.cmd run check:built
  if ($LASTEXITCODE -ne 0) { throw "Built-site validation failed." }
  & $venvPython scripts\optimize_profile_image.py --check images\yu-zhan-illustration.webp
  if ($LASTEXITCODE -ne 0) { throw "Optimized profile-image validation failed." }
  git diff --check
  if ($LASTEXITCODE -ne 0) { throw "Working-tree diff check failed." }
  git diff --cached --check
  if ($LASTEXITCODE -ne 0) { throw "Staged diff check failed." }
  ```

  Implement `scripts/set-release-env.ps1` separately from the validation runner with the explicit `-RepositoryRoot` parameter above. It performs only path/token validation, D-local directory/environment setup, and `Set-Location`; it never authenticates, fetches, pushes, calls `gh`, or changes Git/GitHub configuration. It is safe to dot-source from the reviewed feature worktree while targeting the main checkout before fast-forward integration.

  Implement `scripts/setup-local-gh.ps1` as the separate release-only, hash-verified installer described by the red contract. It must call the sibling release loader before download or tool execution, use only PowerShell download/hash/archive APIs after D-only redirection, keep partial extraction under `.local-tools/release`, and remove only path-validated partial/staging content on failure. Do not invoke it during Tasks 11-13.

- [ ] **Step 4: Run the focused runner contract green**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\full-validation-runner-contract.test.mjs tests\release-runtime-contract.test.mjs tests\gh-toolchain-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Runner/release contracts failed after implementation." }
  ```

  Expected: PASS before the runner is used as evidence.

- [ ] **Step 5: Write the failing validation-workflow contract**

  `tests/validate-workflow-contract.test.mjs` parses `.github/workflows/validate.yml` and requires:

  - triggers for pull requests, push to `master`, and manual dispatch;
  - top-level `permissions: { contents: read }`, one `ubuntu-latest` job, and a finite timeout;
  - `actions/checkout@v4` with credentials not persisted, `actions/setup-node@v4` using exact Node `22.14.0`/npm `10.9.2` plus npm cache, `ruby/setup-ruby@v1` using Ruby 3.2.11/Bundler 2.5.23 with Bundler cache, and `actions/setup-python@v5` using exact Python `3.10.9`;
  - exact `Pillow==12.1.1` binary-wheel installation, exact embedded libwebp `1.6.0` smoke check, `npm ci`, Node/Python tests, source validators, strict build to `.test-output/site`, built-site check, and image-budget check;
  - no Pages configuration/deployment action, write permission, commit, push, artifact containing private source, or invocation of the Windows D-only runner.

- [ ] **Step 6: Confirm the workflow contract is red**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\validate-workflow-contract.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Validation workflow contract unexpectedly passed before implementation." }
  ```

  Expected: FAIL with `ENOENT` for `.github/workflows/validate.yml`.

- [ ] **Step 7: Implement validation-only CI and document the one-command gate**

  Create one `validate` job that performs the same content/build checks natively on Linux. It validates only; classic Pages publishing stays separate. Update `README.md` so the canonical local command is:

  ```powershell
  . .\scripts\set-local-env.ps1
  & .\scripts\run-full-validation.ps1
  if ($LASTEXITCODE -ne 0) { throw "Documented full validation command failed." }
  ```

  State that CI never deploys, certificate images/IDs are prohibited, release remains an explicit human-gated action, and the locked D-local GitHub CLI setup is executed only after exact-SHA Task 14 approval.

- [ ] **Step 8: Run focused contracts and the fresh complete gate**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\full-validation-runner-contract.test.mjs tests\release-runtime-contract.test.mjs tests\gh-toolchain-contract.test.mjs tests\validate-workflow-contract.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Focused validation contracts failed." }
  & .\scripts\run-full-validation.ps1
  if ($LASTEXITCODE -ne 0) { throw "Fresh complete validation gate failed." }
  ```

  Expected: focused contracts pass and the runner prints its exact success line with the build under `.test-output/site`.

- [ ] **Step 9: Commit the complete validation gate**

  ```powershell
  . .\scripts\set-local-env.ps1
  git add scripts/run-full-validation.ps1 scripts/set-release-env.ps1 scripts/setup-local-gh.ps1 tests/full-validation-runner-contract.test.mjs tests/release-runtime-contract.test.mjs tests/gh-toolchain-contract.test.mjs .github/workflows/validate.yml tests/validate-workflow-contract.test.mjs README.md
  if ($LASTEXITCODE -ne 0) { throw "Unable to stage the validation gate." }
  git commit -m "ci: add complete academic site validation"
  if ($LASTEXITCODE -ne 0) { throw "Validation-gate commit failed." }
  ```

### Task 12: Run isolated responsive, keyboard, counterpart, and A4 browser QA

**Files:**
- Create: `scripts/setup-local-playwright.ps1`
- Create: `scripts/manage-local-qa-server.ps1`
- Create: `scripts/playwright/browser-qa-core.mjs`
- Create: `scripts/playwright/run-browser-qa.mjs`
- Create: `scripts/playwright/export-a4-cv.mjs`
- Create: `scripts/check_and_render_cv_pdf.py`
- Create: `requirements-pdf-tools.txt`
- Create: `tests/playwright-toolchain-contract.test.mjs`
- Create: `tests/browser-qa-validation.test.mjs`
- Create: `tests/test_check_and_render_cv_pdf.py`
- Create: `docs/qa/2026-07-13-browser-qa.md`
- Modify: `tests/dependency-contract.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify only after a reproduced defect: the closest SCSS/Liquid source and contract test

- [ ] **Step 1: Write the failing direct-Playwright isolation contract**

  `tests/playwright-toolchain-contract.test.mjs` must require:

  - exact `playwright: "1.58.0"` in development dependencies and no `@playwright/test`, terminal/agent CLI, daemon, global browser tool, or user-browser automation;
  - exact `PyMuPDF==1.28.0` plus official Windows x64 wheel SHA-256 `e01e90fd86abfeb37ceb921eddb951f988a11d45ff6ce6b7664f2039849068ec` in the separate local-QA-only `requirements-pdf-tools.txt`, while `requirements-tools.txt` remains exactly `Pillow==12.1.1`;
  - setup/server scripts dot-sourcing `scripts/set-local-env.ps1`, deriving the current worktree root from `$PSScriptRoot`, rejecting roots outside the D-drive CV workspace, and containing no literal `C:\` path;
  - every browser binary, automatically created temporary profile, home/appdata/cache, screenshot, accessibility snapshot, download, log, report, and PDF path below the current worktree's `.local-tools` or `.test-output/browser-qa`; only separately authorized Task 14 may use `.test-output/live-qa`;
  - `npx.cmd --no-install playwright install chromium` only for browser installation; no terminal/agent CLI browser command, daemon, Chrome/Edge channel, app-browser session, default Downloads, `launchPersistentContext`, `launchServer`, `connect`, `connectOverCDP`, `userDataDir`, or persistent profile;
  - argument/root/origin/output validation using Node built-ins before dynamically importing the locked `playwright` package; `chromium.launch({ headless: true })`, a fresh `browser.newContext({ serviceWorkers: "block", acceptDownloads: false })` for every case, and `try/finally` closure of page/context/browser on every path; `chromium.executablePath()` must resolve below the D-local `PLAYWRIGHT_BROWSERS_PATH`, and automatic browser temporary data is confined by the already redirected D-local `TEMP`/`TMP`;
  - canonical path guards before launch or navigation: `--mode smoke` writes only below local `.test-output/browser-qa`; `--mode local` accepts only `http://127.0.0.1:4000`; `--mode live` accepts only `https://dravencent.github.io` and only an output root below `.test-output/live-qa`;
  - `context.route()` plus request/response/requestfailed/console/pageerror listeners installed before first navigation, with blocked external requests de-duplicated from their expected aborted-request event, finite navigation/action timeouts, no remote active asset or redirect, and one atomically written JSON report;
  - local mode covers the exact 32 route/viewport cases and writes 32 full-page PNGs plus 32 body `locator.ariaSnapshot()` records and separate mobile-menu-open evidence; live mode audits all ten routes at both `390 x 844` and `1440 x 900` but writes only the three named smoke PNG/snapshot pairs. Its deterministic `summary` has exact keys/values `routeCount: 10`, `viewportCaseCount: 32` locally or `20` live, `networkAuditCaseCount: 32` locally or `20` live, `responsiveScreenshotCount: 32` locally or `3` live, `accessibilitySnapshotCount: 32` locally or `3` live, `counterpartPairCount: 5`, `publicationCount: 8`, `awardCount: 6`, `selectedPublicationCount: 4`, `boldPrimaryAuthorCount: 8`, `menuFindingCount: 0`, `overflowFindingCount: 0`, `privacyFindingCount: 0`, `keyboardFindingCount: 0`, `focusFindingCount: 0`, `networkFindingCount: 0`, `consoleFindingCount: 0`, `pageErrorFindingCount: 0`, `redirectFindingCount: 0`, `requiredResourceTypesPresent: true`, and `canonicalLinksValid: true`;
  - direct keyboard-only traversal via `page.keyboard.press`, recorded active element plus `:focus-visible`/outline/box-shadow evidence, bounded focus-trap detection, mobile menu closed/open artifacts, full-page screenshots, and `page.locator("body").ariaSnapshot()` without post-1.58 options—never a mouse command;
  - direct Chromium PDF export with explicit `format: "A4"`, `preferCSSPageSize: true`, `printBackground: true`, `displayHeaderFooter: false`, and two confined output paths below `.test-output/browser-qa/print`;
  - checked native exit codes, `process.exitCode = 1` on any Node finding, and PowerShell setup/server scripts that catch/report failure and establish explicit `0`/nonzero caller status; the server manager must start the D-local `.local-tools/ruby/bin/ruby.exe` directly (never a `bundle` BAT/shim or `cmd.exe`) with `-S bundle _2.5.23_ exec jekyll serve ...`, then cleanup stops only that recorded Ruby PID after start-time/root/command-line verification.

- [ ] **Step 2: Confirm the toolchain contract is red**

  ```powershell
  . .\scripts\set-local-env.ps1
  node --test tests\playwright-toolchain-contract.test.mjs
  $redExit = $LASTEXITCODE
  if ($redExit -eq 0) { throw "Playwright isolation contract unexpectedly passed before implementation." }
  ```

  Expected: FAIL because the package/scripts are absent.

- [ ] **Step 3: Implement and smoke-test the pinned direct Playwright library**

  Add the exact npm dependency and refresh `package-lock.json` with the D-local npm cache. `setup-local-playwright.ps1` dot-sources the shared environment, creates `.local-tools/playwright-browsers` and `.test-output/browser-qa/{logs,reports,accessibility,screenshots,print}`, calls `setup-local-python.ps1`, installs the hash-pinned `requirements-pdf-tools.txt` into the pinned D-local venv with `--only-binary=:all: --require-hashes`, and runs only `npx.cmd --no-install playwright install chromium` after `PLAYWRIGHT_BROWSERS_PATH` is set. PyMuPDF/MuPDF is a local QA tool only and is never copied into the published site.

  Before browser implementation, add `tests/browser-qa-validation.test.mjs` against exported pure functions in `browser-qa-core.mjs`. Observe red, then cover: root/output/origin/mode escape; 32 unique local and 20 unique live cases; unique screenshot/snapshot names; all expected document/stylesheet/image requests plus any font request actually emitted on the allowed origin; blocked external request and de-duplicated abort failure; 3xx redirect; non-2xx response; request failure; console/page error; missing route; wrong language/counterpart/menu link; horizontal overflow; wrong 8/6/4 count; missing bold author or canonical link; banned text; keyboard order/focus visibility/focus trap; exact local/live artifact counts; and exact clean report summaries. Do not require a font request because the approved site intentionally uses no external or bundled webfont.

  Implement `run-browser-qa.mjs` as a thin direct-execution layer over those pure functions. It validates every argument and output path before importing/launching Chromium, asserts the locked package version and executable path, installs all event/route hooks before first navigation, collects the exact DOM/keyboard/network matrices, writes screenshots/accessibility snapshots plus one report, and closes page/context/browser in `finally`. `export-a4-cv.mjs` uses the same guarded launch pattern, waits for `networkidle` and `document.fonts.ready`, emulates print media, and writes both A4 PDFs. `manage-local-qa-server.ps1` implements idempotent `Start`, `Status`, and `Stop`; `Start-Process -WindowStyle Hidden -PassThru` targets the exact D-local `.local-tools\ruby\bin\ruby.exe` with argument list `-S`, `bundle`, `_2.5.23_`, `exec`, `jekyll`, `serve`, and the checked serve flags. It never launches a `bundle`/`jekyll` BAT shim or `cmd.exe`. The manager stores the Ruby PID/start-time/root/normalized command metadata under `.test-output/browser-qa`, and `Status`/`Stop` verify all of them plus the live process executable and command line before stopping that exact Ruby process.

  Run this exact smoke sequence:

  ```powershell
  . .\scripts\set-local-env.ps1
  npm.cmd install --package-lock-only --cache $env:npm_config_cache
  if ($LASTEXITCODE -ne 0) { throw "Unable to refresh the Playwright lockfile." }
  npm.cmd ci --cache $env:npm_config_cache
  if ($LASTEXITCODE -ne 0) { throw "Unable to install the locked Node dependencies." }
  & .\scripts\setup-local-playwright.ps1
  if ($LASTEXITCODE -ne 0) { throw "D-local Playwright/PyMuPDF setup failed." }
  node --test tests\playwright-toolchain-contract.test.mjs tests\browser-qa-validation.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Direct Playwright contracts failed." }
  node .\scripts\playwright\run-browser-qa.mjs --mode smoke --output-root .test-output\browser-qa
  if ($LASTEXITCODE -ne 0) { throw "Direct Playwright smoke launch failed." }
  ```

  Expected: contracts pass; smoke evidence proves `playwright@1.58.0`, the bundled Chromium executable under the current worktree's `.local-tools/playwright-browsers`, a headless launch, fresh non-persistent context, `about:blank` page, and clean page/context/browser closure. No daemon, persistent profile, global browser, or terminal/agent CLI is created.

- [ ] **Step 4: Build the A4 dimension checker and renderer red-first**

  `tests/test_check_and_render_cv_pdf.py` uses only `.test-output/pdf-qa-tests/` (never `tempfile`) and creates fixtures through PyMuPDF. Cover a valid one- and two-page A4 PDF, Letter/landscape/rotated rejection, wrong CropBox rejection, empty or blank-trailing-page rejection, path escape rejection before opening, deterministic rendered filenames/pixel dimensions/manifest, and exact page count. First run through the pinned venv and expect `ModuleNotFoundError` for `scripts.check_and_render_cv_pdf`.

  Implement pure inspection plus a thin CLI in `scripts/check_and_render_cv_pdf.py`. Require PyMuPDF `1.28.0`; accept only a PDF and render directory under `.test-output`; require every MediaBox and CropBox to equal A4 (`595.276 x 841.890` points, portrait, tolerance at most `0.5` point, equivalent to `210 x 297 mm`) with rotation 0; require at least one page and non-empty extracted text per page; render RGB/no-alpha pages at 144 dpi to `<render-dir>/<pdf-stem>-page-001.png` etc.; verify pixels are within one pixel of `1191 x 1684`; write exact `<render-dir>/manifest.json` with boxes/page count/rendered names; remove partial output on failure; and print exactly `Verified A4 PDF: <n> pages at 210 x 297 mm; rendered <n> PNGs.`.

  ```powershell
  . .\scripts\set-local-env.ps1
  & .\.local-tools\python-venv\Scripts\python.exe -m unittest tests.test_check_and_render_cv_pdf -v
  if ($LASTEXITCODE -ne 0) { throw "A4 PDF checker/renderer unit tests failed after implementation." }
  ```

  Expected: red before implementation, then all focused cases pass with the pinned D-local PyMuPDF/MuPDF wheel; no external or system PDF renderer is used.

- [ ] **Step 5: Establish a clean server and QA baseline**

  Run the full validation runner, then use the checked server manager. It starts `.local-tools\ruby\bin\ruby.exe -S bundle _2.5.23_ exec jekyll serve --strict_front_matter --host 127.0.0.1 --port 4000 --destination .test-output/site --trace` directly in a hidden process, redirects stdout/stderr under `.test-output/browser-qa/logs`, writes verified Ruby PID/start-time/root/command metadata, and polls `/` for at most 30 seconds. It must never record a transient BAT/shim or `cmd.exe` PID.

  ```powershell
  . .\scripts\set-local-env.ps1
  & .\scripts\run-full-validation.ps1
  if ($LASTEXITCODE -ne 0) { throw "Fresh full validation failed before browser QA." }
  & .\scripts\manage-local-qa-server.ps1 -Action Start
  if ($LASTEXITCODE -ne 0) { throw "Unable to start the recorded local QA server." }
  & .\scripts\manage-local-qa-server.ps1 -Action Status
  if ($LASTEXITCODE -ne 0) { throw "Recorded local QA server status check failed." }
  $response = Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:4000/ -TimeoutSec 5
  if ($response.StatusCode -ne 200) { throw "Local QA server did not return 200." }
  ```

  Expected: the fresh full gate passes first and `http://127.0.0.1:4000/` returns 200.

- [ ] **Step 6: Generate the exact responsive, accessibility, and runtime matrix**

  Run the checked direct-library script once. For every case it must create a fresh non-persistent context, install network/console/page hooks before navigation, use locators plus direct DOM evaluation, close that case's page/context in `finally`, and write deterministic per-case screenshots, accessibility snapshots, keyboard evidence, and one report:

  ```powershell
  . .\scripts\set-local-env.ps1
  node .\scripts\playwright\run-browser-qa.mjs --mode local --origin http://127.0.0.1:4000 --output-root .test-output\browser-qa
  if ($LASTEXITCODE -ne 0) { throw "Direct local browser QA reported a finding." }
  $reportPath = ".test-output\browser-qa\reports\browser-qa.json"
  if (-not (Test-Path -LiteralPath $reportPath -PathType Leaf)) { throw "Local browser QA report is missing." }
  $browserReport = Get-Content -LiteralPath $reportPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ([int]$browserReport.summary.routeCount -ne 10 -or [int]$browserReport.summary.viewportCaseCount -ne 32) {
    throw "Local browser report does not contain the exact route/viewport matrix."
  }
  ```

  The exact matrix is all ten routes at `390 x 844` and `1440 x 900`, plus both-language home, Publications, and CV routes at `768 x 1024` and `1024 x 768` (32 cases total). At every case the script asserts `document.documentElement.scrollWidth <= window.innerWidth`, no clipped/overlapping title/citation/email, readable Chinese, correct illustration aspect ratio, no unexpected layout shift, and correct mobile/desktop navigation visibility. At 390 px it captures the mobile menu both closed and keyboard-open.

- [ ] **Step 7: Inspect keyboard, focus, counterpart, network, and visual evidence**

  Read the machine report and inspect the generated artifacts. The direct script must have used only `page.keyboard.press("Tab")`, `page.keyboard.press("Shift+Tab")`, and `page.keyboard.press("Enter")` for interaction; no mouse API is permitted.

  ```powershell
  . .\scripts\set-local-env.ps1
  $browserReport = Get-Content -LiteralPath .test-output\browser-qa\reports\browser-qa.json -Raw -Encoding UTF8 | ConvertFrom-Json
  $summary = $browserReport.summary
  $expected = [ordered]@{
    routeCount = 10
    viewportCaseCount = 32
    networkAuditCaseCount = 32
    responsiveScreenshotCount = 32
    accessibilitySnapshotCount = 32
    counterpartPairCount = 5
    publicationCount = 8
    awardCount = 6
    selectedPublicationCount = 4
    boldPrimaryAuthorCount = 8
    menuFindingCount = 0
    overflowFindingCount = 0
    privacyFindingCount = 0
    keyboardFindingCount = 0
    focusFindingCount = 0
    networkFindingCount = 0
    consoleFindingCount = 0
    pageErrorFindingCount = 0
    redirectFindingCount = 0
  }
  foreach ($name in $expected.Keys) {
    if ([int]$summary.$name -ne [int]$expected[$name]) { throw "Unexpected local browser QA summary field: $name" }
  }
  if (-not [bool]$summary.requiredResourceTypesPresent -or -not [bool]$summary.canonicalLinksValid) {
    throw "Local browser evidence is missing required resource or canonical-link proof."
  }
  ```

  Inspect all 32 full-page screenshots and accessibility snapshots, with special attention to the closed/open mobile menu, both-language home/Publications/CV pages at tablet widths, and every Chinese page. Require keyboard traversal of the skip link, mobile `<summary>`, every menu item, and language switch with visible focus and no trap; five exact counterpart pairs both ways; current-language menus only; exact 8/6/4 and bold-author/link/privacy invariants; successful document/CSS/image requests (and any font request actually emitted) on `http://127.0.0.1:4000`; and no external request, redirect, failed/non-2xx response, console error, or page error.

- [ ] **Step 8: Generate, machine-check, render, and visually inspect both A4 CV PDFs**

  Generate both PDFs through the tracked direct-library exporter; no terminal CLI, daemon, browser download, or default Downloads path is allowed:

  ```powershell
  . .\scripts\set-local-env.ps1
  node .\scripts\playwright\export-a4-cv.mjs --origin http://127.0.0.1:4000 --output-root .test-output\browser-qa\print
  if ($LASTEXITCODE -ne 0) { throw "Direct English/Chinese A4 PDF export failed." }
  & .\.local-tools\python-venv\Scripts\python.exe .\scripts\check_and_render_cv_pdf.py .test-output\browser-qa\print\cv-en.pdf .test-output\browser-qa\print\rendered\en
  if ($LASTEXITCODE -ne 0) { throw "English A4 PDF validation/rendering failed." }
  & .\.local-tools\python-venv\Scripts\python.exe .\scripts\check_and_render_cv_pdf.py .test-output\browser-qa\print\cv-zh.pdf .test-output\browser-qa\print\rendered\zh
  if ($LASTEXITCODE -ne 0) { throw "Chinese A4 PDF validation/rendering failed." }
  ```

  Expected: both checker calls prove every MediaBox/CropBox is 210 x 297 mm and render every page through pinned PyMuPDF at 144 dpi. Inspect every resulting PNG with the PDF visual workflow. Require usable margins, hidden navigation/footer/illustration, legible text and URLs, no stranded heading, avoidable split, clipping, overlap, black-square glyph, or blank trailing page. Visually compare `images/My.png` and the generated WebP at useful zoom and record whether compression introduces any visible defect.

- [ ] **Step 9: Record evidence and close every browser/print defect red-first**

  `docs/qa/2026-07-13-browser-qa.md` records the tested pre-commit working-tree state and pending path set, exact route/viewport matrix, screenshot/accessibility paths, keyboard results, five counterpart pairs, the machine-checked `browser-qa.json` path/summary, both PDF/page counts, illustration comparison, and pass/fail conclusion. It must not falsely label the previous HEAD as the tested state. Reference ignored artifacts and the post-commit binding required by Step 11; do not commit screenshots, accessibility snapshots, temporary profiles, browser binaries, logs, JSON runtime evidence, or PDFs.

  For each defect: add the closest failing contract, observe red, make the smallest SCSS/Liquid fix, rerun green, and repeat the affected browser/PDF inspection.

- [ ] **Step 10: Run the fresh post-QA gate, cleanly stop the server, and commit**

  ```powershell
  . .\scripts\set-local-env.ps1
  $primaryFailure = $null
  $cleanupFailure = $null
  try {
    & .\scripts\manage-local-qa-server.ps1 -Action Stop
    if ($LASTEXITCODE -ne 0) { throw "Unable to establish a stopped-server baseline." }
    & .\.local-tools\python-venv\Scripts\python.exe -m unittest tests.test_check_and_render_cv_pdf -v
    if ($LASTEXITCODE -ne 0) { throw "Pre-gate PDF QA unit tests failed." }
    & .\scripts\run-full-validation.ps1
    if ($LASTEXITCODE -ne 0) { throw "Full validation failed." }
    & .\scripts\manage-local-qa-server.ps1 -Action Start
    if ($LASTEXITCODE -ne 0) { throw "Unable to start the fresh post-gate QA server." }
    node .\scripts\playwright\run-browser-qa.mjs --mode local --origin http://127.0.0.1:4000 --output-root .test-output\browser-qa
    if ($LASTEXITCODE -ne 0) { throw "Fresh post-gate browser QA failed." }
    node .\scripts\playwright\export-a4-cv.mjs --origin http://127.0.0.1:4000 --output-root .test-output\browser-qa\print
    if ($LASTEXITCODE -ne 0) { throw "Fresh post-gate PDF export failed." }
    & .\.local-tools\python-venv\Scripts\python.exe .\scripts\check_and_render_cv_pdf.py .test-output\browser-qa\print\cv-en.pdf .test-output\browser-qa\print\rendered\en
    if ($LASTEXITCODE -ne 0) { throw "Fresh English PDF validation failed." }
    & .\.local-tools\python-venv\Scripts\python.exe .\scripts\check_and_render_cv_pdf.py .test-output\browser-qa\print\cv-zh.pdf .test-output\browser-qa\print\rendered\zh
    if ($LASTEXITCODE -ne 0) { throw "Fresh Chinese PDF validation failed." }
    git diff --check
    if ($LASTEXITCODE -ne 0) { throw "Working-tree diff check failed." }
    foreach ($probe in @(".local-tools/probe", ".test-output/probe")) {
      git check-ignore --quiet --no-index -- $probe
      if ($LASTEXITCODE -ne 0) { throw "Local output is not ignored: $probe" }
    }
    $qaStatus = @(git status --short --untracked-files=all)
    if ($LASTEXITCODE -ne 0) { throw "Unable to inspect the post-QA worktree." }
    $qaStatus
  }
  catch {
    $primaryFailure = $_
  }
  finally {
    try {
      & .\scripts\manage-local-qa-server.ps1 -Action Stop *> $null
      if ($LASTEXITCODE -ne 0) { throw "Recorded Jekyll server cleanup failed." }
    }
    catch {
      $cleanupFailure = $_
    }
  }
  if ($primaryFailure -and $cleanupFailure) { throw "$($primaryFailure.Exception.Message) Cleanup also failed: $($cleanupFailure.Exception.Message)" }
  if ($primaryFailure) { throw $primaryFailure }
  if ($cleanupFailure) { throw $cleanupFailure }
  ```

  Expected: the complete gate passes; every direct browser process closes itself in `finally`; all browser artifacts are ignored; and only the QA report, toolchain files, manifests, and any intentional regression fix/test are pending. If any earlier QA command fails, run the checked server stop immediately before leaving the task; never use `kill-all` or process-name-wide termination.

  ```powershell
  . .\scripts\set-local-env.ps1
  git add scripts/setup-local-playwright.ps1 scripts/manage-local-qa-server.ps1 scripts/playwright/browser-qa-core.mjs scripts/playwright/run-browser-qa.mjs scripts/playwright/export-a4-cv.mjs scripts/check_and_render_cv_pdf.py requirements-pdf-tools.txt tests/playwright-toolchain-contract.test.mjs tests/browser-qa-validation.test.mjs tests/test_check_and_render_cv_pdf.py docs/qa/2026-07-13-browser-qa.md tests/dependency-contract.test.mjs package.json package-lock.json
  if ($LASTEXITCODE -ne 0) { throw "Unable to stage direct browser QA files." }
  git add _sass/layout/_academic-cv.scss _includes/masthead.html _includes/language-switch.html
  if ($LASTEXITCODE -ne 0) { throw "Unable to stage conditional browser-QA fixes." }
  git diff --cached --check
  if ($LASTEXITCODE -ne 0) { throw "Staged QA diff check failed." }
  git commit -m "test: verify responsive and print CV presentation"
  if ($LASTEXITCODE -ne 0) { throw "QA commit failed." }
  ```

  Omit every unchanged conditional path from staging. If a reproduced defect added or changed a regression test outside the explicitly named QA tests, append only that exact test file path to the first `git add`; never stage the broad `tests` directory.

- [ ] **Step 11: Bind a clean committed HEAD to fresh browser/PDF evidence**

  Remove any stale binding, require a clean worktree, rerun the complete machine/browser/PDF gate at the new commit, then write the ignored binding only after every check and cleanup succeeds:

  ```powershell
  . .\scripts\set-local-env.ps1
  $qaBinding = ".test-output\browser-qa\reports\verified-head.txt"
  Remove-Item -LiteralPath $qaBinding -Force -ErrorAction SilentlyContinue
  $verifiedHeadText = git rev-parse HEAD
  if ($LASTEXITCODE -ne 0 -or -not $verifiedHeadText) { throw "Unable to resolve the post-commit QA HEAD." }
  $verifiedHead = $verifiedHeadText.Trim()
  $preBindingStatus = @(git status --porcelain=v1 --untracked-files=all)
  if ($LASTEXITCODE -ne 0 -or $preBindingStatus.Count -ne 0) { throw "Post-commit QA worktree is not clean." }
  $primaryFailure = $null
  $cleanupFailure = $null
  try {
    & .\scripts\manage-local-qa-server.ps1 -Action Stop
    if ($LASTEXITCODE -ne 0) { throw "Unable to establish a stopped-server binding baseline." }
    & .\scripts\run-full-validation.ps1
    if ($LASTEXITCODE -ne 0) { throw "Post-commit full validation failed." }
    & .\scripts\manage-local-qa-server.ps1 -Action Start
    if ($LASTEXITCODE -ne 0) { throw "Unable to start the post-commit binding server." }
    node .\scripts\playwright\run-browser-qa.mjs --mode local --origin http://127.0.0.1:4000 --output-root .test-output\browser-qa
    if ($LASTEXITCODE -ne 0) { throw "Post-commit browser QA failed." }
    node .\scripts\playwright\export-a4-cv.mjs --origin http://127.0.0.1:4000 --output-root .test-output\browser-qa\print
    if ($LASTEXITCODE -ne 0) { throw "Post-commit PDF export failed." }
    & .\.local-tools\python-venv\Scripts\python.exe .\scripts\check_and_render_cv_pdf.py .test-output\browser-qa\print\cv-en.pdf .test-output\browser-qa\print\rendered\en
    if ($LASTEXITCODE -ne 0) { throw "Post-commit English PDF validation failed." }
    & .\.local-tools\python-venv\Scripts\python.exe .\scripts\check_and_render_cv_pdf.py .test-output\browser-qa\print\cv-zh.pdf .test-output\browser-qa\print\rendered\zh
    if ($LASTEXITCODE -ne 0) { throw "Post-commit Chinese PDF validation failed." }
  }
  catch {
    $primaryFailure = $_
  }
  finally {
    try {
      & .\scripts\manage-local-qa-server.ps1 -Action Stop *> $null
      if ($LASTEXITCODE -ne 0) { throw "Post-commit binding server cleanup failed." }
    }
    catch {
      $cleanupFailure = $_
    }
  }
  if ($primaryFailure -and $cleanupFailure) { throw "$($primaryFailure.Exception.Message) Cleanup also failed: $($cleanupFailure.Exception.Message)" }
  if ($primaryFailure) { throw $primaryFailure }
  if ($cleanupFailure) { throw $cleanupFailure }
  $postBindingHeadText = git rev-parse HEAD
  if ($LASTEXITCODE -ne 0 -or -not $postBindingHeadText -or $postBindingHeadText.Trim() -ne $verifiedHead) { throw "HEAD changed during post-commit QA." }
  $postBindingStatus = @(git status --porcelain=v1 --untracked-files=all)
  if ($LASTEXITCODE -ne 0 -or $postBindingStatus.Count -ne 0) { throw "Post-commit QA introduced tracked changes." }
  [IO.File]::WriteAllText($qaBinding, "$verifiedHead`n", [Text.UTF8Encoding]::new($false))
  ```

  Expected: `verified-head.txt` contains the exact clean Task 12 commit and the adjacent ignored browser report/PDF manifests were generated from that same HEAD. Task 13 rejects a missing or mismatched binding.

### Task 13: Complete the local release preflight and stop for user confirmation

**Files:**
- No planned tracked file changes.
- Write command evidence only below `.test-output/release-preflight/`.

- [ ] **Step 1: Run the final fresh local quality gate**

  Run from `feature/bilingual-academic-cv` and capture without piping through another command, preserving the runner's native exit code:

  ```powershell
  . .\scripts\set-local-env.ps1
  $preflightHeadText = git rev-parse HEAD
  if ($LASTEXITCODE -ne 0 -or -not $preflightHeadText) { throw "Unable to resolve preflight HEAD." }
  $preflightHead = $preflightHeadText.Trim()
  $qaBinding = ".test-output\browser-qa\reports\verified-head.txt"
  if (-not (Test-Path -LiteralPath $qaBinding -PathType Leaf)) { throw "Committed browser/PDF QA binding is missing." }
  $qaHead = (Get-Content -LiteralPath $qaBinding -Raw -Encoding UTF8).Trim()
  if ($qaHead -notmatch "^[0-9a-f]{40}$" -or $qaHead -ne $preflightHead) { throw "Browser/PDF QA evidence is not bound to preflight HEAD." }
  foreach ($evidence in @(
    ".test-output\browser-qa\reports\browser-qa.json",
    ".test-output\browser-qa\print\cv-en.pdf",
    ".test-output\browser-qa\print\cv-zh.pdf",
    ".test-output\browser-qa\print\rendered\en\manifest.json",
    ".test-output\browser-qa\print\rendered\zh\manifest.json"
  )) {
    if (-not (Test-Path -LiteralPath $evidence -PathType Leaf)) { throw "Bound browser/PDF QA evidence is missing: $evidence" }
  }
  New-Item -ItemType Directory -Force .test-output\release-preflight | Out-Null
  $validationLog = ".test-output\release-preflight\full-validation.log"
  & .\scripts\run-full-validation.ps1 *> $validationLog
  $validationExit = $LASTEXITCODE
  Get-Content -LiteralPath $validationLog -Encoding UTF8
  if ($validationExit -ne 0) { throw "Full validation failed with exit code $validationExit." }
  ```

  Expected: exact success line from the final committed feature state.

- [ ] **Step 2: Audit Git, privacy, ignored outputs, and commit traceability**

  ```powershell
  . .\scripts\set-local-env.ps1
  $expectedRoot = (Resolve-Path -LiteralPath D:\Doctor\Code\CV\.worktrees\bilingual-academic-cv).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
  $topText = git rev-parse --show-toplevel
  if ($LASTEXITCODE -ne 0 -or -not $topText) { throw "Unable to read worktree root." }
  $actualRoot = (Resolve-Path -LiteralPath $topText.Trim()).Path.TrimEnd([IO.Path]::DirectorySeparatorChar)
  if ($actualRoot -ne $expectedRoot) { throw "Unexpected feature worktree root: $actualRoot" }
  $branchText = git branch --show-current
  if ($LASTEXITCODE -ne 0 -or -not $branchText -or $branchText.Trim() -ne "feature/bilingual-academic-cv") { throw "Unexpected feature branch." }
  $originText = git remote get-url origin
  if ($LASTEXITCODE -ne 0 -or -not $originText -or $originText.Trim() -ne "https://github.com/Dravencent/Dravencent.github.io.git") { throw "Unexpected origin." }
  $pushUrls = @(git remote get-url --push --all origin)
  if ($LASTEXITCODE -ne 0 -or $pushUrls.Count -ne 1 -or $pushUrls[0].Trim() -ne "https://github.com/Dravencent/Dravencent.github.io.git") { throw "Origin does not have exactly one approved push URL." }
  $porcelain = @(git status --porcelain=v1 --untracked-files=all)
  if ($LASTEXITCODE -ne 0) { throw "Unable to read worktree status." }
  if ($porcelain.Count -ne 0) { $porcelain; throw "Feature worktree is not clean." }
  git diff --exit-code --check
  if ($LASTEXITCODE -ne 0) { throw "Working-tree diff check failed." }
  git diff --cached --exit-code --check
  if ($LASTEXITCODE -ne 0) { throw "Index diff check failed." }
  $trace = @(git log --oneline --decorate origin/master..HEAD)
  if ($LASTEXITCODE -ne 0 -or $trace.Count -eq 0) { throw "Commit trace is unavailable." }
  $trace
  $tracked = @(git ls-files --stage)
  if ($LASTEXITCODE -ne 0 -or $tracked.Count -eq 0) { throw "Tracked-file audit failed." }
  foreach ($probe in @(".local-tools/probe", ".test-output/probe", ".worktrees/probe", "_site/probe")) {
    git check-ignore --quiet --no-index -- $probe
    if ($LASTEXITCODE -ne 0) { throw "Local output is not ignored: $probe" }
  }
  npm.cmd run validate:source
  if ($LASTEXITCODE -ne 0) { throw "Source hygiene validation failed." }
  npm.cmd run check:built
  if ($LASTEXITCODE -ne 0) { throw "Built-site validation failed." }
  $privacyMatches = git grep -n -I -E "[0-9]{5,}@qq\.com|certificate[ _-]?(number|no\.?)[[:space:]]*[:#]?[[:space:]]*[A-Za-z0-9-]{4,}|证书编号[：: ]*[A-Za-z0-9-]{4,}" -- . 2>$null
  $privacyExit = $LASTEXITCODE
  if ($privacyExit -eq 0) { $privacyMatches; throw "Private or corrupt tracked text detected." }
  if ($privacyExit -ne 1) { throw "git grep failed with exit code $privacyExit." }
  ```

  This block is fail-closed: exact root/branch/fetch URL, exactly one approved push URL, empty porcelain status, each native exit code, a non-empty commit trace/tracked index, each of four ignore probes, and both source/generated validators must pass. The staged-path/source-hygiene contracts—not policy-word grep—prove zero tracked/local public artifact containing QQ, certificate/QR/signature material, `.local-tools`, `.test-output`, `.worktrees`, `_site`, `files/`, or browser output.

- [ ] **Step 3: Dispatch final whole-implementation review and close findings**

  Run a fresh spec-compliance review followed by a code-quality review over the complete feature-branch diff. Any Critical/Important or spec gap returns to the responsible implementer with a regression test and re-review. After the last fix commit, rerun Task 12 Step 11 to bind fresh browser/PDF evidence to the new HEAD, then rerun Steps 1-2.

- [ ] **Step 4: Stop without integrating, pushing, or changing Pages**

  Audit every unpublished commit's author and committer name/email identity without printing the names or addresses. Only a metadata-clean, fully reviewed SHA gets a release marker:

  ```powershell
  . .\scripts\set-local-env.ps1
  $featureRootText = git rev-parse --show-toplevel
  if ($LASTEXITCODE -ne 0 -or -not $featureRootText) { throw "Unable to resolve the feature worktree root for release evidence." }
  $releaseEvidence = Join-Path $featureRootText.Trim() ".test-output\release-preflight"
  New-Item -ItemType Directory -Force $releaseEvidence | Out-Null
  $reviewedMarker = Join-Path $releaseEvidence "reviewed-feature-sha.txt"
  $metadataEvidence = Join-Path $releaseEvidence "non-noreply-metadata-commit-shas.txt"
  Remove-Item -LiteralPath $reviewedMarker,$metadataEvidence -Force -ErrorAction SilentlyContinue
  $reviewedShaText = git rev-parse HEAD
  if ($LASTEXITCODE -ne 0 -or -not $reviewedShaText) { throw "Unable to resolve reviewed feature SHA." }
  $reviewedSha = $reviewedShaText.Trim()
  $metadataRows = @(git log --format="%H%x09%an%x09%ae%x09%cn%x09%ce" origin/master..HEAD)
  if ($LASTEXITCODE -ne 0 -or $metadataRows.Count -eq 0) { throw "Unable to audit unpublished commit metadata." }
  $invalidMetadataShas = @(
    foreach ($row in $metadataRows) {
      $fields = $row -split "`t"
      if ($fields.Count -ne 5) { throw "Malformed commit metadata row." }
      if ($fields[1] -cne "Dravencent" -or $fields[2] -cne "Dravencent@users.noreply.github.com" -or $fields[3] -cne "Dravencent" -or $fields[4] -cne "Dravencent@users.noreply.github.com") { $fields[0] }
    }
  )
  if ($invalidMetadataShas.Count -gt 0) {
    [IO.File]::WriteAllLines($metadataEvidence, $invalidMetadataShas, [Text.UTF8Encoding]::new($false))
    throw "Release blocked: unpublished commit author/committer metadata is not the exact approved GitHub noreply identity. SHA-only evidence was recorded; history rewrite requires separate explicit authorization."
  }
  [IO.File]::WriteAllText($reviewedMarker, "$reviewedSha`n", [Text.UTF8Encoding]::new($false))
  ```

  Report the feature branch, reviewed HEAD, validation evidence, browser/PDF QA conclusion, and remaining release actions. With the current history, the expected outcome is the known `20e0ff2` metadata blocker and no `reviewed-feature-sha.txt`; report it without exposing the name/address values. Every unpublished commit must have exact author and committer identity `Dravencent <Dravencent@users.noreply.github.com>`. Do not merge to `master`, push any ref, modify GitHub Pages settings, or start Task 14. Even after a future metadata-clean rerun, Task 14 still requires the user to explicitly approve that exact reviewed SHA.

### Task 14: Integrate, publish, and audit GitHub Pages only after explicit user approval

**Authorization gate:** This entire task is forbidden during the current local-only implementation. Execute it only when Task 13 produced `.test-output/release-preflight/reviewed-feature-sha.txt` with no metadata blocker and the user explicitly approves integrating and publishing that exact SHA. A generic “publish” approval or approval of a different SHA is insufficient.

**Release-runtime placement:** Before fast-forward integration, the main checkout still has its old ignore rules, so no release command may create `D:\Doctor\Code\CV\.local-tools`. Every Task 14 fresh shell therefore stores `HOME`, Git/GitHub CLI state, the pinned `gh.exe`, caches, and temp files under the reviewed feature worktree's already ignored `.local-tools/release`, then explicitly returns to the main checkout for main-branch Git operations. Later steps reuse that same feature-worktree runtime even after integration; live/browser outputs alone go to the now-ignored main-checkout `.test-output`/`.local-tools` locations required by their own checked setup scripts.

**Files:**
- No planned tracked file changes.
- Any live defect must be fixed on the feature branch with a failing regression test and a new reviewed commit before release is retried.

- [ ] **Step 1: Verify remote and Pages state read-only**

  The release operator must supply `GH_TOKEN` in the process environment; never discover or copy it from a user-profile file. Before any `git`/`gh` command, establish the complete D-only release environment, bind the marker SHA, then use only GET/read commands:

  ```powershell
  $ErrorActionPreference = "Stop"
  Set-StrictMode -Version Latest
  $repoRoot = (Resolve-Path -LiteralPath D:\Doctor\Code\CV).Path
  $featureRoot = (Resolve-Path -LiteralPath D:\Doctor\Code\CV\.worktrees\bilingual-academic-cv).Path
  Set-Location -LiteralPath $repoRoot
  if ([string]::IsNullOrWhiteSpace($env:GH_TOKEN)) { throw "A pre-supplied GH_TOKEN is required; do not read credentials from the user profile." }
  # Before integration, keep release tooling under the already ignored reviewed feature worktree.
  $releaseRuntime = Join-Path $featureRoot ".local-tools\release"
  @("tmp", "home", "appdata", "localappdata", "cache", "gh-config", "empty-git-hooks") | ForEach-Object { New-Item -ItemType Directory -Force (Join-Path $releaseRuntime $_) | Out-Null }
  $env:HOME = Join-Path $releaseRuntime "home"
  $env:USERPROFILE = $env:HOME
  $env:APPDATA = Join-Path $releaseRuntime "appdata"
  $env:LOCALAPPDATA = Join-Path $releaseRuntime "localappdata"
  $env:TEMP = Join-Path $releaseRuntime "tmp"
  $env:TMP = $env:TEMP
  $env:TMPDIR = $env:TEMP
  $env:XDG_CACHE_HOME = Join-Path $releaseRuntime "cache"
  $env:GH_CONFIG_DIR = Join-Path $releaseRuntime "gh-config"
  $env:GIT_CONFIG_GLOBAL = Join-Path $releaseRuntime "gitconfig"
  $env:GIT_CONFIG_NOSYSTEM = "1"
  $env:GIT_CONFIG_COUNT = "4"
  $env:GIT_CONFIG_KEY_0 = "safe.directory"
  $env:GIT_CONFIG_VALUE_0 = $repoRoot.Replace('\', '/')
  $env:GIT_CONFIG_KEY_1 = "safe.directory"
  $env:GIT_CONFIG_VALUE_1 = $featureRoot.Replace('\', '/')
  $env:GIT_CONFIG_KEY_2 = "core.hooksPath"
  $env:GIT_CONFIG_VALUE_2 = Join-Path $releaseRuntime "empty-git-hooks"
  $env:GIT_CONFIG_KEY_3 = "commit.gpgsign"
  $env:GIT_CONFIG_VALUE_3 = "false"
  $env:GH_PROMPT_DISABLED = "1"
  $env:GH_NO_UPDATE_NOTIFIER = "1"
  $env:GH_TELEMETRY = "false"
  $env:DO_NOT_TRACK = "true"
  $env:GCM_INTERACTIVE = "Never"
  $env:GIT_TERMINAL_PROMPT = "0"
  $marker = Join-Path $featureRoot ".test-output\release-preflight\reviewed-feature-sha.txt"
  if (-not (Test-Path -LiteralPath $marker -PathType Leaf)) { throw "Reviewed SHA marker is missing." }
  $approvedSha = (Get-Content -LiteralPath $marker -Raw -Encoding UTF8).Trim()
  if ($approvedSha -notmatch "^[0-9a-f]{40}$") { throw "Reviewed SHA marker is invalid." }
  $originText = git remote get-url origin
  if ($LASTEXITCODE -ne 0 -or -not $originText -or $originText.Trim() -ne "https://github.com/Dravencent/Dravencent.github.io.git") { throw "Unexpected origin." }
  $pushUrls = @(git remote get-url --push --all origin)
  if ($LASTEXITCODE -ne 0 -or $pushUrls.Count -ne 1 -or $pushUrls[0].Trim() -ne "https://github.com/Dravencent/Dravencent.github.io.git") { throw "Origin does not have exactly one approved push URL." }
  $branchText = git branch --show-current
  if ($LASTEXITCODE -ne 0 -or -not $branchText -or $branchText.Trim() -ne "master") { throw "Main checkout is not on master." }
  $mainStatus = @(git status --porcelain=v1 --untracked-files=all)
  if ($LASTEXITCODE -ne 0 -or $mainStatus.Count -ne 0) { throw "Main checkout is not clean." }
  $featureText = git -C $featureRoot rev-parse HEAD
  if ($LASTEXITCODE -ne 0 -or -not $featureText -or $featureText.Trim() -ne $approvedSha) { throw "Feature branch moved after review." }
  $featureStatus = @(git -C $featureRoot status --porcelain=v1 --untracked-files=all)
  if ($LASTEXITCODE -ne 0 -or $featureStatus.Count -ne 0) { throw "Reviewed feature worktree is not clean." }
  $ghSetup = Join-Path $featureRoot "scripts\setup-local-gh.ps1"
  if (-not (Test-Path -LiteralPath $ghSetup -PathType Leaf)) { throw "Reviewed D-local GitHub CLI setup script is missing." }
  & $ghSetup -RepositoryRoot $featureRoot
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($env:GH_EXE) -or -not (Test-Path -LiteralPath $env:GH_EXE -PathType Leaf)) { throw "Pinned D-local GitHub CLI setup failed." }
  Set-Location -LiteralPath $repoRoot
  $pagesJson = & $env:GH_EXE api -H "Accept: application/vnd.github+json" repos/Dravencent/Dravencent.github.io/pages
  $pagesExit = $LASTEXITCODE
  if ($pagesExit -ne 0) { throw "Unable to read Pages configuration." }
  $pages = $pagesJson | ConvertFrom-Json
  if ($pages.build_type -ne "legacy" -or $pages.source.branch -ne "master" -or $pages.source.path -ne "/") { throw "Pages source is not classic master /(root)." }
  ```

  Do not invoke any mutating Pages endpoint, click Save, or change Pages, workflow, permissions, branch, or folder. If state differs or cannot be verified, stop and ask the user.

- [ ] **Step 2: Fetch safely and require a fast-forwardable release**

  Start from a fresh shell, load the reviewed feature branch's release loader before any `git`/`gh` command, bind the approved marker again, then fetch and prove the exact ancestry relationship:

  ```powershell
  $repoRoot = "D:\Doctor\Code\CV"
  $featureRoot = "D:\Doctor\Code\CV\.worktrees\bilingual-academic-cv"
  $loader = Join-Path $featureRoot "scripts\set-release-env.ps1"
  if (-not (Test-Path -LiteralPath $loader -PathType Leaf)) { throw "Reviewed release loader is missing." }
  . $loader -RepositoryRoot $featureRoot
  Set-Location -LiteralPath $repoRoot
  $marker = Join-Path $featureRoot ".test-output\release-preflight\reviewed-feature-sha.txt"
  if (-not (Test-Path -LiteralPath $marker -PathType Leaf)) { throw "Reviewed SHA marker is missing." }
  $approvedSha = (Get-Content -LiteralPath $marker -Raw -Encoding UTF8).Trim()
  if ($approvedSha -notmatch "^[0-9a-f]{40}$") { throw "Reviewed SHA marker is invalid." }
  $originText = git remote get-url origin
  if ($LASTEXITCODE -ne 0 -or -not $originText -or $originText.Trim() -ne "https://github.com/Dravencent/Dravencent.github.io.git") { throw "Unexpected origin." }
  $pushUrls = @(git remote get-url --push --all origin)
  if ($LASTEXITCODE -ne 0 -or $pushUrls.Count -ne 1 -or $pushUrls[0].Trim() -ne "https://github.com/Dravencent/Dravencent.github.io.git") { throw "Origin does not have exactly one approved push URL." }
  $featureHeadText = git -C $featureRoot rev-parse HEAD
  if ($LASTEXITCODE -ne 0 -or -not $featureHeadText -or $featureHeadText.Trim() -ne $approvedSha) { throw "Feature worktree moved after review." }
  $featureRefText = git rev-parse feature/bilingual-academic-cv
  if ($LASTEXITCODE -ne 0 -or -not $featureRefText -or $featureRefText.Trim() -ne $approvedSha) { throw "Feature branch ref differs from the approved SHA." }
  $featureStatus = @(git -C $featureRoot status --porcelain=v1 --untracked-files=all)
  if ($LASTEXITCODE -ne 0 -or $featureStatus.Count -ne 0) { throw "Reviewed feature worktree is not clean." }
  $ghSetup = Join-Path $featureRoot "scripts\setup-local-gh.ps1"
  if (-not (Test-Path -LiteralPath $ghSetup -PathType Leaf)) { throw "Reviewed D-local GitHub CLI setup script is missing." }
  & $ghSetup -RepositoryRoot $featureRoot
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($env:GH_EXE) -or -not (Test-Path -LiteralPath $env:GH_EXE -PathType Leaf)) { throw "Pinned D-local GitHub CLI setup failed." }
  Set-Location -LiteralPath $repoRoot
  $ghCredentialHelper = "!$($env:GH_EXE.Replace('\', '/')) auth git-credential"
  git -c "credential.helper=" -c "credential.helper=$ghCredentialHelper" fetch --no-tags origin master
  if ($LASTEXITCODE -ne 0) { throw "Fetch failed." }
  $originShaText = git rev-parse origin/master
  if ($LASTEXITCODE -ne 0 -or -not $originShaText) { throw "Unable to resolve fetched origin/master." }
  $originSha = $originShaText.Trim()
  $masterShaText = git rev-parse master
  if ($LASTEXITCODE -ne 0 -or -not $masterShaText) { throw "Unable to resolve local master." }
  $masterSha = $masterShaText.Trim()
  $featureShaText = git rev-parse feature/bilingual-academic-cv
  if ($LASTEXITCODE -ne 0 -or -not $featureShaText -or $featureShaText.Trim() -ne $approvedSha) { throw "Feature branch changed during fetch." }
  git merge-base --is-ancestor $originSha $masterSha
  if ($LASTEXITCODE -ne 0) { throw "Local master does not contain fetched origin/master; stop for divergence review." }
  git merge-base --is-ancestor $masterSha $approvedSha
  if ($LASTEXITCODE -ne 0) { throw "Feature branch is not a fast-forward descendant of local master." }
  git log --oneline --decorate --graph --boundary origin/master..$approvedSha
  if ($LASTEXITCODE -ne 0) { throw "Unable to display the approved release trace." }
  ```

  Any failed ancestry check stops the release; do not merge, rebase, reset, or force-push without a new user decision.

- [ ] **Step 3: Fast-forward local master and rerun the entire gate**

  In another fresh shell, reload the D-only environment and approved SHA. With the user's exact-SHA approval, use only this explicit integration:

  ```powershell
  $repoRoot = "D:\Doctor\Code\CV"
  $featureRoot = "D:\Doctor\Code\CV\.worktrees\bilingual-academic-cv"
  $loader = Join-Path $featureRoot "scripts\set-release-env.ps1"
  if (-not (Test-Path -LiteralPath $loader -PathType Leaf)) { throw "Reviewed release loader is missing." }
  . $loader -RepositoryRoot $featureRoot
  Set-Location -LiteralPath $repoRoot
  $marker = Join-Path $featureRoot ".test-output\release-preflight\reviewed-feature-sha.txt"
  if (-not (Test-Path -LiteralPath $marker -PathType Leaf)) { throw "Reviewed SHA marker is missing." }
  $approvedSha = (Get-Content -LiteralPath $marker -Raw -Encoding UTF8).Trim()
  if ($approvedSha -notmatch "^[0-9a-f]{40}$") { throw "Reviewed SHA marker is invalid." }
  $originText = git remote get-url origin
  if ($LASTEXITCODE -ne 0 -or -not $originText -or $originText.Trim() -ne "https://github.com/Dravencent/Dravencent.github.io.git") { throw "Unexpected origin." }
  $branchText = git branch --show-current
  if ($LASTEXITCODE -ne 0 -or -not $branchText -or $branchText.Trim() -ne "master") { throw "Main checkout is not on master." }
  $preMergeStatus = @(git status --porcelain=v1 --untracked-files=all)
  if ($LASTEXITCODE -ne 0 -or $preMergeStatus.Count -ne 0) { throw "Main checkout is not clean before integration." }
  $featureHeadText = git -C $featureRoot rev-parse HEAD
  if ($LASTEXITCODE -ne 0 -or -not $featureHeadText -or $featureHeadText.Trim() -ne $approvedSha) { throw "Feature worktree moved after review." }
  $featureRefText = git rev-parse feature/bilingual-academic-cv
  if ($LASTEXITCODE -ne 0 -or -not $featureRefText -or $featureRefText.Trim() -ne $approvedSha) { throw "Feature branch ref differs from the approved SHA." }
  git merge --ff-only $approvedSha
  if ($LASTEXITCODE -ne 0) { throw "Fast-forward integration failed." }
  $integratedHeadText = git rev-parse HEAD
  if ($LASTEXITCODE -ne 0 -or -not $integratedHeadText -or $integratedHeadText.Trim() -ne $approvedSha) { throw "Integrated SHA differs from the approved SHA." }
  & .\scripts\run-full-validation.ps1
  if ($LASTEXITCODE -ne 0) { throw "Post-integration validation failed." }
  npm.cmd run validate:source
  if ($LASTEXITCODE -ne 0) { throw "Post-integration source validation failed." }
  npm.cmd run check:built
  if ($LASTEXITCODE -ne 0) { throw "Post-integration built-site validation failed." }
  foreach ($probe in @(".local-tools/probe", ".test-output/probe", ".worktrees/probe", "_site/probe")) {
    git check-ignore --quiet --no-index -- $probe
    if ($LASTEXITCODE -ne 0) { throw "Local output is not ignored after integration: $probe" }
  }
  $privacyMatches = git grep -n -I -E "[0-9]{5,}@qq\.com|certificate[ _-]?(number|no\.?)[[:space:]]*[:#]?[[:space:]]*[A-Za-z0-9-]{4,}|证书编号[：: ]*[A-Za-z0-9-]{4,}" -- . 2>$null
  $privacyExit = $LASTEXITCODE
  if ($privacyExit -eq 0) { $privacyMatches; throw "Private tracked text detected after integration." }
  if ($privacyExit -ne 1) { throw "Post-integration privacy scan failed with exit code $privacyExit." }
  $metadataRows = @(git log --format="%H%x09%an%x09%ae%x09%cn%x09%ce" origin/master..HEAD)
  if ($LASTEXITCODE -ne 0 -or $metadataRows.Count -eq 0) { throw "Unable to repeat the unpublished metadata audit." }
  foreach ($row in $metadataRows) {
    $fields = $row -split "`t"
    if ($fields.Count -ne 5) { throw "Malformed commit metadata row." }
    if ($fields[1] -cne "Dravencent" -or $fields[2] -cne "Dravencent@users.noreply.github.com" -or $fields[3] -cne "Dravencent" -or $fields[4] -cne "Dravencent@users.noreply.github.com") { throw "Non-approved author/committer metadata reappeared after integration." }
  }
  git diff --exit-code --check
  if ($LASTEXITCODE -ne 0) { throw "Post-integration diff check failed." }
  git diff --cached --exit-code --check
  if ($LASTEXITCODE -ne 0) { throw "Post-integration staged diff check failed." }
  $postMergeStatus = @(git status --porcelain=v1 --untracked-files=all)
  if ($LASTEXITCODE -ne 0 -or $postMergeStatus.Count -ne 0) { throw "Integrated master is not clean." }
  ```

  This block repeats Task 13's fail-closed source/built/privacy/metadata/ignore/diff checks from the main checkout and requires the same approved commit. Any failure stops before push.

- [ ] **Step 4: Push only the approved SHA to master and match the deployment**

  In a fresh shell, load the now-tracked main-checkout release loader before any `git`/`gh` call, bind the same marker, require exactly one approved push URL, push only `<approved-sha>:refs/heads/master` with mirror/follow-tags/push-signing disabled, then poll the Pages build endpoint—not the validation workflow—for that exact SHA:

  ```powershell
  $repoRoot = "D:\Doctor\Code\CV"
  $featureRoot = "D:\Doctor\Code\CV\.worktrees\bilingual-academic-cv"
  $loader = Join-Path $repoRoot "scripts\set-release-env.ps1"
  if (-not (Test-Path -LiteralPath $loader -PathType Leaf)) { throw "Integrated release loader is missing." }
  . $loader -RepositoryRoot $featureRoot
  Set-Location -LiteralPath $repoRoot
  $marker = Join-Path $featureRoot ".test-output\release-preflight\reviewed-feature-sha.txt"
  if (-not (Test-Path -LiteralPath $marker -PathType Leaf)) { throw "Reviewed SHA marker is missing." }
  $approvedSha = (Get-Content -LiteralPath $marker -Raw -Encoding UTF8).Trim()
  if ($approvedSha -notmatch "^[0-9a-f]{40}$") { throw "Reviewed SHA marker is invalid." }
  $branchText = git branch --show-current
  if ($LASTEXITCODE -ne 0 -or -not $branchText -or $branchText.Trim() -ne "master") { throw "Main checkout is not on master." }
  $originText = git remote get-url origin
  if ($LASTEXITCODE -ne 0 -or -not $originText -or $originText.Trim() -ne "https://github.com/Dravencent/Dravencent.github.io.git") { throw "Unexpected origin." }
  $releaseShaText = git rev-parse HEAD
  if ($LASTEXITCODE -ne 0 -or -not $releaseShaText -or $releaseShaText.Trim() -ne $approvedSha) { throw "Main HEAD differs from the approved SHA." }
  $prePushStatus = @(git status --porcelain=v1 --untracked-files=all)
  if ($LASTEXITCODE -ne 0 -or $prePushStatus.Count -ne 0) { throw "Main checkout is not clean before push." }
  $ghSetup = Join-Path $repoRoot "scripts\setup-local-gh.ps1"
  if (-not (Test-Path -LiteralPath $ghSetup -PathType Leaf)) { throw "Integrated D-local GitHub CLI setup script is missing." }
  & $ghSetup -RepositoryRoot $featureRoot
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($env:GH_EXE) -or -not (Test-Path -LiteralPath $env:GH_EXE -PathType Leaf)) { throw "Pinned D-local GitHub CLI setup failed." }
  Set-Location -LiteralPath $repoRoot
  $pushUrls = @(git remote get-url --push --all origin)
  if ($LASTEXITCODE -ne 0 -or $pushUrls.Count -ne 1 -or $pushUrls[0].Trim() -ne "https://github.com/Dravencent/Dravencent.github.io.git") { throw "Origin does not have exactly one approved push URL immediately before push." }
  $ghCredentialHelper = "!$($env:GH_EXE.Replace('\', '/')) auth git-credential"
  $pushRefspec = "$($approvedSha):refs/heads/master"
  git -c "credential.helper=" -c "credential.helper=$ghCredentialHelper" -c remote.origin.mirror=false -c push.followTags=false -c push.gpgSign=false push origin $pushRefspec
  if ($LASTEXITCODE -ne 0) { throw "Normal push failed; stop without retrying destructively." }
  $deadline = (Get-Date).AddMinutes(15)
  do {
    $latestPagesBuildJson = & $env:GH_EXE api -H "Accept: application/vnd.github+json" repos/Dravencent/Dravencent.github.io/pages/builds/latest
    $latestPagesBuildExit = $LASTEXITCODE
    if ($latestPagesBuildExit -ne 0) { throw "Unable to read latest Pages build." }
    $latestPagesBuild = $latestPagesBuildJson | ConvertFrom-Json
    if ($latestPagesBuild.commit -eq $approvedSha -and $latestPagesBuild.status -eq "built") { break }
    if ($latestPagesBuild.commit -eq $approvedSha -and $latestPagesBuild.status -in @("errored", "cancelled")) {
      throw "Pages reported terminal status '$($latestPagesBuild.status)' for the approved SHA."
    }
    if ((Get-Date) -ge $deadline) { throw "Timed out waiting for Pages to deploy the approved SHA." }
    Start-Sleep -Seconds 30
  } while ($true)
  ```

  On auth, protection, non-fast-forward, failed build, or timeout, stop; never force-push or change settings. A green validation workflow alone is not deployment proof.

- [ ] **Step 5: Verify live routes, custom 404, content, privacy, and responsive smoke**

  In a fresh D-only release shell, verify HTTP semantics first with .NET `HttpClient`, storing evidence only below `.test-output/live-qa`:

  ```powershell
  $repoRoot = "D:\Doctor\Code\CV"
  $featureRoot = "D:\Doctor\Code\CV\.worktrees\bilingual-academic-cv"
  $loader = Join-Path $repoRoot "scripts\set-release-env.ps1"
  if (-not (Test-Path -LiteralPath $loader -PathType Leaf)) { throw "Integrated release loader is missing." }
  . $loader -RepositoryRoot $featureRoot
  Set-Location -LiteralPath $repoRoot
  $marker = Join-Path $featureRoot ".test-output\release-preflight\reviewed-feature-sha.txt"
  if (-not (Test-Path -LiteralPath $marker -PathType Leaf)) { throw "Reviewed SHA marker is missing." }
  $approvedSha = (Get-Content -LiteralPath $marker -Raw -Encoding UTF8).Trim()
  if ($approvedSha -notmatch "^[0-9a-f]{40}$") { throw "Reviewed SHA marker is invalid." }
  $headText = git rev-parse HEAD
  if ($LASTEXITCODE -ne 0 -or -not $headText -or $headText.Trim() -ne $approvedSha) { throw "Live audit checkout differs from the approved SHA." }
  $liveQa = Join-Path $repoRoot ".test-output\live-qa"
  New-Item -ItemType Directory -Force $liveQa | Out-Null
  $base = "https://dravencent.github.io"
  $routes = @("/", "/zh/", "/research/", "/zh/research/", "/publications/", "/zh/publications/", "/honors/", "/zh/honors/", "/cv/", "/zh/cv/", "/404.html")
  $client = [Net.Http.HttpClient]::new()
  $httpAudit = [Collections.Generic.List[object]]::new()
  try {
    foreach ($route in $routes) {
      $response = $client.GetAsync($base + $route).GetAwaiter().GetResult()
      try {
        $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
        if ([int]$response.StatusCode -ne 200 -or [string]::IsNullOrWhiteSpace($body)) {
          throw "Unexpected HTTP result for $route."
        }
        $httpAudit.Add([ordered]@{ route = $route; status = [int]$response.StatusCode; finalUri = $response.RequestMessage.RequestUri.AbsoluteUri })
      }
      finally {
        $response.Dispose()
      }
    }
    $missingRoute = "/missing-release-audit-$approvedSha/"
    $missing = $client.GetAsync($base + $missingRoute).GetAwaiter().GetResult()
    try {
      $missingBody = $missing.Content.ReadAsStringAsync().GetAwaiter().GetResult()
      if ([int]$missing.StatusCode -ne 404 -or $missingBody -notmatch "Page not found") { throw "Custom 404 behavior failed." }
      $httpAudit.Add([ordered]@{ route = $missingRoute; status = [int]$missing.StatusCode; finalUri = $missing.RequestMessage.RequestUri.AbsoluteUri })
    }
    finally {
      $missing.Dispose()
    }
  }
  finally {
    $client.Dispose()
  }
  $httpJson = $httpAudit | ConvertTo-Json -Depth 4
  [IO.File]::WriteAllText((Join-Path $liveQa "http-audit.json"), "$httpJson`n", [Text.UTF8Encoding]::new($false))
  ```

  Then, from another fresh release shell, run the same locked direct-library browser QA in its exact-live-origin mode. It generates the live machine report, screenshots, and accessibility evidence with one fresh non-persistent context per case; never use Chrome/app-browser state, a terminal/agent CLI, or a daemon:

  ```powershell
  $repoRoot = "D:\Doctor\Code\CV"
  $featureRoot = "D:\Doctor\Code\CV\.worktrees\bilingual-academic-cv"
  $loader = Join-Path $repoRoot "scripts\set-release-env.ps1"
  if (-not (Test-Path -LiteralPath $loader -PathType Leaf)) { throw "Integrated release loader is missing." }
  . $loader -RepositoryRoot $featureRoot
  Set-Location -LiteralPath $repoRoot
  $marker = Join-Path $featureRoot ".test-output\release-preflight\reviewed-feature-sha.txt"
  if (-not (Test-Path -LiteralPath $marker -PathType Leaf)) { throw "Reviewed SHA marker is missing." }
  $approvedSha = (Get-Content -LiteralPath $marker -Raw -Encoding UTF8).Trim()
  if ($approvedSha -notmatch "^[0-9a-f]{40}$") { throw "Reviewed SHA marker is invalid." }
  $headText = git rev-parse HEAD
  if ($LASTEXITCODE -ne 0 -or -not $headText -or $headText.Trim() -ne $approvedSha) { throw "Live browser audit checkout differs from the approved SHA." }
  & .\scripts\setup-local-playwright.ps1
  if ($LASTEXITCODE -ne 0) { throw "D-local Playwright setup failed." }
  node .\scripts\playwright\run-browser-qa.mjs --mode live --origin https://dravencent.github.io --output-root .test-output\live-qa
  if ($LASTEXITCODE -ne 0) { throw "Live direct-browser audit reported a finding." }
  $runtimeReport = ".test-output\live-qa\reports\browser-qa.json"
  if (-not (Test-Path -LiteralPath $runtimeReport -PathType Leaf)) { throw "Live browser QA report is missing." }
  $runtime = Get-Content -LiteralPath $runtimeReport -Raw -Encoding UTF8 | ConvertFrom-Json
  $summary = $runtime.summary
  $expected = [ordered]@{
    routeCount = 10
    viewportCaseCount = 20
    networkAuditCaseCount = 20
    responsiveScreenshotCount = 3
    accessibilitySnapshotCount = 3
    counterpartPairCount = 5
    publicationCount = 8
    awardCount = 6
    selectedPublicationCount = 4
    boldPrimaryAuthorCount = 8
    menuFindingCount = 0
    overflowFindingCount = 0
    privacyFindingCount = 0
    keyboardFindingCount = 0
    focusFindingCount = 0
    networkFindingCount = 0
    consoleFindingCount = 0
    pageErrorFindingCount = 0
    redirectFindingCount = 0
  }
  foreach ($name in $expected.Keys) {
    if ([int]$summary.$name -ne [int]$expected[$name]) { throw "Unexpected live browser QA summary field: $name" }
  }
  if (-not [bool]$summary.requiredResourceTypesPresent -or -not [bool]$summary.canonicalLinksValid) {
    throw "Live browser evidence is missing required resource or canonical-link proof."
  }
  foreach ($artifact in @(
    ".test-output\live-qa\screenshots\home-en-390x844.png",
    ".test-output\live-qa\screenshots\publications-en-1440x900.png",
    ".test-output\live-qa\screenshots\cv-zh-1440x900.png"
  )) {
    if (-not (Test-Path -LiteralPath $artifact -PathType Leaf)) { throw "Required live visual artifact is missing: $artifact" }
  }
  ```

  Inspect at least `.test-output/live-qa/screenshots/home-en-390x844.png`, `publications-en-1440x900.png`, and `cv-zh-1440x900.png`, plus their accessibility records, and require parity with the approved local QA. The direct report must prove both 390×844 and 1440×900 behavior across all ten routes, five counterpart pairs both ways, both navigation modes, four selected homepage publications, eight bold publication-page `Yu Zhan` occurrences, canonical DOI/ORCID/GitHub/supervisor/team links, exact counts 8/6/4, and no demo content, QQ, certificate/QR/signature material, U+FFFD/mojibake, console/page/request/response failure, redirect, or request outside `https://dravencent.github.io`.

- [ ] **Step 6: Record the final clean/deployed state**

  ```powershell
  $repoRoot = "D:\Doctor\Code\CV"
  $featureRoot = "D:\Doctor\Code\CV\.worktrees\bilingual-academic-cv"
  $loader = Join-Path $repoRoot "scripts\set-release-env.ps1"
  if (-not (Test-Path -LiteralPath $loader -PathType Leaf)) { throw "Integrated release loader is missing." }
  . $loader -RepositoryRoot $featureRoot
  Set-Location -LiteralPath $repoRoot
  $marker = Join-Path $featureRoot ".test-output\release-preflight\reviewed-feature-sha.txt"
  if (-not (Test-Path -LiteralPath $marker -PathType Leaf)) { throw "Reviewed SHA marker is missing." }
  $approvedSha = (Get-Content -LiteralPath $marker -Raw -Encoding UTF8).Trim()
  if ($approvedSha -notmatch "^[0-9a-f]{40}$") { throw "Reviewed SHA marker is invalid." }
  $branchText = git branch --show-current
  if ($LASTEXITCODE -ne 0 -or -not $branchText -or $branchText.Trim() -ne "master") { throw "Main checkout is not on master." }
  $originText = git remote get-url origin
  if ($LASTEXITCODE -ne 0 -or -not $originText -or $originText.Trim() -ne "https://github.com/Dravencent/Dravencent.github.io.git") { throw "Unexpected origin." }
  $ghSetup = Join-Path $repoRoot "scripts\setup-local-gh.ps1"
  if (-not (Test-Path -LiteralPath $ghSetup -PathType Leaf)) { throw "Integrated D-local GitHub CLI setup script is missing." }
  & $ghSetup -RepositoryRoot $featureRoot
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($env:GH_EXE) -or -not (Test-Path -LiteralPath $env:GH_EXE -PathType Leaf)) { throw "Pinned D-local GitHub CLI setup failed." }
  Set-Location -LiteralPath $repoRoot
  $ghCredentialHelper = "!$($env:GH_EXE.Replace('\', '/')) auth git-credential"
  git -c "credential.helper=" -c "credential.helper=$ghCredentialHelper" fetch origin master
  if ($LASTEXITCODE -ne 0) { throw "Final fetch failed." }
  $localFinalText = git rev-parse HEAD
  if ($LASTEXITCODE -ne 0 -or -not $localFinalText) { throw "Unable to resolve local final SHA." }
  $localFinal = $localFinalText.Trim()
  $remoteFinalText = git rev-parse origin/master
  if ($LASTEXITCODE -ne 0 -or -not $remoteFinalText) { throw "Unable to resolve remote final SHA." }
  $remoteFinal = $remoteFinalText.Trim()
  $featureFinalText = git -C $featureRoot rev-parse HEAD
  if ($LASTEXITCODE -ne 0 -or -not $featureFinalText) { throw "Unable to resolve feature final SHA." }
  $featureFinal = $featureFinalText.Trim()
  $latestPagesBuildJson = & $env:GH_EXE api -H "Accept: application/vnd.github+json" repos/Dravencent/Dravencent.github.io/pages/builds/latest
  if ($LASTEXITCODE -ne 0) { throw "Unable to re-read latest Pages build." }
  $latestPagesBuild = $latestPagesBuildJson | ConvertFrom-Json
  $deployedFinal = [string]$latestPagesBuild.commit
  if (
    $localFinal -ne $approvedSha -or
    $remoteFinal -ne $approvedSha -or
    $featureFinal -ne $approvedSha -or
    $deployedFinal -ne $approvedSha -or
    $latestPagesBuild.status -ne "built"
  ) { throw "Approved, feature, local, remote, and successfully deployed SHAs do not all match." }
  $finalStatus = @(git status --porcelain=v1 --untracked-files=all)
  if ($LASTEXITCODE -ne 0 -or $finalStatus.Count -ne 0) { throw "Final master is not clean." }
  $releaseEvidence = Join-Path $repoRoot ".test-output\release-preflight"
  New-Item -ItemType Directory -Force $releaseEvidence | Out-Null
  $finalRecord = [ordered]@{
    sha = $approvedSha
    pagesStatus = [string]$latestPagesBuild.status
    liveUrl = "https://dravencent.github.io/"
    verifiedAtUtc = [DateTime]::UtcNow.ToString("o")
  } | ConvertTo-Json
  [IO.File]::WriteAllText((Join-Path $releaseEvidence "final-deployment.json"), "$finalRecord`n", [Text.UTF8Encoding]::new($false))
  ```

  Report the live URL and verified SHA from the ignored final record; no additional commit or Pages-setting change is required.

### Chunk 4 implementation traps

- Validation CI must never become a Pages deployment workflow.
- Native PowerShell exit codes must be checked explicitly; `$ErrorActionPreference` alone is insufficient.
- The locked Playwright Node library, Chromium, automatic temporary profiles, accessibility snapshots, screenshots, downloads, logs, reports, and PDFs must remain under the current D-drive worktree.
- Browser screenshots do not prove print CSS; both English and Chinese A4 PDFs must be rendered page-by-page and visually inspected.
- `/404.html` may return 200 while an unknown route must return 404; test both.
- A successful CI job is not proof that Pages deployed the same commit; match the deployment SHA.
- Never resolve remote divergence, a Pages-source mismatch, auth failure, or branch protection by changing settings, resetting history, or force-pushing.
