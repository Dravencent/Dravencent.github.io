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
