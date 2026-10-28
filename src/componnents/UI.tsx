/**
 * ============================================================
 * PROJECT 06 - SISTEM INFORMASI KEPEGAWAIAN SEKOLAH
 * ============================================================
 
 * FITUR / KONSEP UTAMA:
 * 1. Card           : Kontainer tampilan berbentuk kartu.
 * 2. Button         : Tombol aksi dengan ikon.
 * 3. Field          : Input teks dengan label.
 * 4. Props          : Parameter untuk komponen.
 * 5. TextInputProps : Properti bawaan TextInput.
 * 6. StyleSheet     : Pengaturan tampilan komponen.
 *
 * TUJUAN:
 * Menjaga konsistensi UI dan mengurangi pengulangan
 * kode antarscreen pada aplikasi kepegawaian sekolah.
 * ============================================================
 */

// ============================================================
// 1. IMPORT LIBRARY
// ============================================================

// React digunakan untuk membuat komponen antarmuka.
import React from 'react';

// Komponen dasar antarmuka React Native.
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
  TextInputProps,
} from 'react-native';

// Ionicons digunakan untuk menampilkan ikon.
import { Ionicons } from '@expo/vector-icons';

// ============================================================
// 2. KOMPONEN CARD
// ============================================================

/**
 * Card berfungsi sebagai kontainer untuk membungkus
 * informasi dalam bentuk kartu.
 *
 * Komponen ini memiliki:
 * - Warna latar putih.
 * - Sudut membulat.
 * - Padding.
 * - Efek bayangan.
 *
 * Props:
 * children : Konten yang ditampilkan di dalam kartu.
 */
export const Card = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <View style={s.card}>
    {children}
  </View>
);

// ============================================================
// 3. KOMPONEN BUTTON
// ============================================================

/**
 * Button merupakan tombol reusable untuk menjalankan aksi.
 *
 * Props:
 * title   : Teks yang ditampilkan pada tombol.
 * onPress : Fungsi yang dijalankan ketika tombol ditekan.
 * icon    : Nama ikon Ionicons.
 * danger  : Menentukan apakah tombol berwarna merah.
 *
 * Nilai default:
 * icon   = 'checkmark-circle'
 * danger = false
 *
 * Warna tombol:
 * - Biru : Tombol normal.
 * - Merah: Tombol untuk aksi berbahaya.
 */
export const Button = ({
  title,
  onPress,
  icon = 'checkmark-circle',
  danger = false,
}: {
  title: string;
  onPress: () => void;
  icon?: any;
  danger?: boolean;
}) => (
  <TouchableOpacity
    style={[
      s.btn,
      danger && {
        backgroundColor: '#b42318',
      },
    ]}
    onPress={onPress}
  >
    {/* Ikon tombol sesuai nilai props icon. */}
    <Ionicons
      name={icon}
      size={19}
      color="#fff"
    />

    {/* Teks tombol sesuai nilai props title. */}
    <Text style={s.bt}>
      {title}
    </Text>
  </TouchableOpacity>
);

// ============================================================
// 4. KOMPONEN FIELD
// ============================================================

/**
 * Field menyediakan komponen input teks dengan label.
 *
 * Props:
 * label : Judul atau keterangan input.
 * ...p  : Properti tambahan dari TextInputProps.
 *
 * Contoh properti TextInput:
 * - value
 * - onChangeText
 * - placeholder
 * - keyboardType
 * - multiline
 * - secureTextEntry
 * - editable
 *
 * Spread operator (...p) digunakan untuk menerima
 * berbagai properti TextInput tanpa harus
 * mendefinisikannya satu per satu.
 */
export const Field = ({
  label,
  ...p
}: TextInputProps & {
  label: string;
}) => (
  <View
    style={{
      marginBottom: 12,
    }}
  >
    {/* Label yang menjelaskan fungsi input. */}
    <Text style={s.label}>
      {label}
    </Text>

    {/* Input untuk menerima data dari pengguna. */}
    <TextInput
      {...p}
      style={s.input}
    />
  </View>
);

// ============================================================
// 5. STYLESHEET / PENGATURAN TAMPILAN
// ============================================================

/**
 * StyleSheet menyimpan konfigurasi tampilan
 * untuk seluruh komponen reusable.
 *
 * Warna utama:
 * Biru tombol   : #1565c0
 * Merah bahaya  : #b42318
 * Biru teks     : #455a64
 * Border input  : #d9e2ec
 *
 * Semua nilai style asli dipertahankan
 * agar desain Project 06 tidak berubah.
 */
const s = StyleSheet.create({
  // Kontainer kartu dengan sudut membulat dan bayangan.
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: .07,
    shadowRadius: 10,
    elevation: 3,
  },

  // Tombol utama berwarna biru.
  btn: {
    backgroundColor: '#1565c0',
    padding: 13,
    borderRadius: 13,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  // Teks tombol berwarna putih.
  bt: {
    color: '#fff',
    fontWeight: '800',
  },

  // Label yang berada di atas input.
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#455a64',
    marginBottom: 5,
  },

  // Tampilan input teks.
  input: {
    borderWidth: 1,
    borderColor: '#d9e2ec',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
});

// ============================================================
// AKHIR FILE UI.tsx
// ============================================================
