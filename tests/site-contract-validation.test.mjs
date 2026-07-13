import test from "node:test";
import assert from "node:assert/strict";

import {
  REQUIRED_ROUTES,
  parseFrontMatter,
  validateNavigation,
  validatePages,
} from "../scripts/lib/site-contract-validation.mjs";

const page = (permalink, lang, counterpart, pageType, layout = "academic") => ({
  filePath: `_pages/${pageType}-${lang}.md`,
  data: {
    layout,
    lang,
    permalink,
    counterpart,
    title: pageType,
    description: `${pageType} description`,
    page_type: pageType,
    body_class: `academic-site ${pageType}-page`,
  },
});

function validPages() {
  return [
    page("/", "en", "/zh/", "home", "home"),
    page("/zh/", "zh", "/", "home", "home"),
    page("/research/", "en", "/zh/research/", "research"),
    page("/zh/research/", "zh", "/research/", "research"),
    page("/publications/", "en", "/zh/publications/", "publications"),
    page("/zh/publications/", "zh", "/publications/", "publications"),
    page("/honors/", "en", "/zh/honors/", "honors"),
    page("/zh/honors/", "zh", "/honors/", "honors"),
    page("/cv/", "en", "/zh/cv/", "cv"),
    page("/zh/cv/", "zh", "/cv/", "cv"),
    {
      filePath: "_pages/404.md",
      data: {
        layout: "academic",
        lang: "en",
        permalink: "/404.html",
        title: "Page not found",
        description: "The requested page could not be found.",
        page_type: "error",
        body_class: "academic-site error-page",
        sitemap: false,
      },
    },
  ];
}

const navigation = {
  main_en: [
    { key: "research", title: "Research", url: "/research/" },
    { key: "publications", title: "Publications", url: "/publications/" },
    { key: "honors", title: "Honors", url: "/honors/" },
    { key: "cv", title: "CV", url: "/cv/" },
  ],
  main_zh: [
    { key: "research", title: "研究方向", url: "/zh/research/" },
    { key: "publications", title: "论文发表", url: "/zh/publications/" },
    { key: "honors", title: "荣誉奖励", url: "/zh/honors/" },
    { key: "cv", title: "学术简历", url: "/zh/cv/" },
  ],
};

test("front matter parser returns strict metadata and body", () => {
  const parsed = parseFrontMatter("---\nlang: en\npermalink: /\n---\nBody\n", "home.md");
  assert.equal(parsed.filePath, "home.md");
  assert.equal(parsed.data.lang, "en");
  assert.equal(parsed.body.trim(), "Body");
  assert.throws(() => parseFrontMatter("Body", "bad.md"), /front matter/iu);
});

test("page and navigation contracts accept only the approved bilingual graph", () => {
  assert.deepEqual(REQUIRED_ROUTES, [
    "/", "/zh/", "/research/", "/zh/research/", "/publications/",
    "/zh/publications/", "/honors/", "/zh/honors/", "/cv/", "/zh/cv/",
  ]);
  assert.deepEqual(validatePages(validPages()), []);
  assert.deepEqual(validateNavigation(navigation, validPages()), []);

  const broken = validPages();
  broken[0].data.counterpart = "/zh/cv/";
  assert.match(validatePages(broken).join("\n"), /counterpart/iu);

  const mixed = structuredClone(navigation);
  mixed.main_zh[0].url = "/research/";
  assert.match(validateNavigation(mixed, validPages()).join("\n"), /Chinese|zh/iu);
});
