---
title: "Dari Data Mentah ke Keputusan: Pelajaran dari 4 Proyek Analisis"
date: "2026-09-02"
language: "id"
tags: ["Analisis Data", "Python", "Refleksi"]
readingTime: 5
excerpt: "Empat proyek analisis data mengajarkan satu hal yang sama: kualitas analitik bukan soal jumlah grafik, tapi disiplin data."
---

Empat proyek analisis data terakhir saya (gempa Indonesia, Transjakarta, pendidikan nasional, dan e-commerce Olist) terlihat sangat berbeda di permukaan. Satu soal geologi, satu transportasi, satu kebijakan pendidikan, satu ritel online.

Tapi semuanya mengajarkan pelajaran yang sama.

## Wawasan bukan datang dari grafik yang banyak

Godaan terbesar dalam analisis data adalah membuat visualisasi sebanyak mungkin. Grafik itu indah, tapi indah bukan berarti berguna.

Di proyek Olist, saya hampir terjebak di sana. 96 ribu order bisa divisualisasikan dengan ratusan cara. Yang menyelamatkan saya adalah mundur dan bertanya: *keputusan apa yang harus diambil?* Jawaban itu mempersempit semuanya menjadi beberapa KPI yang benar-benar berarti.

## Disiplin data adalah fondasinya

Satu baris per order. Order yang terkirim saja untuk KPI komersial. Bulan parsial dikecualikan. Rentang metrik diuji dengan pytest.

Detail-detail kecil ini yang membedakan analisis yang bisa dipercaya dari yang sekadar terlihat meyakinkan. Di dunia nyata, keputusan dibuat dari angka ini. Angka yang salah berarti keputusan yang salah.

## Konteks mengalahkan korelasi

Proyek pendidikan menemukan korelasi positif antara lama sekolah dan pengangguran. Kalau berhenti di angka, kesimpulannya keliru: *"pendidikan menyebabkan pengangguran."*

Konteksnya, terbatasnya lapangan kerja formal di provinsi tertentu, yang mengubah angka itu menjadi cerita yang benar. Korelasi tanpa konteks hanyalah angka.

## Kesimpulannya

Analisis data yang baik bukan soal alat yang canggih atau grafik yang banyak. Ini soal tiga hal: pertanyaan yang tepat, disiplin data yang ketat, dan kerendahan hati untuk membaca konteks sebelum menyimpulkan.
