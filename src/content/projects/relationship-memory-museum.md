---
title: "Relationship Memory Museum"
description: "Website personal berbentuk museum digital, menyimpan kenangan bersama Piti dalam format arsip spasial yang bisa dimasuki dan dirasakan kembali."
status: "Selesai"
tags: ["HTML", "CSS", "JavaScript", "Framer Motion", "Vite"]
category: "Web"
metric: "Proyek personal paling ambisius secara visual dan emosional"
date: "2026-06-20"
featured: false
language: "id"
# demo: "https://memory-museum.pages.dev"
---

## Konsep

Sebagian besar perjalanan dua orang seringkali berakhir terkubur di bawah ribuan pesan digital atau terselip secara acak di folder galeri ponsel yang penuh sesak. Proyek ini lahir dari keinginan sederhana namun mendalam. **"**bagaimana jika momen-momen berharga tersebut tidak sekadar disimpan, melainkan diberi sebuah rumah?**"**

Untukmu, Piti. **Relationship Memory Museum** adalah sebuah kado personal sekaligus eksperimen teknologi. Ini adalah ruang museum digital statis yang memperlakukan rekaman perjalanan kami, baik berupa potongan foto, sebaris kalimat, rekaman suara, hingga tanggal-tanggal penting, sebagai artefak pameran yang dikurasi secara sadar. Proyek ini mengeksplorasi bagaimana sebuah situs web bisa bertransformasi menjadi medium naratif yang imersif dan bernyawa, melampaui dinginnya interaksi *scrolling* halaman web konvensional.

## Pendekatan Desain

Museum ini dirancang dalam bentuk beberapa ruang virtual yang masing-masing mewakili satu babak waktu tertentu dalam perjalanan kami. Pengunjung diajak berjalan melintasi koridor waktu, menemukan potongan masa lalu yang sengaja diletakkan di sudut-sudut yang terencana.

Untuk meredam impresi kaku dari sebuah perangkat digital, arah estetikanya sengaja ditarik ke elemen-elemen **analog** :
* **Grain & Texture :** Lapisan tekstur kertas dan efek *noise* halus pada latar belakang untuk memberi kesan taktil (seolah bisa diraba).
* **Tipografi Klasik :** Penggunaan font serif yang melankolis dan hangat, menyerupai ketikan mesin tik atau surat-surat lama yang disimpan dalam kotak.
* **Palet Warna Muted :** Warna-warna pudar yang terinspirasi dari tone foto polaroid lama yang mulai menguning oleh waktu.

Terdapat kontras yang indah di sini, sebuah usaha untuk menangkap kehangatan masa lalu yang rapuh, dibangun di atas fondasi instruksi JavaScript modern yang bekerja secara presisi di balik layar.

## Teknis

Proyek ini sengaja dibangun dengan arsitektur *minimal footprint* tanpa database atau infrastruktur backend yang rumit, menjaga agar seluruh pengalaman terasa instan dan privat.

* **Arsitektur Utama :** Menggunakan vanilla JavaScript dengan Vite sebagai *build tool* untuk memastikan performa pemuatan ruang tetap optimal.
* **Kurasi Data :** Semua memori disimpan secara terstruktur di dalam berkas JSON statis. Pengisian data dilakukan secara manual, menjadikan proses penyusunan baris kode ini sebagai proses kurasi ingatan yang intim.
* **Animasi Transisi :** Perpindahan antar ruang memanfaatkan Framer Motion versi vanilla. Gerakan kamera dan pergeseran viewport dirancang sehalus mungkin untuk menciptakan ilusi spasial, seolah pengunjung benar-benar melangkah dari satu ruangan ke ruangan lain.

```json
{
  "room": "babak-awal",
  "title": "Pertemuan Pertama",
  "artifacts": [
    {
      "type": "polaroid",
      "src": "/assets/archive/first-date.jpg",
      "caption": "Sudut kedai kopi malam itu, 2025."
    }
  ]
}
```

### Tantangan terbesar
Merancang navigasi spasial yang intuitif tanpa mengandalkan instruksi teks yang kaku (seperti tombol "Next" atau tanda panah besar). Saya ingin ia bisa menjelajahi ruang-ruang ini secara organik, mengikuti intuisi gerakannya sendiri. Melalui tiga kali perombakan struktur transisi, navigasi berbasis gesture dan pelacakan viewport ini akhirnya berhasil terasa natural, seperti berjalan di koridor nyata yang menuntun langkah secara perlahan.

### Refleksi
Sebagai proyek yang didedikasikan sepenuhnya untuk seseorang yang berharga, Relationship Memory Museum sepenuhnya lepas dari metrik industri web. Tidak ada target pengguna baru, tidak ada conversion rate yang dikejar, dan tidak ada optimasi SEO untuk memburu algoritma pencarian. Metrik-metrik dingin itu kehilangan fungsinya di sini.

Satu-satunya metrik keberhasilan proyek ini adalah perasaan. Ketika antarmuka ini dibuka, dan ia yang berada di seberang layar bisa terdiam sejenak, menelusuri setiap sudutnya dengan ritme yang lambat, dan merasakan kembali kehangatan momen yang tersimpan di dalamnya, maka seluruh baris kode yang ditulis dalam kesunyian telah menyelesaikan tugasnya dengan sempurna.