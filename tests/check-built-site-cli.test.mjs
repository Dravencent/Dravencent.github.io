import test from "node:test";
import assert from "node:assert/strict";

import { main } from "../scripts/check-built-site.mjs";

function stream() {
  let value = "";
  return { write(chunk) { value += chunk; }, read() { return value; } };
}

test("built-site CLI aggregates errors and prints deterministic success", async () => {
  const stderr = stream();
  assert.equal(await main({
    loadSite: async () => ({}), validate: () => ["one", "two"],
    stdout: stream(), stderr,
  }), 1);
  assert.equal(stderr.read(), "one\ntwo\n");

  const stdout = stream();
  assert.equal(await main({
    loadSite: async () => ({}), validate: () => [], stdout, stderr: stream(),
  }), 0);
  assert.equal(stdout.read(), "Built site passed: 11 content routes, bilingual metadata, internal links, publications, honors, and privacy checks are valid.\n");
});
