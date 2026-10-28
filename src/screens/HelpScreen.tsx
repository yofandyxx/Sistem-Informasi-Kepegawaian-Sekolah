/**
 * ============================================================
 * PROJECT 06 - SISTEM INFORMASI KEPEGAWAIAN SEKOLAH
 * ============================================================
 
 * KONSEP PENTING:
 * 1. Array             : Menyimpan daftar panduan.
 * 2. map()             : Menampilkan data secara berulang.
 * 3. ScrollView        : Membuat halaman dapat digulir.
 * 4. Navigation State  : Mengatur perpindahan screen.
 * 5. TouchableOpacity : Komponen tombol interaktif.
 * 6. Ionicons          : Menampilkan ikon panduan.
 * 7. StyleSheet        : Mengatur tampilan antarmuka.

 */

// ============================================================
// 1. IMPORT LIBRARY DAN KOMPONEN
// ============================================================

import React from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Library ikon untuk tampilan panduan.
import { Ionicons } from '@expo/vector-icons';

// Custom hook untuk mengakses navigasi global.
import { useApp } from '../context/AppContext';

// ============================================================
// 2. DATA PANDUAN APLIKASI
// ============================================================

/**
 * items merupakan array yang menyimpan enam panduan.
 *
 * Setiap item terdiri dari:
 * [0] Nama ikon Ionicons.
 * [1] Judul panduan.
 * [2] Keterangan panduan.
 *
 * Data akan ditampilkan menggunakan fungsi map()
 * sehingga tidak perlu menulis kartu secara berulang.
 */
const items = [
  [
    'speedometer',
    '1. Dashboard',
    'Pantau statistik pegawai, distribusi pendidikan, status, dan akses cepat modul.',
  ],
  [
    'people',
    '2. Data Pegawai',
    'Cari/filter pegawai. Admin dan Operator dapat menambah, mengedit, serta menghapus data.',
  ],
  [
    'folder-open',
    '3. Dokumen',
    'Kelola foto dan dokumen PDF/gambar. Upload Cloudinary diaktifkan pada tahap integrasi.',
  ],
  [
    'bar-chart',
    '4. Laporan',
    'Preview data dan siapkan laporan PDF/Excel.',
  ],
  [
    'shield-checkmark',
    '5. User & Role',
    'Admin, Operator, dan Pimpinan mempunyai hak akses berbeda.',
  ],
  [
    'help-buoy',
    '6. Bantuan',
    'Gunakan tombol Kembali pada halaman detail untuk kembali ke halaman sebelumnya.',
  ],
];

// ============================================================
// 3. KOMPONEN HELP SCREEN
// ============================================================

/**
 * Help menampilkan panduan penggunaan aplikasi
 * untuk role ADMIN, OPERATOR, dan PIMPINAN.
 */
export default function Help() {
  // Mengambil fungsi navigasi dari AppContext.
  const {
    setScreen,
  } = useApp();

  // ==========================================================
  // 4. TAMPILAN HALAMAN BANTUAN
  // ==========================================================

  return (
    <ScrollView contentContainerStyle={s.p}>
      {/* Tombol untuk kembali ke halaman HOME. */}
      <TouchableOpacity
        onPress={() => setScreen('HOME')}
        style={s.back}
      >
        <Ionicons
          name="arrow-back"
          size={20}
        />
        <Text>
          Kembali
        </Text>
      </TouchableOpacity>

      {/* Judul utama halaman bantuan. */}
      <Text style={s.h}>
        Panduan Penggunaan
      </Text>

      {/* Keterangan pengguna yang dapat membaca panduan. */}
      <Text style={s.sub}>
        Petunjuk singkat untuk Admin, Operator, dan Pimpinan.
      </Text>

      {/* ======================================================
          5. MENAMPILKAN DAFTAR PANDUAN
         ====================================================== */}

      {/*
        map() membaca setiap elemen array items.

        x : Data satu panduan.
        i : Nomor indeks array.

        x[0] : Nama ikon.
        x[1] : Judul panduan.
        x[2] : Keterangan panduan.
      */}
      {items.map((x, i) => (
        <View
          style={s.card}
          key={i}
        >
          {/* Ikon sesuai kategori panduan. */}
          <Ionicons
            name={x[0] as any}
            size={25}
            color="#7b2cbf"
          />

          {/* Kontainer judul dan keterangan panduan. */}
          <View style={{ flex: 1 }}>
            <Text style={s.title}>
              {x[1]}
            </Text>
            <Text style={s.body}>
              {x[2]}
            </Text>
          </View>
        </View>
      ))}

      {/* Informasi project pada bagian bawah halaman. */}
      <Text style={s.foot}>
        PPNP • Project 06 • Sistem Informasi Kepegawaian Sekolah
      </Text>
    </ScrollView>
  );
}

// ============================================================
// 6. STYLESHEET / PENGATURAN TAMPILAN
// ============================================================

/**
 * StyleSheet digunakan untuk memisahkan tampilan
 * dari struktur JSX agar mudah dipelajari.
 *
 * Semua nilai style asli dipertahankan.
 */
const s = StyleSheet.create({
  // Kontainer utama halaman bantuan.
  p: {
    padding: 18,
    paddingBottom: 40,
  },

  // Tombol kembali dengan ikon dan teks sejajar.
  back: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    marginBottom: 14,
  },

  // Judul utama halaman.
  h: {
    fontSize: 26,
    fontWeight: '900',
    color: '#183153',
  },

  // Keterangan singkat di bawah judul.
  sub: {
    color: '#667085',
    marginVertical: 7,
    marginBottom: 14,
  },

  // Kartu yang menampilkan satu panduan.
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 13,
    elevation: 2,
  },

  // Judul pada setiap kartu panduan.
  title: {
    fontWeight: '900',
    color: '#183153',
  },

  // Isi atau deskripsi panduan.
  body: {
    color: '#667085',
    lineHeight: 19,
    marginTop: 4,
  },

  // Footer informasi project.
  foot: {
    textAlign: 'center',
    color: '#98a2b3',
    marginTop: 14,
    fontSize: 11,
  },
});

// ============================================================
// AKHIR FILE HelpScreen.tsx
// ============================================================
