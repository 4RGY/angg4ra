---
title: "Analisis Pendidikan Indonesia (2017–2023)"
description: "Analisis data pendidikan tingkat provinsi mencakup IPM, rata-rata lama sekolah, pengangguran, dan infrastruktur sekolah dasar untuk memahami ketimpangan antar provinsi."
status: "Selesai"
tags: ["Python", "Pandas", "Matplotlib", "Analisis Data", "Statistik"]
category: "Analisis Data"
metric: "Mengungkap selisih IPM 16.3 poin & korelasi counterintuitive sekolah–pengangguran"
date: "2026-07-21"
featured: false
language: "id"
github: "https://github.com/4RGY/pendidikan-indonesia"
---

## Konsep

Kualitas pendidikan di Indonesia tidak merata, dan angka agregat nasional sering menyembunyikan jurang antar provinsi. Proyek ini menganalisis data pendidikan 2017–2023 untuk membongkar ketimpangan IPM, hubungan pendidikan dengan ketenagakerjaan, dan krisis infrastruktur sekolah dasar.

## Pendekatan

- **Pembersihan & pemrosesan** — dataset mentah dari Kaggle dinormalisasi menjadi beberapa tabel bersih.
- **Analisis tren** — melacak pergerakan IPM provinsi tertinggi vs terendah dari 2017 ke 2023.
- **Korelasi** — menguji hubungan rata-rata lama sekolah dengan tingkat pengangguran terbuka (TPT).
- **Infrastruktur** — mengukur rasio ruang kelas rusak terhadap ruang kelas baik per provinsi.

## Temuan Utama

- Selisih IPM antara provinsi tertinggi (DKI Jakarta 82.46) dan terendah (Papua Barat 66.16) mencapai **16.3 poin**.
- Korelasi positif (r=0.474) antara lama sekolah dan TPT — provinsi berpendidikan lebih tinggi justru punya pengangguran lebih tinggi.
- Papua mencatat kenaikan IPM terbesar (+13.32 poin) berkat otonomi khusus.
- Jawa Barat punya 94.835 ruang kelas rusak, atau 159% dari ruang kelas baik.

## Refleksi

Data ini menampar asumsi bahwa pendidikan tinggi otomatis menurunkan pengangguran. Konteks lapangan kerja formal yang terbatas adalah bagian dari cerita yang sering terlewat.
