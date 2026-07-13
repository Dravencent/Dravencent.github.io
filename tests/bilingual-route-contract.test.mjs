import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

import { parseFrontMatter, validateSiteContract } from "../scripts/lib/site-contract-validation.mjs";
import { load as loadYaml } from "js-yaml";

test("repository declares only the ten bilingual routes and 404", async () => {
  const files = (await readdir("_pages")).filter((name) => /\.(md|html)$/u.test(name)).sort();
  assert.deepEqual(files, [
    "404.md", "cv-en.md", "cv-zh.md", "home-en.md", "home-zh.md",
    "honors-en.md", "honors-zh.md", "publications-en.md", "publications-zh.md",
    "research-en.md", "research-zh.md",
  ]);
  const pages = await Promise.all(files.map(async (file) => parseFrontMatter(
    await readFile(`_pages/${file}`, "utf8"), `_pages/${file}`,
  )));
  const navigation = loadYaml(await readFile("_data/navigation.yml", "utf8"));
  assert.deepEqual(validateSiteContract({ pages, navigation }), []);
});
