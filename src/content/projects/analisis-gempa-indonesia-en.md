---
title: "Indonesia Earthquake Analysis"
description: "An automated pipeline that pulls the latest earthquake data from BMKG open data, converts XML into tabular CSV, then runs descriptive analysis and visualization."
status: "Completed"
tags: ["Python", "Pandas", "Requests", "Matplotlib", "Seaborn", "Open Data"]
category: "Analisis Data"
metric: "Turned BMKG's XML feed into magnitude-vs-depth insight automatically"
date: "2026-09-08"
featured: false
language: "en"
github: "https://github.com/4RGY/analisis-gempa-indonesia"
---

## Concept

Indonesia's earthquake data from BMKG is publicly available, but ships as XML that is awkward to analyze directly. This project bridges that gap: a single script that pulls the latest feed, normalizes it into a CSV table, and produces human-readable descriptive analysis.

## Approach

- **Automated ingest** — `requests` pulls the latest XML data and parses it into structured rows.
- **Normalization** — each earthquake becomes one row with magnitude, depth, location, and time columns.
- **Descriptive analysis** — summary statistics (mean magnitude, mean depth, largest quake) computed straight from live data.
- **Visualization** — magnitude distribution and magnitude-vs-depth relationship plotted to surface patterns.

## Key Findings

From a sample of the last 15 earthquakes, the largest hit magnitude 6.2 SR, with average magnitude around 5.39 SR and average depth 40.20 km. The magnitude-vs-depth chart helps reveal whether shallow quakes tend to be stronger.

## Reflection

This project reinforced that useful data analysis doesn't need to be complex — the key is building a clean, repeatable path from raw data to insight.
