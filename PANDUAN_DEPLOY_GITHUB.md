# 🚀 Panduan Deploy SkyQuiz 3D ke GitHub Pages (Online Website)

Aplikasi **SkyQuiz 3D** telah disiapkan secara lengkap agar dapat langsung di-deploy dan dibaca sebagai website online publik melalui GitHub Pages menggunakan folder **/docs** maupun **GitHub Actions**.

---

## 📌 Pilihan 1: Deploy Langsung Menggunakan Folder `/docs` (Paling Cepat & Mudah)

Struktur folder `/docs` sudah disiapkan berisi `index.html`, `404.html`, file `.nojekyll`, dan seluruh aset bundle JavaScript & CSS dengan jalur relatif (`./`).

### Langkah-langkah:
1. **Unggah (Push) Proyek ke Repository GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Siapkan rilis SkyQuiz 3D untuk GitHub Pages"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/NAMA-REPO-ANDA.git
   git push -u origin main
   ```

2. **Aktifkan GitHub Pages di Repository GitHub:**
   - Buka halaman repository Anda di browser: `https://github.com/USERNAME-ANDA/NAMA-REPO-ANDA`
   - Klik menu **Settings** (ikon roda gigi di bilah atas repository).
   - Di bilah samping kiri, pilih menu **Pages** (di bagian *Code and automation*).
   - Pada bagian **Build and deployment**:
     - **Source**: Pilih `Deploy from a branch`
     - **Branch**: Pilih `main` (atau `master`)
     - **Folder**: Ubah dari `/(root)` menjadi **`/docs`**
     - Klik tombol **Save**.

3. **Selesai!**
   - Dalam 1–2 menit, website online Anda sudah aktif dan dapat diakses publik di:
     ```
     https://USERNAME-ANDA.github.io/NAMA-REPO-ANDA/
     ```

---

## 📌 Pilihan 2: Deploy Otomatis via GitHub Actions (Workflow Otomatis)

Workflow otomatis sudah disiapkan di file `.github/workflows/deploy.yml`.

### Langkah-langkah:
1. Buka menu **Settings** > **Pages** di repository GitHub Anda.
2. Pada bagian **Source**, pilih **`GitHub Actions`**.
3. Setiap kali Anda melakukan `git push` ke branch `main`, GitHub akan otomatis meng-compile dan menerbitkan website secara instan!

---

## 🛠️ Perintah Build Lokal (Jika Ingin Memperbarui File `/docs`)

Jika Anda melakukan perubahan soal atau kode, cukup jalankan:
```bash
npm run build
```
Perintah ini akan secara otomatis:
1. Mem-build aplikasi ke folder `dist/`.
2. Menyalin seluruh hasil build ke folder `docs/`.
3. Membuat file `.nojekyll` (mencegah GitHub mengabaikan file aset).
4. Membuat file `404.html` (agar navigasi Single Page Application tetap lancar saat refresh halaman).

---

## 👨‍🏫 Informasi Pembuat & Kontak
- **Dibuat oleh:** M. Nur Ali Abidin, S.Pd.
- **Instagram:** [@aliabidin988](https://instagram.com/aliabidin988)
- **TikTok:** [@aliabidin98](https://tiktok.com/@aliabidin98)
