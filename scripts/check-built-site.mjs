import { readdir, readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";

import { EXPECTED_BUILT_FILES } from "../tests/fixtures/expected-built-files.mjs";
import { validateBuiltSite } from "./lib/built-site-validation.mjs";
import { parseFrontMatter } from "./lib/site-contract-validation.mjs";

async function walk(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return walk(root, path);
    return [[relative(root, path).replaceAll("\\", "/"), await readFile(path)]];
  }));
  return nested.flat();
}

export async function loadBuiltSite(siteRoot, { cwd = process.cwd() } = {}) {
  const repositoryRoot = resolve(cwd);
  const candidate = resolve(repositoryRoot, siteRoot);
  const relativeCandidate = relative(repositoryRoot, candidate);
  if (relativeCandidate.startsWith("..") || isAbsolute(relativeCandidate)) {
    throw new Error(`site root escapes repository: ${candidate}`);
  }
  const fileMap = new Map(await walk(candidate));
  const pageNames = (await readdir(resolve(repositoryRoot, "_pages"))).filter((name) => /\.(?:md|html)$/u.test(name));
  const pages = await Promise.all(pageNames.map(async (name) => parseFrontMatter(
    await readFile(resolve(repositoryRoot, "_pages", name), "utf8"), `_pages/${name}`,
  )));
  const readYaml = async (name) => loadYaml(await readFile(resolve(repositoryRoot, "_data", name), "utf8"));
  return {
    fileMap,
    pages,
    profile: await readYaml("profile.yml"),
    publications: await readYaml("publications.yml"),
    awards: await readYaml("awards.yml"),
    expectedFiles: EXPECTED_BUILT_FILES,
  };
}

export async function main({
  siteRoot = process.argv[2] ?? ".test-output/site",
  loadSite = loadBuiltSite,
  validate = validateBuiltSite,
  stdout = process.stdout,
  stderr = process.stderr,
} = {}) {
  try {
    const errors = validate(await loadSite(siteRoot));
    if (errors.length) {
      stderr.write(`${errors.join("\n")}\n`);
      return 1;
    }
    stdout.write("Built site passed: 11 content routes, bilingual metadata, internal links, publications, honors, and privacy checks are valid.\n");
    return 0;
  } catch (error) {
    stderr.write(`built site: ${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

const invoked = process.argv[1] ? resolve(process.argv[1]) : "";
if (invoked && fileURLToPath(import.meta.url) === invoked) process.exitCode = await main();
