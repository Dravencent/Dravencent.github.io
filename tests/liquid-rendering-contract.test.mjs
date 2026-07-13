import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");

test("semantic bilingual shell is local, accessible, and no-JavaScript", async () => {
  const [layout, home, academic, masthead, language, seo, head, footer] = await Promise.all([
    read("_layouts/default.html"), read("_layouts/home.html"), read("_layouts/academic.html"),
    read("_includes/masthead.html"), read("_includes/language-switch.html"),
    read("_includes/seo.html"), read("_includes/head.html"), read("_includes/footer.html"),
  ]);
  assert.match(layout, /<html[^>]+lang=/u);
  assert.match(layout, /skip-link[^>]+#main-content/u);
  assert.match(layout, /page\.body_class/u);
  assert.equal((home.match(/<main\b/gu) || []).length, 1);
  assert.equal((academic.match(/<main\b/gu) || []).length, 1);
  assert.match(masthead, /<details/u);
  assert.match(masthead, /aria-current/u);
  assert.match(language, /page\.counterpart/u);
  assert.match(language, /hreflang/u);
  assert.match(seo, /rel="canonical"/u);
  assert.match(seo, /x-default/u);
  assert.doesNotMatch(`${layout}\n${head}\n${footer}`, /<script|analytics|mathjax|fonts\.google/iu);
});

test("shared includes preserve publication, award, identity, and image semantics", async () => {
  const [hero, identity, links, research, authors, publications, awards] = await Promise.all([
    read("_includes/hero.html"), read("_includes/identity-summary.html"),
    read("_includes/profile-links.html"), read("_includes/research-directions.html"),
    read("_includes/author-list.html"), read("_includes/publication-list.html"),
    read("_includes/award-list.html"),
  ]);
  assert.match(hero, /images\/yu-zhan-illustration\.webp/u);
  assert.doesNotMatch(hero, /images\/My\.png/u);
  assert.match(identity, /profile\.name/u);
  assert.doesNotMatch(identity, /mailto:|orcid|github/iu);
  assert.match(links, /mailto:/u);
  assert.match(research, /related_publication_ids/u);
  assert.match(research, /novel-lithium-salt-design/u);
  assert.match(authors, /data-author/u);
  assert.match(authors, /Yu Zhan/u);
  assert.match(publications, /https:\/\/doi\.org\//u);
  assert.match(publications, /data-publication-id/u);
  assert.doesNotMatch(publications, /first.author|co-author|badge/iu);
  assert.match(awards, /official_title_zh/u);
  assert.match(awards, /english_descriptor/u);
  assert.match(awards, /data-award-id/u);
  assert.doesNotMatch(awards, /certificate|二维码|证书/u);
});
