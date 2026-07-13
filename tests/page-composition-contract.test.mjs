import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { parseFrontMatter } from "../scripts/lib/site-contract-validation.mjs";

const expected = {
  home: ["hero", "research-directions", "publication-list", "education-list", "academic-links"],
  research: ["research-directions", "skills-list", "academic-links"],
  publications: ["publication-list"],
  honors: ["award-list"],
  cv: ["identity-summary", "profile-links", "research-directions", "education-list", "skills-list", "publication-list", "award-list", "academic-links"],
};

for (const [type, includes] of Object.entries(expected)) {
  for (const lang of ["en", "zh"]) {
    test(`${type}-${lang} composes shared sections in approved order`, async () => {
      const source = await readFile(`_pages/${type}-${lang}.md`, "utf8");
      const { body } = parseFrontMatter(source, `_pages/${type}-${lang}.md`);
      const actual = [...body.matchAll(/\{%\s*include\s+([\w-]+)\.html\b/gu)].map((match) => match[1]);
      assert.deepEqual(actual, includes);
      assert.match(body, /<section\b/iu);
      if (type === "home") {
        assert.doesNotMatch(body, /award-list|Honors &amp; Awards|荣誉奖励/iu);
        assert.match(body, /selected_only=true/u);
      }
      if (["publications", "cv"].includes(type)) assert.match(body, /selected_only=false/u);
    });
  }
}

test("publication, honors, and CV pages hide header descriptions without removing SEO copy", async () => {
  for (const type of ["publications", "honors", "cv"]) {
    for (const lang of ["en", "zh"]) {
      const filePath = `_pages/${type}-${lang}.md`;
      const source = await readFile(filePath, "utf8");
      const { data } = parseFrontMatter(source, filePath);
      assert.equal(typeof data.description, "string", `${filePath} must retain an SEO description string`);
      assert.match(data.description, /\S/u, `${filePath} must retain non-empty SEO description copy`);
      assert.equal(data.show_description, false, `${filePath} must hide its visible header description`);
    }
  }
});

test("publication and honors pages omit redundant page leads", async () => {
  for (const type of ["publications", "honors"]) {
    for (const lang of ["en", "zh"]) {
      const filePath = `_pages/${type}-${lang}.md`;
      const source = await readFile(filePath, "utf8");
      const { body } = parseFrontMatter(source, filePath);
      assert.doesNotMatch(body, /class=["']page-lead["']/u, `${filePath} must not repeat its page description`);
    }
  }
});

test("research pages keep their biography leads and visible descriptions", async () => {
  for (const lang of ["en", "zh"]) {
    const filePath = `_pages/research-${lang}.md`;
    const source = await readFile(filePath, "utf8");
    const { data, body } = parseFrontMatter(source, filePath);
    assert.notEqual(data.show_description, false, `${filePath} must keep its visible header description`);
    assert.match(
      body,
      new RegExp(`<p\\s+class=["']page-lead["']>\\{\\{\\s*site\\.data\\.profile\\.biography\\.${lang}\\s*\\}\\}</p>`, "u"),
      `${filePath} must retain its biography page lead`,
    );
  }
});
