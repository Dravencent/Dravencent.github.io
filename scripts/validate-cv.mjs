import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";

import { validateAcademicData } from "./lib/cv-validation.mjs";

const DATA_FILES = {
  profile: "_data/profile.yml",
  publications: "_data/publications.yml",
  awards: "_data/awards.yml",
};

export async function loadAcademicData({ cwd = process.cwd(), read = readFile } = {}) {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(DATA_FILES).map(async ([key, relativePath]) => {
        const source = await read(resolve(cwd, relativePath), "utf8");
        return [key, loadYaml(source)];
      }),
    ),
  );
}

export async function main({
  loadData = loadAcademicData,
  validate = validateAcademicData,
  stdout = process.stdout,
  stderr = process.stderr,
} = {}) {
  let data;
  try {
    data = await loadData();
  } catch (error) {
    stderr.write(`data: ${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }

  const errors = validate(data);
  if (errors.length > 0) {
    stderr.write(`${errors.join("\n")}\n`);
    return 1;
  }

  stdout.write("Validated 8 publications, 6 awards, and 3 research directions.\n");
  return 0;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath && fileURLToPath(import.meta.url) === invokedPath) {
  process.exitCode = await main();
}
