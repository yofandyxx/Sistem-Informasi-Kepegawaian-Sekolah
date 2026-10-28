/**
 * ============================================================
 * PROJECT 06 - SISTEM INFORMASI KEPEGAWAIAN SEKOLAH
 * ============================================================
 *
 * KONSEP PENTING:
 * 1. Typed Sample Data      : Data contoh dengan tipe tertentu.
 * 2. Array of Objects       : Kumpulan object dalam array.
 * 3. Type Annotation        : Penentuan tipe data TypeScript.
 * 4. Employee               : Model data pegawai.
 * 5. DocumentItem           : Model data dokumen.
 * 6. Primary Key            : Identitas unik setiap data.
 * 7. Foreign Key            : Penghubung antarjenis data.
 * 8. Export Constant        : Data yang dapat diimpor file lain.
 *

// ============================================================
// 1. IMPORT TYPE DATA
// ============================================================

/**
 * Employee:
 * Mendefinisikan struktur data seorang pegawai.
 *
 * DocumentItem:
 * Mendefinisikan struktur data dokumen pegawai.
 *
 * Kedua tipe berasal dari src/types/index.ts.
 */
import {
  Employee,
  DocumentItem,
} from '../types';

// ============================================================
// 2. SAMPLE DATA PEGAWAI
// ============================================================

/**
 * employees merupakan array berisi empat data pegawai.
 *
 * Employee[] memastikan setiap object memiliki properti
 * sesuai interface Employee pada src/types/index.ts.
 *
 * employee_id : Identitas unik pegawai.
 * nip         : Nomor Induk Pegawai.
 * name        : Nama lengkap pegawai.
 * type        : GURU atau TENAGA_KEPENDIDIKAN.
 * position    : Jabatan atau pekerjaan.
 * education   : Pendidikan terakhir.
 * phone       : Nomor telepon.
 * email       : Alamat email.
 * photo_url   : URL foto pegawai.
 * status      : AKTIF atau NONAKTIF.
 */
export const employees: Employee[] = [
  // PEGAWAI 1: Guru Informatika, status AKTIF.
  {
    employee_id: 'EMP-001',
    nip: '198001012010011001',
    name: 'Drs. Ahmad Fauzan, M.Pd.',
    type: 'GURU',
    position: 'Guru Informatika',
    education: 'S2 Pendidikan',
    phone: '081234567801',
    email: 'ahmad@sekolah.sch.id',
    photo_url: 'https://i.pravatar.cc/300?img=12',
    status: 'AKTIF',
  },

  // PEGAWAI 2: Guru Matematika, status AKTIF.
  {
    employee_id: 'EMP-002',
    nip: '198505122011012002',
    name: 'Siti Rahma, S.Pd.',
    type: 'GURU',
    position: 'Guru Matematika',
    education: 'S1 Pendidikan Matematika',
    phone: '081234567802',
    email: 'siti@sekolah.sch.id',
    photo_url: 'https://i.pravatar.cc/300?img=47',
    status: 'AKTIF',
  },

  // PEGAWAI 3: Tenaga Kependidikan, status AKTIF.
  {
    employee_id: 'EMP-003',
    nip: '199002152019031003',
    name: 'Rizki Pratama, S.Kom.',
    type: 'TENAGA_KEPENDIDIKAN',
    position: 'Pranata Komputer',
    education: 'S1 Sistem Informasi',
    phone: '081234567803',
    email: 'rizki@sekolah.sch.id',
    photo_url: 'https://i.pravatar.cc/300?img=11',
    status: 'AKTIF',
  },

  // PEGAWAI 4: Guru Bahasa Indonesia, status NONAKTIF.
  {
    employee_id: 'EMP-004',
    nip: '197805102005012004',
    name: 'Dewi Kartika, S.Pd.',
    type: 'GURU',
    position: 'Guru Bahasa Indonesia',
    education: 'S1 Pendidikan Bahasa',
    phone: '081234567804',
    email: 'dewi@sekolah.sch.id',
    photo_url: 'https://i.pravatar.cc/300?img=44',
    status: 'NONAKTIF',
  },
];

// ============================================================
// 3. SAMPLE DATA DOKUMEN
// ============================================================

/**
 * documents merupakan array data contoh dokumen.
 *
 * DocumentItem[] memastikan struktur setiap object
 * sesuai interface DocumentItem pada src/types/index.ts.
 *
 * document_id   : Identitas unik dokumen.
 * employee_id   : ID pegawai pemilik dokumen.
 * document_name : Nama dokumen.
 * document_type : Jenis atau kategori dokumen.
 * file_url      : Alamat file dokumen.
 * file_format   : PDF atau IMAGE.
 * uploaded_at   : Tanggal upload dokumen.
 *
 * RELASI DATA:
 *
 * employees.employee_id = 'EMP-001'
 *             |
 *             v
 * documents.employee_id = 'EMP-001'
 *
 * Artinya dokumen DOC-001 dimiliki oleh pegawai EMP-001.
 *
 * employee_id pada documents berperan sebagai foreign key
 * secara konseptual. Pada data array ini, relasinya belum
 * ditegakkan oleh sistem database.
 */
export const documents: DocumentItem[] = [
  // DOKUMEN 1: SK Pengangkatan milik pegawai EMP-001.
  {
    document_id: 'DOC-001',
    employee_id: 'EMP-001',
    document_name: 'SK Pengangkatan',
    document_type: 'SK',
    file_url:
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    file_format: 'IMAGE',
    uploaded_at: '2026-10-03',
  },
];

// ============================================================
// AKHIR FILE sampleData.ts
// ============================================================
