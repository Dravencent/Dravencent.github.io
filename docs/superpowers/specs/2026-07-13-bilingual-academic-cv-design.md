# Bilingual Academic CV Website Design

Date: 2026-07-13
Repository: `Dravencent/Dravencent.github.io`
Local checkout: `D:\Doctor\Code\CV`
Status: Approved for implementation planning

## 1. Objective

Transform the existing Academic Pages fork into a rigorous, maintainable bilingual academic CV website for Yu Zhan. The public English homepage remains at `https://dravencent.github.io/`; a corresponding Chinese site is available under `/zh/`. The site must foreground Yu Zhan's doctoral research on the intelligent design of lithium-battery electrolytes, present verified academic outputs without overclaiming, and remain easy to update through structured data and local Git.

## 2. Design Decisions

- Preserve the current Jekyll and Academic Pages stack rather than rebuilding with a new framework.
- Use the selected Research-First Academic layout.
- Make English the root language and Chinese the `/zh/` language.
- Use separate static pages for each language, backed by shared structured data.
- Keep the existing illustration as the profile image, with an optimized derivative for the web.
- Keep the complete publication list together. Do not split research articles and reviews into separate categories.
- Place the two first-author works first, followed by co-authored works in reverse chronological order.
- Use a browser-printable CV page rather than maintaining a separate manually updated PDF in the first release.
- Publish from the local Git checkout after build, content, visual, and privacy verification.

## 3. Goals and Non-Goals

### Goals

- Communicate one precise research identity: intelligent design of lithium-battery electrolytes.
- Support complete English and Chinese navigation with one-click counterpart switching.
- Present eight verified publications and six verified honors accurately.
- Make authorship evident through author order and bold `Yu Zhan`, not promotional labels.
- Keep content reusable and synchronized through `_data` files.
- Provide responsive, accessible, print-friendly pages.
- Remove all Academic Pages demonstration content and placeholder metadata.

### Non-Goals

- No blog, teaching, talk map, portfolio, or contact form in the first release.
- No analytics, cookies, advertising, or unnecessary third-party scripts.
- No claim of an autonomous closed-loop laboratory, full battery-performance prediction, or completed results for unpublished lithium-salt work.
- No publication of award certificates, certificate numbers, QR codes, signatures, or other team members' personal data beyond what is necessary to identify a publication.
- No broad upstream theme synchronization during this implementation. The customized fork is changed only where required by this design.

## 4. Information Architecture

| Purpose | English route | Chinese route |
| --- | --- | --- |
| Research overview and selected work | `/` | `/zh/` |
| Research directions | `/research/` | `/zh/research/` |
| Complete publication list | `/publications/` | `/zh/publications/` |
| Honors and awards | `/honors/` | `/zh/honors/` |
| Academic CV | `/cv/` | `/zh/cv/` |

Each page declares its language and explicit counterpart URL in front matter. The language switcher links to the corresponding page rather than returning users to a generic landing page.

Navigation is language-aware. `_data/navigation.yml` exposes separate `main_en` and `main_zh` collections with the same stable item keys. The masthead selects the correct collection from `page.lang`; it must never mix English routes into the Chinese menu or Chinese routes into the English menu. Every bilingual page has a unique permalink, an existing counterpart, and a mutual mapping: if page A points to page B, page B points back to page A. These invariants are checked automatically before build.

## 5. Homepage Composition

The homepage uses this order:

1. Compact top navigation with Research, Publications, Honors, CV, and language switch.
2. Hero containing Yu Zhan's name, Ph.D. identity, research statement, selected academic links, and the current illustration.
3. Three research-direction cards.
4. Four selected publications.
5. Compact education timeline and links to the supervisor and team.
6. Minimal footer with copyright and repository link.

The homepage must not use publication counts, award counts, citation metrics, impact-factor badges, or promotional performance counters.

## 6. Research Narrative

### English headline

`Intelligent Design of Lithium-Battery Electrolytes`

### English biography

Yu Zhan is a Ph.D. student in Materials Science and Engineering at Beijing Institute of Technology and a member of the Advanced Energy Materials and Intelligent Battery Innovation Team under the supervision of Associate Professor Nan Chen. His research focuses on the intelligent design of lithium-battery electrolytes by integrating machine learning, computational methods, and electrochemical analysis, with particular interests in high-voltage stability, novel lithium salts, interfacial chemistry, and ion transport.

### Chinese biography

湛煜现为北京理工大学材料科学与工程专业博士研究生，是先进能源材料及智能电池创新团队成员，在陈楠副教授指导下开展研究。他的研究聚焦锂电池电解液的智能设计，结合机器学习、计算方法与电化学分析，重点关注高电压稳定性、新型锂盐、电解液界面化学和离子输运。

### Research directions

1. **Data-Driven Electrolyte Screening / 数据驱动的电解液筛选**
   Machine learning, molecular descriptors, and candidate-system screening.
   利用机器学习、分子描述符和数据驱动方法开展候选电解液体系的筛选与优先级排序。
2. **Novel Lithium Salt Design / 新型锂盐设计**
   An ongoing doctoral research direction involving molecular design and computational evaluation of novel lithium salts, with attention to solvation behavior, electrochemical stability, and interfacial compatibility. No unpublished performance result is stated.
   面向锂电池电解液开展新型锂盐的分子设计与计算评估，关注其溶剂化行为、电化学稳定性及界面相容性；在成果公开前不陈述未经发表的性能结论。
3. **Electrolyte Interfaces and Stability / 电解液界面与稳定性**
   High-voltage stability, SEI chemistry, solid and polymer electrolyte interfaces, and ion transport.
   研究高电压条件下的电解液稳定性、SEI化学、固态与聚合物电解质界面以及离子输运行为。

## 7. Identity and Academic Profile

- Name: Yu Zhan
- Current role: Ph.D. Student in Materials Science and Engineering
- Institution: Beijing Institute of Technology
- Supervisor: Associate Professor Nan Chen
- Team: Advanced Energy Materials and Intelligent Battery Innovation Team
- Institutional email: `3120245693@bit.edu.cn`
- GitHub: `https://github.com/Dravencent`
- ORCID: `https://orcid.org/0009-0007-9163-9385`
- Supervisor profile: `https://mse.bit.edu.cn/szdw/jgml/nyyhjclxg/821e424420484a409c4721ca7512e8ad.htm`
- Team website: `https://bit-battery.com.cn/index.php`
- Public skills: Python, Gaussian, ORCA, CP2K, GROMACS

The QQ email currently in the repository is removed from public display.

## 8. Education

- Ph.D. in Materials Science and Engineering, Beijing Institute of Technology, Sep 2024-present.
- M.S. in Materials Science and Engineering, Beijing Institute of Technology, Sep 2021-Jun 2024.
- B.Eng. in Polymer Materials and Engineering, Beijing Institute of Technology, Sep 2017-Jun 2021.

Only the doctoral research focus is expanded. Earlier research-project descriptions are removed so that the public narrative remains coherent.

### Research page composition

The English and Chinese Research pages expand the homepage cards without inventing a separate project portfolio. Each page contains:

1. the approved research statement;
2. one section for each of the three research directions;
3. a concise explanation of the scientific question and methods for each direction;
4. links to the relevant verified publications where evidence exists;
5. an explicit `ongoing direction` label for novel lithium-salt design until publishable results are available;
6. a methods and tools line containing Python, Gaussian, ORCA, CP2K, and GROMACS;
7. supervisor and team links.

The Research page does not claim unpublished quantitative performance, project leadership, or completed closed-loop experimentation.

### CV page composition

Both CV pages use the same section order:

1. identity, current appointment, institutional email, and academic profile links;
2. research interests, limited to the three approved doctoral directions;
3. Education;
4. Skills;
5. Publications, in the approved eight-record order;
6. Honors & Awards, in reverse chronological order;
7. supervisor and team affiliations.

The CV contains no master's or bachelor's project descriptions, no sample talks or teaching, and no unverified metrics. The print layout uses this same content rather than a second independently maintained data source.

## 9. Publication Model and Ordering

All publication records live in `_data/publications.yml`. Required fields are:

- stable `id`
- title
- ordered author list
- journal
- year
- volume, issue, pages, or article number when assigned
- DOI
- optional publisher URL only when it differs from the canonical DOI URL
- `selected` flag
- `first_author` metadata for internal ordering and validation
- optional bilingual one-sentence relevance note for selected works

Display rules:

- Render the complete ordered author list and bold `Yu Zhan`.
- Do not append first-author or co-author badges to the public citation.
- Derive the canonical publisher link as `https://doi.org/<doi>`; store a separate publisher URL only when a publisher-specific landing page is needed.
- Omit unavailable volume, issue, and page fields rather than rendering placeholders.
- Do not host publisher PDFs unless redistribution rights are confirmed.

Approved order:

1. Yu Zhan, Nan Chen, Li Li, Feng Wu, and Renjie Chen. *AI for battery-accelerated discovery of high-voltage electrolytes for advanced lithium batteries*. Chemical Society Reviews (2026). DOI `10.1039/D4CS01250J`.
2. Yu Zhan, Pengfei Zhai, Tinglu Song, Wen Yang, and Yuchuan Li. *Enhanced performance in lithium metal batteries: A dual-layer solid electrolyte interphase strategy via perfluoropolyether derivative additive*. Chemical Engineering Journal 491 (2024): 151974. DOI `10.1016/j.cej.2024.151974`.
3. Binbin Yang, Nan Chen, Yu Zhan, Jun Wei, Liyuan Zhao, Ningning Wu, Yusheng Ye, Dingguo Xia, Feng Wu, and Renjie Chen. *Interphase activators for continuous Li+ transport in garnet-polymer composite solid electrolytes at room temperature*. Science Bulletin (2026). DOI `10.1016/j.scib.2026.06.039`.
4. Pengfei Zhai, Yu Zhan, Zidan Cao, and Heng Mao. *Screening additive for stable solid electrolyte interphase in polymer lithium battery by coulometric titration time analysis*. Journal of Colloid and Interface Science 716 (2026): 140359. DOI `10.1016/j.jcis.2026.140359`.
5. Sihong Long, Boshun Gui, Chengjie Li, Binbin Yang, Lipu Sun, Yu Zhan, Chuhuai Huang, Jianing Tian, Feng Wu, Nan Chen, and Renjie Chen. *Deep Eutectic Interlayer Design for Stability Enhancement in LLZTO Solid-State Lithium Batteries*. Advanced Functional Materials 36, no. 8 (2026): e13024. DOI `10.1002/adfm.202513024`.
6. Nuo Chen, Jingning Lai, Fengling Zhang, Wen Sun, Bohua Li, Lipu Sun, Yu Zhan, Jixiang Wang, Nan Chen, Li Li, Feng Wu, and Renjie Chen. *Nicotinamide Solid Cosolvent Enhanced Two-Electron Zinc Peroxide Chemistry for Stable Neutral Zinc-Air Batteries*. Nano Letters 25, no. 27 (2025): 10770-10777. DOI `10.1021/acs.nanolett.5c01562`.
7. Zhen Ge, Xiaoli Liu, Xiaobin Zou, Yu Zhan, and Yunjun Luo. *Preparation and properties of a novel green solid polymer electrolyte for all-solid-state lithium battery*. Journal of Applied Polymer Science 138, no. 37 (2021): 50945. DOI `10.1002/app.50945`.
8. Xiaoli Liu, Yu Zhan, Chenying Zhao, Yuefeng Su, Zhen Ge, and Yunjun Luo. *A novel polymer electrolyte matrix incorporating ionic liquid into waterborne polyurethane for lithium-ion battery*. Polymers 12, no. 7 (2020): 1513. DOI `10.3390/polym12071513`.

The homepage selects records 1, 2, 3, and 4. All eight records have a DOI and therefore must render a working canonical DOI link.

## 10. Honors and Awards

All honors live in `_data/awards.yml`. Required fields are stable `id`, year, official Chinese title, award level, role, issuing body when confirmed, optional project title, and a concise English descriptor.

Language rules:

- Chinese pages use the exact official Chinese event and award names.
- English pages retain the official Chinese event name and add only a short English explanation of award level, scope, role, and year.
- Team awards explicitly say `Team Member` or `Co-recipient`.
- The BIT recognition is presented as a university honor, not a ranked competition award.

Verified honors:

1. 北京理工大学第十五届“青年盛典”暨2026年学生表彰大会 - student honoree, Apr 2026.
2. 第五届零碳未来创新大赛二等奖 - team member, Nov 2025.
3. 第四届北京大学生创新创业大赛科技创新赛道三等奖 - team member, Sep 2025.
4. 第十二届中国研究生能源装备创新设计大赛三等奖 - team member, Sep 2025. Project: 冷能引擎--为“锂”定制的极寒电解液.
5. 首届全国人工智能应用创新大赛通用赛道全国赛研究生组特等奖 - co-recipient, Jun 2025. Project: 自选主题的大模型Agent创新应用设计.
6. 中国国际大学生创新大赛（2024）北京赛区二等奖 - team member, Sep 2024. Project: 高比能、宽温域的固态电池在新能源汽车领域的研发与应用.

The complete CV and Honors page show all six in reverse chronological order. Honors are not repeated on the homepage; the persistent navigation provides direct access while preserving the research-first hierarchy.

## 11. Visual System

- Deep navy and charcoal establish the primary academic tone.
- A restrained BIT-inspired red is used for links, focus, and small accents.
- Warm white backgrounds complement the existing illustration.
- English headings use a system serif stack; body text uses a system sans-serif stack.
- Chinese typography uses system Song and Hei families. No external font is required.
- Layout uses generous whitespace, thin rules, and restrained cards.
- No heavy gradients, decorative animation, or marketing-style counters.
- The original illustration remains in the repository. A compressed, appropriately sized derivative is used on the website to reduce transfer size.
- The optimized illustration derivative is at most 640 pixels on its longest displayed dimension and targets a file size below 250 KB without visible compression artifacts.

## 12. Components and Boundaries

- `_data/profile.yml`: identity, links, education, skills, and bilingual research-direction content.
- `_data/publications.yml`: canonical publication records and display order.
- `_data/awards.yml`: canonical honor records and language-specific labels.
- `_data/navigation.yml`: exposes language-specific menus with stable item keys.
- `_includes/language-switch.html`: links only to the current page's explicit counterpart.
- `_includes/masthead.html`: selects the language-specific navigation collection from `page.lang`.
- `_includes/research-directions.html`: renders the three research directions from data.
- `_includes/publication-list.html`: renders selected or complete publication collections without duplicating citation markup.
- `_includes/award-list.html`: renders compact or complete honors with accurate team roles.
- Language-specific Markdown pages: define route, language, counterpart, title, and which shared components to render.
- SCSS additions: own layout, responsive, focus, and print behavior without changing data semantics.

Each component has one responsibility and accepts page-level language and display mode as inputs.

## 13. Responsive, Accessibility, and Print Requirements

- The top navigation collapses cleanly at mobile widths while the language switch remains reachable.
- Long titles, DOI links, and email addresses wrap without horizontal scrolling.
- Semantic headings follow a logical hierarchy.
- Interactive controls have visible keyboard focus and accessible labels.
- Text and control colors meet practical contrast requirements.
- Normal text targets WCAG AA contrast of at least 4.5:1; large text and non-text controls target at least 3:1.
- Layout behavior is explicitly checked below 768 px, from 768-1023 px, and at or above 1024 px.
- Images have meaningful alternative text.
- The CV print stylesheet removes navigation and decorative elements, uses A4-friendly margins, prevents avoidable section splits, and preserves readable links.

## 14. Error Handling and Validation

The site is static and has no runtime backend. Error prevention therefore occurs before deployment:

- Validate unique publication and award IDs.
- Validate required bilingual fields.
- Validate DOI syntax and derive a canonical DOI URL for every publication.
- Validate that every publication contains `Yu Zhan` in its ordered author list.
- Validate that selected publication IDs exist.
- Validate unique routes, existing counterparts, mutual counterpart mappings, and language-correct navigation targets.
- Search for known Academic Pages placeholders and demonstration records.
- Do not render empty links or empty metadata labels.
- Fail the validation command when required data is missing.
- Fail the Jekyll build on Liquid or front-matter errors.
- Keep `.superpowers/`, local dependencies, certificates, `_site/`, and other generated artifacts out of Git.

## 15. Repository Cleanup

- Replace placeholder values in `_config.yml`, including title, name, description, and repository.
- Delete demonstration publication records and replace them with the approved publication data.
- Remove demonstration CV JSON content or remove its route if unused.
- Remove Talks, Teaching, Portfolio, Blog, and Guide from navigation.
- Delete sample records under `_talks`, `_teaching`, `_portfolio`, and `_posts`, and remove or disable their public archive pages and collection output.
- Ensure unused demonstration collections do not appear in generated navigation or sitemap and that their former sample routes are not present in `_site`.
- Preserve upstream theme code unless a focused layout or accessibility change requires modification.

## 16. Verification and Deployment

1. Run the structured-data validation.
2. Build the full Jekyll site locally.
3. Check all English and Chinese routes and counterpart links.
4. Check DOI, ORCID, GitHub, supervisor, and team links.
5. Inspect desktop and mobile renders of the homepage, Publications, Honors, and CV.
6. Inspect the English and Chinese A4 print previews.
7. Search generated content for placeholder strings, mojibake, broken links, and accidental private data.
8. Review `git diff`, `git diff --cached --name-only`, `git status`, and `git ls-files` to confirm no certificate, QR code, signature image, certificate number, or local runtime file is tracked.
9. Before any push, verify that `git rev-parse --show-toplevel` equals `D:/Doctor/Code/CV`, the current branch is `master`, `origin` is exactly `https://github.com/Dravencent/Dravencent.github.io.git`, and the repository's Pages workflow or configuration deploys the intended source.
10. Commit locally and push `master` only after the preflight checks pass.
11. Wait for GitHub Pages deployment and verify `/`, `/zh/`, publications, Honors, CV, language switching, and mobile rendering on the live domain.

## 17. Acceptance Criteria

- `https://dravencent.github.io/` is a complete English research-first homepage.
- `/zh/` is a complete Chinese counterpart with working page-to-page language switching.
- All five page types exist in both languages.
- Eight publications appear in the approved order with correct author order and working DOI links.
- Six honors appear with accurate official Chinese titles and team roles.
- Research and CV pages contain the complete approved section sets in both languages.
- Every bilingual route has a unique, existing, mutually linked counterpart and language-correct navigation.
- No Academic Pages sample content remains visible.
- No certificate image, QR code, certificate number, QQ email, or local scratch artifact is committed.
- The site builds without errors and passes the content validation.
- Desktop, mobile, and A4 print inspections show no overflow, clipping, or illegible content.
- The pushed `master` branch deploys successfully through GitHub Pages.
