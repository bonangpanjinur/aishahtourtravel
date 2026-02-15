
# Analisis Fitur: Yang Perlu Ditambah dan Disempurnakan

## A. FITUR YANG PERLU DISEMPURNAKAN (Bug/UX Issues)

### 1. Booking Page - Error `branch_id` dan `agent_id`
File `src/pages/Booking.tsx` baris 217-218 mengirim field `branch_id` dan `agent_id` ke tabel `bookings`, tapi kolom ini **tidak ada** di database. Tabel `bookings` hanya punya `pic_id` dan `pic_type`. Ini akan menyebabkan error saat submit booking.

**Solusi:** Hapus `branch_id` dan `agent_id` dari payload insert booking.

### 2. Pagination di Semua Halaman Admin
Semua halaman admin (Bookings, Payments, Pilgrims, dll) memuat **seluruh data sekaligus** tanpa pagination. Dengan limit default Supabase 1000 rows, data besar akan terpotong tanpa peringatan.

**Solusi:** Tambahkan pagination (load more atau page numbers) di halaman Bookings, Payments, Pilgrims, dan Reports.

### 3. Dashboard Tidak Filter Berdasarkan Role
Dashboard admin menampilkan semua data terlepas dari role user. User dengan role `cabang` atau `agen` seharusnya hanya melihat data milik mereka.

**Solusi:** Filter query dashboard berdasarkan role user yang sedang login.

### 4. Gender Display Inconsisten
Di `BookingDetailPanel.tsx` baris 158, gender dicek dengan `"L"` dan `"Laki-laki"`, tapi di form Booking, value yang disimpan adalah `"male"` dan `"female"`. Ini menyebabkan label gender tidak muncul di detail panel.

**Solusi:** Standarisasi pengecekan gender ke `"male"/"female"` di seluruh aplikasi.

---

## B. FITUR PENTING YANG BELUM ADA

### 5. Export Laporan ke Excel/PDF
Halaman Reports sudah menampilkan grafik dan tabel, tapi tidak ada fitur export. Admin travel umroh membutuhkan laporan cetak untuk keperluan operasional.

**Solusi:** Tambahkan tombol "Export Excel" dan "Export PDF" di halaman Reports menggunakan library client-side (misalnya membuat CSV langsung dari data yang sudah ada).

### 6. Halaman Admin Kategori Paket
Tabel `package_categories` sudah ada di database dan sudah dipakai di halaman Packages (dropdown kategori), tapi belum ada halaman CRUD untuk mengelola kategori.

**Solusi:** Buat halaman `/admin/categories` untuk CRUD kategori paket, dan tambahkan menu di sidebar.

### 7. Notifikasi WhatsApp
Untuk travel umroh, WhatsApp adalah channel komunikasi utama. Saat ini notifikasi hanya disimpan di database (`notifications` table) tapi tidak dikirim ke manapun.

**Solusi:** Buat edge function yang mengirim notifikasi WA (via API WhatsApp Business atau layanan seperti Fonnte) saat status booking berubah.

### 8. Konfirmasi Pembayaran Multi-Tahap
Halaman Payment (`src/pages/Payment.tsx`) dan Admin Payments sudah mendukung DP dan pelunasan, tapi ketika admin approve pembayaran DP, status booking langsung berubah ke "paid". Seharusnya:
- DP approved -> status "dp_paid" (belum lunas)
- Pelunasan approved -> status "paid" (lunas)

**Solusi:** Tambahkan status `dp_paid` dan logika pengecekan apakah total pembayaran sudah mencapai `total_price`.

### 9. Manajemen User & Role Assignment
Belum ada halaman admin untuk melihat daftar semua user, assign role, atau mapping user ke cabang/agen. Saat ini role hanya bisa diatur langsung di database.

**Solusi:** Buat halaman `/admin/users` untuk:
- Daftar semua user beserta rolenya
- Assign/ubah role user
- Mapping user ke cabang atau agen

### 10. Pencarian Global di Admin
Tidak ada fitur pencarian global. Admin harus masuk ke masing-masing halaman untuk mencari data.

**Solusi:** Tambahkan search bar di header admin yang bisa mencari across bookings, pilgrims, payments.

---

## C. PRIORITAS IMPLEMENTASI (Diurutkan)

| No | Fitur | Prioritas | Alasan |
|----|-------|-----------|--------|
| 1 | Fix Booking insert error (branch_id/agent_id) | **Kritis** | Booking baru akan gagal |
| 2 | Fix gender display inconsistency | **Tinggi** | Data tidak tampil benar |
| 3 | Pagination | **Tinggi** | Data besar akan hilang |
| 4 | Multi-tahap pembayaran (DP vs Lunas) | **Tinggi** | Logika bisnis salah |
| 5 | Dashboard filter per role | **Tinggi** | Keamanan data |
| 6 | Manajemen User & Role | **Sedang** | Operasional admin |
| 7 | Halaman Kategori Paket | **Sedang** | Kelengkapan CRUD |
| 8 | Export Laporan | **Sedang** | Kebutuhan operasional |
| 9 | Notifikasi WhatsApp | **Sedang** | Komunikasi jemaah |
| 10 | Pencarian Global | **Rendah** | Nice to have |

---

## D. DETAIL TEKNIS IMPLEMENTASI

### File yang Perlu Diubah:
1. `src/pages/Booking.tsx` - Hapus `branch_id`, `agent_id` dari insert payload
2. `src/components/admin/BookingDetailPanel.tsx` - Fix gender check
3. `src/pages/admin/Bookings.tsx` - Tambah pagination
4. `src/pages/admin/Payments.tsx` - Logika multi-tahap pembayaran
5. `src/pages/admin/Dashboard.tsx` - Filter berdasarkan role
6. `src/pages/admin/Reports.tsx` - Tambah tombol export

### File Baru:
1. `src/pages/admin/Categories.tsx` - CRUD kategori paket
2. `src/pages/admin/Users.tsx` - Manajemen user dan role

### Perubahan Database:
- Tidak diperlukan perubahan schema untuk fix bug
- Untuk fitur multi-tahap pembayaran, perlu update enum status booking (opsional, bisa pakai string biasa)

Mau saya mulai dari yang mana? Saya rekomendasikan mulai dari **fix bug kritis** (nomor 1-4) terlebih dahulu, lalu lanjut ke fitur baru.
