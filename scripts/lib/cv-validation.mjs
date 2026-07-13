const EXPECTED_PUBLICATION_IDS = [
  "zhan-2026-ai-high-voltage-electrolytes",
  "zhan-2024-dual-layer-sei",
  "yang-2026-interphase-activators",
  "zhai-2026-coulometric-screening",
  "long-2026-deep-eutectic-interlayer",
  "chen-2025-nicotinamide-zinc-air",
  "ge-2021-green-polymer-electrolyte",
  "liu-2020-waterborne-polyurethane",
];

const EXPECTED_DOIS = [
  "10.1039/D4CS01250J",
  "10.1016/j.cej.2024.151974",
  "10.1016/j.scib.2026.06.039",
  "10.1016/j.jcis.2026.140359",
  "10.1002/adfm.202513024",
  "10.1021/acs.nanolett.5c01562",
  "10.1002/app.50945",
  "10.3390/polym12071513",
];

const EXPECTED_AWARD_IDS = [
  "bit-student-honoree-2026",
  "zero-carbon-future-second-prize-2025",
  "beijing-student-innovation-third-2025",
  "energy-equipment-design-third-2025",
  "national-ai-innovation-grand-2025",
  "china-international-innovation-2024",
];

const EXPECTED_AWARD_DATES = ["2026-04", "2025-11", "2025-09", "2025-09", "2025-06", "2024-09"];
const EXPECTED_DIRECTION_IDS = [
  "data-driven-electrolyte-screening",
  "novel-lithium-salt-design",
  "electrolyte-interfaces-and-stability",
];
const EXPECTED_EDUCATION = [
  ["bit-phd-materials", "2024-09", "present"],
  ["bit-ms-materials", "2021-09", "2024-06"],
  ["bit-beng-polymer-materials", "2017-09", "2021-06"],
];
const EXPECTED_SKILLS = ["Python", "Gaussian", "ORCA", "CP2K", "GROMACS"];

const ALLOWED_PUBLIC_URLS = new Set([
  "https://github.com/Dravencent",
  "https://orcid.org/0009-0007-9163-9385",
  "https://mse.bit.edu.cn/szdw/jgml/nyyhjclxg/821e424420484a409c4721ca7512e8ad.htm",
  "https://bit-battery.com.cn/index.php",
]);

const FORBIDDEN_KEYS = new Set([
  "qq",
  "qq_email",
  "google_scholar",
  "google_scholar_url",
  "phone",
  "telephone",
  "address",
  "location",
  "certificate",
  "certificate_number",
  "certificate_path",
  "qr",
  "qr_code",
  "qrcode",
  "signature",
]);

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const DOI = /^10\.\d{4,9}\/\S+$/u;
const YEAR_MONTH = /^\d{4}-(?:0[1-9]|1[0-2])$/u;
const PUBLICATION_REQUIRED_KEYS = [
  "id", "title", "authors", "journal", "year", "doi", "selected", "first_author",
];

function add(errors, path, message) {
  errors.push(`${path}: ${message}`);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateExactKeys(value, allowedKeys, path, errors) {
  if (!isPlainObject(value)) {
    add(errors, path, "must be an object");
    return false;
  }
  const allowed = new Set(allowedKeys);
  const unexpected = [];
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      unexpected.push(key);
      add(errors, `${path}.${key}`, "field is not part of the public CV schema");
    }
  }
  if (unexpected.length > 0) add(errors, path, `contains unsupported fields: ${unexpected.join(", ")}`);
  return true;
}

function validateString(value, path, errors) {
  if (typeof value !== "string" || value.trim() === "") {
    add(errors, path, "must be a non-empty string");
    return false;
  }
  validatePublicString(value, path, errors);
  return true;
}

function validateBilingual(value, path, errors) {
  if (!isPlainObject(value)) {
    add(errors, path, "must be an object");
    add(errors, `${path}.en`, "is required");
    add(errors, `${path}.zh`, "is required");
    return;
  }
  validateExactKeys(value, ["en", "zh"], path, errors);
  validateString(value.en, `${path}.en`, errors);
  validateString(value.zh, `${path}.zh`, errors);
}

function validateId(value, path, errors) {
  if (!validateString(value, path, errors)) return;
  if (!KEBAB_CASE.test(value)) add(errors, path, "must be a stable kebab-case ID");
}

function validatePublicString(value, path, errors) {
  const forbiddenFragments = [
    [/\uFFFD|�/u, "contains the Unicode replacement character"],
    [/(?:Ã|Â|â€|ï¿½|ðŸ)/u, "contains a common mojibake fragment"],
    [/\b(?:TODO|TBD|PLACEHOLDER)\b|Lorem ipsum|Your Name/iu, "contains placeholder text"],
    [/\b\d{5,16}@qq\.com\b/iu, "contains a QQ email address"],
    [/Google Scholar/iu, "references an unconfigured Google Scholar profile"],
    [/example\.com/iu, "contains a placeholder domain"],
    [/\b[a-z]:[\\/]/iu, "contains a local Windows path"],
  ];
  for (const [pattern, message] of forbiddenFragments) {
    if (pattern.test(value)) add(errors, path, message);
  }
  const embeddedUrls = value.match(/https?:\/\/[^\s<>"']+/giu) ?? [];
  for (const candidate of embeddedUrls) {
    const url = candidate.replace(/[),.;!?]+$/u, "");
    if (!ALLOWED_PUBLIC_URLS.has(url)) {
      add(errors, path, `URL is not in the approved public-link allowlist: ${url}`);
    }
  }
}

function validatePrivacy(value, path, errors) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validatePrivacy(item, `${path}[${index}]`, errors));
    return;
  }
  if (isPlainObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      const normalized = key.toLowerCase();
      if (
        FORBIDDEN_KEYS.has(normalized)
        || /(?:certificate|qrcode|qr_code|signature)/iu.test(normalized)
      ) {
        add(errors, `${path}.${key}`, "private or unsupported public field is forbidden");
      }
      validatePrivacy(child, `${path}.${key}`, errors);
    }
    return;
  }
  if (typeof value === "string") validatePublicString(value, path, errors);
}

function validateUniqueIds(records, path, errors) {
  const seen = new Set();
  records.forEach((record, index) => {
    const id = record?.id;
    validateId(id, `${path}[${index}].id`, errors);
    if (typeof id === "string") {
      if (seen.has(id)) add(errors, `${path}[${index}].id`, `duplicates ${id}`);
      seen.add(id);
    }
  });
}

function validateExpectedOrder(records, expectedIds, path, errors) {
  let mismatch = false;
  records.forEach((record, index) => {
    if (index < expectedIds.length && record?.id !== expectedIds[index]) {
      mismatch = true;
      add(errors, `${path}[${index}]`, `record must be ${expectedIds[index]} at this position`);
      add(errors, `${path}[${index}].id`, `must be ${expectedIds[index]} at this position`);
    }
  });
  if (mismatch) add(errors, path, "must use the approved canonical order");
}

export function validatePublications(publications) {
  const errors = [];
  if (!Array.isArray(publications)) {
    add(errors, "publications", "must be an array");
    return errors;
  }
  if (publications.length !== 8) add(errors, "publications", "must contain exactly 8 records");
  validateUniqueIds(publications, "publications", errors);
  validateExpectedOrder(publications, EXPECTED_PUBLICATION_IDS, "publications", errors);

  publications.forEach((publication, index) => {
    const path = `publications[${index}]`;
    if (!validateExactKeys(
      publication,
      [...PUBLICATION_REQUIRED_KEYS, "volume", "issue", "pages", "article_number"],
      path,
      errors,
    )) return;
    for (const key of PUBLICATION_REQUIRED_KEYS) {
      if (!(key in publication)) add(errors, `${path}.${key}`, "is required");
    }
    validateString(publication.title, `${path}.title`, errors);
    validateString(publication.journal, `${path}.journal`, errors);
    if (!Number.isInteger(publication.year)) add(errors, `${path}.year`, "must be an integer");

    if (!Array.isArray(publication.authors) || publication.authors.length === 0) {
      add(errors, `${path}.authors`, "must be a non-empty ordered array");
    } else {
      publication.authors.forEach((author, authorIndex) => {
        validateString(author, `${path}.authors[${authorIndex}]`, errors);
      });
      if (!publication.authors.includes("Yu Zhan")) add(errors, `${path}.authors`, "must include Yu Zhan");
    }

    if (typeof publication.doi !== "string" || !DOI.test(publication.doi)) {
      add(errors, `${path}.doi`, "must be a bare DOI matching 10.<registrant>/<suffix>");
    }
    if (index < EXPECTED_DOIS.length && publication.doi !== EXPECTED_DOIS[index]) {
      add(errors, `${path}.doi`, `must be ${EXPECTED_DOIS[index]} at this position`);
    }
    if (typeof publication.selected !== "boolean") add(errors, `${path}.selected`, "must be boolean");
    if (typeof publication.first_author !== "boolean") add(errors, `${path}.first_author`, "must be boolean");

    const expectedFirstAuthor = publication.authors?.[0] === "Yu Zhan";
    if (publication.first_author !== expectedFirstAuthor) {
      add(errors, `${path}.first_author`, "must equal whether Yu Zhan is the first ordered author");
    }
    const shouldBeSelected = index < 4;
    if (publication.selected !== shouldBeSelected) {
      add(errors, `${path}.selected`, `must be ${shouldBeSelected} for the approved selected set`);
    }
    for (const optional of ["volume", "issue", "pages", "article_number"]) {
      if (optional in publication) validateString(publication[optional], `${path}.${optional}`, errors);
    }
  });

  if (publications.filter((publication) => isPlainObject(publication) && publication.first_author === true).length !== 2) {
    add(errors, "publications", "must contain exactly 2 first-author records");
  }
  if (publications.filter((publication) => isPlainObject(publication) && publication.selected === true).length !== 4) {
    add(errors, "publications", "must contain exactly 4 selected records");
  }
  validatePrivacy(publications, "publications", errors);
  return errors;
}

export function validateProfile(profile, publicationIds = new Set()) {
  const errors = [];
  if (!validateExactKeys(
    profile,
    [
      "name", "headline", "role", "institution", "biography", "contact", "links",
      "supervisor", "team", "education", "skills", "research_directions",
    ],
    "profile",
    errors,
  )) return errors;

  for (const field of ["name", "headline", "role", "institution", "biography"]) {
    validateBilingual(profile[field], `profile.${field}`, errors);
  }

  if (validateExactKeys(profile.contact, ["email"], "profile.contact", errors)) {
    if (profile.contact.email !== "3120245693@bit.edu.cn") {
      add(errors, "profile.contact.email", "must be the approved BIT campus email");
    }
  }
  if (validateExactKeys(profile.links, ["github", "orcid"], "profile.links", errors)) {
    const expected = {
      github: "https://github.com/Dravencent",
      orcid: "https://orcid.org/0009-0007-9163-9385",
    };
    for (const [key, value] of Object.entries(expected)) {
      if (profile.links[key] !== value) add(errors, `profile.links.${key}`, `must be ${value}`);
    }
  }
  if (validateExactKeys(profile.supervisor, ["name", "url"], "profile.supervisor", errors)) {
    validateBilingual(profile.supervisor.name, "profile.supervisor.name", errors);
    const expected = "https://mse.bit.edu.cn/szdw/jgml/nyyhjclxg/821e424420484a409c4721ca7512e8ad.htm";
    if (profile.supervisor.url !== expected) add(errors, "profile.supervisor.url", `must be ${expected}`);
  }
  if (validateExactKeys(profile.team, ["name", "url"], "profile.team", errors)) {
    validateBilingual(profile.team.name, "profile.team.name", errors);
    const expected = "https://bit-battery.com.cn/index.php";
    if (profile.team.url !== expected) add(errors, "profile.team.url", `must be ${expected}`);
  }

  errors.push(...validateEducation(profile.education, "profile.education"));

  if (!Array.isArray(profile.skills) || JSON.stringify(profile.skills) !== JSON.stringify(EXPECTED_SKILLS)) {
    add(errors, "profile.skills", `must be exactly ${EXPECTED_SKILLS.join(", ")} in that order`);
  }

  const directions = profile.research_directions;
  if (!Array.isArray(directions)) {
    add(errors, "profile.research_directions", "must be an array");
  } else {
    if (directions.length !== 3) {
      add(errors, "profile.research_directions", "must contain exactly 3 doctoral research directions");
    }
    validateUniqueIds(directions, "profile.research_directions", errors);
    validateExpectedOrder(directions, EXPECTED_DIRECTION_IDS, "profile.research_directions", errors);
    const knownIds = publicationIds instanceof Set ? publicationIds : new Set(publicationIds);
    directions.forEach((direction, index) => {
      const path = `profile.research_directions[${index}]`;
      if (!validateExactKeys(
        direction,
        ["id", "title", "description", "status", "related_publication_ids"],
        path,
        errors,
      )) return;
      validateBilingual(direction.title, `${path}.title`, errors);
      validateBilingual(direction.description, `${path}.description`, errors);
      validateBilingual(direction.status, `${path}.status`, errors);
      if (direction.id === "novel-lithium-salt-design" && direction.status?.en !== "ongoing") {
        add(errors, `${path}.status.en`, "must remain ongoing until publishable results exist");
      }
      if (!Array.isArray(direction.related_publication_ids)) {
        add(errors, `${path}.related_publication_ids`, "must be an array");
      } else {
        direction.related_publication_ids.forEach((id, referenceIndex) => {
          if (!knownIds.has(id)) {
            add(errors, `${path}.related_publication_ids[${referenceIndex}]`, `unknown publication ID ${id}`);
          }
        });
      }
    });
  }
  validatePrivacy(profile, "profile", errors);
  return errors;
}

export function validateEducation(education, path = "profile.education") {
  const errors = [];
  if (!Array.isArray(education)) {
    add(errors, path, "must be an array");
    return errors;
  }
  if (education.length !== 3) add(errors, path, "must contain exactly 3 records");
  validateUniqueIds(education, path, errors);
  validateExpectedOrder(education, EXPECTED_EDUCATION.map(([id]) => id), path, errors);

  education.forEach((record, index) => {
    const recordPath = `${path}[${index}]`;
    if (!validateExactKeys(
      record,
      ["id", "degree", "institution", "start_date", "end_date"],
      recordPath,
      errors,
    )) return;
    validateBilingual(record.degree, `${recordPath}.degree`, errors);
    validateBilingual(record.institution, `${recordPath}.institution`, errors);
    const expected = EXPECTED_EDUCATION[index];
    if (expected) {
      if (record.start_date !== expected[1]) add(errors, `${recordPath}.start_date`, `must be ${expected[1]}`);
      if (record.end_date !== expected[2]) add(errors, `${recordPath}.end_date`, `must be ${expected[2]}`);
    }
  });
  validatePrivacy(education, path, errors);
  return errors;
}

export function validateAwards(awards) {
  const errors = [];
  if (!Array.isArray(awards)) {
    add(errors, "awards", "must be an array");
    return errors;
  }
  if (awards.length !== 6) add(errors, "awards", "must contain exactly 6 records");
  validateUniqueIds(awards, "awards", errors);
  validateExpectedOrder(awards, EXPECTED_AWARD_IDS, "awards", errors);

  awards.forEach((award, index) => {
    const path = `awards[${index}]`;
    if (!validateExactKeys(
      award,
      [
        "id", "date", "year", "official_title_zh", "award_level", "role",
        "english_descriptor", "project_title", "issuing_body",
      ],
      path,
      errors,
    )) return;
    if (typeof award.date !== "string" || !YEAR_MONTH.test(award.date)) {
      add(errors, `${path}.date`, "must use YYYY-MM");
    }
    if (!Number.isInteger(award.year)) add(errors, `${path}.year`, "must be an integer");
    if (typeof award.date === "string" && Number(award.date.slice(0, 4)) !== award.year) {
      add(errors, `${path}.year`, "must match the year in date");
    }
    if (index < EXPECTED_AWARD_DATES.length && award.date !== EXPECTED_AWARD_DATES[index]) {
      add(errors, `${path}.date`, `must be ${EXPECTED_AWARD_DATES[index]} at this position`);
    }
    validateString(award.official_title_zh, `${path}.official_title_zh`, errors);
    validateBilingual(award.award_level, `${path}.award_level`, errors);
    validateBilingual(award.role, `${path}.role`, errors);
    validateString(award.english_descriptor, `${path}.english_descriptor`, errors);
    if ("project_title" in award) validateString(award.project_title, `${path}.project_title`, errors);
    if ("issuing_body" in award) validateBilingual(award.issuing_body, `${path}.issuing_body`, errors);
  });

  for (let index = 1; index < awards.length; index += 1) {
    if (typeof awards[index - 1]?.date === "string" && typeof awards[index]?.date === "string"
      && awards[index - 1].date < awards[index].date) {
      add(errors, "awards", "must be reverse chronological");
      break;
    }
  }
  validatePrivacy(awards, "awards", errors);
  return errors;
}

export function validateAcademicData(data = {}) {
  const dataErrors = [];
  if (!validateExactKeys(data, ["profile", "publications", "awards"], "data", dataErrors)) {
    return dataErrors;
  }
  const { profile, publications, awards } = data;
  const publicationErrors = validatePublications(publications);
  const publicationIds = new Set(
    Array.isArray(publications)
      ? publications.filter(isPlainObject).map(({ id }) => id)
      : [],
  );
  return [
    ...dataErrors,
    ...publicationErrors,
    ...validateProfile(profile, publicationIds),
    ...validateAwards(awards),
  ];
}
