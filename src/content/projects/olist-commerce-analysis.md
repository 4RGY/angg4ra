---
title: "Olist Commerce Analytics"
description: "Analisis e-commerce Brazil (dataset Olist) yang berorientasi keputusan — 96 ribu order dianalisis untuk rekomendasi performa komersial dan pengalaman pelanggan."
status: "Selesai"
tags: ["Python", "Jupyter", "Pandas", "pytest", "Analisis Data"]
category: "Analisis Data"
metric: "96.478 order → rekomendasi prioritas monitoring pengiriman & cohort repeat-purchase"
date: "2026-06-12"
featured: true
language: "id"
github: "https://github.com/4RGY/olist-commerce-analysis"
---

## Konsep

Dataset publik Brazilian E-Commerce dari Olist adalah kasus analitik yang kaya: pesanan, item, pembayaran, ulasan, dan pelanggan. Proyek ini membangun analisis berorientasi keputusan — bukan sekadar visualisasi, tapi jawaban atas pertanyaan bisnis yang konkret.

## Pertanyaan Bisnis

Ke mana operator e-commerce harus fokus untuk meningkatkan performa komersial dan pengalaman pelanggan: **bauran kategori, cakupan geografis, pembelian berulang, atau keandalan pengiriman?**

## Pendekatan

- **Analytical mart** — satu baris per order sebagai fondasi; tabel one-to-many diagregasi sebelum join untuk mencegah inflasi KPI.
- **Disiplin metrik** — KPI komersial hanya memakai order yang terkirim; bulan parsial dikecualikan dari tren.
- **Kontrak data** — rentang metrik diuji dengan pytest untuk menjaga kualitas.

## Temuan Utama

- 96.478 order terkirim menghasilkan pendapatan item R$13.22 juta.
- 8.1% order telat; order telat rata-rata bintang 2.57/5 vs 4.29/5 saat tepat waktu.
- Hanya 3.0% pelanggan beli lebih dari sekali, tapi menghasilkan 6.1% order.
- São Paulo menyumbang 38.3% pendapatan; kategori health_beauty memimpin 9.3%.

## Refleksi

Rekomendasi utamanya: prioritaskan monitoring pengecualian pengiriman, lalu bangun cohort repeat-purchase berbasis kategori. Kualitas analitik datang dari disiplin data, bukan jumlah grafik.
