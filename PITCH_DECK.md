# Pitch Deck - Si-Banka (Sistem Informasi Bank Sampah)
Dokumen ini berisi materi presentasi (*pitch deck*) untuk aplikasi Si-Banka. Format di bawah dirancang agar mudah dibaca, disalin ke PowerPoint/Canva, atau dikonversi langsung menjadi slide presentasi menggunakan *Markdown Slide Generator* seperti [Marp](https://marp.app/).

---

# BAGIAN 1: SLIDE CONTENT (MARP-COMPATIBLE)

```markdown
---
marp: true
theme: gaia
_class: lead
paginate: true
backgroundColor: #0f172a
color: #f8fafc
style: |
  section {
    font-family: 'Inter', sans-serif;
    padding: 40px;
  }
  h1 {
    color: #10b981;
  }
  h2 {
    color: #34d399;
  }
  footer {
    font-size: 0.5em;
    color: #64748b;
  }

---

# Si-Banka 🍃
### Sistem Informasi Bank Sampah RT Modern & Terintegrasi

*Mengubah Sampah Menjadi Berkah, Mengubah Pembukuan Menjadi Otomatis*

**Oleh:** Tim Pengembang Si-Banka
**Stack:** React + Laravel + Docker

---

## ❌ MASALAH (The Problem)

*   **Pencatatan Manual & Tidak Efisien:** Pengelolaan data bank sampah di tingkat RT masih memakai buku besar fisik—rentan robek, hilang, dan memakan waktu lama saat rekap bulanan.
*   **Akurasi Rendah & Human Error:** Risiko salah hitung berat sampah, nilai rupiah per kategori, dan penarikan saldo oleh admin.
*   **Kurangnya Transparansi Nasabah:** Warga (nasabah) tidak bisa memantau saldo tabungan sampah mereka secara langsung dan mandiri, menurunkan minat warga untuk berpartisipasi.
*   **Masalah Lingkungan RT:** Sampah rumah tangga menumpuk tanpa pemilahan karena kurangnya insentif yang jelas bagi warga.

---

## ✅ SOLUSI (The Solution)

### **Si-Banka: Digitalisasi Bank Sampah Tingkat RT**

Sistem informasi berbasis web yang mengintegrasikan administrasi internal pengurus RT dengan transparansi finansial warga secara instan.

*   **Otomatisasi Penuh:** Perhitungan berat x harga per kategori berjalan otomatis di sistem.
*   **Dashboard Mandiri Nasabah:** Akses mandiri untuk warga untuk mengecek saldo & riwayat setoran secara *real-time*.
*   **Ekspor Data Sekali Klik:** Mengubah data transaksi bulanan menjadi laporan siap pakai (PDF/Excel) untuk rapat RT.
*   **Infrastruktur Modern:** Berbasis arsitektur API terpisah (React + Laravel) yang *Docker-Ready* untuk kemudahan *scaling*.

---

## ⚡ FITUR UTAMA (Key Features)

1.  **Multi-role Dashboard:** Tampilan khusus untuk **Admin RT** (manajemen & input) dan **Nasabah** (cek saldo & riwayat).
2.  **Form Input Setoran Cepat:** Input kategori sampah dan berat secara dinamis dengan hitungan harga otomatis.
3.  **Manajemen Kategori & Harga Sampah:** Pengaturan harga per kilogram sampah yang dapat disesuaikan sewaktu-waktu sesuai harga pasar.
4.  **Sistem Pencairan Saldo (Withdrawal):** Manajemen penarikan dana nasabah dengan verifikasi admin untuk mencocokkan arus kas fisik.
5.  **Generator Laporan Bulanan:** Cetak ringkasan transaksi warga secara berkala tanpa perlu kalkulasi manual.

---

## 💎 MANFAAT (Benefits)

| Bagi Warga (Nasabah) | Bagi Pengurus RT (Admin) | Bagi Lingkungan |
| :--- | :--- | :--- |
| **Insentif Finansial Jelas**<br>Tabungan sampah terkonversi rupiah secara transparan. | **Hemat Waktu & Tenaga**<br>Mengurangi beban administrasi bulanan hingga 80%. | **Pengurangan Sampah TPA**<br>Mendorong warga memilah sampah organik/anorganik sejak dari rumah. |
| **Akses Saldo 24/7**<br>Cukup login melalui browser HP untuk melihat saldo ter-update. | **Bebas Human Error**<br>Semua kalkulasi dilakukan oleh server secara akurat. | **Ekonomi Sirkular**<br>Menciptakan ekosistem RT yang mandiri lingkungan & finansial. |

---

## 🖥️ DEMO APLIKASI (App Walkthrough)

### **Alur Transaksi Si-Banka**

1.  **Registrasi:** Admin RT membuat akun nasabah baru di sistem. Nasabah menerima kredensial login.
2.  **Setoran:** Warga membawa sampah terpilah -> Admin menginput berat dan kategori -> Saldo warga langsung bertambah.
3.  **Pengecekan Saldo:** Nasabah login di HP masing-masing dan melihat histori tabungan yang transparan.
4.  **Penarikan:** Nasabah meminta pencairan -> Admin menyerahkan kas fisik & memotong saldo di sistem -> Transaksi tercatat aman.
5.  **Pelaporan:** Akhir bulan, Admin mengekspor laporan bulanan berformat PDF/Excel.

---

## 🚀 RENCANA LANJUT (Roadmap & Future Plan)

*   **Integrasi WhatsApp Gateway (Notifikasi Instan):** Mengirim struk setoran digital dan info saldo langsung ke nomor WhatsApp nasabah setelah transaksi disubmit.
*   **Fitur Pembayaran Iuran & PPOB:** Saldo tabungan sampah nasabah dapat langsung digunakan untuk membayar iuran RT, membeli token listrik, atau pulsa.
*   **Aplikasi Mobile (PWA):** Menyediakan aplikasi ringan yang dapat di-install di smartphone tanpa memakan memori besar.
*   **Analisis Tren & Prediksi Produksi Sampah:** Dashboard analitik grafik untuk memantau jenis sampah terbanyak guna kerja sama dengan pengepul skala besar.

---

# 🍃 Terima Kasih

**Mari Bersama Wujudkan RT Hijau, Digital, dan Sejahtera!**

*Si-Banka: Solusi Cerdas Kelola Sampah, Manfaat Nyata Bagi Warga.*

*   **Repository:** [Si-Banka GitHub](https://github.com/GUSTIAN-VICKY/SI-BANKA)
*   **Teknologi:** React SPA, Laravel REST API, MySQL Database, Docker.
```

---

# BAGIAN 2: PANDUAN VISUAL & NARASI (SPEAKER NOTES)

Gunakan panduan di bawah ini saat menyusun slide di PowerPoint/Canva dan mempresentasikannya di depan audiens (seperti Ketua RT, RW, atau Juri Pitching).

### 🎨 Rekomendasi Desain Visual
*   **Palet Warna:** Gunakan warna bertema alam namun modern. 
    *   Primary: Hijau Emerald/Mint (`#10b981` atau `#34d399`) untuk melambangkan kebersihan dan uang.
    *   Dark Background: Navy/Slate (`#0f172a` atau `#1e293b`) untuk memberikan kesan premium, modern, dan teknologi tinggi.
    *   Accent: Putih dan Abu-abu Terang untuk teks agar tingkat keterbacaan tinggi.
*   **Tipografi:** Gunakan font Sans-Serif modern seperti **Inter**, **Outfit**, atau **Roboto** (Google Fonts). Hindari Serif tradisional agar terlihat dinamis.
*   **Aset Visual:** Gunakan ikon minimalis (contoh: ikon daun, koin, grafik, timbangan) daripada gambar dekoratif yang terlalu ramai.

---

### Slide 1: Judul & Pengenalan
*   **Visual:** Judul "Si-Banka" dengan font tebal berukuran besar, warna latar belakang gelap (`#0f172a`) dengan logo minimalis berbentuk daun yang berpadu dengan ikon koin emas/hijau.
*   **Narasi Presenter:**
    > "Selamat pagi/siang bapak/ibu sekalian. Hari ini saya ingin memperkenalkan Si-Banka, sebuah Sistem Informasi Bank Sampah RT Modern & Terintegrasi. Aplikasi ini lahir dari keresahan kita bersama tentang bagaimana mengelola sampah sekaligus memberikan dampak ekonomi nyata bagi warga dengan sentuhan teknologi modern."

### Slide 2: Masalah (The Problem)
*   **Visual:** Tampilkan 3 poin masalah menggunakan ikon yang sesuai (misal: buku catatan yang rusak, tanda silang merah, dan grafik menumpuk). Gunakan layout grid horizontal agar audiens mudah memetakan masalahnya.
*   **Narasi Presenter:**
    > "Di lingkungan tingkat RT, kita sering menghadapi tiga masalah utama. Pertama, pengurus RT masih mencatat setoran warga secara manual di buku besar, yang rawan hilang dan sulit direkap. Kedua, sering terjadi salah hitung uang setoran. Ketiga, warga kurang termotivasi memilah sampah karena mereka tidak tahu secara pasti berapa saldo tabungan sampah mereka secara real-time. Hal ini menyebabkan volume sampah ke TPA terus meningkat tanpa ada manfaat ekonomi yang dirasakan warga."

### Slide 3: Solusi (The Solution)
*   **Visual:** Tampilkan mockup/tangkapan layar aplikasi Si-Banka yang bersih dan responsif. Gunakan warna hijau dominan untuk menunjukkan solusi yang ramah lingkungan.
*   **Narasi Presenter:**
    > "Sebagai solusi, kami menghadirkan Si-Banka. Sebuah platform digital yang mendigitalisasi seluruh ekosistem bank sampah RT. Si-Banka secara otomatis mengkalkulasi berat sampah menjadi saldo rupiah, memberikan transparansi bagi warga melalui dashboard pribadi, dan mempermudah pengurus mengekspor laporan bulanan secara instan."

### Slide 4: Fitur Utama (Key Features)
*   **Visual:** Desain berbentuk kartu (*feature cards*) berisi 4-5 fitur unggulan lengkap dengan ikon mini yang interaktif (misal: *dashboard icon, calculator icon, pdf icon*).
*   **Narasi Presenter:**
    > "Si-Banka dilengkapi berbagai fitur unggulan. Kami memiliki Dashboard Multi-Role yang memisahkan akses Admin RT dan Nasabah. Admin dapat menginput transaksi setoran dengan cepat menggunakan kalkulator otomatis, mengelola harga sampah, serta mengelola pencairan dana. Di akhir periode, sistem dapat langsung membuat laporan bulanan siap cetak."

### Slide 5: Manfaat (Benefits)
*   **Visual:** Tampilkan tabel 3 kolom yang membagi manfaat bagi Warga, Admin RT, dan Lingkungan secara ringkas dan padat.
*   **Narasi Presenter:**
    > "Manfaat Si-Banka sangat luas. Bagi warga, ini adalah insentif finansial yang transparan. Bagi admin RT, pekerjaan merekap berkurang hingga 80% dan bebas dari kesalahan hitung saldo warga. Sedangkan bagi lingkungan, sistem ini secara aktif melatih kebiasaan warga memilah sampah dari rumah, menciptakan ekonomi sirkular lokal."

### Slide 6: Demo Aplikasi (App Walkthrough)
*   **Visual:** Diagram alur melingkar (*circular flow*) atau diagram langkah (1-2-3-4-5) yang menunjukkan interaksi dari nasabah membawa sampah hingga terbitnya laporan bulanan.
*   **Narasi Presenter:**
    > "Bagaimana sistem ini bekerja? Alurnya sangat sederhana. Warga mendaftar -> membawa sampah terpilah ke pos RT -> Admin menimbang dan menginput data -> Saldo warga bertambah secara instan dan dapat dicek via HP masing-masing -> Pencairan saldo dapat dilakukan kapan saja dengan verifikasi admin -> Di akhir bulan, laporan terekspor otomatis."

### Slide 7: Rencana Lanjut (Roadmap & Future Plan)
*   **Visual:** Garis linier (*timeline*) horizontal yang menggambarkan tahapan pengembangan ke depan.
*   **Narasi Presenter:**
    > "Pengembangan Si-Banka tidak berhenti di sini. Rencana jangka pendek kami adalah mengintegrasikan WhatsApp Gateway untuk notifikasi setoran. Selanjutnya, saldo sampah warga akan dapat langsung dikonversi untuk pembayaran iuran RT bulanan atau pembelian token listrik (PPOB), serta merilis aplikasi berbasis mobile (PWA) agar aksesnya lebih mudah bagi semua kalangan usia."

### Slide 8: Penutup
*   **Visual:** Informasi kontak, logo sistem, link repositori github, serta kalimat penutup yang kuat.
*   **Narasi Presenter:**
    > "Dengan Si-Banka, mari kita ubah tumpukan sampah menjadi peluang kesejahteraan warga. Terima kasih atas perhatiannya, mari kita wujudkan RT yang bersih, digital, dan mandiri!"
