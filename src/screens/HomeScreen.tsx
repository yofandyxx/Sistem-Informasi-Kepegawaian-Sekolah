/**
 * ============================================================
 * PROJECT 06 - SISTEM INFORMASI KEPEGAWAIAN SEKOLAH
 * ============================================================
 
 *
 * KONSEP PENTING:
 * 1. Dashboard       : Menampilkan ringkasan data.
 * 2. useMemo         : Mengoptimalkan perhitungan statistik.
 * 3. filter()        : Menghitung data berdasarkan kondisi.
 * 4. map()           : Menampilkan komponen secara dinamis.
 * 5. Props           : Mengirim data ke komponen Bar.
 * 6. RBAC            : Menampilkan menu berdasarkan role.
 * 7. Alert           : Konfirmasi sebelum logout.
 * 8. Navigation      : Perpindahan halaman melalui Context.
 * 9. StyleSheet      : Pengaturan tampilan aplikasi.
 */

// ============================================================
// 1. IMPORT LIBRARY DAN KOMPONEN
// ============================================================

import React, {
  useMemo,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

// Library ikon untuk dashboard dan menu.
import { Ionicons } from '@expo/vector-icons';

// Mengakses data, navigasi, dan sesi pengguna.
import { useApp } from '../context/AppContext';

// ============================================================
// 2. KOMPONEN GRAFIK BATANG (BAR)
// ============================================================

/**
 * Bar merupakan komponen reusable untuk menampilkan
 * grafik batang horizontal berdasarkan jumlah data.
 *
 * Props:
 * label : Nama kategori.
 * value : Jumlah data pada kategori.
 * total : Jumlah seluruh pegawai.
 * color : Warna grafik batang.
 */
function Bar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  /**
   * Menghitung lebar grafik dalam persen.
   *
   * Jika total > 0:
   * - Persentase dihitung dari value / total × 100.
   * - Math.round() membulatkan hasil.
   * - Math.max(6, ...) memberi lebar minimal 6%.
   *
   * Jika total = 0, lebar grafik menjadi 0%.
   */
  const pct = total
    ? Math.max(
        6,
        Math.round((value / total) * 100)
      )
    : 0;

  return (
    <View style={s.br}>
      {/* Label dan jumlah data grafik. */}
      <View style={s.bl}>
        <Text style={s.btxt}>
          {label}
        </Text>

        <Text style={s.bnum}>
          {value} (
          {total
            ? Math.round((value / total) * 100)
            : 0}
          %)
        </Text>
      </View>

      {/* Latar belakang grafik batang. */}
      <View style={s.track}>
        {/* Grafik dengan lebar sesuai persentase. */}
        <View
          style={[
            s.fill,
            {
              width: `${pct}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

// ============================================================
// 3. KOMPONEN DASHBOARD / HOME
// ============================================================

export default function Home() {
  // Mengambil data dan fungsi dari AppContext.
  const {
    employees,
    documents,
    setScreen,
    currentUser,
    logout,
  } = useApp();

  // ==========================================================
  // 4. MENGHITUNG STATISTIK PEGAWAI
  // ==========================================================

  /**
   * useMemo digunakan untuk menyimpan hasil perhitungan.
   *
   * Statistik dihitung ulang ketika array employees berubah.
   *
   * Kategori:
   * guru     : Pegawai berjenis GURU.
   * tendik   : Pegawai TENAGA_KEPENDIDIKAN.
   * aktif    : Pegawai dengan status AKTIF.
   * nonaktif : Pegawai dengan status NONAKTIF.
   * s2       : Pendidikan mengandung teks S2.
   * s1       : Pendidikan mengandung teks S1.
   */
  const x = useMemo(
    () => ({
      guru: employees.filter(
        e => e.type === 'GURU'
      ).length,

      tendik: employees.filter(
        e => e.type === 'TENAGA_KEPENDIDIKAN'
      ).length,

      aktif: employees.filter(
        e => e.status === 'AKTIF'
      ).length,

      nonaktif: employees.filter(
        e => e.status === 'NONAKTIF'
      ).length,

      s2: employees.filter(
        e =>
          e.education
            .toUpperCase()
            .includes('S2')
      ).length,

      s1: employees.filter(
        e =>
          e.education
            .toUpperCase()
            .includes('S1')
      ).length,
    }),
    [employees]
  );

  // ==========================================================
  // 5. DATA KARTU STATISTIK
  // ==========================================================

  /**
   * cards menyimpan informasi untuk empat kartu statistik.
   *
   * Setiap item memiliki:
   * [0] Nama ikon.
   * [1] Label statistik.
   * [2] Jumlah data.
   * [3] Warna kartu.
   */
  const cards = [
    [
      'people',
      'Pegawai',
      employees.length,
      '#6d28d9',
    ],
    [
      'school',
      'Guru',
      x.guru,
      '#0f766e',
    ],
    [
      'briefcase',
      'Tendik',
      x.tendik,
      '#ea580c',
    ],
    [
      'document-attach',
      'Dokumen',
      documents.length,
      '#2563eb',
    ],
  ];

  // ==========================================================
  // 6. DATA MENU UTAMA
  // ==========================================================

  /**
   * menus berisi tiga modul utama dashboard.
   *
   * Setiap item terdiri dari:
   * [0] Nama screen tujuan.
   * [1] Nama ikon.
   * [2] Judul menu.
   * [3] Keterangan menu.
   */
  const menus = [
    [
      'EMPLOYEES',
      'people-circle',
      'Data Kepegawaian',
      'Data guru, tenaga kependidikan, jabatan, pendidikan dan status.',
    ],
    [
      'DOCUMENTS',
      'folder-open',
      'Dokumen Pegawai',
      'SK, ijazah, sertifikat dan dokumen pegawai.',
    ],
    [
      'REPORTS',
      'bar-chart',
      'Dashboard & Laporan',
      'Analitik serta preview laporan.',
    ],
    [
      'TRANSACTION_HISTORY',
      'time',
      'Riwayat Transaksi',
      'Lihat aktivitas perubahan data dan sesi pengguna.',
    ],
  ];

  // ==========================================================
  // 7. KONFIRMASI LOGOUT
  // ==========================================================

  /**
   * doLogout menampilkan dialog konfirmasi.
   *
   * Batal:
   * Menutup dialog tanpa logout.
   *
   * Logout:
   * Memanggil logout() dari AppContext.
   */
  const doLogout = () =>
    Alert.alert(
      'Keluar dari Aplikasi',
      `Keluar dari akun ${currentUser.name}?`,
      [
        {
          text: 'Batal',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );

  // ==========================================================
  // 8. TAMPILAN DASHBOARD
  // ==========================================================

  return (
    <ScrollView contentContainerStyle={s.p}>
      {/* ======================================================
          8.1 HEADER DASHBOARD
         ====================================================== */}

      <View style={s.hero}>
        <View style={s.heroText}>
          <Text style={s.h}>
            SISTEM INFORMASI
          </Text>

          <Text style={s.h}>
            KEPEGAWAIAN
          </Text>

          <Text style={s.w}>
            Selamat datang, {currentUser.name}
          </Text>

          <Text style={s.role}>
            {currentUser.role} • Login Aktif
          </Text>
        </View>

        {/* Ikon utama dashboard. */}
        <View style={s.heroIcon}>
          <Ionicons
            name="people"
            size={40}
            color="#fff"
          />
        </View>
      </View>

      {/* ======================================================
          8.2 INFORMASI SESI PENGGUNA
         ====================================================== */}

      <View style={s.session}>
        <View>
          <Text style={s.sessionTitle}>
            Akun Aktif
          </Text>

          <Text style={s.sessionUser}>
            @{currentUser.username} • {currentUser.role}
          </Text>
        </View>

        {/* Tombol keluar dari aplikasi. */}
        <TouchableOpacity
          style={s.logout}
          onPress={doLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={19}
            color="#b42318"
          />

          <Text style={s.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================
          8.3 KARTU RINGKASAN KEPEGAWAIAN
         ====================================================== */}

      <Text style={s.section}>
        Ringkasan Kepegawaian
      </Text>

      <View style={s.grid}>
        {cards.map(c => (
          <View
            key={c[1] as string}
            style={[
              s.stat,
              {
                borderTopColor: c[3] as string,
              },
            ]}
          >
            <Ionicons
              name={c[0] as any}
              size={24}
              color={c[3] as string}
            />

            <Text style={s.num}>
              {c[2]}
            </Text>

            <Text style={s.lab}>
              {c[1]}
            </Text>
          </View>
        ))}
      </View>

      {/* ======================================================
          8.4 GRAFIK KOMPOSISI PEGAWAI
         ====================================================== */}

      <Text style={s.section}>
        Grafik Komposisi Pegawai
      </Text>

      <View style={s.chart}>
        <Text style={s.chartTitle}>
          Jenis & Status Kepegawaian
        </Text>

        <Text style={s.chartSub}>
          Perbandingan data aktif pada aplikasi saat ini.
        </Text>

        {/* Grafik berdasarkan jenis pegawai. */}
        <Bar
          label="Guru"
          value={x.guru}
          total={employees.length}
          color="#6d28d9"
        />

        <Bar
          label="Tendik"
          value={x.tendik}
          total={employees.length}
          color="#0f766e"
        />

        {/* Grafik berdasarkan status pegawai. */}
        <Bar
          label="Aktif"
          value={x.aktif}
          total={employees.length}
          color="#16a34a"
        />

        <Bar
          label="Tidak Aktif"
          value={x.nonaktif}
          total={employees.length}
          color="#dc2626"
        />

        {/* Grafik berdasarkan pendidikan pegawai. */}
        <Bar
          label="Pendidikan S2"
          value={x.s2}
          total={employees.length}
          color="#2563eb"
        />

        <Bar
          label="Pendidikan S1"
          value={x.s1}
          total={employees.length}
          color="#ea580c"
        />
      </View>

      {/* ======================================================
          8.5 TIGA MODUL UTAMA
         ====================================================== */}

      <Text style={s.section}>
        3 Modul Utama
      </Text>

      {/*
        map() membuat menu secara dinamis.

        m[0] : Screen tujuan.
        m[1] : Nama ikon.
        m[2] : Judul menu.
        m[3] : Deskripsi menu.
      */}
      {menus.map(m => (
        <TouchableOpacity
          key={m[0]}
          style={s.menu}
          onPress={() =>
            setScreen(m[0] as any)
          }
        >
          {/* Ikon menu. */}
          <View style={s.mi}>
            <Ionicons
              name={m[1] as any}
              size={27}
              color="#6d28d9"
            />
          </View>

          {/* Judul dan deskripsi menu. */}
          <View style={{ flex: 1 }}>
            <Text style={s.mt}>
              {m[2]}
            </Text>

            <Text style={s.md}>
              {m[3]}
            </Text>
          </View>

          {/* Ikon panah navigasi. */}
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#98a2b3"
          />
        </TouchableOpacity>
      ))}

      {/* ======================================================
          8.6 ADMINISTRASI DAN BANTUAN
         ====================================================== */}

      <Text style={s.section}>
        Administrasi & Bantuan
      </Text>

      <View style={s.quick}>
        {/* User Management hanya untuk ADMIN. */}
        {currentUser.role === 'ADMIN' && (
          <TouchableOpacity
            style={s.q}
            onPress={() => setScreen('USERS')}
          >
            <Ionicons
              name="shield-checkmark"
              size={24}
              color="#6d28d9"
            />

            <Text style={s.qt}>
              User Management
            </Text>
          </TouchableOpacity>
        )}

        {/* Menu bantuan tersedia untuk semua role. */}
        <TouchableOpacity
          style={s.q}
          onPress={() => setScreen('HELP')}
        >
          <Ionicons
            name="help-buoy"
            size={24}
            color="#ea580c"
          />

          <Text style={s.qt}>
            Help / Panduan
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ============================================================
// 9. STYLESHEET / PENGATURAN TAMPILAN
// ============================================================

/**
 * StyleSheet mengatur tampilan dashboard.
 * Seluruh nilai style asli dipertahankan.
 */
const s = StyleSheet.create({
  // Kontainer utama dashboard.
  p: {
    padding: 16,
    paddingBottom: 30,
  },

  // Header utama dengan latar ungu gelap.
  hero: {
    backgroundColor: '#312e81',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  // Kontainer teks pada header.
  heroText: {
    flex: 1,
    paddingRight: 12,
  },

  // Kontainer ikon pada header.
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },

  // Teks judul aplikasi.
  h: {
    fontSize: 23,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 27,
  },

  // Teks sambutan pengguna.
  w: {
    color: '#fff',
    marginTop: 10,
    fontWeight: '700',
  },

  // Informasi role pengguna.
  role: {
    color: '#c7d2fe',
    fontSize: 11,
    marginTop: 3,
  },

  // Kartu informasi sesi login.
  session: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },

  // Label informasi akun aktif.
  sessionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#98a2b3',
  },

  // Username dan role.
  sessionUser: {
    fontSize: 12,
    fontWeight: '900',
    color: '#344054',
    marginTop: 2,
  },

  // Tombol logout.
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fef3f2',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
  },

  // Teks tombol logout.
  logoutText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#b42318',
  },

  // Judul setiap bagian dashboard.
  section: {
    fontSize: 16,
    fontWeight: '900',
    color: '#183153',
    marginTop: 20,
    marginBottom: 10,
  },

  // Layout kartu statistik.
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  // Tampilan satu kartu statistik.
  stat: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 18,
    borderTopWidth: 4,
    elevation: 2,
  },

  // Angka statistik.
  num: {
    fontSize: 25,
    fontWeight: '900',
    color: '#183153',
    marginTop: 5,
  },

  // Label kartu statistik.
  lab: {
    color: '#667085',
    fontWeight: '700',
  },

  // Kontainer grafik komposisi pegawai.
  chart: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    elevation: 2,
  },

  // Judul grafik.
  chartTitle: {
    fontWeight: '900',
    fontSize: 15,
    color: '#183153',
  },

  // Keterangan grafik.
  chartSub: {
    fontSize: 11,
    color: '#667085',
    marginTop: 3,
    marginBottom: 9,
  },

  // Kontainer setiap grafik batang.
  br: {
    marginTop: 10,
  },

  // Baris label dan persentase grafik.
  bl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Label kategori grafik.
  btxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475467',
  },

  // Angka dan persentase grafik.
  bnum: {
    fontSize: 11,
    fontWeight: '900',
    color: '#344054',
  },

  // Latar grafik batang.
  track: {
    height: 10,
    backgroundColor: '#eef2f6',
    borderRadius: 9,
    marginTop: 5,
    overflow: 'hidden',
  },

  // Isi grafik batang.
  fill: {
    height: 10,
    borderRadius: 9,
  },

  // Kartu menu utama.
  menu: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
  },

  // Latar ikon menu.
  mi: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Judul menu.
  mt: {
    fontWeight: '900',
    color: '#183153',
  },

  // Deskripsi menu.
  md: {
    fontSize: 12,
    color: '#667085',
    marginTop: 3,
    lineHeight: 17,
  },

  // Kontainer menu administrasi dan bantuan.
  quick: {
    flexDirection: 'row',
    gap: 10,
  },

  // Kartu menu pintas.
  q: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 18,
    alignItems: 'center',
    gap: 7,
    elevation: 2,
  },

  // Teks menu pintas.
  qt: {
    fontSize: 12,
    fontWeight: '900',
    color: '#344054',
    textAlign: 'center',
  },
});

// ============================================================
// AKHIR FILE HomeScreen.tsx
// ============================================================
