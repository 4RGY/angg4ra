---
title: "Jakarta Air Quality Index (ISPU) Prediction"
description: "Predicting Jakarta's air quality index using 5 ML algorithms with SHAP explainability."
status: "Completed"
tags: ["Python", "Scikit-learn", "SHAP", "Pandas", "Matplotlib"]
category: "Machine Learning"
metric: "Best accuracy: 94.2% (Random Forest)"
date: "2024-11-15"
featured: true
language: "en"
# github: "https://github.com/4RGY/jakarta-ispu"
---

## Background

Jakarta consistently ranks among the cities with the worst air quality in the world.
Accurate ISPU (air quality index) prediction helps residents and the government make timely decisions.

## Approach

Compared 5 algorithms: Logistic Regression, Decision Tree, Random Forest, SVM, and KNN.
Used SHAP to explain *why* the model makes a given prediction, not just how accurate it is.

## Key Findings

- Random Forest achieved 94.2% accuracy, consistently outperforming the other models
- PM2.5 was the feature with the largest influence on predictions
- The model tends to underpredict at the "Very Unhealthy" level, likely due to imbalanced data

## What I Learned

High accuracy isn't enough. A model that can't be explained is hard to trust in a public health domain.
SHAP changed how I think about model validation.