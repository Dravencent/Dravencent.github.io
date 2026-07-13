import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  validateAcademicData,
  validateAwards,
  validateEducation,
  validateProfile,
  validatePublications,
} from "../scripts/lib/cv-validation.mjs";
import { approvedAcademicData } from "./fixtures/approved-academic-data.mjs";

const clone = (value) => structuredClone(value);

function assertHasPath(errors, path) {
  assert.ok(errors.some((error) => error.startsWith(`${path}:`)), `${path} appears in ${errors.join("\n")}`);
}

test("accepts the approved in-memory academic data", () => {
  assert.deepEqual(validateAcademicData(approvedAcademicData()), []);
});

test("publication validation reports schema, order, DOI, author, and flag violations together", () => {
  const publications = clone(approvedAcademicData().publications);
  publications[0].id = "Not stable";
  publications[1].id = publications[0].id;
  publications[2].doi = "https://doi.org/not-a-doi";
  publications[2].authors = ["Nan Chen"];
  publications[2].first_author = true;
  publications[4].selected = true;
  publications.pop();

  const errors = validatePublications(publications);
  assertHasPath(errors, "publications");
  assertHasPath(errors, "publications[0].id");
  assertHasPath(errors, "publications[1].id");
  assertHasPath(errors, "publications[2].doi");
  assertHasPath(errors, "publications[2].authors");
  assertHasPath(errors, "publications[2].first_author");
  assertHasPath(errors, "publications[4].selected");
});

test("profile validation requires education and complete bilingual doctoral-only content", () => {
  const { profile, publications } = approvedAcademicData();
  delete profile.biography.zh;
  profile.research_directions[0].related_publication_ids.push("unknown-publication");
  profile.research_directions[1].status.en = "complete";
  profile.research_directions.pop();
  profile.education.pop();

  const errors = validateProfile(profile, new Set(publications.map(({ id }) => id)));
  assertHasPath(errors, "profile.biography.zh");
  assertHasPath(errors, "profile.education");
  assertHasPath(errors, "profile.research_directions");
  assertHasPath(errors, "profile.research_directions[0].related_publication_ids[2]");
  assertHasPath(errors, "profile.research_directions[1].status.en");
});

test("education validation enforces the three approved degrees and chronological ranges", () => {
  const education = clone(approvedAcademicData().profile.education);
  education[0].end_date = "2026-06";
  education[1].gpa = "4.0";
  education.reverse();

  const errors = validateEducation(education, "profile.education");
  assertHasPath(errors, "profile.education");
  assertHasPath(errors, "profile.education[0]");
  assert.ok(errors.some((error) => error.includes("gpa")), errors.join("\n"));
});

test("award validation enforces exact dates, Chinese project titles, roles, and ordering", () => {
  const awards = clone(approvedAcademicData().awards);
  awards[0].date = "April 2026";
  awards[1].year = 2024;
  awards[2].id = awards[1].id;
  awards[3].project_title = "";
  awards[4].issuing_body = null;
  [awards[4], awards[5]] = [awards[5], awards[4]];

  const errors = validateAwards(awards);
  assertHasPath(errors, "awards[0].date");
  assertHasPath(errors, "awards[1].year");
  assertHasPath(errors, "awards[2].id");
  assertHasPath(errors, "awards[3].project_title");
  assertHasPath(errors, "awards[5].issuing_body");
  assertHasPath(errors, "awards");
});

test("profile validation pins public links, campus email, and the five approved skills", () => {
  const { profile, publications } = approvedAcademicData();
  profile.contact.email = "not-campus@bit.edu.cn";
  profile.links.google_scholar = "https://scholar.google.com/example";
  profile.supervisor.url = "https://example.com/profile";
  profile.skills.push("MATLAB");

  const errors = validateProfile(profile, new Set(publications.map(({ id }) => id)));
  assertHasPath(errors, "profile.contact.email");
  assertHasPath(errors, "profile.links");
  assertHasPath(errors, "profile.supervisor.url");
  assertHasPath(errors, "profile.skills");
});

test("privacy validation rejects generic QQ mail, private fields, placeholders, and mojibake", () => {
  const data = approvedAcademicData();
  const syntheticQqAddress = `${"0".repeat(16)}@${"qq"}.com`;
  data.profile.phone = "+00 000 0000";
  data.profile.address = "TODO";
  data.profile.biography.en = `Contact ${syntheticQqAddress}`;
  data.awards[0].certificate_number = "TEST-ONLY";
  data.publications[0].publisher_url = "https://example.com/paper";

  const errors = validateAcademicData(data);
  assertHasPath(errors, "profile.phone");
  assertHasPath(errors, "profile.address");
  assertHasPath(errors, "profile.biography.en");
  assertHasPath(errors, "awards[0].certificate_number");
  assertHasPath(errors, "publications[0].publisher_url");
});

test("validator source contains no literal numeric QQ email address", async () => {
  const source = await readFile("scripts/lib/cv-validation.mjs", "utf8");
  assert.doesNotMatch(source.replaceAll("\\.", "."), /\b\d{5,16}@qq\.com\b/iu);
});

test("academic validation rejects legacy top-level education", () => {
  const data = approvedAcademicData();
  data.education = [];
  const errors = validateAcademicData(data);
  assertHasPath(errors, "data.education");
});

test("malformed publication and award records return path errors instead of throwing", () => {
  let publicationErrors;
  let awardErrors;
  assert.doesNotThrow(() => {
    publicationErrors = validatePublications([null, 7, "invalid-record"]);
    awardErrors = validateAwards([null, 7, "invalid-record"]);
  });
  assertHasPath(publicationErrors, "publications[0]");
  assertHasPath(publicationErrors, "publications[1]");
  assertHasPath(publicationErrors, "publications[2]");
  assertHasPath(awardErrors, "awards[0]");
  assertHasPath(awardErrors, "awards[1]");
  assertHasPath(awardErrors, "awards[2]");

  const data = approvedAcademicData();
  data.publications = [null];
  data.awards = [null];
  let aggregateErrors;
  assert.doesNotThrow(() => {
    aggregateErrors = validateAcademicData(data);
  });
  assertHasPath(aggregateErrors, "publications[0]");
  assertHasPath(aggregateErrors, "awards[0]");
});

test("privacy validation finds embedded external URLs and Windows paths", () => {
  const rejectedValues = [
    "Reference https://outside.invalid/resource within prose.",
    "Synthetic path d:\\synthetic\\private-file.txt",
    "Synthetic path D:/synthetic/private-file.txt",
    "Synthetic path e:/synthetic/private-file.txt",
  ];
  for (const value of rejectedValues) {
    const data = approvedAcademicData();
    data.profile.biography.en = value;
    const publicationIds = new Set(data.publications.map(({ id }) => id));
    const errors = validateProfile(data.profile, publicationIds);
    assertHasPath(errors, "profile.biography.en");
  }

  const allowed = approvedAcademicData();
  allowed.profile.biography.en = `Approved profile: ${allowed.profile.links.github}.`;
  const publicationIds = new Set(allowed.publications.map(({ id }) => id));
  const allowedErrors = validateProfile(allowed.profile, publicationIds);
  assert.ok(
    !allowedErrors.some((error) => error.startsWith("profile.biography.en:")),
    allowedErrors.join("\n"),
  );
});
