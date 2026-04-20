# SWIMLANE FLOWCHART: SI-BANKA

Berikut adalah diagram flowchart dengan format *swimlane* yang menggambarkan alur kerja aplikasi Si-Banka secara menyeluruh. Diagram ini dapat Anda jadikan referensi untuk penyusunan dokumen di Visio atau laporan proyek.

```mermaid
graph TB
    subgraph Nasabah_Warga ["NASABAH (WARGA)"]
        N1([Mulai]) --> N2[Registrasi Akun]
        N2 --> N3[Akses Link Verifikasi Email]
        N8[Cek Saldo & Riwayat]
        N9([Selesai])
    end

    subgraph Admin_RT ["ADMIN RT (OPERATOR)"]
        A1[Login ke Sistem]
        A2[Manajemen Data Nasabah]
        A3[Input Transaksi Sampah]
        A4[Atur Harga Sampah]
        A5[Lihat Laporan & Statistik]
    end

    subgraph Sistem_Backend ["SISTEM (FRONTEND & BACKEND)"]
        S1{Validasi Data}
        S2[Kirim Email Verifikasi]
        S3{Auth Berhasil?}
        S4[(Database Si-Banka)]
        S5[Kalkulasi Saldo Otomatis]
        S6[Generate Grafik Distribusi]
    end

    %% Flow Alur Pendaftaran
    N2 --> S1
    S1 -- Valid --> S2
    S2 --> N3
    N3 --> S4

    %% Flow Alur Login
    A1 --> S3
    S3 -- Yes --> A2
    S3 -- Yes --> A5

    %% Flow Alur Transaksi
    A2 --> A3
    A3 --> S5
    S5 --> S4
    S4 --> N8
    N8 --> N9

    %% Flow Alur Statistik
    A4 --> S4
    S4 --> S6
    S6 --> A5

    style N1 fill:#f9f,stroke:#333,stroke-width:2px
    style N9 fill:#f9f,stroke:#333,stroke-width:2px
    style S4 fill:#00d2ff,stroke:#333,stroke-width:2px
```

---

## Penjelasan Jalur (Swimlane)

### 1. Jalur Nasabah (Warga)
*   **Registrasi**: User mendaftarkan unit Bank Sampah atau akun nasabah.
*   **Verifikasi**: Melakukan aktivasi melalui email yang dikirimkan sistem.
*   **Monitoring**: Mengakses dashboard pribadi untuk melihat perkembangan tabungan sampah.

### 2. Jalur Admin RT (Operator)
*   **Pengelolaan**: Orang yang memiliki hak akses penuh terhadap unit Bank Sampah RT tertentu.
*   **Operasional**: Melakukan input data sampah (berat, jenis) yang dibawa nasabah.
*   **Manajemen**: Mengatur harga beli sampah per kilogram agar saldo nasabah terhitung otomatis.

### 3. Jalur Sistem (Sistem & Backend)
*   **Validasi**: Memastikan data RT/RW tidak duplikat dan email valid.
*   **Automasi**: Melakukan perhitungan `Berat x Harga = Saldo` tanpa campur tangan manual untuk menghindari kesalahan.
*   **Penyimpanan**: Mengelola database terpusat agar data nasabah aman dan terisolasi per unit RT.
