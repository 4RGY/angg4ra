---
title: "Relationship Memory Museum"
description: "A personal website shaped like a digital museum, holding memories with Piti as a spatial archive that can be entered and felt again."
status: "Completed"
tags: ["HTML", "CSS", "JavaScript", "Framer Motion", "Vite"]
category: "Web"
metric: "Most visually and emotionally ambitious personal project"
date: "2026-06-20"
featured: false
language: "en"
# demo: "https://memory-museum.pages.dev"
---

## Concept

Most of a couple's journey together ends up buried under thousands of digital messages, or scattered randomly inside an overflowing phone gallery. This project came from a simple but deeply felt question. **"**what if those precious moments weren't just stored, but given a home?**"**

For you, Piti. **Relationship Memory Museum** is both a personal gift and a technology experiment. It's a static digital museum space that treats the record of our journey — photo fragments, single lines of text, voice recordings, important dates — as consciously curated exhibition artifacts. This project explores how a website can transform into an immersive, living narrative medium, beyond the cold scroll-based interaction of a conventional webpage.

## Design Approach

The museum is designed as several virtual rooms, each representing a particular chapter in our timeline. Visitors are invited to walk through a corridor of time, discovering pieces of the past deliberately placed in carefully planned corners.

To soften the stiff impression of a digital device, the aesthetic direction is deliberately pulled toward **analog** elements:
* **Grain & Texture:** Layers of paper texture and subtle noise on the background, giving a tactile feel — as if it could be touched.
* **Classic Typography:** Warm, melancholic serif fonts reminiscent of typewriter print or old letters kept in a box.
* **Muted Color Palette:** Faded colors inspired by the tones of old polaroid photos yellowing with time.

There's a beautiful contrast here — an effort to capture the fragile warmth of the past, built on a foundation of modern JavaScript instructions working with precision behind the scenes.

## Technical

This project was deliberately built with a *minimal footprint* architecture, no database or complex backend infrastructure, keeping the entire experience instant and private.

* **Core Architecture:** Vanilla JavaScript with Vite as the build tool to keep room-loading performance optimal.
* **Data Curation:** All memories are stored in structured static JSON files. Data entry was done manually, turning the process of writing each line into an intimate act of curating memory.
* **Transition Animation:** Movement between rooms uses vanilla Framer Motion. Camera movement and viewport shifts were designed to be as smooth as possible, creating the illusion of space — as if the visitor were truly stepping from one room into another.

```json
{
  "room": "babak-awal",
  "title": "First Meeting",
  "artifacts": [
    {
      "type": "polaroid",
      "src": "/assets/archive/first-date.jpg",
      "caption": "That coffee shop corner that night, 2025."
    }
  ]
}
```

### Biggest Challenge
Designing intuitive spatial navigation without relying on rigid text instructions (like a "Next" button or big arrow icons). I wanted her to be able to explore these rooms organically, following her own sense of movement. After three rounds of reworking the transition structure, the gesture-based navigation and viewport tracking finally felt natural — like walking down a real corridor that gently guides each step.

### Reflection
As a project dedicated entirely to someone who matters, Relationship Memory Museum is completely free from web industry metrics. No new-user targets, no conversion rate to chase, no SEO optimization to hunt search algorithms. Those cold metrics lose all meaning here.

The only metric of success for this project is feeling. When this interface opens, and the person on the other side of the screen pauses for a moment, tracing every corner at a slow rhythm, and feels again the warmth of the moments stored inside it — then every line of code written in quiet has done its job perfectly.