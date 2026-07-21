---
title: "Analisis E-Commerce Olist"
description: "Analisis berorientasi keputusan terhadap data e-commerce Olist: dari EDA sampai insight eksekutif dengan reproducible data marts."
status: "Selesai"
tags: ["Python", "Pandas", "Jupyter", "SQL", "Matplotlib"]
category: "Analisis Data"
date: "2025-07-15"
featured: false
language: "id"
github: "https://github.com/4RGY/olist-commerce-analysis"
---

## Konteks

Dataset Olist dari Kaggle itu salah satu dataset e-commerce paling lengkap yang tersedia publik. Tapi kebanyakan analisis yang ada cuma berhenti di EDA dasar. Gua mau bikin analisis yang benar-benar bisa dipake buat ambil keputusan bisnis.

## Pendekatan

- Bangun data marts yang reproducible dari raw data
- EDA mendalam: pola pembelian, segmentasi customer, analisis review
- Analisis delivery performance dan dampaknya ke satisfaction
- Identifikasi product categories dengan margin dan volume terbaik
- Rangkum temuan dalam format executive insight

## Temuan Kunci

- Delivery time adalah faktor nomor satu yang mempengaruhi review score, bukan harga
- Ada sweet spot waktu pengiriman dimana review scores drop drastis
- Seller dengan response time cepat punya retention rate yang jauh lebih tinggi
- Beberapa kategori produk punya margin tinggi tapi volume rendah, cocok buat strategi niche

## Yang Beda dari Proyek Ini

Gua sengaja bikin ini dengan mindset "kalau gua present ke CEO, dia harus bisa ambil aksi dari slide ini." Bukan cuma grafik cantik, tapi setiap visualisasi punya rekomendasi yang bisa dieksekusi.
