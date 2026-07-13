---
layout: home
lang: en
permalink: /
counterpart: /zh/
title: Yu Zhan
description: Ph.D. student researching the intelligent design of lithium-battery electrolytes.
page_type: home
body_class: academic-site home-page
---
{% include hero.html lang=page.lang %}

<section class="section-block" aria-labelledby="research-heading">
  <div class="section-heading"><p class="eyebrow">Doctoral focus</p><h2 id="research-heading">Research Directions</h2></div>
  {% include research-directions.html lang=page.lang mode="compact" %}
  <p class="section-action"><a href="{{ '/research/' | relative_url }}">Explore the research approach</a></p>
</section>

<section class="section-block" aria-labelledby="selected-publications-heading">
  <div class="section-heading"><p class="eyebrow">Selected work</p><h2 id="selected-publications-heading">Selected Publications</h2></div>
  {% include publication-list.html lang=page.lang selected_only=true %}
  <p class="section-action"><a href="{{ '/publications/' | relative_url }}">View all publications</a></p>
</section>

<section class="section-block" aria-labelledby="education-heading">
  <div class="section-heading"><p class="eyebrow">Academic training</p><h2 id="education-heading">Education</h2></div>
  {% include education-list.html lang=page.lang compact=true %}
</section>

<section class="section-block" aria-labelledby="affiliations-heading">
  <div class="section-heading"><p class="eyebrow">Academic environment</p><h2 id="affiliations-heading">Supervisor &amp; Team</h2></div>
  {% include academic-links.html lang=page.lang %}
</section>
