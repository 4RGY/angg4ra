---
title: "Prediksi ISPU Kualitas Udara Jakarta"
description: "Prediksi indeks kualitas udara Jakarta menggunakan 5 algoritma ML dengan SHAP explainability."
status: "Selesai"
tags: ["Python", "Scikit-learn", "SHAP", "Pandas", "Matplotlib"]
category: "Machine Learning"
metric: "Akurasi terbaik: 94.2% (Random Forest)"
date: "2024-11-15"
featured: true
github: "https://github.com/username-kamu/jakarta-ispu"
---

## Latar Belakang Masalah

Jakarta secara konsisten berada di antara kota-kota dengan kualitas udara terburuk di dunia.
Prediksi ISPU yang akurat membantu warga dan pemerintah mengambil keputusan yang tepat waktu.

## Pendekatan

Membandingkan 5 algoritma: Logistic Regression, Decision Tree, Random Forest, SVM, dan KNN.
Menggunakan SHAP untuk menjelaskan *mengapa* model membuat prediksi tertentu — bukan hanya berapa akurasinya.

## Temuan Utama

- Random Forest mencapai akurasi 94.2%, mengalahkan model lainnya secara konsisten
- PM2.5 adalah fitur dengan pengaruh terbesar terhadap prediksi
- Model cenderung underpredict pada level "Sangat Tidak Sehat" — data imbalanced

## Yang Saya Pelajari

Akurasi tinggi tidak cukup. Model yang tidak bisa dijelaskan sulit dipercaya di domain kesehatan publik.
SHAP mengubah cara saya memikirkan validasi model.