---
title: "File Organizer"
description: "Aplikasi desktop berbasis Python dan Tkinter yang merapikan ribuan file kuliah dan kerjaan jokian secara otomatis berdasarkan keyword nama file."
status: "Selesai"
tags: ["Python", "Tkinter", "Threading", "Desktop App", "PyInstaller"]
category: "Web"
metric: "Mengubah folder 'Download' yang kacau jadi 17 folder terstruktur dalam satu klik"
date: "2024-09-12"
featured: false
language: "id"
github: "https://github.com/4RGY/organize_files"
---

## Konsep

Sebagian besar mahasiswa, terutama yang merangkap jadi "Freelancer" seperti saya, punya satu musuh bersama, yaitu folder Download yang isinya ratusan file dengan nama acak, numpuk dari semester ke semester tanpa sistem yang jelas. Tugas, materi kuliah, dan orderan jokian semuanya bercampur jadi satu, dan mencari satu file spesifik di tengah kekacauan itu bisa menghabiskan waktu lebih lama daripada mengerjakan tugasnya sendiri.

**File Organizer** lahir dari kebutuhan paling praktis. **"**bagaimana caranya merapikan semua ini tanpa harus drag-and-drop manual satu per satu?**"** Aplikasi ini adalah tool desktop sederhana yang membangun struktur folder akademik secara instan, lalu menyortir file-file berantakan ke tempatnya berdasarkan keyword yang terselip di nama filenya sendiri.

## Pendekatan Desain

Aplikasi ini dirancang dengan satu prinsip utama, yaitu *zero friction*. Tidak perlu setup database, tidak perlu instalasi rumit, cukup jalankan, pilih folder, klik beberapa tombol, dan semuanya selesai.

Untuk menjaga pengalaman tetap jelas dan tidak membingungkan, antarmuka dipecah ke dalam tiga tab yang punya tanggung jawab masing-masing:
* **Tab Main :** Tempat memilih base folder dan menjalankan dua aksi inti — membuat struktur folder dan mengeksekusi proses sortir.
* **Tab Keywords :** Konfigurasi mapping antara nama folder tujuan dengan kata kunci pemicunya, supaya sistem tetap fleksibel kalau suatu saat ada mata kuliah baru.
* **Tab Activity Logs :** Riwayat setiap pergerakan file secara real-time, lengkap dengan statistik total entri, jumlah file yang berhasil dipindah, dan error yang mungkin terjadi.

Ada kepuasan tersendiri melihat progress bar bergerak dari 0 ke 100% sambil status text berganti "Processing... 12/47 files", seolah menyaksikan kekacauan berubah jadi rapi secara langsung di depan mata.

## Teknis

Proyek ini dibangun dengan filosofi *no external dependency* yaitu semua menggunakan modul standar Python supaya bisa langsung jalan di komputer manapun tanpa drama instalasi library tambahan.

* **Arsitektur Utama :** Tkinter sebagai GUI framework, dipasangkan dengan `ttk` untuk komponen yang lebih modern seperti Notebook (tab) dan Progressbar.
* **Logika Pemindahan File :** Setiap file di folder `02_File_Berantakan` dicocokkan terhadap dictionary keyword. Begitu ada kecocokan, `shutil.move()` dipanggil dan file langsung berpindah ke folder tujuannya.
* **Concurrency:** Proses organize dijalankan di `threading.Thread` terpisah agar GUI tidak freeze selama file-file besar dipindahkan, sehingga progress bar dan status text tetap responsif.
* **Distribusi :** Dikemas ulang menjadi `.exe` standalone menggunakan PyInstaller (`organize.spec`), supaya teman-teman yang tidak punya Python terinstal pun tetap bisa memakainya.

```python
self.file_mappings = {
    "00_Jokian": ["0000", "jokian", "orderan"],
    "03_Tugas_Pemrograman": ["0003", "tugasPemrograman"],
    "05_Tugas_Design_Interface_User": ["0005", "tugasDesign", "tugasui", "tugasux"],
    # ...dst, total 17 folder tujuan
}
```

### Tantangan terbesar
Menjaga GUI tetap responsif ketika memindahkan ratusan file sekaligus. Percobaan pertama dijalankan secara synchronous di main thread, dan hasilnya Tkinter window langsung "Not Responding" selama proses berlangsung, membuat progress bar terlihat seperti macet padahal sebenarnya bekerja. Solusinya adalah memisahkan proses pemindahan file ke dalam thread tersendiri, lalu menyinkronkan update UI kembali ke main thread lewat `root.after()`, supaya update status dan progress bar tetap mulus tanpa membuat aplikasi hang.

### Refleksi
Tidak seperti proyek-proyek lain yang dikejar untuk skripsi atau portofolio, File Organizer murni lahir dari rasa kesal pribadi terhadap folder yang berantakan. Tidak ada arsitektur rumit, tidak ada machine learning, tidak ada deployment ke cloud hanya tool kecil yang menyelesaikan masalah kecil secara konsisten.

Satu-satunya metrik keberhasilan proyek ini adalah ketika saya membuka folder Download setelah berbulan-bulan menumpuk file jokian dan tugas kuliah, menekan satu tombol, dan dalam hitungan detik semuanya sudah duduk rapi di rumah masing-masing. Kadang solusi terbaik bukan yang paling canggih, tapi yang paling sering dipakai.