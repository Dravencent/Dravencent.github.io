# Streamline CV Page Copy Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove redundant visible page copy from the bilingual Publications, Honors, and CV pages while preserving SEO metadata and correcting the national AI competition role.

**Architecture:** Keep each page's `description` in front matter as the SEO source of truth, and add a page-level `show_description: false` presentation flag. The shared academic layout conditionally renders the visible description; canonical award YAML and its independent fixture stay synchronized.

**Tech Stack:** Jekyll, Liquid, Markdown/YAML front matter, Node.js built-in test runner, `js-yaml`.

---

## Chunk 1: Regression coverage and implementation

### Task 1: Add failing presentation and role tests

**Files:**
- Modify: `tests/page-composition-contract.test.mjs`
- Modify: `tests/liquid-rendering-contract.test.mjs`
- Modify: `tests/fixtures/approved-academic-data.mjs`

- [ ] **Step 1: Add page-composition assertions**

Add a test that parses the six affected pages and asserts `data.show_description === false`; assert Publications and Honors bodies contain no `page-lead`. Add a Research control assertion that its front matter does not set `show_description: false` and its biography lead remains present.

- [ ] **Step 2: Add layout contract assertions**

Assert `_layouts/academic.html` still references `page.description` and conditionally checks `page.show_description`.

- [ ] **Step 3: Update the independent approved-data fixture**

Change the national AI competition role to `bilingual("Project Lead", "项目负责人")` and its descriptor to `National Finals Grand Prize, Graduate Division; Project Lead; June 2025.`

- [ ] **Step 4: Run focused tests and verify RED**

Run: `node --test tests/page-composition-contract.test.mjs tests/liquid-rendering-contract.test.mjs tests/academic-data-contract.test.mjs`

Expected: FAIL because the six flags, layout guard, and canonical award role have not yet been implemented.

### Task 2: Implement the minimal bilingual content change

**Files:**
- Modify: `_layouts/academic.html`
- Modify: `_pages/publications-en.md`
- Modify: `_pages/publications-zh.md`
- Modify: `_pages/honors-en.md`
- Modify: `_pages/honors-zh.md`
- Modify: `_pages/cv-en.md`
- Modify: `_pages/cv-zh.md`
- Modify: `_data/awards.yml`

- [ ] **Step 1: Guard visible description rendering**

Wrap the existing description paragraph in:

```liquid
{% unless page.show_description == false %}
    <p>{{ page.description }}</p>
{% endunless %}
```

- [ ] **Step 2: Configure the six affected pages**

Add `show_description: false` beside each existing `description` field on the Publications, Honors, and CV pages in both languages. Remove only the four `page-lead` paragraphs from Publications and Honors; leave Research unchanged.

- [ ] **Step 3: Correct canonical award wording**

Change `Co-recipient / 共同获奖人` to `Project Lead / 项目负责人` and update `english_descriptor` consistently.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `node --test tests/page-composition-contract.test.mjs tests/liquid-rendering-contract.test.mjs tests/academic-data-contract.test.mjs`

Expected: all focused tests PASS.

- [ ] **Step 5: Run full verification**

Run in order:

```powershell
npm.cmd test
npm.cmd run validate:data
npm.cmd run validate:site
npm.cmd run build
npm.cmd run check:built
git diff --check
```

Expected: all tests and validators pass, strict Jekyll build succeeds, built-site validation passes, and Git reports no whitespace errors.

- [ ] **Step 6: Commit and deploy**

Commit the implementation as `fix: streamline CV page copy`, push `master`, then verify the six live routes. In each route's `<main>`, the removed visible copy must be absent; meta descriptions must remain present; Honors must show `Project Lead / 项目负责人` and not the former role.
