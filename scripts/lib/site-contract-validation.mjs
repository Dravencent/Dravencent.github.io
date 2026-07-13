import { load as loadYaml } from "js-yaml";

export const REQUIRED_ROUTES = Object.freeze([
  "/", "/zh/",
  "/research/", "/zh/research/",
  "/publications/", "/zh/publications/",
  "/honors/", "/zh/honors/",
  "/cv/", "/zh/cv/",
]);

const REQUIRED_FIELDS = ["layout", "lang", "permalink", "counterpart", "title", "description", "page_type", "body_class"];
const NAV_KEYS = ["research", "publications", "honors", "cv"];
const ERROR_PAGE = {
  layout: "academic",
  lang: "en",
  permalink: "/404.html",
  title: "Page not found",
  description: "The requested page could not be found.",
  page_type: "error",
  body_class: "academic-site error-page",
  sitemap: false,
};

export function parseFrontMatter(source, filePath = "unknown") {
  const normalized = source.replace(/^\uFEFF/u, "");
  const match = normalized.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)([\s\S]*)$/u);
  if (!match) throw new Error(`${filePath}: missing or malformed YAML front matter`);
  const data = loadYaml(match[1]);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`${filePath}: front matter must be a mapping`);
  }
  return { filePath, data, body: match[2] };
}

export function validatePages(pages) {
  const errors = [];
  const formal = pages.filter(({ data }) => data.permalink !== "/404.html");
  const auxiliary = pages.filter(({ data }) => data.permalink === "/404.html");
  const byRoute = new Map();

  for (const page of formal) {
    const { data, filePath } = page;
    for (const field of REQUIRED_FIELDS) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
        errors.push(`${filePath}: missing required field '${field}'`);
      }
    }
    if (byRoute.has(data.permalink)) errors.push(`${filePath}: duplicate permalink '${data.permalink}'`);
    byRoute.set(data.permalink, page);
    if (data.lang === "zh" && !String(data.permalink).startsWith("/zh/")) {
      errors.push(`${filePath}: zh page must use a /zh/ route`);
    }
    if (data.lang === "en" && String(data.permalink).startsWith("/zh/")) {
      errors.push(`${filePath}: English page cannot use a /zh/ route`);
    }
  }

  const actualRoutes = [...byRoute.keys()];
  for (const route of REQUIRED_ROUTES) {
    if (!byRoute.has(route)) errors.push(`pages: missing required route '${route}'`);
  }
  for (const route of actualRoutes) {
    if (!REQUIRED_ROUTES.includes(route)) errors.push(`pages: unexpected formal route '${route}'`);
  }

  for (const page of formal) {
    const target = byRoute.get(page.data.counterpart);
    if (!target) {
      errors.push(`${page.filePath}: counterpart '${page.data.counterpart}' does not exist`);
    } else {
      if (target.data.counterpart !== page.data.permalink) {
        errors.push(`${page.filePath}: counterpart mapping is not mutual`);
      }
      if (target.data.lang === page.data.lang) {
        errors.push(`${page.filePath}: counterpart must use the other language`);
      }
    }
  }

  if (auxiliary.length !== 1) {
    errors.push(`pages: expected exactly one /404.html page, found ${auxiliary.length}`);
  } else {
    const errorPage = auxiliary[0];
    for (const [key, value] of Object.entries(ERROR_PAGE)) {
      if (errorPage.data[key] !== value) errors.push(`${errorPage.filePath}: '${key}' must equal '${value}'`);
    }
    if (Object.hasOwn(errorPage.data, "counterpart")) {
      errors.push(`${errorPage.filePath}: 404 must not declare a counterpart`);
    }
  }
  return errors;
}

export function validateNavigation(navigation, pages) {
  const errors = [];
  const routes = new Set(pages.map(({ data }) => data.permalink));
  if (!navigation || typeof navigation !== "object") return ["_data/navigation.yml: expected a mapping"];
  const menuNames = Object.keys(navigation);
  if (menuNames.length !== 2 || !menuNames.includes("main_en") || !menuNames.includes("main_zh")) {
    errors.push("_data/navigation.yml: only main_en and main_zh menus are permitted");
  }
  for (const menuName of ["main_en", "main_zh"]) {
    const menu = navigation[menuName];
    if (!Array.isArray(menu)) {
      errors.push(`_data/navigation.yml: ${menuName} must be a list`);
      continue;
    }
    const keys = menu.map((item) => item?.key);
    if (JSON.stringify(keys) !== JSON.stringify(NAV_KEYS)) {
      errors.push(`_data/navigation.yml: ${menuName} keys must be ${NAV_KEYS.join(", ")}`);
    }
    for (const item of menu) {
      if (!item?.title || !item?.url) errors.push(`_data/navigation.yml: ${menuName} items require title and url`);
      if (menuName === "main_en" && String(item?.url).startsWith("/zh/")) {
        errors.push(`_data/navigation.yml: English menu mixes a zh route '${item.url}'`);
      }
      if (menuName === "main_zh" && !String(item?.url).startsWith("/zh/")) {
        errors.push(`_data/navigation.yml: Chinese menu must target zh routes, received '${item?.url}'`);
      }
      if (item?.url && !routes.has(item.url)) errors.push(`_data/navigation.yml: target '${item.url}' is not declared`);
    }
  }
  const enKeys = navigation.main_en?.map((item) => item.key) ?? [];
  const zhKeys = navigation.main_zh?.map((item) => item.key) ?? [];
  if (JSON.stringify(enKeys) !== JSON.stringify(zhKeys)) errors.push("_data/navigation.yml: menu keys/order differ by language");
  return errors;
}

export function validateSiteContract({ pages, navigation }) {
  return [...validatePages(pages), ...validateNavigation(navigation, pages)];
}
