import test from "node:test";
import assert from "node:assert/strict";

import { main } from "../scripts/validate-site-contract.mjs";

function stream() {
  let value = "";
  return { write(chunk) { value += chunk; }, read() { return value; } };
}

test("site-contract CLI reports aggregated findings and deterministic success", async () => {
  const stdout = stream();
  const stderr = stream();
  assert.equal(await main({
    loadContract: async () => ({ pages: [], navigation: {} }),
    validate: () => ["first", "second"], stdout, stderr,
  }), 1);
  assert.equal(stderr.read(), "first\nsecond\n");

  const okOut = stream();
  assert.equal(await main({
    loadContract: async () => ({ pages: [], navigation: {} }),
    validate: () => [], stdout: okOut, stderr: stream(),
  }), 0);
  assert.equal(okOut.read(), "Validated 10 bilingual routes, 5 mutual counterpart pairs, and 2 language-specific menus.\n");
});
