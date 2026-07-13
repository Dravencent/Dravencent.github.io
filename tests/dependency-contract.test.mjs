import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

function activeIgnoreRules(source) {
  return source
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function gemfileLockSection(source, heading) {
  const lines = source.split(/\r?\n/u);
  const start = lines.indexOf(heading);
  assert.ok(start >= 0, `Gemfile.lock contains ${heading}`);
  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (/^[A-Z][A-Z ]+$/u.test(line)) break;
    body.push(line.trim());
  }
  return body.filter(Boolean);
}

test("dependency manifests are minimal, locked, and locally reproducible", async () => {
  const [gitignore, packageText, gemfile, packageLockText, gemfileLock] = await Promise.all([
    readFile(".gitignore", "utf8"),
    readFile("package.json", "utf8"),
    readFile("Gemfile", "utf8"),
    readFile("package-lock.json", "utf8"),
    readFile("Gemfile.lock", "utf8"),
  ]);

  const ignoreRules = activeIgnoreRules(gitignore);
  const requiredRules = [
    ".local-tools/",
    ".bundle/",
    ".test-output/",
    ".worktrees/",
    "_site/",
    ".superpowers/",
    "node_modules/",
  ];
  for (const rule of requiredRules) {
    assert.ok(ignoreRules.includes(rule), `.gitignore names ${rule}`);
  }
  assert.ok(!ignoreRules.includes("package-lock.json"), "package-lock.json remains tracked");
  assert.ok(!ignoreRules.includes("Gemfile.lock"), "Gemfile.lock remains tracked");

  const packageJson = JSON.parse(packageText);
  assert.equal(packageJson.name, "yu-zhan-academic-cv");
  assert.equal(packageJson.private, true);
  assert.deepEqual(packageJson.engines, { node: "22.14.0", npm: "10.9.2" });
  assert.deepEqual(packageJson.scripts, {
    test: "node --test tests/*.test.mjs",
    "validate:data": "node scripts/validate-cv.mjs",
    "validate:site": "node scripts/validate-site-contract.mjs",
    validate: "npm run validate:data && npm run validate:site",
    build: "powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-site.ps1",
    "check:built": "node scripts/check-built-site.mjs .test-output/site",
  });
  assert.deepEqual(packageJson.devDependencies, { cheerio: "1.0.0", "js-yaml": "^4.1.0" });
  assert.ok(!("dependencies" in packageJson), "template runtime dependencies are removed");
  assert.ok(!/uglify|onchange|minif/iu.test(packageText), "old minification tooling is removed");

  const normalizedGemfile = gemfile.replace(/\r\n/gu, "\n").trim();
  assert.equal(
    normalizedGemfile,
    [
      'source "https://rubygems.org"',
      "",
      'gem "github-pages", group: :jekyll_plugins',
      'gem "webrick", "~> 1.8"',
    ].join("\n"),
  );

  const packageLock = JSON.parse(packageLockText);
  assert.equal(packageLock.lockfileVersion, 3);
  assert.equal(packageLock.packages[""].devDependencies["js-yaml"], "^4.1.0");
  assert.equal(packageLock.packages[""].devDependencies.cheerio, "1.0.0");
  assert.ok(packageLock.packages["node_modules/cheerio"], "package-lock.json locks cheerio");
  assert.ok(packageLock.packages["node_modules/js-yaml"], "package-lock.json locks js-yaml");

  const platforms = gemfileLockSection(gemfileLock, "PLATFORMS");
  assert.ok(platforms.some((platform) => platform === "x64-mingw-ucrt"), "Windows x64 platform is locked");
  assert.ok(platforms.includes("x86_64-linux"), "Linux x64 platform is locked");
  const bundledWith = gemfileLockSection(gemfileLock, "BUNDLED WITH");
  assert.deepEqual(bundledWith, ["2.5.23"]);
});
