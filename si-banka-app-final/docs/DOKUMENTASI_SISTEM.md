# DOKUMENTASI SISTEM SI-BANKA
**Sistem Informasi Bank Sampah Digital - RT/RW Terintegrated**

---

## 1. PENDAHULUAN
**Si-Banka** adalah platform berbasis web yang dirancang untuk memodernisasi pengelolaan Bank Sampah di tingkat Rukun Tetangga (RT). Sistem ini memungkinkan digitalisasi pencatatan, pemantauan saldo nasabah, dan pengelolaan stok sampah secara real-time, transparan, dan efisien.

### Visi & Misi
- **Digitalisasi**: Mengganti buku tabungan manual dengan catatan digital yang aman.
- **Transparansi**: Nasabah dapat melihat saldo dan riwayat transaksi mereka kapan saja.
- **Efisiensi**: Memudahkan tugas Admin RT dalam mengelola setoran sampah harian.

---

## 2. PANDUAN PENDAFTARAN (REGISTRATION)
Proses pendaftaran di Si-Banka dirancang dengan alur *Multi-Step* untuk memastikan data pribadi dan data lokasi Bank Sampah tercatat dengan akurat.

### Langkah 1: Data Pribadi (Akun Admin)
Calon Admin RT mengisi informasi identitas dasar:
- **Nama Lengkap**: Digunakan sebagai nama profil.
- **Email**: Digunakan sebagai alamat login dan sarana verifikasi.
- **Password**: Minimal 8 karakter untuk keamanan data.

### Langkah 2: Lokasi Bank Sampah
Admin menentukan wilayah operasional Bank Sampah:
- **Nama Bank Sampah**: Identitas unik unit (misal: *Bank Sampah Makmur Sentosa*).
- **Lokasi (RT/RW/Kelurahan/Kecamatan/Kota)**: Data ini penting untuk pemetaan distribusi wilayah pada Dashboard pusat.
- **Alamat Lengkap**: Lokasi fisik unit Bank Sampah.

### Langkah 3: Verifikasi Email (PENTING)
Dalam sistem Si-Banka, keamanan adalah prioritas:
1. Sistem akan mengirimkan link verifikasi ke email yang didaftarkan.
2. User harus mengklik link tersebut untuk mengaktifkan akun.
3. Login tidak dapat dilakukan sebelum email terverifikasi sebagai bentuk pencegahan penyalahgunaan akun.

---

## 3. PANDUAN LOGIN & AUTENTIKASI
Si-Banka menggunakan sistem **Dual-Login** untuk memfasilitasi peran yang berbeda dalam satu gerbang masuk.

### A. Login Admin (Super Admin & Admin RT)
- **Metode**: Menggunakan **Alamat Email** dan Password.
- **Hak Akses**: Mengelola data nasabah, transaksi, harga sampah, dan laporan wilayah.

### B. Login Nasabah (Warga)
- **Metode**: Menggunakan **Username** (format: `nama.lengkap`) dan Password.
- **Hak Akses**: Hanya dapat melihat saldo dan riwayat transaksi pribadi (*Read-Only*).

---

## 4. DASHBOARD & FITUR UTAMA
Setelah login berhasil, user akan diarahkan ke Dashboard sesuai dengan peran masing-masing.

### A. Dashboard Admin RT
Menampilkan ringkasan unit Bank Sampah lokal:
- **Total Nasabah**: Jumlah warga yang aktif menabung.
- **Total Saldo**: Uang yang terkumpul dari sampah yang disetor.
- **Stok Sampah**: Berat sampah yang tersimpan di gudang sebelum dijual ke pengepul.

### B. Manajemen Nasabah
- **Registrasi Kolektif**: Admin RT bertanggung jawab mendaftarkan warga sebagai nasabah.
- **Pembuatan Akun Otomatis**: Sistem secara otomatis akan men-generate akun (username & password) untuk nasabah saat Admin melakukan pendaftaran.
- **Penentuan Alamat**: Alamat nasabah otomatis terhubung dengan unit Bank Sampah pengelola.

### C. Transaksi Setoran
- Pencatatan sampah masuk (Plastik, Kertas, Logam, dll).
- Kalkulasi saldo otomatis berdasarkan harga per kg yang sudah diatur oleh Admin.

---

## 5. ARSITEKTUR TEKNIS
- **Frontend**: React.js dengan Tailwind CSS (Responsive Desktop & Mobile).
- **Backend**: Laravel API Framework.
- **Database**: PostgreSQL dengan sistem *Multi-tenant* (Data antar RT terisolasi aman).

---
*Dokumentasi ini dibuat untuk kebutuhan proyek dan manual penggunaan Si-Banka.*
