import * as cheerio from "cheerio";

const HTML_FILES = Object.freeze([
  "404.html", "index.html", "zh/index.html", "research/index.html", "zh/research/index.html",
  "publications/index.html", "zh/publications/index.html", "honors/index.html", "zh/honors/index.html",
  "cv/index.html", "zh/cv/index.html",
]);

function textValue(value) {
  return Buffer.isBuffer(value) ? value.toString("utf8") : String(value ?? "");
}

function pageOutput(permalink) {
  if (permalink === "/") return "index.html";
  if (permalink === "/404.html") return "404.html";
  return `${permalink.replace(/^\//u, "")}index.html`;
}

function hrefOutput(href) {
  const path = href.split(/[?#]/u, 1)[0];
  if (path === "/") return "index.html";
  if (path.endsWith("/")) return `${path.slice(1)}index.html`;
  return path.replace(/^\//u, "");
}

export function validateBuiltSite({
  fileMap,
  expectedFiles,
  pages = [],
  profile = null,
  publications = [],
  awards = [],
}) {
  const errors = [];
  const expected = new Set(expectedFiles);
  const actual = new Set(fileMap.keys());
  for (const path of expected) if (!actual.has(path)) errors.push(`Missing output: ${path}`);
  for (const path of actual) if (!expected.has(path)) errors.push(`Unexpected output: ${path}`);

  const pageByOutput = new Map(pages.map((page) => [pageOutput(page.data.permalink), page]));
  for (const path of HTML_FILES) {
    if (!fileMap.has(path)) continue;
    const html = textValue(fileMap.get(path));
    const $ = cheerio.load(html);
    const page = pageByOutput.get(path);
    if (!page) {
      if (pages.length) errors.push(`${path}: no source page metadata`);
      continue;
    }
    const { data } = page;
    if ($("html").attr("lang") !== data.lang) errors.push(`${path}: incorrect html lang`);
    if ($("h1").length !== 1) errors.push(`${path}: expected exactly one h1`);
    const expectedTitle = data.page_type === "home" ? data.title : `${data.title} | Yu Zhan`;
    if ($("title").text().trim() !== expectedTitle) errors.push(`${path}: incorrect title`);
    if ($('meta[name="description"]').attr("content") !== data.description) errors.push(`${path}: incorrect description`);
    const canonical = `https://dravencent.github.io${data.permalink}`;
    if ($('link[rel="canonical"]').attr("href") !== canonical) errors.push(`${path}: incorrect canonical URL`);

    const switches = $("a.language-switch");
    if (data.counterpart) {
      if (!switches.length || switches.filter((_, node) => $(node).attr("href") !== data.counterpart).length) {
        errors.push(`${path}: language switch does not target counterpart`);
      }
      const enRoute = data.lang === "en" ? data.permalink : data.counterpart;
      const zhRoute = data.lang === "zh" ? data.permalink : data.counterpart;
      if ($('link[rel="alternate"][hreflang="en"]').attr("href") !== `https://dravencent.github.io${enRoute}`) errors.push(`${path}: incorrect English alternate`);
      if ($('link[rel="alternate"][hreflang="zh-Hans"]').attr("href") !== `https://dravencent.github.io${zhRoute}`) errors.push(`${path}: incorrect Chinese alternate`);
      if ($('link[rel="alternate"][hreflang="x-default"]').attr("href") !== `https://dravencent.github.io${enRoute}`) errors.push(`${path}: incorrect x-default alternate`);
    } else if (switches.length || $('link[rel="alternate"]').length) {
      errors.push(`${path}: auxiliary page must not have language alternates`);
    }

    $("a[href]").each((_, node) => {
      const href = $(node).attr("href");
      if (!href || href.startsWith("#") || /^(?:https?:|mailto:)/u.test(href)) return;
      const output = hrefOutput(href);
      if (!fileMap.has(output)) errors.push(`${path}: unresolved internal link '${href}'`);
    });
    $("script[src], link[rel='stylesheet'][href], img[src], iframe[src]").each((_, node) => {
      const asset = $(node).attr("src") ?? $(node).attr("href");
      if (/^https?:/u.test(asset ?? "")) errors.push(`${path}: remote active asset '${asset}'`);
    });

    const lower = $.html().toLowerCase();
    for (const forbidden of ["@qq.com", "your name", "lorem ipsum", "academic pages is a ready-to-fork", "�"] ) {
      if (lower.includes(forbidden)) errors.push(`${path}: forbidden generated content '${forbidden}'`);
    }

    const publicationIds = $("[data-publication-id]").map((_, node) => $(node).attr("data-publication-id")).get();
    const awardIds = $("[data-award-id]").map((_, node) => $(node).attr("data-award-id")).get();
    const researchIds = $("[data-research-id]").map((_, node) => $(node).attr("data-research-id")).get();
    if (data.page_type === "home" && JSON.stringify(publicationIds) !== JSON.stringify(publications.filter((item) => item.selected).map((item) => item.id))) errors.push(`${path}: selected publication order/count differs`);
    if (["publications", "cv"].includes(data.page_type) && JSON.stringify(publicationIds) !== JSON.stringify(publications.map((item) => item.id))) errors.push(`${path}: complete publication order/count differs`);
    if (["honors", "cv"].includes(data.page_type) && JSON.stringify(awardIds) !== JSON.stringify(awards.map((item) => item.id))) errors.push(`${path}: award order/count differs`);
    if (["home", "research", "cv"].includes(data.page_type) && profile && JSON.stringify(researchIds) !== JSON.stringify(profile.research_directions.map((item) => item.id))) errors.push(`${path}: research direction order/count differs`);
    if (publicationIds.length) {
      $(".publication-authors strong").each((_, node) => {
        if ($(node).text().trim() !== "Yu Zhan") errors.push(`${path}: an author other than Yu Zhan is bold`);
      });
      if ($(".publication-authors strong").length !== publicationIds.length) errors.push(`${path}: Yu Zhan emphasis count differs`);
    }
    if ($(".status-label").length > 1 || ($(".status-label").length && !$("[data-research-id='novel-lithium-salt-design'] .status-label").length)) {
      errors.push(`${path}: ongoing status is attached to the wrong direction`);
    }
  }
  return errors;
}
