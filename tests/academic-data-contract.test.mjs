import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load as loadYaml } from "js-yaml";

import { validateAcademicData } from "../scripts/lib/cv-validation.mjs";
import { APPROVED_ACADEMIC_DATA } from "./fixtures/approved-academic-data.mjs";

async function loadCanonicalData() {
  const paths = {
    profile: "_data/profile.yml",
    publications: "_data/publications.yml",
    awards: "_data/awards.yml",
  };
  return Object.fromEntries(
    await Promise.all(
      Object.entries(paths).map(async ([key, path]) => [key, loadYaml(await readFile(path, "utf8"))]),
    ),
  );
}

test("canonical YAML exactly matches the independent approved-data oracle", async () => {
  const actual = await loadCanonicalData();
  assert.deepEqual(validateAcademicData(actual), []);
  assert.deepEqual(actual, APPROVED_ACADEMIC_DATA);
});

test("education has no independent canonical YAML file", async () => {
  await assert.rejects(readFile("_data/education.yml", "utf8"), { code: "ENOENT" });
});
