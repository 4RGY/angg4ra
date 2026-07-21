---
title: "Indonesia Earthquake Data Analysis"
description: "Analyzing recent earthquake data from BMKG open data. Visualizing distribution, magnitude, and seismic patterns across Indonesia."
status: "Completed"
tags: ["Python", "Pandas", "Matplotlib", "BMKG API"]
category: "Analisis Data"
date: "2025-07-18"
featured: false
language: "en"
github: "https://github.com/4RGY/analisis-gempa-indonesia"
---

## Background

Indonesia sits on the Ring of Fire. Earthquakes are not unusual, but most people only see the news without ever looking at the raw data. I wanted to see the patterns straight from BMKG's data.

## Approach

- Pulled earthquake data from BMKG's open API
- Processed and cleaned data: coordinates, magnitude, depth, timestamps
- Visualized earthquake distribution maps across Indonesia
- Analyzed magnitude and depth distributions
- Identified regions with highest earthquake frequency

## Findings

- Most earthquakes occur at intermediate depths (50-150 km)
- Subduction zones south of Java and north of Sulawesi are the most active
- Shallow earthquakes (below 50 km) tend to have greater impact despite lower magnitudes

## Reflection

Simple project, but it taught me something important: geospatial data tells a fundamentally different story than tabular data. How you visualize it matters as much as the statistical analysis.
