/**
 * ============================================================
 * PROJECT 06 - SISTEM INFORMASI KEPEGAWAIAN SEKOLAH
 * ============================================================
 
 *
 * KONSEP PENTING:
 * 1. Authentication Simulation : Simulasi login pengguna.
 * 2. useState                  : Mengelola state form.
 * 3. Controlled Input          : Input terhubung ke state.
 * 4. Secure Text Entry         : Menyembunyikan password.
 * 5. Conditional Rendering     : Tampilan berdasarkan kondisi.
 * 6. Async/Await               : Menjalankan proses login.
 * 7. Try/Catch/Finally         : Menangani proses dan error.
 * 8. RBAC                      : Hak akses berdasarkan role.
 * 9. KeyboardAvoidingView      : Penyesuaian saat keyboard aktif.
 * 10. StyleSheet               : Pengaturan tampilan login.
 */

// ============================================================
// 1. IMPORT LIBRARY DAN KOMPONEN
// ============================================================

import React, {
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Library ikon untuk form login.
import { Ionicons } from '@expo/vector-icons';

// Mengakses fungsi login dari AppContext.
import { useApp } from '../context/AppContext';

// ============================================================
// 2. KOMPONEN LOGIN SCREEN
// ============================================================

export default function LoginScreen() {
  // Mengambil fungsi login dari AppContext.
  const {
    login,
  } = useApp();

  // ==========================================================
  // 3. STATE FORM LOGIN
  // ==========================================================

  /**
   * username:
   * Menyimpan username yang dimasukkan pengguna.
   */
  const [username, setUsername] = useState('');

  /**
   * password:
   * Menyimpan password yang dimasukkan pengguna.
   */
  const [password, setPassword] = useState('');

  /**
   * showPassword:
   * false = password disembunyikan.
   * true  = password ditampilkan.
   */
  const [showPassword, setShowPassword] = useState(false);

  /**
   * loading:
   * Menandai apakah proses login sedang berlangsung.
   */
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // 4. FUNGSI PROSES LOGIN
  // ==========================================================

  /**
   * handleLogin menjalankan tahapan:
   *
   * 1. Memeriksa kelengkapan username dan password.
   * 2. Mengaktifkan indikator loading.
   * 3. Memanggil login() dari AppContext.
   * 4. Menampilkan pesan jika terjadi kesalahan.
   * 5. Menonaktifkan loading setelah proses selesai.
   *
   * Validasi kredensial dan penentuan role dilakukan
   * oleh fungsi login() pada AppContext.
   */
  const handleLogin = async () => {
    // Validasi input sebelum login.
    if (!username.trim() || !password) {
      return Alert.alert(
        'Data Belum Lengkap',
        'Masukkan username dan password.'
      );
    }

    try {
      // Menandai bahwa proses login dimulai.
      setLoading(true);

      // Memanggil fungsi autentikasi dari AppContext.
      await login(username, password);
    } catch (error) {
      // Menampilkan pesan apabila proses login gagal.
      Alert.alert(
        'Login Gagal',
        error instanceof Error
          ? error.message
          : 'Login gagal.'
      );
    } finally {
      // Loading dinonaktifkan baik login berhasil/gagal.
      setLoading(false);
    }
  };

  // ==========================================================
  // 5. TAMPILAN HALAMAN LOGIN
  // ==========================================================

  return (
    <KeyboardAvoidingView
      style={s.page}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ====================================================
            5.1 HEADER / HERO LOGIN
           ==================================================== */}

        <View style={s.hero}>
          {/* Ikon utama aplikasi. */}
          <View style={s.heroIcon}>
            <Ionicons
              name="people"
              size={40}
              color="#fff"
            />
          </View>

          {/* Identitas project. */}
          <View style={s.badge}>
            <Text style={s.badgeText}>
              PROJECT 06 • CLOUD INFORMATION SYSTEM
            </Text>
          </View>

          {/* Judul aplikasi. */}
          <Text style={s.heroTitle}>
            Sistem Informasi{'\n'}Kepegawaian Sekolah
          </Text>

          {/* Teknologi backend dan cloud. */}
          <Text style={s.heroText}>
            Google Sheets • Apps Script • Cloudinary
          </Text>

          {/* ==================================================
              5.2 INFORMASI FITUR APLIKASI
             ================================================== */}

          <View style={s.heroStats}>
            {/* Informasi hak akses pengguna. */}
            <View style={s.heroStat}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color="#ddd6fe"
              />
              <Text style={s.heroStatText}>
                Role Based
              </Text>
            </View>

            {/* Informasi penyimpanan file cloud. */}
            <View style={s.heroStat}>
              <Ionicons
                name="cloud"
                size={18}
                color="#ddd6fe"
              />
              <Text style={s.heroStatText}>
                Cloud File
              </Text>
            </View>

            {/* Informasi pengujian melalui Expo Go. */}
            <View style={s.heroStat}>
              <Ionicons
                name="phone-portrait"
                size={18}
                color="#ddd6fe"
              />
              <Text style={s.heroStatText}>
                Expo Go
              </Text>
            </View>
          </View>
        </View>

        {/* ====================================================
            5.3 KARTU FORM LOGIN
           ==================================================== */}

        <View style={s.card}>
          <Text style={s.welcome}>
            Selamat Datang
          </Text>

          <Text style={s.subtitle}>
            Masuk menggunakan akun sesuai hak akses Anda.
          </Text>

          {/* ==================================================
              5.4 INPUT USERNAME
             ================================================== */}

          <Text style={s.label}>
            Username
          </Text>

          <View style={s.inputBox}>
            {/* Ikon username. */}
            <View style={s.inputIcon}>
              <Ionicons
                name="person-outline"
                size={19}
                color="#6d28d9"
              />
            </View>

            {/* Input username terhubung ke state. */}
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Masukkan username"
              placeholderTextColor="#98a2b3"
              style={s.input}
              returnKeyType="next"
            />
          </View>

          {/* ==================================================
              5.5 INPUT PASSWORD
             ================================================== */}

          <Text style={s.label}>
            Password
          </Text>

          <View style={s.inputBox}>
            {/* Ikon password. */}
            <View style={s.inputIcon}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color="#6d28d9"
              />
            </View>

            {/*
              secureTextEntry={!showPassword}

              showPassword = false:
              Password disembunyikan.

              showPassword = true:
              Password ditampilkan.
            */}
            <TextInput
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword}
              placeholder="Masukkan password"
              placeholderTextColor="#98a2b3"
              style={s.input}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />

            {/* Tombol lihat/sembunyikan password. */}
            <TouchableOpacity
              onPress={() =>
                setShowPassword(v => !v)
              }
              hitSlop={10}
            >
              <Ionicons
                name={
                  showPassword
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={22}
                color="#667085"
              />
            </TouchableOpacity>
          </View>

          {/* ==================================================
              5.6 TOMBOL LOGIN
             ================================================== */}

          {/*
            Tombol menjalankan handleLogin().

            Ketika loading = true:
            - Tombol dinonaktifkan.
            - ActivityIndicator ditampilkan.
            - Teks berubah menjadi MEMERIKSA....

            Ketika loading = false:
            - Tombol dapat ditekan.
            - Ikon login ditampilkan.
          */}
          <TouchableOpacity
            style={[
              s.button,
              loading && s.disabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons
                name="log-in-outline"
                size={22}
                color="#fff"
              />
            )}

            <Text style={s.buttonText}>
              {loading
                ? 'MEMERIKSA...'
                : 'MASUK KE APLIKASI'}
            </Text>
          </TouchableOpacity>

          {/* ==================================================
              5.7 INFORMASI ROLE PENGGUNA
             ================================================== */}

          <View style={s.roleBox}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#6d28d9"
            />

            <View style={{ flex: 1 }}>
              <Text style={s.roleTitle}>
                Hak akses berdasarkan role
              </Text>

              <Text style={s.roleText}>
                ADMIN • OPERATOR • PIMPINAN
              </Text>
            </View>
          </View>
        </View>

        {/* ====================================================
            5.8 FOOTER
           ==================================================== */}

        <Text style={s.footer}>
          Project 06 • Praktikum React Native
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// 6. STYLESHEET / PENGATURAN TAMPILAN
// ============================================================

/**
 * StyleSheet digunakan untuk memisahkan pengaturan tampilan
 * dari struktur JSX.
 *
 * Semua nilai style asli dipertahankan.
 */
const s = StyleSheet.create({
  // Kontainer utama halaman login.
  page: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },

  // Pengaturan ScrollView.
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
    paddingVertical: 28,
  },

  // Header utama login.
  hero: {
    backgroundColor: '#312e81',
    borderRadius: 30,
    padding: 24,
    paddingBottom: 30,
    overflow: 'hidden',
  },

  // Kotak ikon utama aplikasi.
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#6d28d9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  // Badge identitas project.
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,.13)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  // Teks badge.
  badgeText: {
    color: '#ddd6fe',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Judul aplikasi.
  heroTitle: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '900',
    color: '#fff',
    marginTop: 12,
  },

  // Keterangan teknologi.
  heroText: {
    color: '#c7d2fe',
    marginTop: 7,
    fontWeight: '600',
  },

  // Baris informasi fitur.
  heroStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    flexWrap: 'wrap',
  },

  // Kartu kecil informasi fitur.
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,.1)',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 12,
  },

  // Teks informasi fitur.
  heroStatText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '800',
  },

  // Kartu form login.
  card: {
    backgroundColor: '#fff',
    borderRadius: 26,
    padding: 22,
    marginTop: -10,
    marginHorizontal: 8,
    elevation: 6,
  },

  // Judul sambutan.
  welcome: {
    fontSize: 23,
    fontWeight: '900',
    color: '#183153',
  },

  // Keterangan form login.
  subtitle: {
    color: '#667085',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 15,
  },

  // Label username dan password.
  label: {
    fontSize: 12,
    fontWeight: '900',
    color: '#344054',
    marginBottom: 7,
    marginTop: 10,
  },

  // Kotak input username/password.
  inputBox: {
    height: 54,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    gap: 8,
    backgroundColor: '#fcfcfd',
  },

  // Latar ikon input.
  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Pengaturan TextInput.
  input: {
    flex: 1,
    fontSize: 14,
    color: '#101828',
  },

  // Tombol login.
  button: {
    height: 56,
    borderRadius: 17,
    backgroundColor: '#6d28d9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 22,
    elevation: 2,
  },

  // Tampilan tombol ketika loading.
  disabled: {
    opacity: 0.65,
  },

  // Teks tombol login.
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 0.4,
    fontSize: 13,
  },

  // Kotak informasi hak akses.
  roleBox: {
    backgroundColor: '#f5f3ff',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    alignItems: 'center',
  },

  // Judul informasi role.
  roleTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#4c1d95',
  },

  // Daftar role aplikasi.
  roleText: {
    fontSize: 10,
    color: '#6d28d9',
    fontWeight: '700',
    marginTop: 2,
  },

  // Footer halaman login.
  footer: {
    textAlign: 'center',
    color: '#667085',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 16,
  },
});

// ============================================================
// AKHIR FILE LoginScreen.tsx
// ============================================================
