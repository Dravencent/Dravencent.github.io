---
layout: home
lang: zh
permalink: /zh/
counterpart: /
title: 湛煜
description: 北京理工大学材料科学与工程专业博士研究生，研究方向为锂电池电解液智能设计。
page_type: home
body_class: academic-site home-page
---
{% include hero.html lang=page.lang %}

<section class="section-block" aria-labelledby="research-heading">
  <div class="section-heading"><p class="eyebrow">博士阶段研究</p><h2 id="research-heading">研究方向</h2></div>
  {% include research-directions.html lang=page.lang mode="compact" %}
  <p class="section-action"><a href="{{ '/zh/research/' | relative_url }}">了解研究思路</a></p>
</section>

<section class="section-block" aria-labelledby="selected-publications-heading">
  <div class="section-heading"><p class="eyebrow">代表性成果</p><h2 id="selected-publications-heading">代表性论文</h2></div>
  {% include publication-list.html lang=page.lang selected_only=true %}
  <p class="section-action"><a href="{{ '/zh/publications/' | relative_url }}">查看全部论文</a></p>
</section>

<section class="section-block" aria-labelledby="education-heading">
  <div class="section-heading"><p class="eyebrow">学术训练</p><h2 id="education-heading">教育经历</h2></div>
  {% include education-list.html lang=page.lang compact=true %}
</section>

<section class="section-block" aria-labelledby="affiliations-heading">
  <div class="section-heading"><p class="eyebrow">学术环境</p><h2 id="affiliations-heading">导师与团队</h2></div>
  {% include academic-links.html lang=page.lang %}
</section>
