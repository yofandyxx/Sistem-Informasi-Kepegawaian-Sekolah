/**
 * ============================================================
 * PROJECT 06 - SISTEM INFORMASI KEPEGAWAIAN SEKOLAH
 * ============================================================
 * File        : App.tsx
 * Lokasi File : App.tsx (root project)
 * Fungsi      : Root aplikasi, provider, pemilihan screen,
 *               header, dan bottom navigation.
 * Dibuat oleh : Amrizal, S.Kom., M.Kom.
 *
 * KONSEP PENTING:
 * 1. SafeAreaProvider   : Menyediakan dukungan area aman.
 * 2. SafeAreaView       : Mengatur area tampilan aplikasi.
 * 3. Context API        : Mengakses state global aplikasi.
 * 4. AppProvider        : Menyediakan data dan fungsi global.
 * 5. Conditional Render : Menentukan tampilan berdasarkan login.
 * 6. Screen Mapping     : Memilih komponen berdasarkan screen.
 * 7. Bottom Navigation  : Navigasi menu bagian bawah.
 * 8. RBAC Session       : Menggunakan status sesi login.
 * 9. Array.map()        : Membentuk menu navigasi.
 * 10. StyleSheet        : Mengatur desain tampilan.
 * ============================================================
 */

// ============================================================
// 1. IMPORT LIBRARY REACT
// ============================================================

import React from 'react';

// Komponen dasar untuk membuat tampilan aplikasi.
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// Mengatur tampilan status bar perangkat.
import {
  StatusBar,
} from 'expo-status-bar';

// Mengatur area aman pada layar perangkat.
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

// Library ikon untuk navigasi bawah.
import {
  Ionicons,
} from '@expo/vector-icons';

// Provider dan hook untuk state global aplikasi.
import {
  AppProvider,
  useApp,
} from './src/context/AppContext';

// ============================================================
// 2. IMPORT SCREEN APLIKASI
// ============================================================

// Halaman login pengguna.
import Login from './src/screens/LoginScreen';

// Dashboard utama aplikasi.
import Home from './src/screens/HomeScreen';

// Halaman daftar pegawai.
import List from './src/screens/EmployeeListScreen';

// Halaman tambah dan edit pegawai.
import Form from './src/screens/EmployeeFormScreen';

// Halaman detail pegawai.
import Detail from './src/screens/EmployeeDetailScreen';

// Halaman dokumen pegawai.
import Docs from './src/screens/DocumentsScreen';

// Halaman laporan kepegawaian.
import Reports from './src/screens/ReportsScreen';

// Halaman User Management.
import Users from './src/screens/UsersScreen';

// Halaman bantuan aplikasi.
import Help from './src/screens/HelpScreen';
import TransactionHistory from './src/screens/TransactionHistoryScreen';

// ============================================================
// 3. KOMPONEN SHELL
// ============================================================

/**
 * Shell merupakan komponen utama yang mengatur:
 *
 * - Status login pengguna.
 * - Pemilihan screen aktif.
 * - Header aplikasi.
 * - Konten halaman.
 * - Bottom navigation.
 *
 * Shell menggunakan useApp() untuk mengakses
 * state global dari AppProvider.
 */
function Shell() {
  // ==========================================================
  // 3.1 MENGAMBIL STATE DARI APP CONTEXT
  // ==========================================================

  /**
   * screen:
   * Nama halaman yang sedang aktif.
   *
   * setScreen:
   * Fungsi untuk mengubah halaman aktif.
   *
   * isLoggedIn:
   * Menunjukkan apakah pengguna sudah login.
   */
  const {
    screen,
    setScreen,
    isLoggedIn,
  } = useApp();

  // ==========================================================
  // 3.2 PEMERIKSAAN STATUS LOGIN
  // ==========================================================

  /**
   * Jika pengguna belum login:
   * - Tampilkan LoginScreen.
   * - Jangan tampilkan halaman utama.
   * - Jangan tampilkan bottom navigation.
   *
   * Jika pengguna sudah login:
   * Proses dilanjutkan ke pemilihan screen.
   */
  if (!isLoggedIn) {
    return <Login />;
  }

  // ==========================================================
  // 3.3 SCREEN MAPPING
  // ==========================================================

  /**
   * Object map menghubungkan nama screen
   * dengan komponen React Native.
   *
   * Contoh:
   *
   * HOME -> HomeScreen
   *
   * EMPLOYEES -> EmployeeListScreen
   *
   * DOCUMENTS -> DocumentsScreen
   *
   * Dengan cara ini, komponen yang ditampilkan
   * dapat ditentukan berdasarkan nilai screen.
   */
  const map: any = {
    HOME: Home,
    EMPLOYEES: List,
    EMPLOYEE_FORM: Form,
    EMPLOYEE_DETAIL: Detail,
    DOCUMENTS: Docs,
    REPORTS: Reports,
    USERS: Users,
    HELP: Help,
    TRANSACTION_HISTORY: TransactionHistory,
  };

  // ==========================================================
  // 3.4 MENENTUKAN KOMPONEN AKTIF
  // ==========================================================

  /**
   * map[screen]:
   * Mengambil komponen berdasarkan screen aktif.
   *
   * Operator ||:
   * Jika komponen tidak ditemukan, gunakan Home.
   *
   * C:
   * Variabel yang menyimpan komponen screen aktif.
   */
  const C = map[screen] || Home;

  // ==========================================================
  // 3.5 TAMPILAN UTAMA APLIKASI
  // ==========================================================

  return (
    <SafeAreaView style={s.safe}>
      {/* ======================================================
          HEADER APLIKASI
         ====================================================== */}

      <View style={s.top}>
        {/* Nama sistem informasi. */}
        <Text style={s.brand}>
          PPNP • SISTEM KEPEGAWAIAN
        </Text>

        {/* Informasi project dan fitur login. */}
        <Text style={s.mode}>
          PROJECT 06 • LOGIN & RBAC
        </Text>
      </View>

      {/* ======================================================
          KONTEN SCREEN AKTIF
         ====================================================== */}

      {/*
        flex: 1 membuat area konten mengisi
        ruang yang tersedia di antara
        header dan bottom navigation.

        <C /> menampilkan komponen yang
        telah dipilih melalui screen mapping.
      */}
      <View style={{ flex: 1 }}>
        <C />
      </View>

      {/* ======================================================
          BOTTOM NAVIGATION
         ====================================================== */}

      <View style={s.nav}>
        {/*
          Setiap menu mempunyai tiga informasi:

          [0] Nama screen.
          [1] Nama ikon.
          [2] Label menu.

          Array.map() digunakan untuk membentuk
          seluruh tombol navigasi secara otomatis.
        */}
        {[
          ['HOME', 'home', 'Beranda'],
          ['EMPLOYEES', 'people', 'Pegawai'],
          ['DOCUMENTS', 'folder', 'Dokumen'],
          ['REPORTS', 'bar-chart', 'Laporan'],
        ].map(x => (
          <TouchableOpacity
            key={x[0]}
            style={s.item}
            onPress={() => setScreen(x[0] as any)}
          >
            {/* =================================================
                IKON NAVIGASI
               ================================================= */}

            {/*
              Warna ikon bergantung pada screen aktif.

              Jika menu sedang aktif:
              Gunakan warna ungu (#7b2cbf).

              Jika menu tidak aktif:
              Gunakan warna abu-abu (#98a2b3).
            */}
            <Ionicons
              name={x[1] as any}
              size={22}
              color={
                screen === x[0]
                  ? '#7b2cbf'
                  : '#98a2b3'
              }
            />

            {/* =================================================
                LABEL NAVIGASI
               ================================================= */}

            <Text
              style={[
                s.t,
                screen === x[0] && {
                  color: '#7b2cbf',
                },
              ]}
            >
              {x[2]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// 4. ROOT COMPONENT APLIKASI
// ============================================================

/**
 * App merupakan komponen root aplikasi.
 *
 * Urutan provider:
 *
 * SafeAreaProvider
 *        |
 *        v
 * StatusBar
 *        |
 *        v
 * AppProvider
 *        |
 *        v
 * Shell
 *
 * SafeAreaProvider:
 * Menyediakan dukungan informasi area aman.
 *
 * StatusBar:
 * Mengatur tampilan status bar menjadi dark.
 *
 * AppProvider:
 * Menyediakan state dan fungsi global aplikasi.
 *
 * Shell:
 * Mengatur login, screen, header, dan navigasi.
 *
 * AppProvider harus membungkus Shell karena
 * Shell menggunakan hook useApp().
 */
export default function App() {
  return (
    <SafeAreaProvider>
      {/* Mengatur tampilan status bar perangkat. */}
      <StatusBar style="dark" />

      {/* Menyediakan Context API bagi komponen anak. */}
      <AppProvider>
        {/* Menampilkan shell utama aplikasi. */}
        <Shell />
      </AppProvider>
    </SafeAreaProvider>
  );
}

// ============================================================
// 5. STYLESHEET APLIKASI
// ============================================================

/**
 * StyleSheet digunakan untuk memisahkan
 * pengaturan tampilan dari struktur JSX.
 *
 * Semua nilai style asli dipertahankan.
 */
const s = StyleSheet.create({
  // Kontainer utama aplikasi.
  safe: {
    flex: 1,
    backgroundColor: '#f6f5fb',
  },

  // Area header aplikasi.
  top: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },

  // Teks nama aplikasi pada header.
  brand: {
    fontSize: 12,
    fontWeight: '900',
    color: '#4c1d95',
  },

  // Teks informasi project pada header.
  mode: {
    fontSize: 8,
    fontWeight: '800',
    color: '#98a2b3',
  },

  // Kontainer bottom navigation.
  nav: {
    height: 72,
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ebe8f2',
  },

  // Tombol setiap menu navigasi.
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  // Teks label menu navigasi.
  t: {
    fontSize: 10,
    fontWeight: '800',
    color: '#98a2b3',
  },
});

// ============================================================
// AKHIR FILE App.tsx
// ============================================================
