# Diagram Swimlane (Format Horizontal / Visio Rapi)

Gunakan fitur **Markdown Preview** di VS Code. Diagram di bawah telah dikalibrasi ke `flowchart LR` dengan kolom bersisian agar garis-garis alur (_routing_) tidak bertabrakan, sehingga bentuk **Swimlane**-nya jauh lebih rapi dan linier untuk disalin ke Visio.

```mermaid
flowchart LR
    %% Style standar rapi
    classDef startend fill:#e1e1e1,stroke:#333,stroke-width:1px,rx:20,ry:20;
    classDef process fill:#f0f0f0,stroke:#333,stroke-width:1px;
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:1px;

    %% SWIMLANES (Dibariskan dari Kiri ke Kanan sebagai Kolom) %%
    
    subgraph Nasabah ["1. Nasabah"]
        direction TB
        N_Start([Nasabah\nMembawa Sampah]):::startend
        N_End([Notifikasi:\nSaldo Bertambah]):::startend
        N_Fail([Notifikasi:\nTransaksi Batal]):::startend
    end

    subgraph Admin ["2. Admin RT"]
        direction TB
        A_Log["Admin Menimbang &\nInput Data"]:::process
        A_Req["Admin Mengoreksi\nData"]:::process
        A_Cancel["Membatalkan\nTransaksi"]:::process
    end

    subgraph Sistem ["3. Sistem Si-Banka"]
        direction TB
        S_Review["Sistem Menerima\nData Input"]:::process
        S_Dec_Valid{"Data\nSesuai?"}:::decision
        S_Approve["Menyetujui\nSetoran"]:::process
    end

    subgraph Validasi ["4. Validasi Backend"]
        direction TB
        V_Rule["Sistem Verifikasi\nAnomali Berat"]:::process
        V_Dec_Chg{"Perbaikan\nDiterima?"}:::decision
        V_Ok["Tandai Valid (OK)"]:::process
        V_No["Tandai Invalid"]:::process
    end

    subgraph DB ["5. Database Saldo"]
        direction TB
        DB_Save["Simpan Transaksi &\nUpdate Saldo"]:::process
        DB_End([Saldo Nasabah\nDiperbarui]):::startend
        DB_CancelEnd([Tidak Ada\nPerubahan]):::startend
    end

    %% MAPPING ALUR (Diurutkan berdasarkan eksekusi) %%
    
    N_Start --> A_Log
    A_Log --> S_Review
    S_Review --> S_Dec_Valid

    %% Percabangan Pertama
    S_Dec_Valid -- Ya --> S_Approve
    S_Dec_Valid -- Tidak --> A_Req

    %% Loop Perbaikan
    A_Req --> V_Rule
    V_Rule --> V_Dec_Chg

    %% Percabangan Kedua (Hasil Perbaikan)
    V_Dec_Chg -- Ya --> V_Ok
    V_Ok --> S_Approve

    V_Dec_Chg -- Tidak --> V_No
    V_No --> A_Cancel

    %% Alur Gagal
    A_Cancel --> DB_CancelEnd
    A_Cancel --> N_Fail

    %% Alur Sukses
    S_Approve --> DB_Save
    DB_Save --> DB_End
    DB_Save --> N_End
```

### 💡 Konversi ke Visio:
Karena di Visio kita bisa menarik garis dengan bebas:
1. Buat **Cross-Functional Flowchart (Vertical)** dengan 5 lanes.
2. Labeli _lanes_ dari kiri ke kanan: **Nasabah**, **Admin RT**, **Sistem**, **Validasi Backend**, dan **Database Saldo**.
3. Taruh setiap blok _shape_ yang ada pada kode ini pada lintasannya masing-masing.
4. Buat garis lurus mengikuti panah. Tidak akan ada garis yang melilit secara tidak beraturan dengan memodelkannya seperti kerangka di atas.
