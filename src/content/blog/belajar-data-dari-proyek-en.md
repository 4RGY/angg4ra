---
title: "I Learned Data Science from Earthquakes and Air Quality"
date: "2026-06-15"
language: "en"
tags: ["Data Science", "Reflection", "Coding Education"]
readingTime: 7
excerpt: "Why Kaggle tutorials were never enough, and why 'small' projects taught me more."
---

I once watched 12 hours of data science tutorials on YouTube. In a single day. The result? I could say "overfitting" in conversations, but couldn't debug why my model only predicted one class.

That was my wake-up call.

## The Tutorial Trap

The problem with tutorials isn't their quality. Many are great. The problem is the illusion of learning they create.

You follow step by step, everything works, the output looks beautiful, and you feel like you understand. But try changing the dataset. Try using messy data with missing values everywhere, with column names that make no sense. Suddenly all your "tutorial skills" aren't enough.

I realized this when I first tried analyzing Indonesian earthquake data from BMKG.

## Earthquake Data: Lesson One

BMKG data is free and open. But the format? Nobody tells you that coordinates sometimes use commas, sometimes dots. Nobody tells you that timezones are inconsistent. Nobody tells you about duplicate entries you only discover after plotting them on a map.

Tutorials don't teach this. Tutorials give you clean CSVs.

From this small project I learned:
- **Data cleaning is 70% of the work**. Not an exaggeration.
- **Geospatial visualization plays by different rules**. Regular scatter plots aren't enough for latitude-longitude data.
- **Domain knowledge matters**. I had to read about subduction, earthquake focal depth, and the Ring of Fire to produce a meaningful analysis.

## Air Quality: Lesson Two

The Jakarta ISPU project was more ambitious. I compared 5 ML algorithms, got 94.2% accuracy with Random Forest. Sounds good, right?

That number was almost misleading.

My model was great at the dominant class ("Moderate" air quality) but terrible at the most important class ("Very Unhealthy"). Why? Imbalanced data. The rare class was the most critical for public health.

This taught me something tutorials rarely emphasize: **accuracy isn't a sufficient metric**. Confusion matrix, per-class recall, and domain context. These are what actually matter.

SHAP also changed how I think. Not just "what's the accuracy" but "why did the model make this decision." Explainability isn't a luxury, especially in domains that affect people.

## Indonesia Education: Lesson Three

The last project that solidified this approach: analyzing education data across 34 provinces.

Here I didn't use ML at all. Pure EDA and visualization. And that's precisely what made me appreciate descriptive statistics.

Not every problem needs a model. Sometimes one well-chosen chart tells more than a thousand training epochs.

## The Pattern I See

Three projects, three different domains, one same pattern:

1. **Start from the question, not the tools.** "Why is Jakarta's air bad?" not "I want to use Random Forest."
2. **Data cleaning is the best teacher.** You learn more about data from cleaning it than from the model you train on it.
3. **Domain knowledge can't be skipped.** Without it, your analysis is just numbers without meaning.
4. **Small projects are enough.** You don't need 10 million row datasets. What matters is a real question and an honest answer.

I'm still learning. There's still a lot I don't know. But at least now I'm learning from real things, not from tutorials that make me feel smart without being able to do anything.
