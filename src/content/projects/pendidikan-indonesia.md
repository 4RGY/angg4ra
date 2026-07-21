---
title: "Analisis Data Pendidikan Indonesia"
description: "Eksplorasi data pendidikan Indonesia 2017-2023: IPM, rata-rata lama sekolah, pengangguran, dan infrastruktur SD di 34 provinsi."
status: "Selesai"
tags: ["Python", "Pandas", "Matplotlib", "Seaborn", "Jupyter"]
category: "Analisis Data"
date: "2025-07-20"
featured: false
language: "id"
github: "https://github.com/4RGY/pendidikan-indonesia"
---

## Kenapa Proyek Ini

Gua penasaran: seberapa jauh kesenjangan pendidikan antar provinsi di Indonesia? Data-datanya tersebar di BPS, tapi jarang ada yang nyatuin dan bandingin langsung. Jadi gua coba sendiri.

## Yang Gua Lakuin

- Ngumpulin data dari BPS: Indeks Pembangunan Manusia (IPM), rata-rata lama sekolah, tingkat pengangguran terbuka, dan infrastruktur SD per provinsi
- Bersihin dan merge dataset dari berbagai tahun (2017-2023)
- Visualisasi perbandingan antar provinsi dan tren waktu
- Analisis korelasi antara lama sekolah, IPM, dan tingkat pengangguran

## Temuan yang Menarik

- Provinsi dengan rata-rata lama sekolah tinggi ga selalu punya IPM tertinggi. Ada faktor lain yang main.
- Kesenjangan infrastruktur SD antara Jawa dan luar Jawa masih lebar.
- Beberapa provinsi menunjukkan perbaikan signifikan dalam 6 tahun terakhir, terutama di Sulawesi dan Kalimantan.

## Yang Gua Pelajari

Ini proyek pertama gua yang serius pake data publik Indonesia. Yang paling susah bukan analisisnya, tapi bersihin datanya. Format BPS ga konsisten antar tahun, nama provinsi berubah, dan ada missing values yang harus dihandle hati-hati biar ga misleading.
