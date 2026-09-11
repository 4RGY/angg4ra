---
title: "Analisis Gempa Terkini Indonesia"
description: "Pipeline otomatis yang menarik data gempa terbaru dari open data BMKG, mengubah XML menjadi CSV tabular, lalu menjalankan analisis deskriptif dan visualisasi."
status: "Selesai"
tags: ["Python", "Pandas", "Requests", "Matplotlib", "Seaborn", "Open Data"]
category: "Analisis Data"
metric: "Mengubah feed XML BMKG menjadi insight magnitudo vs kedalaman secara otomatis"
date: "2026-09-08"
featured: false
language: "id"
github: "https://github.com/4RGY/analisis-gempa-indonesia"
---

## Konsep

Data gempa bumi dari BMKG tersedia publik, tetapi dalam bentuk XML yang kurang nyaman dianalisis langsung. Proyek ini menjembatani celah itu: sebuah script tunggal yang menarik feed terbaru, menormalkan strukturnya menjadi tabel CSV, lalu menghasilkan analisis deskriptif yang siap dibaca manusia.

## Pendekatan

- **Ingest otomatis**: `requests` menarik data XML terkini, diparsing menjadi baris-baris terstruktur.
- **Normalisasi**: setiap kejadian gempa diubah menjadi satu baris dengan kolom magnitudo, kedalaman, lokasi, dan waktu.
- **Analisis deskriptif**: statistik ringkas (rerata magnitudo, rerata kedalaman, gempa terbesar) dihitung langsung dari data terbaru.
- **Visualisasi**: distribusi magnitudo dan hubungan magnitudo vs kedalaman diplot untuk menangkap pola.

## Temuan Utama

Dari sampel 15 gempa terakhir, gempa terbesar tercatat magnitudo 6.2 SR, dengan rata-rata kekuatan sekitar 5.39 SR dan rata-rata kedalaman 40.20 km. Visualisasi magnitudo vs kedalaman membantu melihat apakah gempa dangkal cenderung lebih kuat.

## Refleksi

Proyek ini menegaskan bahwa analisis data yang berguna tidak harus rumit. Yang penting adalah membangun jalur dari data mentah menuju insight dengan rapi dan bisa diulang.
