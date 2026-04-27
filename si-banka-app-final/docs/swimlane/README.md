# 📊 UML Swimlane Flowchart — Si-Banka

Folder ini berisi **7 diagram swimlane** yang mendokumentasikan seluruh alur sistem Si-Banka.  
Format: **Draw.io (`.drawio`)** — buka dengan [app.diagrams.net](https://app.diagrams.net) atau ekstensi VS Code **Draw.io Integration**.

---

## 📂 Daftar Diagram

| No | File | Deskripsi | Aktor Terlibat |
|----|------|-----------|----------------|
| 1 | `01_registrasi.drawio` | Registrasi Bank Sampah & Verifikasi Email | Admin RT, Sistem, Email Server |
| 2 | `02_login.drawio` | Login Multi-Role (email/username) | User, Frontend, Backend, Database |
| 3 | `03_manajemen_nasabah.drawio` | CRUD Nasabah + Auto-Buat Akun Login | Admin RT, Sistem, AccountService, DB |
| 4 | `04_transaksi.drawio` | Transaksi Setoran Sampah (Create/Update/Delete) | Admin RT, Sistem, BalanceService, StockService, TransactionLog |
| 5 | `05_harga_stok.drawio` | Update Harga & Stok dengan Auto-Clone Global→Lokal | Admin RT, Super Admin RT, Super Admin Kota, Sistem, DB |
| 6 | `06_manajemen_user.drawio` | Manajemen Akun User (CRUD) | Super Admin, Sistem, DB |
| 7 | `07_transfer_nasabah.drawio` | Transfer Nasabah Antar Bank Sampah | Super Admin Kota, Sistem, DB |
| 8 | `08_sistem_aplikasi_umum.drawio` | Flowchart End-to-End Sistem Aplikasi Setelah Login | Aktor, Frontend, Backend & Database |
| 9 | `09_presentasi_high_level.drawio` | Flowchart Bisnis (Cocok untuk presentasi dosen/pengguna) | Seluruh Role, Sistem |

---

## 🎭 Hierarki Role

```
super_admin_kota   → Akses penuh ke semua Bank Sampah (level kota)
admin_kota         → View only semua data (tanpa CRUD)
super_admin_rt     → Akses penuh di Bank Sampah sendiri + kelola user
admin_rt           → CRUD data di Bank Sampah sendiri (tanpa kelola user)
nasabah            → View data sendiri saja
```

---

## 🔑 Konvensi Warna

| Warna | Makna |
|-------|-------|
| 🟢 Hijau | Start / End / Sukses |
| 🔵 Biru | Aksi User (Frontend) |
| 🟣 Ungu | Proses Sistem (Backend) |
| 🟡 Kuning | Decision / Database |
| 🟠 Orange | Service Layer (BalanceService, StockService) |
| 🔴 Merah | Error / Rejected / Audit Log |

---

## ⚙️ Cara Membuka

### Opsi 1 — Browser (Gratis)
1. Buka [https://app.diagrams.net](https://app.diagrams.net)
2. `File` → `Open from` → `Device`
3. Pilih file `.drawio`

### Opsi 2 — VS Code Extension
1. Install ekstensi **"Draw.io Integration"** (Henning Dieterichs)
2. Klik file `.drawio` langsung dari Explorer VS Code

---

## 📋 Ringkasan Alur Sistem

### 1. Registrasi
Admin RT mendaftar → sistem buat Bank Sampah + akun `super_admin_rt` → kirim email verifikasi → admin verifikasi → bisa login.

### 2. Login
Input email (admin) atau username (nasabah) → cek format → query DB → hash check password → cek email verified → generate Sanctum token → redirect ke dashboard sesuai role.

### 3. Manajemen Nasabah
Admin RT tambah nasabah → sistem auto-assign lokasi dari bank sampah admin → cek soft-deleted → buat Customer + akun User (role: nasabah) dengan username otomatis.

### 4. Transaksi Setoran
Admin RT input transaksi → sistem verifikasi tenant → DB transaction: simpan transaksi + update saldo nasabah (BalanceService) + update stok (StockService) + catat audit log (TransactionLog).

### 5. Harga & Stok (Auto-Clone)
Admin RT update harga WasteType global → sistem **auto-clone** record global menjadi record lokal milik bank sampah admin → update hanya berlaku untuk lokal, tidak mempengaruhi bank sampah lain.

### 6. Manajemen User
Hanya Super Admin (Kota/RT) yang bisa CRUD user → hapus Super Admin RT terakhir → otomatis hapus Bank Sampah terkait.

### 7. Transfer Nasabah
Hanya Super Admin Kota → pilih nasabah + bank sampah tujuan → cek duplikasi nama → update `bank_sampah_id`, RT, RW di customer + akun user terkait.
