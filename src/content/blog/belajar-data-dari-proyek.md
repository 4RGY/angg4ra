---
title: "Belajar Data Science dari Gempa Bumi dan Kualitas Udara"
date: "2026-06-15"
language: "id"
tags: ["Data Science", "Refleksi", "Coding Education"]
readingTime: 7
excerpt: "Kenapa tutorial Kaggle tidak pernah cukup, dan kenapa proyek yang 'kecil' justru mengajarkan lebih banyak."
---

Saya pernah menonton 12 jam tutorial data science di YouTube. Dalam satu hari. Hasilnya? Saya bisa menyebut "overfitting" di obrolan, tetapi tidak bisa menelusuri kenapa model saya hanya memprediksi satu kelas.

Itu peringatan keras.

## Jebakan Tutorial

Masalah tutorial bukan pada kualitasnya. Banyak yang bagus. Masalahnya pada ilusi belajar yang ditimbulkannya.

Anda mengikuti langkah demi langkah, semuanya berjalan, hasilnya rapi, dan Anda merasa paham. Tetapi coba ganti datasetnya. Coba pakai data berantakan, yang nilai kosongnya tersebar di mana-mana, yang nama kolomnya tidak masuk akal. Tiba-tiba semua keterampilan hasil tutorial itu tidak cukup.

Saya menyadarinya saat pertama kali mencoba menganalisis data gempa Indonesia dari BMKG.

## Data Gempa: Pelajaran Pertama

Data BMKG gratis dan terbuka. Tetapi formatnya? Tidak ada yang memberi tahu bahwa koordinatnya kadang memakai koma, kadang titik. Tidak ada yang memberi tahu bahwa zona waktunya tidak konsisten. Tidak ada yang memberi tahu bahwa ada entri ganda yang baru ketahuan setelah diplot di peta.

Tutorial tidak mengajarkan ini. Tutorial memberi Anda CSV yang sudah bersih.

Dari proyek kecil ini saya belajar:
- **Pembersihan data itu 70 persen pekerjaan**. Ini bukan melebih-lebihkan.
- **Visualisasi geospasial punya aturan main sendiri**. Scatter plot biasa tidak cukup untuk data yang punya lintang dan bujur.
- **Pengetahuan domain itu penting**. Saya harus membaca soal subduksi, kedalaman fokus gempa, dan Ring of Fire agar analisisnya bermakna.

## Kualitas Udara: Pelajaran Kedua

Proyek ISPU Jakarta lebih ambisius. Saya membandingkan 5 algoritma ML dan mendapat akurasi 94,2 persen dengan Random Forest. Terdengar bagus, bukan?

Tetapi angka itu nyaris menyesatkan.

Model saya bagus pada kelas yang dominan (kualitas udara "Sedang"), tetapi buruk pada kelas yang paling penting ("Sangat Tidak Sehat"). Mengapa? Datanya timpang. Kelas yang langka justru yang paling kritis bagi kesehatan publik.

Dari sini saya belajar satu hal yang jarang ditekankan tutorial: **akurasi bukan metrik yang cukup**. Confusion matrix, recall per kelas, dan konteks domain. Inilah yang benar-benar penting.

SHAP juga mengubah cara saya berpikir. Bukan lagi sekadar "berapa akurasinya", melainkan "mengapa model mengambil keputusan ini". Explainability bukan kemewahan, apalagi pada domain yang menyangkut manusia.

## Pendidikan Indonesia: Pelajaran Ketiga

Proyek terakhir yang membuat saya makin yakin dengan pendekatan ini: analisis data pendidikan 34 provinsi.

Di sini saya tidak memakai ML sama sekali. Murni EDA dan visualisasi. Justru itu yang membuat saya menghargai statistik deskriptif.

Tidak semua masalah butuh model. Kadang satu grafik yang tepat bercerita lebih banyak daripada seribu epoch pelatihan.

## Pola yang Saya Lihat

Tiga proyek, tiga domain berbeda, satu pola yang sama:

1. **Mulai dari pertanyaan, bukan dari perkakas.** "Mengapa udara Jakarta buruk?" bukan "Saya mau memakai Random Forest."
2. **Pembersihan data adalah guru terbaik.** Anda belajar lebih banyak tentang data dari membersihkannya daripada dari model yang Anda latih.
3. **Pengetahuan domain tidak bisa dilewati.** Tanpa itu, analisis Anda hanya angka tanpa makna.
4. **Proyek kecil itu cukup.** Tidak perlu dataset 10 juta baris. Yang penting ada pertanyaan nyata dan jawaban yang jujur.

Saya masih belajar. Masih banyak yang belum saya tahu. Tetapi setidaknya sekarang saya belajar dari hal yang nyata, bukan dari tutorial yang membuat saya merasa pintar tanpa bisa apa-apa.
