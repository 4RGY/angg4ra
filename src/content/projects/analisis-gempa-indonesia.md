---
title: "Analisis Data Gempa Bumi Indonesia"
description: "Analisis data gempa bumi terkini dari open data BMKG. Visualisasi sebaran, magnitudo, dan pola seismik di Indonesia."
status: "Selesai"
tags: ["Python", "Pandas", "Matplotlib", "BMKG API"]
category: "Analisis Data"
date: "2025-07-18"
featured: false
language: "id"
github: "https://github.com/4RGY/analisis-gempa-indonesia"
---

## Latar Belakang

Indonesia duduk di Ring of Fire. Gempa itu bukan hal aneh, tapi kebanyakan orang cuma liat beritanya tanpa pernah liat datanya langsung. Gua mau liat pola-polanya dari data mentah BMKG.

## Pendekatan

- Ambil data gempa dari API terbuka BMKG
- Proses dan bersihin data: koordinat, magnitudo, kedalaman, timestamp
- Visualisasi peta sebaran gempa di seluruh Indonesia
- Analisis distribusi magnitudo dan kedalaman
- Identifikasi daerah dengan frekuensi gempa tertinggi

## Temuan

- Sebagian besar gempa terjadi di kedalaman menengah (50-150 km)
- Zona subduksi di selatan Jawa dan utara Sulawesi paling aktif
- Gempa dangkal (di bawah 50 km) cenderung punya dampak yang lebih besar meski magnitudonya lebih kecil

## Refleksi

Proyek ini simpel tapi ngajarin gua satu hal penting: data geospatial punya cerita yang beda dari data tabular biasa. Cara lu visualisasiin itu sama pentingnya dengan analisis statistiknya.
