import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const activeSources = [
  "_config.yml", "assets/css/main.scss", "_sass/_academic.scss",
  "_layouts/default.html", "_layouts/home.html", "_layouts/academic.html",
  "_includes/head.html", "_includes/head/custom.html", "_includes/seo.html",
  "_includes/masthead.html", "_includes/footer.html", "_includes/hero.html",
  "_includes/profile-links.html", "_includes/research-directions.html",
  "_includes/publication-list.html", "_includes/award-list.html",
];

test("active rendering sources contain no private address, remote asset, or template placeholder", async () => {
  const text = (await Promise.all(activeSources.map((path) => readFile(path, "utf8")))).join("\n");
  assert.doesNotMatch(text, /\b\d{5,}@qq\.com\b/iu);
  assert.doesNotMatch(text, /<(?:script|link|img|iframe)\b[^>]+(?:src|href)=["']https?:\/\//iu);
  assert.doesNotMatch(text, /Your Name|Lorem ipsum|Paper Title Number|Academic Pages is a ready-to-fork|\uFFFD/iu);
  assert.doesNotMatch(text, /<script\b|staticman|disqus|cookie/iu);
  assert.match(text, /analytics:\s*\r?\n\s+provider:\s*false/iu);
});

test("demonstration collections and public legacy asset directories are absent", async () => {
  for (const path of ["_publications", "_talks", "_teaching", "_portfolio", "_posts", "_drafts", "assets/js", "assets/fonts", "assets/webfonts", "files"]) {
    await assert.rejects(access(path), undefined, `${path} must be absent`);
  }
});
