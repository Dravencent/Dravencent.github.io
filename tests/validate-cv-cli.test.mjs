import test from "node:test";
import assert from "node:assert/strict";
import { basename } from "node:path";

import { loadAcademicData, main } from "../scripts/validate-cv.mjs";

function outputBuffer() {
  let value = "";
  return {
    write(chunk) {
      value += String(chunk);
    },
    text() {
      return value;
    },
  };
}

function minimalInvalidData() {
  return {
    profile: {
      name: { en: "Yu Zhan", zh: "" },
      education: [],
      research_directions: [],
    },
    publications: [
      {
        id: "broken",
        title: "Placeholder",
        authors: [],
        journal: "Journal",
        year: 2026,
        doi: "bad-doi",
        selected: false,
        first_author: false,
      },
    ],
    awards: [],
  };
}

test("CLI aggregates path-aware validation failures and returns one", async () => {
  const stdout = outputBuffer();
  const stderr = outputBuffer();

  const exitCode = await main({
    loadData: async () => minimalInvalidData(),
    stdout,
    stderr,
  });

  assert.equal(exitCode, 1);
  assert.equal(stdout.text(), "");
  assert.match(stderr.text(), /profile\.biography\.en:/u);
  assert.match(stderr.text(), /profile\.education:/u);
  assert.match(stderr.text(), /publications\[0\]\.authors:/u);
  assert.match(stderr.text(), /awards:/u);
  assert.ok(stderr.text().trim().split(/\r?\n/u).length > 4, "all diagnostics are printed");
});

test("CLI prints the exact success line for injected valid data", async () => {
  const stdout = outputBuffer();
  const stderr = outputBuffer();
  const validData = {
    profile: { education: [] },
    publications: Array.from({ length: 8 }),
    awards: Array.from({ length: 6 }),
  };

  const exitCode = await main({
    loadData: async () => validData,
    validate: () => [],
    stdout,
    stderr,
  });

  assert.equal(exitCode, 0);
  assert.equal(
    stdout.text(),
    "Validated 8 publications, 6 awards, and 3 research directions.\n",
  );
  assert.equal(stderr.text(), "");
});

test("CLI converts loader failures to a path-aware diagnostic", async () => {
  const stdout = outputBuffer();
  const stderr = outputBuffer();
  const exitCode = await main({
    loadData: async () => {
      throw new Error("cannot read YAML");
    },
    stdout,
    stderr,
  });

  assert.equal(exitCode, 1);
  assert.equal(stdout.text(), "");
  assert.equal(stderr.text(), "data: cannot read YAML\n");
});

test("default loader reads only the three canonical YAML files", async () => {
  const requested = [];
  const data = await loadAcademicData({
    cwd: "D:\\Doctor\\Code\\CV",
    read: async (path) => {
      requested.push(basename(path));
      return basename(path) === "profile.yml" ? "{}" : "[]";
    },
  });

  assert.deepEqual(requested, ["profile.yml", "publications.yml", "awards.yml"]);
  assert.deepEqual(Object.keys(data), ["profile", "publications", "awards"]);
});
