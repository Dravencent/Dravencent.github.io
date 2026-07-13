import test from "node:test";
import assert from "node:assert/strict";

import { EXPECTED_BUILT_FILES } from "./fixtures/expected-built-files.mjs";
import { validateBuiltSite } from "../scripts/lib/built-site-validation.mjs";

test("generated-site validator rejects missing and unexpected output", () => {
  const errors = validateBuiltSite({ fileMap: new Map(), expectedFiles: EXPECTED_BUILT_FILES });
  assert.ok(errors.some((error) => error.includes("Missing output")));

  const fileMap = new Map(EXPECTED_BUILT_FILES.map((path) => [path, ""]));
  fileMap.set("unexpected.txt", "template");
  const extraErrors = validateBuiltSite({ fileMap, expectedFiles: EXPECTED_BUILT_FILES });
  assert.ok(extraErrors.some((error) => error.includes("Unexpected output")));
});
