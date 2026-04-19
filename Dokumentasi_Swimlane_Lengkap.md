# Diagram Flow Aplikasi Si-Banka (End-to-End Swimlane)

Diagram swimlane ini memvisualisasikan siklus bisnis utama secara keseluruhan di dalam aplikasi **Si-Banka** dari sudut pandang 3 pihak utama: **Nasabah**, **Admin RT (Operator)**, dan **Sistem/Database**.

Mencakup 4 alur utama:
1. Pendaftaran Akun Nasabah.
2. Proses Setoran (Deposit) Sampah.
3. Proses Penarikan (Withdrawal) Saldo.
4. Pengecekan Saldo & Pelaporan.

```mermaid
flowchart TD
    %% Styling
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef sys fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef nasabah fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    classDef admin fill:#fff3e0,stroke:#f57c00,stroke-width:2px;

    %% SWIMLANES %%
    subgraph Nasabah ["NASABAH (Warga RT)"]
        direction TB
        N_Reg([Datang Mendaftar]):::nasabah
        N_Drop([Membawa Sampah Terpilah]):::nasabah
        N_Check([Mengecek Saldo via Web/Aplikasi]):::nasabah
        N_Req([Mengajukan Penarikan Dana]):::nasabah
        N_Terima([Menerima Uang Tunai / Transfer]):::nasabah
    end

    subgraph Admin_RT ["ADMIN RT / OPERATOR"]
        direction TB
        A_Reg[Membuat Akun Nasabah di Sistem]:::admin
        A_Timbang[Menimbang & Memeriksa Kategori]:::admin
        A_Input[Input Form Setoran Sampah]:::admin
        A_Approve[Verifikasi Tarik Saldo & Serahkan Dana]:::admin
        A_Report[Generate Rekap Laporan Bulanan]:::admin
    end

    subgraph Sistem_Si_Banka ["SISTEM SI-BANKA"]
        direction TB
        S_Akun[("Simpan Data Akun & Generate ID")]:::sys
        S_Kalkulasi["Kalkulasi Rupiah (Berat x Nilai)"]:::sys
        S_TxIn[("Update Saldo [+] & Simpan Setoran")]:::sys
        S_Dash["Tampilkan Informasi Saldo & Riwayat"]:::sys
        S_TxOut[("Update Saldo [-] & Simpan Tarikan")]:::sys
        S_GenPDF["Kompilasi Data Transaksi (PDF/Excel)"]:::sys
    end

    %% ALUR PENDAFTARAN %%
    N_Reg -->|Menyerahkan KTP/Data| A_Reg
    A_Reg -->|Submit Form Reg| S_Akun

    %% ALUR SETORAN %%
    S_Akun -.->|Hari Transaksi| N_Drop
    N_Drop -->|Menyerahkan| A_Timbang
    A_Timbang -->|Mendata| A_Input
    A_Input -->|POST Transaksi| S_Kalkulasi
    S_Kalkulasi --> S_TxIn

    %% ALUR PENGECEKAN SALDO & PENARIKAN %%
    S_TxIn -.-> |Notifikasi/Login| N_Check
    N_Check -->|GET Data| S_Dash
    S_Dash -.->|Ingin Cairkan Saldo| N_Req
    N_Req -->|Konfirmasi| A_Approve
    A_Approve -->|Submit Penarikan| S_TxOut
    S_TxOut -->|Notifikasi Sukses| N_Terima

    %% ALUR PELAPORAN / REKAP %%
    S_TxIn -.-> |Akhir Periode| A_Report
    S_TxOut -.-> |Akhir Periode| A_Report
    A_Report -->|Request Laporan| S_GenPDF
```

### Keterangan Alur Siklus:
1. **Fase Pendaftaran**: Nasabah mendaftarkan diri melalui Admin RT, lalu sistem membuatkan `ID Nasabah` dan titik saldo awal (`0`).
2. **Fase Transaksi Rutin**: Nasabah secara berkala membawa sampah terpilah. Admin menimbang dan memilih kategorinya di form, lalu Sistem secara matematis mengkonversi valuasinya ke rupiah dan menambahkan ke saldo Nasabah. 
3. **Fase Kontrol (Nasabah)**: Nasabah bisa kapan saja _login_ untuk mengecek riwayat tabungan dan _dashboard_-nya menggunakan kredensial miliknya.
4. **Fase Penarikan**: Ketika saldo dirasa cukup, nasabah dapat mengajukan pencairan. Admin memberikan uang secara fisik sembari memotong riwayat saldo tersebut di dalam sistem, agar _balance_ tetap tersimpan akurat.
5. **Fase Evaluasi (Admin)**: Saat akhir bulan, Admin melakukan administrasi ekspor (Laporan PDF/Excel) lewat sistem Si-Banka.
