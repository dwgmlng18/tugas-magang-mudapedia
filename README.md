# Caelas

> **Modern Point of Sale (POS) & Product Catalog System**

Caelas adalah aplikasi **Point of Sale (POS)** dan **Katalog Produk** berbasis web yang dirancang untuk membantu proses penjualan secara cepat, sederhana, dan efisien. Sistem ini dapat digunakan oleh berbagai jenis usaha, seperti kafe, restoran, toko retail, bakery, gerai minuman, hingga bisnis lainnya yang tidak memerlukan pengelolaan stok.

Aplikasi menyediakan katalog produk yang dapat diakses secara umum tanpa harus login. Selain itu, Caelas menerapkan sistem **Role-Based Access Control (RBAC)** dengan dua peran utama, yaitu **Admin** dan **Kasir**, sehingga setiap pengguna hanya dapat mengakses fitur sesuai dengan hak aksesnya.

---

## ✨ Fitur

### 🌐 Umum (Pengunjung / Pengguna Publik)

* **Katalog Produk & Menu**
  Menampilkan daftar produk aktif dengan fitur pencarian real-time dan filter kategori yang dapat diakses tanpa perlu login.

* **Registrasi Akun Baru**
  Fasilitas pendaftaran akun bagi kasir baru dengan status awal *Pending* menunggu persetujuan (approval) Admin.

### 💳 Kasir

* **Transaksi Penjualan**
  Melakukan transaksi penjualan secara cepat dengan memilih produk dari katalog, menentukan jumlah, serta otomatis menghitung subtotal dan total harga.

* **Kelola Transaksi**
  Melihat detail transaksi, mengubah/mengedit item transaksi yang sudah dibuat, serta menghapus transaksi jika terjadi kesalahan input.

* **Riwayat & Laporan Transaksi**
  Melihat daftar transaksi yang pernah dilakukan oleh kasir yang bersangkutan dengan opsi filter pencarian.

* **Profil Pengguna**
  Mengubah informasi nama, memperbarui foto profil (disimpan di Cloudinary), serta melakukan ubah password secara mandiri.

### 👨‍💼 Admin

* **Manajemen Kategori**
  Menambah, mengubah, dan menghapus kategori produk.

* **Manajemen Produk & Recycle Bin**
  Mengelola data produk (nama, deskripsi, harga, status, kategori, dan upload gambar) dilengkapi sistem **Soft Delete**: produk yang dihapus dipindahkan ke tab Sampah (Trash) dan dapat dipulihkan (*Restore*) atau dihapus selamanya (*Permanent Delete*).

* **Manajemen Pengguna & Verifikasi**
  Menyetujui (*Approve*), menolak/menonaktifkan (*Reject*), menghapus, atau mengubah informasi serta peran (Admin/Kasir) dari pengguna yang mendaftar.

* **Laporan Transaksi Global**
  Memantau seluruh transaksi yang masuk ke sistem dengan penyaringan berdasarkan rentang tanggal tertentu.

* **Profil Administrator**
  Mengubah nama, foto profil, dan kata sandi administrator.

---

## 🛠️ Teknologi yang Digunakan

| Teknologi         | Kegunaan                                                           |
| ----------------- | ------------------------------------------------------------------ |
| **Next.js**       | Framework utama untuk membangun aplikasi web berbasis React.       |
| **React.js**      | Library JavaScript untuk membangun antarmuka pengguna.             |
| **NextAuth.js**   | Autentikasi dan manajemen sesi pengguna.                           |
| **MongoDB Atlas** | Database NoSQL berbasis cloud untuk menyimpan data aplikasi.       |
| **Cloudinary**    | Penyimpanan dan pengelolaan gambar produk berbasis cloud.          |
| **Tailwind CSS**  | Framework CSS untuk membangun antarmuka yang responsif dan modern. |

---

## 📸 Tampilan Aplikasi

> Tambahkan screenshot aplikasi pada bagian ini.

* Halaman Katalog Produk
* Halaman Login
* Dashboard Kasir
* Halaman Transaksi
* Halaman Manajemen Produk
* Halaman Manajemen Kategori
* Halaman Manajemen Pengguna

---

## 🚀 Instalasi

1. Clone repository

```bash
git clone <repository-url>
```

2. Masuk ke folder proyek

```bash
cd caelas
```

3. Install dependency

```bash
npm install
```

4. Buat file `.env.local` dan sesuaikan konfigurasi yang dibutuhkan.

```env
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

5. Jalankan aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan pada:

```
http://localhost:3000
```

---

## 📂 Struktur Hak Akses

| Role      | Hak Akses / Fitur yang Dapat Diakses                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------- |
| **Umum**  | Lihat katalog produk, registrasi akun kasir                                                              |
| **Kasir** | Transaksi penjualan, edit & hapus transaksi milik sendiri, riwayat transaksi, update profil (nama, foto, password) |
| **Admin** | Manajemen kategori, manajemen produk (termasuk Restore/Permanent Delete), laporan transaksi global dengan filter tanggal, manajemen & approval pengguna, update profil admin |

---

## 🎯 Tujuan Proyek

Caelas dikembangkan sebagai proyek portofolio untuk mengimplementasikan sistem Point of Sale (POS) modern menggunakan teknologi web terkini. Fokus utama proyek ini adalah membangun aplikasi yang memiliki arsitektur modular, autentikasi berbasis peran, penyimpanan data berbasis cloud, serta antarmuka yang responsif sehingga mudah dikembangkan dengan fitur-fitur baru di masa mendatang.

---

## 👨‍💻 Developer

**Dewa Gemilang Wicaksana Putra Prayitno**

Mahasiswa Program Studi Teknologi Rekayasa Perangkat Lunak
Politeknik Negeri Banyuwangi
