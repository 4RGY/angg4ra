---
title: "Gua Belajar Data Science dari Gempa Bumi dan Kualitas Udara"
date: "2026-06-15"
language: "id"
tags: ["Data Science", "Refleksi", "Coding Education"]
readingTime: 7
excerpt: "Kenapa tutorial Kaggle ga pernah cukup, dan kenapa proyek yang 'kecil' justru ngajarin lebih banyak."
---

Gua pernah nonton 12 jam tutorial data science di YouTube. Dalam satu hari. Hasilnya? Gua bisa ngomong "overfitting" di obrolan, tapi ga bisa debug kenapa model gua cuma predict satu class.

Itu wake-up call.

## Tutorial Trap

Masalah tutorial bukan di kualitasnya. Banyak yang bagus. Masalahnya di ilusi belajar yang dia kasih.

Lu ikutin step by step, semua jalan, output-nya cantik, dan lu ngerasa paham. Tapi coba ganti dataset-nya. Coba pake data yang berantakan, yang ada missing values di mana-mana, yang kolom namanya ga make sense. Tiba-tiba semua skill "tutorial" lu ga cukup.

Gua sadar ini waktu pertama kali coba analisis data gempa Indonesia dari BMKG.

## Data Gempa: Pelajaran Pertama

Data BMKG itu gratis dan terbuka. Tapi formatnya? Ga ada yang bilang kalau koordinat kadang pake koma, kadang pake titik. Ga ada yang bilang kalau timezone-nya ga konsisten. Ga ada yang bilang kalau ada duplikat entry yang baru ketauan setelah lu plot di peta.

Tutorial ga ngajarin ini. Tutorial kasih lu CSV yang udah bersih.

Dari proyek kecil ini gua belajar:
- **Data cleaning itu 70% kerjaan**. Bukan exaggeration.
- **Visualisasi geospatial itu beda aturan mainnya**. Scatter plot biasa ga cukup buat data yang punya latitude longitude.
- **Domain knowledge penting**. Gua harus baca soal subduksi, kedalaman fokus gempa, dan Ring of Fire buat bisa bikin analisis yang bermakna.

## Kualitas Udara: Pelajaran Kedua

Proyek ISPU Jakarta lebih ambisius. Gua bandingin 5 algoritma ML, dapet akurasi 94.2% pake Random Forest. Kedengeran bagus kan?

Tapi angka itu hampir misleading.

Model gua bagus di class yang dominan (kualitas udara "Sedang"), tapi payah di class yang paling penting ("Sangat Tidak Sehat"). Kenapa? Data imbalanced. Class yang langka justru yang paling kritis buat kesehatan publik.

Dari sini gua belajar satu hal yang tutorial jarang tekanin: **akurasi bukan metrik yang cukup**. Confusion matrix, recall per class, dan konteks domain. Ini yang beneran penting.

SHAP juga ngubah cara gua mikir. Bukan cuma "berapa akurasinya" tapi "kenapa model ambil keputusan ini." Explainability bukan luxury, terutama di domain yang menyangkut manusia.

## Pendidikan Indonesia: Pelajaran Ketiga

Proyek terakhir yang bikin gua makin yakin sama approach ini: analisis data pendidikan 34 provinsi.

Di sini gua ga pake ML sama sekali. Murni EDA dan visualisasi. Dan justru itu yang bikin gua appreciate statistik deskriptif.

Ga semua masalah butuh model. Kadang satu grafik yang tepat bisa ceritain lebih banyak dari seribu epoch training.

## Pola yang Gua Liat

Tiga proyek, tiga domain beda, satu pola sama:

1. **Mulai dari pertanyaan, bukan dari tools.** "Kenapa udara Jakarta buruk?" bukan "Gua mau pake Random Forest."
2. **Data cleaning adalah guru terbaik.** Lu belajar lebih banyak tentang data dari bersihin dia daripada dari model yang lu train.
3. **Domain knowledge ga bisa di-skip.** Tanpa dia, analisis lu cuma angka tanpa makna.
4. **Proyek kecil itu cukup.** Ga perlu dataset 10 juta rows. Yang penting ada pertanyaan nyata dan jawaban yang jujur.

Gua masih belajar. Masih banyak yang ga gua tau. Tapi setidaknya sekarang gua belajar dari hal yang nyata, bukan dari tutorial yang bikin gua ngerasa pintar tanpa bisa apa-apa.
