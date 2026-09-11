---
title: "Transjakarta BRT Analysis"
description: "Analisis data eksploratif transaksi Transjakarta (BRT Jakarta) April 2023: pola rute, jam sibuk, dan demografi penumpang."
status: "Selesai"
tags: ["Python", "Pandas", "Jupyter", "EDA", "Matplotlib", "Seaborn"]
category: "Analisis Data"
metric: "Membongkar 1 bulan transaksi BRT menjadi pola koridor & jam puncak"
date: "2026-07-27"
featured: true
language: "id"
github: "https://github.com/4RGY/transjakarta-analysis"
---

## Konsep

Transjakarta adalah tulang punggung transportasi publik Jakarta, dan data transaksinya menyimpan jejak pergerakan jutaan penumpang. Proyek ini melakukan exploratory data analysis (EDA) terhadap data transaksi April 2023 untuk memahami bagaimana kota ini benar-benar bergerak.

## Pendekatan

- **Pembersihan data**: transaksi mentah dinormalkan, kolom waktu diparsing, dan data tidak valid dibuang.
- **Analisis rute**: mengidentifikasi koridor tersibuk dan distribusi perjalanan antar halte.
- **Jam puncak**: memetakan lonjakan penumpang per jam untuk melihat ritme harian kota.
- **Demografi**: mengurai profil penumpang dari atribut transaksi.

## Temuan Utama

Pola jam puncak pagi dan sore terlihat jelas, dengan koridor-koridor tertentu mendominasi volume perjalanan. Analisis demografi mengungkap segmen penumpang yang paling bergantung pada BRT.

## Refleksi

Data transportasi publik adalah cermin kota. Menganalisisnya bukan sekadar soal angka, tapi memahami bagaimana orang-orang bergerak, bekerja, dan hidup di dalamnya.
