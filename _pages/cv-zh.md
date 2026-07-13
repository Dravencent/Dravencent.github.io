---
layout: academic
lang: zh
permalink: /zh/cv/
counterpart: /cv/
title: 学术简历
description: 教育经历、研究方向、专业技能、论文发表与经核验的荣誉记录。
page_type: cv
body_class: academic-site cv-page
---
<section class="cv-section identity-section" aria-labelledby="identity-heading">
  <h2 id="identity-heading" class="visually-hidden">个人信息与联系方式</h2>
  {% include identity-summary.html lang=page.lang %}
  {% include profile-links.html lang=page.lang %}
</section>

<section class="cv-section" aria-labelledby="interests-heading">
  <h2 id="interests-heading">研究方向</h2>
  {% include research-directions.html lang=page.lang mode="compact" %}
</section>

<section class="cv-section" aria-labelledby="education-heading">
  <h2 id="education-heading">教育经历</h2>
  {% include education-list.html lang=page.lang compact=false %}
</section>

<section class="cv-section" aria-labelledby="skills-heading">
  <h2 id="skills-heading">专业技能</h2>
  {% include skills-list.html lang=page.lang %}
</section>

<section class="cv-section" aria-labelledby="publications-heading">
  <h2 id="publications-heading">论文发表</h2>
  {% include publication-list.html lang=page.lang selected_only=false %}
</section>

<section class="cv-section" aria-labelledby="honors-heading">
  <h2 id="honors-heading">荣誉奖励</h2>
  {% include award-list.html lang=page.lang %}
</section>

<section class="cv-section" aria-labelledby="affiliations-heading">
  <h2 id="affiliations-heading">学术关系</h2>
  {% include academic-links.html lang=page.lang %}
</section>
