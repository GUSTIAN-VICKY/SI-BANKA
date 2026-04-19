# Dokumentasi Sistem Informasi Bank Sampah (Si-Banka)

Dokumen ini berisi visualisasi alur kerja dan arsitektur sistem Si-Banka menggunakan Swimlane Diagram dan UML (Use Case, Sequence, Class Diagram). Semua diagram di bawah menggunakan standar `mermaid` agar mudah di-render pada platform seperti Markdown preview, GitHub, dll.

## 1. Swimlane Diagram: Alur Setoran Sampah
Diagram ini menggambarkan alur kerja operasional antar peran (Nasabah, Admin RT, dan Sistem Si-Banka) saat proses transaksi setoran sampah berlangsung.

```mermaid
flowchart TD
    subgraph Nasabah
        N1([Membawa Sampah])
        N2([Menerima Bukti Saldo/Setoran])
    end

    subgraph Admin_RT ["Admin RT / Operator"]
        A1[Menerima & Menimbang Sampah]
        A2[Login ke Sistem]
        A3[Input Data Transaksi Setoran]
        A4[Memberikan Informasi Saldo]
    end

    subgraph Sistem_Si_Banka ["Sistem Si-Banka"]
        S1[Validasi Data]
        S2[Kalkulasi Nilai Rupiah\n(Berat x Harga Kategori)]
        S3[(Simpan Data Transaksi &\nUpdate Saldo Nasabah)]
        S4[Tampilkan Notifikasi Berhasil]
    end

    N1 --> A1
    A1 --> A2
    A2 --> A3
    A3 --> S1
    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> A4
    A4 --> N2
```

## 2. Use Case Diagram
Diagram interaksi aktor yang berisi fitur atau tindakan fungsional apa saja yang bisa dilakukan oleh _Admin RT_ (sebagai eksekutor) dan _Nasabah_ di dalam sistem.

```mermaid
flowchart LR
    A(Admin RT)
    N(Nasabah)

    subgraph "Sistem Informasi Si-Banka"
        direction TB
        UC1([Kelola Data Nasabah])
        UC2([Kelola Kategori Sampah])
        UC3([Input Transaksi Setoran])
        UC4([Input Transaksi Penarikan Saldo])
        UC5([Lihat Saldo & Transaksi])
        UC6([Generate Analisis/Laporan])
    end

    A --> UC1
    A --> UC2
    A --> UC3
    A --> UC4
    A --> UC5
    A --> UC6

    N --> UC5
```

## 3. Sequence Diagram: Fitur Setor Sampah
Memvisualisasikan alur atau langkah pertukaran pesan dari User Interface (Frontend) hingga ke API (Backend) dan Database pada satu skenario yaitu **Setoran Sampah**.

```mermaid
sequenceDiagram
    actor Nasabah
    actor Admin RT
    participant Frontend as Aplikasi Si-Banka
    participant Backend as Server API
    participant Database

    Nasabah->>Admin RT: Menyerahkan Sampah
    Admin RT->>Admin RT: Menimbang Sampah
    Admin RT->>Frontend: Input Form Setoran (ID Nasabah, Kategori, Berat)
    Frontend->>Backend: POST /api/transactions
    Backend->>Backend: Kalkulasi Total Harga (Berat * Harga Satuan)
    Backend->>Database: INSERT Transaksi Baru
    Database-->>Backend: Status Berhasil
    Backend->>Database: UPDATE Saldo Nasabah
    Database-->>Backend: Status Berhasil
    Backend-->>Frontend: Response 201 OK (Transaksi Berhasil)
    Frontend-->>Admin RT: Tampilkan Alert Setoran Sukses
    Admin RT-->>Nasabah: Informasi Transaksi / Struk Digital
```

## 4. Class Diagram (Model Basis Data)
Merepresentasikan relasi _Entity_ (Tabel data) beserta atribut dan perilakunya yang menjadi fondasi penyimpanan data (Model) pada Si-Banka.

```mermaid
classDiagram
    class User {
        +int id
        +string username
        +string password
        +string role
        +date created_at
        +login()
        +logout()
    }

    class Nasabah {
        +int id_nasabah
        +string nomor_induk
        +string nama_lengkap
        +string alamat
        +string no_hp
        +decimal saldo_terkini
        +date created_at
        +getSaldo()
        +getRiwayatTransaksi()
    }

    class KategoriSampah {
        +int id_kategori
        +string nama_kategori
        +decimal harga_per_kg
        +updateHarga()
    }

    class Transaksi {
        +int id_transaksi
        +int id_nasabah
        +int id_admin
        +date tanggal
        +string jenis_transaksi
        +decimal total_nilai
        +string status
        +simpan()
        +batal()
    }

    class DetailTransaksi {
        +int id_detail
        +int id_transaksi
        +int id_kategori
        +decimal berat_kg
        +decimal subtotal
    }

    User "1" -- "1" Nasabah : Memiliki profil nasabah (opsional)
    User "1" -- "*" Transaksi : Diinput oleh (admin)
    Nasabah "1" -- "*" Transaksi : Melakukan transaksi
    Transaksi "1" -- "1..*" DetailTransaksi : Terdiri dari
    KategoriSampah "1" -- "*" DetailTransaksi : Tipe sampah
```
