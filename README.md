# Sistem Informasi Kepegawaian Sekolah

Aplikasi mobile berbasis **Expo, React Native, dan TypeScript** untuk mengelola data kepegawaian sekolah secara terpusat.

## Fitur

- Login pengguna dan pengelolaan sesi.
- Dashboard ringkasan data pegawai.
- Tambah, lihat, ubah, dan hapus data pegawai.
- Pencarian serta detail pegawai.
- Upload foto pegawai.
- Upload, buka, dan hapus dokumen pegawai dalam format PDF, JPG, atau PNG.
- Laporan kepegawaian.
- Data pengguna dan riwayat transaksi.
- Halaman bantuan penggunaan aplikasi.

## Teknologi

- Expo `~58.0.19`
- React Native `0.88.0`
- React `19.3.0`
- TypeScript `~6.0.3`
- Google Apps Script sebagai REST API
- Google Sheets sebagai penyimpanan data
- Cloudinary sebagai penyimpanan foto dan dokumen

## Persyaratan

- Node.js dan npm
- Expo CLI melalui dependency proyek
- Android Studio/emulator Android atau perangkat Android
- Koneksi internet untuk mengakses API

## Instalasi

1. Masuk ke folder proyek:

   ```bash
   cd PPNPSchoolEmployeeInformation
   ```

2. Install dependency:

   ```bash
   npm install
   ```

3. Periksa konfigurasi API pada `src/config/api.ts`.

4. Jalankan aplikasi:

   ```bash
   npm start
   ```

   Kemudian pilih Android, iOS, atau web dari menu Expo.

## Perintah yang tersedia

```bash
npm start      # Menjalankan Expo development server
npm run android # Menjalankan proyek melalui Android
npm run ios     # Menjalankan proyek melalui iOS
npm run web     # Menjalankan proyek melalui browser
npx tsc --noEmit # Memeriksa tipe TypeScript
```

## Konfigurasi API

Konfigurasi endpoint berada di `src/config/api.ts`:

```ts
export const API_URL = 'URL_GOOGLE_APPS_SCRIPT_WEB_APP';
export const USE_DEMO_DATA = false;
```

`API_URL` harus mengarah ke Google Apps Script Web App yang menangani resource `employees` dan `documents`. Jika ingin menggunakan data contoh untuk pengembangan lokal, ubah `USE_DEMO_DATA` sesuai kebutuhan aplikasi.

Alur upload dokumen dan foto adalah:

```text
React Native → Google Apps Script → Cloudinary
                         └──────→ Google Sheets
```

API secret Cloudinary tidak boleh disimpan di dalam aplikasi mobile. Simpan credential tersebut hanya di sisi server atau Google Apps Script.

## Struktur folder

```text
.
├── assets/              # Ikon, splash screen, dan favicon
├── src/
│   ├── componnents/     # Komponen UI bersama
│   ├── config/          # Konfigurasi aplikasi dan API
│   ├── constants/       # Data contoh dan konstanta
│   ├── context/         # State global aplikasi
│   ├── screens/         # Halaman aplikasi
│   ├── serviceS/        # Komunikasi dengan REST API
│   └── types/           # Definisi tipe TypeScript
├── App.tsx              # Root aplikasi dan navigasi screen
├── app.json             # Konfigurasi Expo
├── index.ts             # Entry point
└── package.json         # Dependency dan scripts
```

## Pengembangan

- Gunakan `npx tsc --noEmit` sebelum melakukan commit untuk memeriksa TypeScript.
- Pastikan perubahan pada model UI tetap sesuai dengan pemetaan data di `src/serviceS/api.ts`.
- Jangan menyimpan credential Cloudinary atau secret API di repository.
- Perubahan pada konfigurasi native sebaiknya dilakukan melalui `app.json` dan konfigurasi Expo.

## Lisensi

Proyek ini menggunakan lisensi yang tercantum pada file [LICENSE](./LICENSE).
