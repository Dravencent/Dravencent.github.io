---
layout: academic
lang: en
permalink: /cv/
counterpart: /zh/cv/
title: Academic CV
description: Education, research interests, skills, publications, and verified honors.
page_type: cv
body_class: academic-site cv-page
---
<section class="cv-section identity-section" aria-labelledby="identity-heading">
  <h2 id="identity-heading" class="visually-hidden">Identity and contact</h2>
  {% include identity-summary.html lang=page.lang %}
  {% include profile-links.html lang=page.lang %}
</section>

<section class="cv-section" aria-labelledby="interests-heading">
  <h2 id="interests-heading">Research Interests</h2>
  {% include research-directions.html lang=page.lang mode="compact" %}
</section>

<section class="cv-section" aria-labelledby="education-heading">
  <h2 id="education-heading">Education</h2>
  {% include education-list.html lang=page.lang compact=false %}
</section>

<section class="cv-section" aria-labelledby="skills-heading">
  <h2 id="skills-heading">Skills</h2>
  {% include skills-list.html lang=page.lang %}
</section>

<section class="cv-section" aria-labelledby="publications-heading">
  <h2 id="publications-heading">Publications</h2>
  {% include publication-list.html lang=page.lang selected_only=false %}
</section>

<section class="cv-section" aria-labelledby="honors-heading">
  <h2 id="honors-heading">Honors &amp; Awards</h2>
  {% include award-list.html lang=page.lang %}
</section>

<section class="cv-section" aria-labelledby="affiliations-heading">
  <h2 id="affiliations-heading">Affiliations</h2>
  {% include academic-links.html lang=page.lang %}
</section>
