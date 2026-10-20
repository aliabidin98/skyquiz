# ✈️ SkyQuiz 3D - Simulator Penerbangan & Kuis Interaktif

Game simulasi penerbangan 3D interaktif dan bank soal ujian kurikulum berbasis web. Siswa dapat mengemudikan pesawat 3D dengan stik analog responsif, menembus gerbang jawaban yang benar di udara dengan pemandangan dinamis (pantai, kepulauan, pegunungan, luar angkasa), dan berlomba dalam mode layar terbagi 2 pemain (*split screen*).

## ✨ Fitur Utama
- **Mode 1 Pemain (Solo)**: Langsung terbang dan menembus gerbang soal tanpa hambatan form nama pemain.
- **Mode 2 Pemain (Split-Screen)**: Layar terbagi 2 dengan pilihan wahana mandiri untuk Pemain 1 dan Pemain 2 sebelum balapan dimulai. Soal diacak secara independen dan jawaban dikerjakan langsung di layar masing-masing tanpa menutup layar lawan.
- **Kemudi Stik Analog**: Menggunakan stik analog virtual 360 derajat responsif untuk manuver pesawat, dilengkapi tombol Turbo Boost.
- **Menu Pengaturan Terpadu**:
  - Kelola bank soal ujian (tambah, edit, hapus).
  - Unduh template tabel Excel (`.xlsx` dan `.csv`).
  - Impor soal langsung dari berkas Excel.
  - Pengaturan kecepatan terbang (preset Santai, Standar, Cepat, Turbo & slider kustom).
  - Pengaturan penilaian skor (poin jawaban benar, penalti jika salah, dan bonus streak combo).
- **Siap Deploy ke GitHub Pages**: Dilengkapi folder `/docs`, file `.nojekyll`, dan workflow `.github/workflows/deploy.yml` untuk online instan.

## 🚀 Panduan Menjalankan Lokal
```bash
npm install
npm run dev
```
Buka browser di `http://localhost:3000`.

## 🌐 Panduan Deploy Online (GitHub Pages via Folder /docs)
1. Push repository ini ke akun GitHub Anda.
2. Di GitHub: buka **Settings** > **Pages**.
3. Pada **Build and deployment**, pilih **Branch: `main`** dan **Folder: `/docs`**, lalu klik **Save**.
4. Website akan langsung aktif dalam 1-2 menit di `https://USERNAME.github.io/REPO_NAME/`.

---
*Dibuat oleh: M. Nur Ali Abidin, S.Pd.*  
*Instagram: [@aliabidin988](https://instagram.com/aliabidin988) | TikTok: [@aliabidin98](https://tiktok.com/@aliabidin98)*
