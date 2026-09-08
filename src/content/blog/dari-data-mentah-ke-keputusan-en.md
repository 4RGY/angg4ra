---
title: "From Raw Data to Decisions: Lessons from 4 Analysis Projects"
date: "2026-09-02"
language: "en"
tags: ["Data Analysis", "Python", "Reflection"]
readingTime: 5
excerpt: "Four data analysis projects taught me the same thing: analytics quality isn't about chart count, it's about data discipline."
---

My last four data analysis projects — Indonesian earthquakes, Transjakarta, national education, and Olist e-commerce — look very different on the surface. One is geology, one transport, one education policy, one online retail.

But they all taught the same lesson.

## Insight doesn't come from more charts

The biggest temptation in data analysis is making as many visualizations as possible. Charts are beautiful, but beautiful isn't the same as useful.

In the Olist project, I almost fell into that trap. 96k orders can be visualized hundreds of ways. What saved me was stepping back and asking: *what decision needs to be made?* That answer narrowed everything down to a few KPIs that actually mattered.

## Data discipline is the foundation

One row per order. Delivered orders only for commercial KPIs. Partial months excluded. Metric ranges tested with pytest.

These small details separate trustworthy analysis from merely convincing-looking work. In the real world, decisions are made from these numbers. Wrong numbers mean wrong decisions.

## Context beats correlation

The education project found a positive correlation between schooling and unemployment. Stop at the number and the conclusion is wrong: *"education causes unemployment."*

It was the context — limited formal job markets in certain provinces — that turned that number into a true story. Correlation without context is just a number.

## The takeaway

Good data analysis isn't about fancy tools or lots of charts. It's three things: the right question, strict data discipline, and the humility to read context before concluding.
