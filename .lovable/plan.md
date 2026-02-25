

# Daftar Lengkap Pengembangan dan Perbaikan

## A. BUG & PERBAIKAN KRITIS

### 1. [SUDAH DIPERBAIKI] Booking insert error (branch_id/agent_id)
Sudah dihapus dari payload insert booking.

### 2. [SUDAH DIPERBAIKI] Gender display inconsistency
Sudah distandarkan di BookingDetailPanel.

### 3. [SUDAH DIPERBAIKI] Pagination di Bookings
Sudah ditambahkan pagination server-side di halaman Bookings.

### 4. [SUDAH DIPERBAIKI] Multi-tahap pembayaran (DP vs Lunas)
Logika `dp_paid` sudah ditambahkan di admin Payments.

### 5. [BELUM] Status `dp_paid` belum ditangani di halaman user (MyBookings)
File `src/pages/MyBookings.tsx` baris 27-39 belum punya mapping untuk status `dp_paid`. Jemaah yang sudah bayar DP akan melihat badge kosong.
- Tambahkan `dp_paid` ke `statusColors` dan `statusLabels`
- Tambahkan tombol "Bayar Pelunasan" untuk status `dp_paid`

### 6. [BELUM] Pagination belum ada di Payments, Pilgrims, Reports
Hanya Bookings yang sudah punya pagination. Halaman Payments dan Pilgrims masih load semua data sekaligus.

### 7. [BELUM] handleVerifyPayment di Bookings.tsx tidak konsisten
Baris 86-104 di `src/pages/admin/Bookings.tsx` langsung set status `paid` tanpa cek apakah ini DP atau pelunasan. Ini bertentangan dengan logika multi-tahap yang sudah diimplementasi di Payments.tsx.

---

## B. FITUR YANG BELUM ADA (Prioritas Tinggi)

### 8. Dashboard filter per role
Dashboard menampilkan semua data tanpa filter role. User `cabang` dan `agen` bisa melihat semua booking, revenue, dan statistik milik orang lain.
- Filter semua query berdasarkan `pic_id` / `pic_type` untuk role cabang/agen

### 9. Halaman Manajemen User & Role (`/admin/users`)
Belum ada halaman admin untuk:
- Melihat daftar semua user
- Assign/ubah role (super_admin, admin, staff, cabang, agen, jemaah)
- Mapping user ke cabang atau agen
- Saat ini hanya bisa dikelola langsung di database

### 10. Halaman CRUD Kategori Paket (`/admin/categories`)
Tabel `package_categories` sudah ada dan sudah dipakai sebagai dropdown di form Packages, tapi belum ada halaman admin untuk mengelola kategori (tambah, edit, hapus).

### 11. Export Laporan ke Excel/CSV
Halaman Reports menampilkan grafik dan tabel, tapi tidak ada tombol export. Admin travel membutuhkan ini untuk keperluan operasional dan pelaporan.

---

## C. FITUR YANG BELUM ADA (Prioritas Sedang)

### 12. Pencarian global di admin
Tidak ada search bar global di header admin. Admin harus masuk ke tiap halaman untuk mencari data.

### 13. Kupon / Diskon
Tabel `coupons` sudah ada di database (code, discount_type, value, min_purchase, max_uses, expired_at), tapi:
- Belum ada halaman admin CRUD untuk kupon
- Belum ada integrasi di form booking (input kode kupon)
- Belum ada validasi dan kalkulasi diskon

### 14. Halaman Admin Kupon (`/admin/coupons`)
Buat CRUD kupon: kode, tipe diskon (persen/nominal), nilai, min pembelian, max penggunaan, tanggal kadaluarsa.

### 15. Notifikasi WhatsApp
Notifikasi hanya disimpan di tabel `notifications` tapi tidak dikirim ke channel manapun. Untuk travel umroh, WhatsApp adalah kanal utama.
- Buat edge function integrasi WA API (Fonnte/WA Business)
- Kirim notifikasi saat: booking dibuat, pembayaran diverifikasi, pengingat deadline

### 16. Print/Download Manifes Keberangkatan
Admin belum bisa mencetak daftar jemaah per keberangkatan. Fitur ini krusial untuk operasional di bandara.

### 17. Halaman Detail Keberangkatan
Saat ini admin hanya bisa melihat daftar keberangkatan. Belum ada halaman detail yang menampilkan:
- Daftar jemaah yang terdaftar di keberangkatan tersebut
- Status pembayaran masing-masing
- Assign muthawif

---

## D. FITUR YANG BELUM ADA (Prioritas Rendah / Nice-to-Have)

### 18. Dark mode toggle
Sudah install `next-themes` tapi belum ada toggle UI untuk user.

### 19. Audit log / Activity log
Belum ada pencatatan aktivitas admin (siapa yang approve pembayaran, siapa yang edit booking, dll).

### 20. Bulk actions di tabel admin
Belum bisa select multiple rows dan lakukan aksi massal (contoh: approve beberapa pembayaran sekaligus, export selected).

### 21. Notifikasi admin real-time
Admin belum punya NotificationBell. Hanya user biasa (jemaah) yang punya notifikasi. Admin seharusnya dapat notifikasi saat ada booking baru atau pembayaran masuk.

### 22. Filter dan sorting di semua tabel admin
Kebanyakan tabel admin tidak punya fitur sort by column atau filter lanjutan (contoh: filter booking by date range, package, dll).

### 23. Konfirmasi sebelum navigasi (unsaved changes)
Form-form admin tidak ada warning ketika user menutup modal atau pindah halaman saat ada perubahan yang belum disimpan.

### 24. Upload gambar langsung di form paket
Field `image_url` di form paket hanya menerima URL teks. Belum ada fitur upload gambar langsung ke storage lalu auto-fill URL.

---

## E. PRIORITAS IMPLEMENTASI

| No | Fitur | Status | Prioritas |
|----|-------|--------|-----------|
| 5 | Status dp_paid di MyBookings | Belum | Kritis |
| 7 | Fix handleVerifyPayment inkonsisten | Belum | Kritis |
| 6 | Pagination di Payments & Pilgrims | Belum | Tinggi |
| 8 | Dashboard filter per role | Belum | Tinggi |
| 9 | Halaman Manajemen User & Role | Belum | Tinggi |
| 10 | Halaman CRUD Kategori Paket | Belum | Sedang |
| 11 | Export Laporan Excel/CSV | Belum | Sedang |
| 13 | Integrasi Kupon di Booking | Belum | Sedang |
| 14 | Halaman Admin Kupon | Belum | Sedang |
| 16 | Print Manifes Keberangkatan | Belum | Sedang |
| 17 | Detail Keberangkatan + daftar jemaah | Belum | Sedang |
| 21 | Notifikasi admin real-time | Belum | Sedang |
| 12 | Pencarian global admin | Belum | Rendah |
| 15 | Notifikasi WhatsApp | Belum | Rendah |
| 18 | Dark mode toggle | Belum | Rendah |
| 19 | Audit log | Belum | Rendah |
| 20 | Bulk actions | Belum | Rendah |
| 22 | Filter & sorting lanjutan | Belum | Rendah |
| 23 | Unsaved changes warning | Belum | Rendah |
| 24 | Upload gambar langsung | Belum | Rendah |

---

## F. RENCANA IMPLEMENTASI (Batch)

**Batch 1 - Fix kritis:**
- Tambah status `dp_paid` di MyBookings.tsx
- Fix handleVerifyPayment di Bookings.tsx agar konsisten dengan logika multi-tahap
- Tambah pagination di Payments.tsx dan Pilgrims.tsx

**Batch 2 - Keamanan & Role:**
- Dashboard filter per role
- Halaman Manajemen User & Role (`/admin/users`)

**Batch 3 - Kelengkapan CRUD:**
- Halaman Kategori Paket (`/admin/categories`)
- Halaman Admin Kupon (`/admin/coupons`)
- Integrasi kupon di form booking

**Batch 4 - Operasional:**
- Export laporan Excel/CSV
- Print manifes keberangkatan
- Detail keberangkatan dengan daftar jemaah

**Batch 5 - Enhancement:**
- Notifikasi admin
- Pencarian global
- Upload gambar langsung di form paket

