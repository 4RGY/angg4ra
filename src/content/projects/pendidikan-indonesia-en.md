---
title: "Indonesia Education Analysis (2017–2023)"
description: "Province-level education data analysis covering HDI, mean years of schooling, unemployment, and primary school infrastructure to understand inter-province inequality."
status: "Completed"
tags: ["Python", "Pandas", "Matplotlib", "Data Analysis", "Statistics"]
category: "Analisis Data"
metric: "Uncovered a 16.3-point HDI gap & a counterintuitive schooling–unemployment correlation"
date: "2026-07-21"
featured: false
language: "en"
github: "https://github.com/4RGY/pendidikan-indonesia"
---

## Concept

Education quality in Indonesia is uneven, and national aggregates often hide the gap between provinces. This project analyzes 2017–2023 education data to expose HDI inequality, the link between education and employment, and the primary school infrastructure crisis.

## Approach

- **Cleaning & processing** — raw Kaggle datasets normalized into several clean tables.
- **Trend analysis** — tracking HDI movement for top vs bottom provinces from 2017 to 2023.
- **Correlation** — testing the relationship between mean years of schooling and open unemployment rate.
- **Infrastructure** — measuring the ratio of damaged to good classrooms per province.

## Key Findings

- HDI gap between the highest province (Jakarta 82.46) and lowest (West Papua 66.16) reaches **16.3 points**.
- Positive correlation (r=0.474) between schooling and unemployment — better-educated provinces show higher unemployment.
- Papua recorded the largest HDI gain (+13.32 points) thanks to special autonomy.
- West Java has 94,835 damaged classrooms, or 159% of good classrooms.

## Reflection

This data challenges the assumption that higher education automatically lowers unemployment. Limited formal job markets are part of a story that's too often missed.
