---
title: "Olist Commerce Analytics"
description: "Decision-oriented analysis of Brazil's Olist e-commerce dataset — 96k orders analyzed for commercial performance and customer experience recommendations."
status: "Completed"
tags: ["Python", "Jupyter", "Pandas", "pytest", "Data Analysis"]
category: "Analisis Data"
metric: "96,478 orders → recommendations for delivery monitoring & repeat-purchase cohorts"
date: "2026-06-12"
featured: false
language: "en"
github: "https://github.com/4RGY/olist-commerce-analysis"
---

## Concept

The public Brazilian E-Commerce dataset by Olist is a rich analytics case: orders, items, payments, reviews, and customers. This project builds decision-oriented analysis — not just visualizations, but answers to concrete business questions.

## Business Question

Where should an e-commerce operator focus to improve commercial performance and customer experience: **category mix, geographic coverage, repeat purchasing, or delivery reliability?**

## Approach

- **Analytical mart** — one row per order as the foundation; one-to-many tables aggregated before joining to prevent KPI inflation.
- **Metric discipline** — commercial KPIs use delivered orders only; partial months excluded from trends.
- **Data contracts** — metric ranges tested with pytest to protect quality.

## Key Findings

- 96,478 delivered orders generated R$13.22M in item revenue.
- 8.1% of orders were late; late orders averaged 2.57/5 stars vs 4.29/5 on time.
- Only 3.0% of customers purchased twice, yet drove 6.1% of orders.
- São Paulo contributed 38.3% of revenue; health_beauty led categories at 9.3%.

## Reflection

The primary recommendation: prioritize delivery-exception monitoring, then build category-aware repeat-purchase cohorts. Analytics quality comes from data discipline, not chart count.
