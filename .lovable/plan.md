
# Plan: Komisi Otomatis di Detail Booking Admin + Rekomendasi Fitur MVP

## Bagian 1: Tambah Perhitungan Komisi di Halaman Booking Admin

### Perubahan yang Dilakukan

**1. Expand Row di Tabel Booking (`src/pages/admin/Bookings.tsx`)**

Saat admin klik baris booking, akan muncul panel detail yang menampilkan:
- Info PIC (nama, tipe: cabang/agen/karyawan)
- Jumlah jemaah dalam booking tersebut
- Rate komisi per jemaah (dari `package_commissions`)
- **Total komisi otomatis** = rate x jumlah jemaah
- Daftar jemaah dalam booking

**2. Data yang Diambil**
- Query `booking_pilgrims` untuk hitung jumlah jemaah
- Query `package_commissions` untuk rate komisi sesuai `pic_type` dan `package_id`
- Query `agents` / `branches` / `profiles` untuk nama PIC

**3. Tampilan UI**
- Tombol "Detail" (icon Eye) di setiap baris booking
- Panel expandable di bawah baris menampilkan:

```text
+--------------------------------------------------+
| PIC: Agen - Ahmad Fauzi                          |
| Paket: Umroh Plus Turkey                         |
| Jemaah: 3 orang                                  |
| Komisi/Jemaah: Rp 2.000.000                      |
| TOTAL KOMISI: Rp 6.000.000                       |
+--------------------------------------------------+
| Daftar Jemaah:                                   |
| 1. Budi - Laki-laki                              |
| 2. Siti - Perempuan                              |
| 3. Andi - Laki-laki                              |
+--------------------------------------------------+
```

Booking tanpa PIC (pic_type = "pusat") akan menampilkan "Tidak ada komisi (Kantor Pusat)".

---

## Bagian 2: Rekomendasi Fitur MVP vs Premium

### Fitur yang SUDAH ADA (MVP -- Siap Pakai):
1. Manajemen Paket Umroh (CRUD, harga per tipe kamar)
2. Keberangkatan & Kuota
3. Booking Online (pilih kamar, data jemaah, PIC)
4. Pembayaran Multi-Tahap (DP + cicilan)
5. Deadline Pembayaran Otomatis
6. Notifikasi & Reminder Pembayaran
7. Manajemen Cabang & Agen
8. Komisi per Paket (Cabang/Agen/Karyawan)
9. Laporan & Statistik (Booking, Pendapatan, Komisi)
10. CMS (Blog, Halaman Dinamis, FAQ, Galeri, Testimoni)
11. Autentikasi & Admin Dashboard

### Fitur yang BELUM ADA tapi PENTING untuk MVP:
1. **Export Laporan ke Excel/PDF** -- admin butuh cetak laporan
2. **Invoice/Kwitansi Otomatis** -- bukti pembayaran resmi
3. **Manajemen Muthawif** -- sudah ada tabel tapi belum ada halaman admin
4. **WhatsApp Integration** -- kirim notifikasi via WA (paling penting untuk travel umroh)

### Fitur untuk UPGRADE/PREMIUM (tampil menu tapi muncul notif upgrade):
1. **Akuntansi & Keuangan** -- Buku besar, neraca, laporan laba rugi
2. **CRM & Follow-up Otomatis** -- Pipeline calon jemaah, auto follow-up
3. **Multi-Bahasa** -- Website dalam bahasa Arab/Inggris
4. **Integrasi Payment Gateway** -- Bayar online via Midtrans/Xendit
5. **Manajemen Dokumen Jemaah** -- Upload paspor, visa, foto, tracking status dokumen
6. **Analitik AI** -- Prediksi demand, rekomendasi harga optimal
7. **Mobile App** -- Aplikasi khusus untuk jemaah dan agen
8. **Multi-Cabang Dashboard** -- Dashboard terpisah per cabang dengan login sendiri

### Implementasi Menu Premium
- Tambah menu-menu premium di sidebar `AdminLayout.tsx` dengan icon `Crown` atau `Lock`
- Saat diklik, tampilkan Dialog/Modal:
  > "Fitur [Nama Fitur] tersedia di paket Premium. Hubungi kami untuk upgrade sistem Anda."
  > dengan tombol "Hubungi Kami" (link ke WhatsApp)

---

## Detail Teknis

### File yang Diubah:
1. **`src/pages/admin/Bookings.tsx`** -- Tambah expand row dengan detail komisi, daftar jemaah, dan info PIC
2. **`src/components/admin/AdminLayout.tsx`** -- Tambah menu premium dengan icon Lock dan handler upgrade dialog
3. **Buat komponen baru `src/components/admin/UpgradeDialog.tsx`** -- Dialog reusable untuk notifikasi upgrade

### Tidak ada perubahan database -- semua data sudah tersedia di tabel yang ada.
