import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const docsDir = path.resolve(rootDir, 'docs');

function copyDirRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  if (!fs.existsSync(distDir)) {
    console.error('Folder dist/ tidak ditemukan. Jalankan vite build terlebih dahulu.');
    process.exit(1);
  }

  // Bersihkan folder docs jika sudah ada
  if (fs.existsSync(docsDir)) {
    fs.rmSync(docsDir, { recursive: true, force: true });
  }

  // Salin seluruh isi dist/ ke docs/
  copyDirRecursive(distDir, docsDir);

  // Buat file .nojekyll agar GitHub Pages tidak memblokir file asset Vite
  fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');

  // Buat 404.html sebagai salinan index.html untuk fallback SPA routing di GitHub Pages
  const indexPath = path.join(docsDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, path.join(docsDir, '404.html'));
  }

  console.log('✅ Berhasil menyiapkan folder /docs untuk deployment GitHub Pages!');
  console.log(`📁 Lokasi file online: ${docsDir}`);
} catch (err) {
  console.error('❌ Gagal menyiapkan folder docs:', err);
  process.exit(1);
}
