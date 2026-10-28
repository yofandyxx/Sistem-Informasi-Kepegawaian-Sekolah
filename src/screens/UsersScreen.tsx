/**
 * ============================================================
 * PROJECT 06 - SISTEM INFORMASI KEPEGAWAIAN SEKOLAH
 * ============================================================
 * File        : UsersScreen.tsx
 * Lokasi File : src/screens/UsersScreen.tsx
 * Fungsi      : Menampilkan daftar user, role, dan status.
 *               Halaman hanya dapat diakses oleh ADMIN.
 * Dibuat oleh : Amrizal, S.Kom., M.Kom.
 *
 * KONSEP PENTING:
 * 1. RBAC                  : Pembatasan akses berdasarkan role.
 * 2. Conditional Rendering: Tampilan berdasarkan kondisi.
 * 3. User Management      : Menampilkan informasi akun.
 * 4. useApp()              : Mengakses data dari AppContext.
 * 5. Array.map()           : Menampilkan daftar pengguna.
 * 6. Props                 : Mengatur ikon berdasarkan role.
 * 7. Navigation State      : Mengatur perpindahan halaman.
 * 8. StyleSheet            : Mengatur tampilan aplikasi.
 */

// ============================================================
// 1. IMPORT LIBRARY DAN KOMPONEN
// ============================================================

import React from 'react';

import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';

// Library ikon untuk tampilan user dan hak akses.
import { Ionicons } from '@expo/vector-icons';

// Custom hook untuk mengakses data dan navigasi global.
import { useApp } from '../context/AppContext';

// ============================================================
// 2. KOMPONEN USER MANAGEMENT
// ============================================================

/**
 * Users merupakan halaman yang menampilkan daftar akun.
 *
 * Halaman ini menggunakan Role-Based Access Control (RBAC).
 *
 * ADMIN:
 * Dapat melihat daftar pengguna.
 *
 * OPERATOR dan PIMPINAN:
 * Tidak dapat mengakses halaman User Management.
 */
export default function Users() {
  // ==========================================================
  // 3. MENGAMBIL DATA DARI APP CONTEXT
  // ==========================================================

  /**
   * users:
   * Array yang berisi data akun pengguna.
   *
   * currentUser:
   * Informasi pengguna yang sedang login.
   *
   * setScreen:
   * Fungsi untuk berpindah halaman.
   */
  const {
    users,
    currentUser,
    setScreen,
  } = useApp();

  // ==========================================================
  // 4. VALIDASI HAK AKSES (RBAC)
  // ==========================================================

  /**
   * Jika role pengguna bukan ADMIN,
   * halaman daftar user tidak ditampilkan.
   *
   * Sebagai gantinya, aplikasi menampilkan:
   * - Ikon akses terkunci.
   * - Pesan akses dibatasi.
   * - Tombol kembali ke HOME.
   *
   * return menghentikan proses render berikutnya.
   */
  if (currentUser.role !== 'ADMIN') {
    return (
      <View style={s.denied}>
        {/* Ikon akses ditolak. */}
        <Ionicons
          name="lock-closed"
          size={42}
          color="#b42318"
        />

        {/* Judul pemberitahuan akses. */}
        <Text style={s.h}>
          Akses Dibatasi
        </Text>

        {/* Keterangan pembatasan role. */}
        <Text style={s.sub}>
          User Management hanya dapat diakses oleh ADMIN.
        </Text>

        {/* Tombol kembali ke Dashboard. */}
        <TouchableOpacity
          onPress={() => setScreen('HOME')}
          style={s.btn}
        >
          <Text style={s.bt}>
            Kembali
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ==========================================================
  // 5. TAMPILAN USER MANAGEMENT UNTUK ADMIN
  // ==========================================================

  return (
    <ScrollView contentContainerStyle={s.p}>
      {/* ======================================================
          5.1 TOMBOL KEMBALI
         ====================================================== */}

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

      {/* ======================================================
          5.2 JUDUL DAN DESKRIPSI HALAMAN
         ====================================================== */}

      <Text style={s.h}>
        User Management
      </Text>

      <Text style={s.sub}>
        Daftar akun dan role pada simulasi RBAC Project 06.
      </Text>

      {/* ======================================================
          5.3 MENAMPILKAN DAFTAR PENGGUNA
         ====================================================== */}

      {/*
        users.map() membaca setiap data pengguna.

        u:
        Object pengguna yang sedang diproses.

        u.user_id:
        Identifier unik yang digunakan sebagai key.

        u.name:
        Nama lengkap pengguna.

        u.username:
        Username untuk login.

        u.role:
        Hak akses pengguna.

        u.status:
        Status akun pengguna.
      */}
      {users.map(u => (
        <View
          key={u.user_id}
          style={s.card}
        >
          {/* ==================================================
              IKON PENGGUNA
             ================================================== */}

          <View style={s.avatar}>
            {/*
              Jika role PIMPINAN:
              Ikon business ditampilkan.

              Jika role selain PIMPINAN:
              Ikon person ditampilkan.
            */}
            <Ionicons
              name={
                u.role === 'PIMPINAN'
                  ? 'business'
                  : 'person'
              }
              size={23}
              color="#fff"
            />
          </View>

          {/* ==================================================
              INFORMASI AKUN PENGGUNA
             ================================================== */}

          <View style={{ flex: 1 }}>
            {/* Nama lengkap pengguna. */}
            <Text style={s.name}>
              {u.name}
            </Text>

            {/* Username dan role pengguna. */}
            <Text style={s.meta}>
              @{u.username} • {u.role}
            </Text>
          </View>

          {/* ==================================================
              STATUS AKUN PENGGUNA
             ================================================== */}

          <View style={s.badge}>
            <Text style={s.badget}>
              {u.status}
            </Text>
          </View>
        </View>
      ))}

      {/* ======================================================
          5.4 INFORMASI PERGANTIAN ROLE
         ====================================================== */}

      <View style={s.info}>
        <Ionicons
          name="shield-checkmark"
          size={23}
          color="#7b2cbf"
        />

        <Text style={s.it}>
          Pergantian role sekarang dilakukan melalui Logout
          lalu Login menggunakan akun yang sesuai, bukan
          dengan mengganti user aktif dari halaman ini.
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================================
// 6. STYLESHEET / PENGATURAN TAMPILAN
// ============================================================

/**
 * StyleSheet memisahkan pengaturan desain dari JSX.
 *
 * Seluruh nilai style asli dipertahankan.
 */
const s = StyleSheet.create({
  // Kontainer halaman daftar pengguna.
  p: {
    padding: 16,
    paddingBottom: 100,
  },

  // Tombol kembali ke Dashboard.
  back: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    marginBottom: 12,
  },

  // Judul halaman dan judul akses dibatasi.
  h: {
    fontSize: 22,
    fontWeight: '900',
    color: '#183153',
  },

  // Keterangan halaman dan pembatasan akses.
  sub: {
    color: '#667085',
    marginTop: 5,
    marginBottom: 15,
    lineHeight: 19,
  },

  // Kartu informasi setiap pengguna.
  card: {
    backgroundColor: '#fff',
    borderRadius: 17,
    padding: 13,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    elevation: 1,
  },

  // Kotak ikon pengguna.
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#6d28d9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Nama lengkap pengguna.
  name: {
    fontWeight: '900',
    color: '#183153',
  },

  // Username dan role pengguna.
  meta: {
    fontSize: 11,
    color: '#667085',
    marginTop: 3,
  },

  // Latar badge status akun.
  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  // Teks status akun.
  badget: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803d',
  },

  // Kotak informasi pergantian role.
  info: {
    backgroundColor: '#f5f3ff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },

  // Teks informasi pergantian role.
  it: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#5b21b6',
    fontWeight: '700',
  },

  // Tampilan ketika akses ditolak.
  denied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  // Tombol kembali ketika akses ditolak.
  btn: {
    marginTop: 18,
    backgroundColor: '#6d28d9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 13,
  },

  // Teks tombol kembali.
  bt: {
    color: '#fff',
    fontWeight: '900',
  },
});

// ============================================================
// AKHIR FILE UsersScreen.tsx
// ============================================================
