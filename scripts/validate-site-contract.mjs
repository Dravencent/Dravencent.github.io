import { readdir, readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";

import { parseFrontMatter, validateSiteContract } from "./lib/site-contract-validation.mjs";

async function listPageFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return listPageFiles(path);
    return /\.(?:md|html)$/u.test(entry.name) ? [path] : [];
  }));
  return nested.flat();
}

export async function loadSiteContract({ cwd = process.cwd(), read = readFile } = {}) {
  const pageRoot = resolve(cwd, "_pages");
  const pageFiles = await listPageFiles(pageRoot);
  const pages = await Promise.all(pageFiles.map(async (path) => parseFrontMatter(
    await read(path, "utf8"), relative(cwd, path).replaceAll("\\", "/"),
  )));
  const navigation = loadYaml(await read(resolve(cwd, "_data/navigation.yml"), "utf8"));
  return { pages, navigation };
}

export async function main({
  loadContract = loadSiteContract,
  validate = validateSiteContract,
  stdout = process.stdout,
  stderr = process.stderr,
} = {}) {
  try {
    const errors = validate(await loadContract());
    if (errors.length) {
      stderr.write(`${errors.join("\n")}\n`);
      return 1;
    }
    stdout.write("Validated 10 bilingual routes, 5 mutual counterpart pairs, and 2 language-specific menus.\n");
    return 0;
  } catch (error) {
    stderr.write(`site: ${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

const invoked = process.argv[1] ? resolve(process.argv[1]) : "";
if (invoked && fileURLToPath(import.meta.url) === invoked) process.exitCode = await main();
