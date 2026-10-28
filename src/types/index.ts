/**
 * ============================================================
 * PROJECT 06 - SISTEM INFORMASI KEPEGAWAIAN SEKOLAH
 * ============================================================
 * File        : index.ts
 * Lokasi File : src/types/index.ts
 * Fungsi      : Mendefinisikan tipe data pegawai, dokumen,
 *               pengguna, role, dan navigasi aplikasi.

 * KONSEP PENTING:
 * 1. TypeScript Types : Mendefinisikan tipe data.
 * 2. Union Type      : Membatasi pilihan nilai.
 * 3. Interface       : Mendefinisikan struktur object.
 * 4. Data Model      : Membentuk struktur data aplikasi.
 * 5. Type Safety     : Membantu mencegah kesalahan tipe.
 * 6. RBAC            : Mendefinisikan role pengguna.
 * 7. Navigation State: Membatasi nama screen aplikasi.
 * 8. Export Type     : Membagikan definisi antarfile.

 */

// ============================================================
// 1. EMPLOYEE TYPE
// ============================================================

/**
 * EmployeeType menggunakan konsep Union Type.
 *
 * Nilai yang diperbolehkan:
 * - GURU
 * - TENAGA_KEPENDIDIKAN
 *
 * Contoh benar:
 * type: 'GURU'
 *
 * Contoh salah:
 * type: 'DOSEN'
 *
 * TypeScript akan mendeteksi nilai yang tidak sesuai
 * ketika dilakukan pemeriksaan tipe data.
 */
export type EmployeeType =
  | 'GURU'
  | 'TENAGA_KEPENDIDIKAN';

// ============================================================
// 2. EMPLOYEE STATUS
// ============================================================

/**
 * EmployeeStatus menentukan status kepegawaian.
 *
 * Nilai yang diperbolehkan:
 * - AKTIF
 * - NONAKTIF
 *
 * Union Type membantu memastikan nilai status
 * sesuai dengan pilihan yang sudah ditentukan.
 */
export type EmployeeStatus =
  | 'AKTIF'
  | 'NONAKTIF';

// ============================================================
// 3. EMPLOYEE INTERFACE
// ============================================================

/**
 * Interface Employee mendefinisikan struktur data pegawai.
 *
 * Setiap object bertipe Employee harus mempunyai
 * seluruh property wajib di bawah ini.
 *
 * Interface digunakan pada:
 * - Data contoh pegawai.
 * - Form tambah/edit pegawai.
 * - Daftar dan detail pegawai.
 * - AppContext.
 * - Service API.
 */
export interface Employee {
  // Identifier unik pegawai, contoh: EMP-001.
  employee_id: string;

  // Nomor Induk Pegawai.
  nip: string;

  // Nama lengkap pegawai.
  name: string;

  // Jenis pegawai berdasarkan EmployeeType.
  type: EmployeeType;

  // Jabatan pegawai, contoh: Guru Informatika.
  position: string;

  // Pendidikan terakhir pegawai.
  education: string;

  // Nomor telepon pegawai.
  phone: string;

  // Alamat email pegawai.
  email: string;

  // URL foto pegawai, misalnya dari Cloudinary.
  photo_url: string;

  // Status kepegawaian berdasarkan EmployeeStatus.
  status: EmployeeStatus;
}

// ============================================================
// 4. DOCUMENT ITEM INTERFACE
// ============================================================

/**
 * Interface DocumentItem mendefinisikan struktur
 * data dokumen milik pegawai.
 *
 * Relasi data menggunakan employee_id.
 *
 * Contoh:
 *
 * Employee
 * employee_id = EMP-001
 *       |
 *       v
 * DocumentItem
 * employee_id = EMP-001
 *
 * Artinya dokumen tersebut terhubung dengan
 * pegawai yang mempunyai ID EMP-001.
 */
export interface DocumentItem {
  // Identifier unik dokumen, contoh: DOC-001.
  document_id: string;

  // Identifier pegawai pemilik dokumen.
  employee_id: string;

  // Nama dokumen, contoh: SK Pengangkatan.
  document_name: string;

  // Jenis dokumen, contoh: SK, Ijazah, Sertifikat.
  document_type: string;

  // URL file dokumen yang dapat diakses aplikasi.
  file_url: string;

  /**
   * Format file menggunakan Union Type.
   *
   * PDF   : Dokumen PDF.
   * IMAGE : Dokumen berbentuk gambar.
   */
  file_format:
    | 'PDF'
    | 'IMAGE';

  // Tanggal dokumen diunggah.
  uploaded_at: string;
}

// ============================================================
// 5. ROLE PENGGUNA
// ============================================================

/**
 * Role digunakan untuk mendefinisikan
 * tiga jenis pengguna aplikasi.
 *
 * ADMIN:
 * Mengakses fitur administrasi aplikasi.
 *
 * OPERATOR:
 * Mengelola data operasional sesuai hak akses.
 *
 * PIMPINAN:
 * Melihat informasi dan laporan kepegawaian.
 *
 * Role merupakan bagian dari konsep
 * Role-Based Access Control (RBAC).
 *
 * Catatan:
 * Type Role hanya membatasi nilai role.
 * Pemeriksaan hak akses dijalankan oleh
 * logika aplikasi, misalnya di AppContext
 * dan masing-masing screen.
 */
export type Role =
  | 'ADMIN'
  | 'OPERATOR'
  | 'PIMPINAN';

// ============================================================
// 6. USER INTERFACE
// ============================================================

/**
 * Interface User mendefinisikan struktur
 * informasi akun pengguna aplikasi.
 *
 * Digunakan untuk:
 * - Informasi pengguna yang sedang login.
 * - Daftar pengguna pada User Management.
 * - Pemeriksaan role.
 * - Informasi status akun.
 */
export interface User {
  // Identifier unik pengguna.
  user_id: string;

  // Nama lengkap pengguna.
  name: string;

  // Username yang digunakan untuk login.
  username: string;

  // Hak akses berdasarkan type Role.
  role: Role;

  /**
   * Status akun pengguna.
   *
   * AKTIF:
   * Akun berstatus aktif.
   *
   * NONAKTIF:
   * Akun berstatus tidak aktif.
   */
  status:
    | 'AKTIF'
    | 'NONAKTIF';

  // Kolom relasi dan audit sesuai tabel USERS.
  employee_id?: string;
  created_at?: string;
  last_login?: string;
}

export type TransactionAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'UPLOAD' | 'LOGIN' | 'LOGOUT';

export interface Transaction {
  transaction_id: string;
  action: TransactionAction;
  description: string;
  actor: string;
  created_at: string;
}

// ============================================================
// 7. SCREEN / NAVIGATION STATE
// ============================================================

/**
 * Screen merupakan Union Type yang mendefinisikan
 * nama-nama halaman aplikasi.
 *
 * Nilai Screen digunakan oleh sistem navigasi
 * berbasis state untuk menentukan halaman aktif.
 *
 * Contoh benar:
 * setScreen('HOME')
 *
 * Contoh salah:
 * setScreen('HOMES')
 *
 * TypeScript akan mendeteksi nama screen yang
 * tidak termasuk dalam Union Type Screen.
 *
 * Catatan:
 * Type Screen membatasi nilai navigasi,
 * tetapi bukan mekanisme otorisasi pengguna.
 */
export type Screen =
  // Dashboard atau halaman utama aplikasi.
  | 'HOME'

  // Halaman daftar data pegawai.
  | 'EMPLOYEES'

  // Halaman form tambah/edit pegawai.
  | 'EMPLOYEE_FORM'

  // Halaman detail pegawai.
  | 'EMPLOYEE_DETAIL'

  // Halaman dokumen pegawai.
  | 'DOCUMENTS'

  // Halaman laporan kepegawaian.
  | 'REPORTS'

  // Halaman User Management.
  | 'USERS'

  // Halaman panduan penggunaan aplikasi.
  | 'TRANSACTION_HISTORY'

  // Halaman panduan penggunaan aplikasi.
  | 'HELP';

// ============================================================
// AKHIR FILE src/types/index.ts
// ============================================================
