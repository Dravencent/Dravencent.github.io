# Streamline CV Page Copy

Date: 2026-07-13

## Scope

- Change the national AI competition award role from `共同获奖人 / Co-recipient` to `项目负责人 / Project Lead`.
- Keep page `description` metadata for SEO, but hide it visually on the English and Chinese Publications, Honors, and CV pages.
- Remove the additional explanatory lead paragraph from both Publications pages and both Honors pages.
- Keep Research page descriptions unchanged.

## Implementation

- Add `show_description: false` to the six affected page front matters.
- Render the academic page description only when `show_description` is not false.
- Update canonical award data and its frozen test fixture in both languages.
- Add regression assertions for bilingual visibility and award-role wording.

## Acceptance

- The six affected pages show their title followed directly by their content.
- SEO descriptions remain present in generated metadata.
- The AI competition record displays `项目负责人` in Chinese and `Project Lead` in English.
- Local tests and the Jekyll build pass before deployment.
