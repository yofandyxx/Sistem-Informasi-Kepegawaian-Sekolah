/**
 * ============================================================
 * PROJECT 06 - SISTEM INFORMASI KEPEGAWAIAN SEKOLAH
 * File        : api.ts
 * Lokasi File : src/services/api.ts
 * Fungsi      : Komunikasi React Native dengan Google Apps Script
 *               REST API, Google Sheets, dan Cloudinary.
 * Dibuat oleh : Amrizal, S.Kom., M.Kom.
 *
 * Konsep penting:
 * - REST API dan fetch()
 * - Promise, async/await, dan JSON
 * - TypeScript Interface dan Generic Type
 * - Data Mapping antara API dan UI
 * - CRUD Pegawai dan Dokumen
 * - Upload Base64 ke Cloudinary melalui Apps Script
 * ============================================================
 */

// Model data yang digunakan oleh tampilan React Native.
import {
  Employee,
  DocumentItem,
} from '../types';

// ============================================================
// 1. KONFIGURASI REST API
// ============================================================
// URL Web App hasil deployment Google Apps Script.

import { API_URL } from '../config/api';

// ============================================================
// 2. FORMAT RESPONSE DARI GOOGLE APPS SCRIPT
// ============================================================
// Generic <T> memungkinkan data berisi pegawai, dokumen,
// hasil upload foto, atau tipe lain sesuai endpoint.
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================
// 3. MODEL PEGAWAI SESUAI KOLOM GOOGLE SHEETS
// ============================================================
// Nama properti backend berbeda dari model Employee pada UI.
interface ApiEmployee {
  employee_id: string;
  nip: string;
  nama: string;
  jenis_pegawai: string;
  jabatan: string;
  pendidikan: string;
  status: string;
  email: string;
  telepon: string;
  alamat?: string;
  foto_url: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// 4. MODEL DOKUMEN SESUAI KOLOM GOOGLE SHEETS
// ============================================================
interface ApiDocument {
  document_id: string;
  employee_id: string;
  jenis_dokumen: string;
  nama_dokumen: string;
  file_url: string;
  public_id?: string;
  file_type: string;
  ukuran?: string | number;
  tanggal_upload?: string;
  uploaded_by?: string;
  status?: string;
}

// ============================================================
// 5. KONVERSI PEGAWAI: FORMAT API -> FORMAT UI
// ============================================================
// Backend: TENDIK, TIDAK AKTIF.
// UI     : TENAGA_KEPENDIDIKAN, NONAKTIF.
// Operator ?? menyediakan nilai kosong bila field null/undefined.
function mapEmployeeFromApi(
  item: ApiEmployee
): Employee {
  return {
    employee_id: String(item.employee_id ?? ''),
    nip: String(item.nip ?? ''),
    name: String(item.nama ?? ''),
    type:
      String(item.jenis_pegawai).toUpperCase() === 'TENDIK'
        ? 'TENAGA_KEPENDIDIKAN'
        : 'GURU',
    position: String(item.jabatan ?? ''),
    education: String(item.pendidikan ?? ''),
    phone: String(item.telepon ?? ''),
    email: String(item.email ?? ''),
    photo_url: String(item.foto_url ?? ''),
    status:
      String(item.status).toUpperCase() === 'TIDAK AKTIF'
        ? 'NONAKTIF'
        : 'AKTIF',
  };
}

// ============================================================
// 6. KONVERSI PEGAWAI: FORMAT UI -> FORMAT API
// ============================================================
// Dilakukan sebelum CREATE atau UPDATE ke server.
function mapEmployeeToApi(
  employee: Employee
) {
  return {
    employee_id: employee.employee_id,
    nip: employee.nip,
    nama: employee.name,
    jenis_pegawai:
      employee.type === 'TENAGA_KEPENDIDIKAN'
        ? 'TENDIK'
        : 'GURU',
    jabatan: employee.position,
    pendidikan: employee.education,
    status:
      employee.status === 'NONAKTIF'
        ? 'TIDAK AKTIF'
        : 'AKTIF',
    email: employee.email,
    telepon: employee.phone,
    foto_url: employee.photo_url,
  };
}

// ============================================================
// 7. KONVERSI DOKUMEN: FORMAT API -> FORMAT UI
// ============================================================
function mapDocumentFromApi(
  item: ApiDocument
): DocumentItem {
  const fileType = String(item.file_type ?? '').toUpperCase();

  return {
    document_id: String(item.document_id ?? ''),
    employee_id: String(item.employee_id ?? ''),
    document_name: String(item.nama_dokumen ?? ''),
    document_type: String(item.jenis_dokumen ?? ''),
    file_url: String(item.file_url ?? ''),
    file_format: fileType === 'PDF' ? 'PDF' : 'IMAGE',
    uploaded_at: String(item.tanggal_upload ?? ''),
  };
}

// ============================================================
// 8. GET SELURUH DATA PEGAWAI
// ============================================================
export async function getEmployees(): Promise<Employee[]> {
  // 1. Mengirim HTTP GET ke resource employees.
  const response = await fetch(
    `${API_URL}?resource=employees`
  );

  // 2. Memeriksa status HTTP.
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  // 3. Mengubah response JSON menjadi object TypeScript.
  const result: ApiResponse<ApiEmployee[]> =
    await response.json();

  // 4. Memeriksa status keberhasilan dari Apps Script.
  if (!result.success) {
    throw new Error(
      result.message || 'Gagal mengambil data pegawai.'
    );
  }

  // 5. Mengubah setiap record backend menjadi model UI.
  return (result.data ?? []).map(mapEmployeeFromApi);
}

// ============================================================
// 9. GET DETAIL PEGAWAI BERDASARKAN ID
// ============================================================
export async function getEmployeeById(
  employeeId: string
): Promise<Employee> {
  // encodeURIComponent mengamankan ID ketika dimasukkan ke URL.
  const response = await fetch(
    `${API_URL}?resource=employees&id=${encodeURIComponent(employeeId)}`
  );

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  const result: ApiResponse<ApiEmployee> =
    await response.json();

  if (!result.success) {
    throw new Error(
      result.message || 'Pegawai tidak ditemukan.'
    );
  }

  return mapEmployeeFromApi(result.data);
}

// ============================================================
// 10. GET SELURUH DATA DOKUMEN
// ============================================================
export async function getDocuments(): Promise<DocumentItem[]> {
  const response = await fetch(
    `${API_URL}?resource=documents`
  );

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  const result: ApiResponse<ApiDocument[]> =
    await response.json();

  if (!result.success) {
    throw new Error(
      result.message || 'Gagal mengambil data dokumen.'
    );
  }

  return (result.data ?? []).map(mapDocumentFromApi);
}

// ============================================================
// 11. SIMPAN PEGAWAI (CREATE ATAU UPDATE)
// ============================================================
// ID dari form dapat berupa ID lokal sementara. Oleh sebab itu,
// keputusan CREATE/UPDATE harus didasarkan pada keberadaan ID
// di server, bukan sekadar pada ada/tidaknya teks employee_id.
export async function saveEmployee(
  employee: Employee
): Promise<void> {
  let isUpdate = false;

  // LANGKAH 1: Periksa keberadaan ID pegawai di server.
  if (employee.employee_id) {
    try {
      const checkResponse = await fetch(
        `${API_URL}?resource=employees&id=${encodeURIComponent(
          employee.employee_id
        )}`
      );

      if (checkResponse.ok) {
        const checkResult: ApiResponse<ApiEmployee> =
          await checkResponse.json();

        isUpdate = checkResult.success === true;
      }
    } catch (error) {
      // Pertahankan perilaku asli: kegagalan pengecekan
      // dicatat, lalu proses diperlakukan sebagai CREATE.
      console.log('Pengecekan employee_id:', error);
      isUpdate = false;
    }
  }

  // LANGKAH 2: Pilih URL berdasarkan hasil pengecekan.
  // Apps Script memakai POST dengan parameter method=PUT
  // untuk operasi UPDATE.
  const url = isUpdate
    ? `${API_URL}?resource=employees&method=PUT`
    : `${API_URL}?resource=employees`;

  // LANGKAH 3: Ubah model UI ke nama kolom backend.
  const body = mapEmployeeToApi(employee);

  // Pada CREATE, ID harus dibuat oleh Apps Script.
  // Jangan mengirim ID lokal sementara dari form.
  if (!isUpdate) {
    delete (body as Partial<typeof body>).employee_id;
  }

  // LANGKAH 4: Kirim JSON menggunakan HTTP POST.
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  // LANGKAH 5: Periksa status keberhasilan dari server.
  const result: ApiResponse<unknown> =
    await response.json();

  if (!result.success) {
    throw new Error(
      result.message ||
        (isUpdate
          ? 'Gagal memperbarui data pegawai.'
          : 'Gagal menambahkan data pegawai.')
    );
  }
}

// ============================================================
// 12. HAPUS PEGAWAI
// ============================================================
export async function deleteEmployee(
  employeeId: string
): Promise<void> {
  // Apps Script menerima operasi DELETE melalui POST
  // dengan parameter method=DELETE pada URL.
  const response = await fetch(
    `${API_URL}?resource=employees&method=DELETE`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employee_id: employeeId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  const result: ApiResponse<unknown> =
    await response.json();

  if (!result.success) {
    throw new Error(
      result.message || 'Gagal menghapus data pegawai.'
    );
  }
}

// ============================================================
// 13. STRUKTUR DATA REQUEST UPLOAD DOKUMEN
// ============================================================
// Field harus sesuai dengan kontrak upload Google Apps Script.
export interface UploadDocumentRequest {
  employee_id: string;
  jenis_dokumen: string;
  nama_dokumen: string;
  file_base64: string;
  mime_type: string;
  uploaded_by: string;
}

// ============================================================
// 14. UPLOAD DOKUMEN MELALUI APPS SCRIPT KE CLOUDINARY
// ============================================================
// Alur: React Native -> Base64 -> Apps Script -> Cloudinary.
// Metadata dokumen kemudian disimpan server ke Google Sheets.
// Cloudinary API Secret tidak boleh disimpan pada aplikasi HP.
export async function uploadDocument(
  data: UploadDocumentRequest
): Promise<void> {
  // LANGKAH 1: Validasi data wajib sebelum request.
  if (!data.employee_id.trim()) {
    throw new Error('Pegawai belum dipilih.');
  }

  if (!data.jenis_dokumen.trim()) {
    throw new Error('Jenis dokumen belum dipilih.');
  }

  if (!data.nama_dokumen.trim()) {
    throw new Error('Nama dokumen tidak tersedia.');
  }

  if (!data.file_base64) {
    throw new Error('Data file belum tersedia.');
  }

  if (!data.mime_type.trim()) {
    throw new Error('MIME type file tidak tersedia.');
  }

  // LANGKAH 2: Tentukan endpoint upload dokumen.
  const url =
    `${API_URL}?resource=documents&action=upload`;

  // LANGKAH 3: Kirim isi file dan metadata sebagai JSON.
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      employee_id: data.employee_id,
      jenis_dokumen: data.jenis_dokumen,
      nama_dokumen: data.nama_dokumen,
      file_base64: data.file_base64,
      mime_type: data.mime_type,
      uploaded_by: data.uploaded_by,
    }),
  });

  // LANGKAH 4: Periksa status HTTP.
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  // LANGKAH 5: Periksa status proses upload dari Apps Script.
  const result: ApiResponse<unknown> =
    await response.json();

  if (!result.success) {
    throw new Error(
      result.message || 'Upload dokumen gagal.'
    );
  }
}

// ============================================================
// 15. HAPUS DOKUMEN
// ============================================================
// Backend menangani pencarian metadata, penghapusan asset
// Cloudinary, dan penghapusan baris dokumen dari Google Sheets.
export async function deleteDocument(
  documentId: string
): Promise<void> {
  if (!documentId.trim()) {
    throw new Error('Document ID tidak tersedia.');
  }

  const response = await fetch(
    `${API_URL}?resource=documents&method=DELETE`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document_id: documentId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  const result: ApiResponse<unknown> =
    await response.json();

  if (!result.success) {
    throw new Error(
      result.message || 'Gagal menghapus dokumen.'
    );
  }
}

// ============================================================
// 16. STRUKTUR REQUEST DAN HASIL UPLOAD FOTO
// ============================================================
export interface UploadPhotoRequest {
  file_base64: string;
  mime_type: string;
  file_name: string;
}

export interface UploadPhotoResult {
  secure_url: string;
  public_id: string;
}

// ============================================================
// 17. UPLOAD FOTO PEGAWAI KE CLOUDINARY
// ============================================================
export async function uploadEmployeePhoto(
  data: UploadPhotoRequest
): Promise<UploadPhotoResult> {
  // LANGKAH 1: Pastikan foto tersedia dan format didukung.
  if (!data.file_base64) {
    throw new Error('Data foto belum tersedia.');
  }

  if (!['image/jpeg', 'image/png'].includes(data.mime_type)) {
    throw new Error('Foto harus JPG/JPEG atau PNG.');
  }

  // LANGKAH 2: Upload melalui server Apps Script.
  const response = await fetch(
    `${API_URL}?resource=employees&action=upload-photo`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  // LANGKAH 3: Ambil URL HTTPS dan public_id Cloudinary.
  const result: ApiResponse<UploadPhotoResult> =
    await response.json();

  if (!result.success) {
    throw new Error(
      result.message || 'Upload foto gagal.'
    );
  }

  return result.data;
}
