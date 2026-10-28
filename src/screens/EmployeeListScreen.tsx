/**
 * ============================================================
 *
 * KONSEP PEMBELAJARAN:
 * 1. useState            : State pencarian dan filter.
 * 2. Array.filter()      : Penyaringan daftar pegawai.
 * 3. Array.map()         : Menampilkan daftar dan pilihan filter.
 * 4. Conditional Render : Foto/avatar, status, dan data kosong.
 * 5. React Context      : Data, role, dan navigasi aplikasi.
 * 6. RBAC               : Tombol tambah tidak tampil untuk PIMPINAN.
 */

// ============================================================
// 1. IMPORT LIBRARY
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

// ============================================================
// 2. SCREEN DAFTAR PEGAWAI
// ============================================================
export default function List() {
  // Mengambil data pegawai, navigasi, pilihan pegawai, dan role.
  const {
    employees,
    setScreen,
    select,
    currentUser,
  } = useApp();

  // q menyimpan teks yang diketik pada kolom pencarian.
  const [q, setQ] = useState('');

  // f menyimpan pilihan filter: SEMUA, GURU, atau TENDIK.
  const [f, setF] = useState('SEMUA');

  // ==========================================================
  // 3. FILTER JENIS PEGAWAI DAN PENCARIAN
  // ==========================================================
  /**
   * Pegawai ditampilkan jika:
   * - Jenisnya cocok dengan filter (atau filter SEMUA), DAN
   * - Gabungan nama, NIP, serta jabatan memuat teks pencarian.
   * Pencarian tidak membedakan huruf besar dan kecil.
   * Array asli employees tidak diubah oleh filter().
   */
  const data = employees.filter(
    (e) =>
      (f === 'SEMUA' || e.type === f) &&
      (e.name + e.nip + e.position)
        .toLowerCase()
        .includes(q.toLowerCase())
  );

  // ==========================================================
  // 4. RENDER TAMPILAN
  // ==========================================================
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.c}>
        {/* 4.1 Navigasi kembali ke Dashboard. */}
        <TouchableOpacity
          onPress={() => setScreen('HOME')}
          style={s.back}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#312e81"
          />
          <Text style={s.backt}>
            Kembali ke Dashboard
          </Text>
        </TouchableOpacity>

        {/* 4.2 Judul dan deskripsi halaman. */}
        <Text style={s.h}>
          Data Kepegawaian
        </Text>
        <Text style={s.sub}>
          Cari dan kelola data guru serta tenaga kependidikan.
        </Text>

        {/* 4.3 Kolom pencarian berdasarkan nama, NIP, jabatan. */}
        <View style={s.search}>
          <Ionicons
            name="search"
            size={20}
            color="#667085"
          />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Cari nama, NIP, jabatan..."
            style={{ flex: 1 }}
          />
        </View>

        {/* 4.4 Pilihan filter jenis pegawai. */}
        <View style={s.filters}>
          {[
            'SEMUA',
            'GURU',
            'TENAGA_KEPENDIDIKAN',
          ].map((x) => (
            <TouchableOpacity
              key={x}
              onPress={() => setF(x)}
              style={[
                s.chip,
                f === x && s.active,
              ]}
            >
              <Text
                style={[
                  s.ct,
                  f === x && { color: '#fff' },
                ]}
              >
                {x === 'TENAGA_KEPENDIDIKAN' ? 'TENDIK' : x}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4.5 Kartu pegawai dari hasil filter. */}
        {data.map((e) => (
          <TouchableOpacity
            key={e.employee_id}
            style={s.card}
            onPress={() => {
              // Simpan pegawai yang dipilih sebelum membuka detail.
              select(e);
              setScreen('EMPLOYEE_DETAIL');
            }}
          >
            {/*
              Jika photo_url tersedia, tampilkan foto.
              Jika kosong, tampilkan avatar bawaan.
              Ini mencegah Image menerima source.uri kosong.
            */}
            {e.photo_url?.trim() ? (
              <Image
                source={{ uri: e.photo_url }}
                style={s.img}
              />
            ) : (
              <View style={[s.img, s.avatarFallback]}>
                <Ionicons
                  name="person"
                  size={28}
                  color="#6d28d9"
                />
              </View>
            )}

            {/* Informasi identitas dan status pegawai. */}
            <View style={{ flex: 1 }}>
              <Text style={s.name}>
                {e.name}
              </Text>
              <Text style={s.meta}>
                {e.nip}
              </Text>
              <Text style={s.meta}>
                {e.position}
                {' • '}
                {e.education}
              </Text>

              {/* Warna badge berubah menurut status pegawai. */}
              <View
                style={[
                  s.badge,
                  e.status === 'AKTIF' ? s.ba : s.bn,
                ]}
              >
                <Text
                  style={[
                    s.badget,
                    e.status === 'AKTIF' ? s.bat : s.bnt,
                  ]}
                >
                  {e.status === 'AKTIF' ? 'AKTIF' : 'TIDAK AKTIF'}
                </Text>
              </View>
            </View>

            {/* Ikon penanda bahwa kartu dapat dibuka. */}
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#98a2b3"
            />
          </TouchableOpacity>
        ))}

        {/* 4.6 Pesan jika tidak ada data yang cocok. */}
        {data.length === 0 && (
          <View style={s.empty}>
            <Ionicons
              name="search-outline"
              size={34}
              color="#98a2b3"
            />
            <Text style={s.emptyt}>
              Data pegawai tidak ditemukan.
            </Text>
          </View>
        )}
      </ScrollView>

      {/*
        4.7 Floating Action Button (FAB) tambah pegawai.
        Role PIMPINAN tidak memperoleh tombol ini.
        ADMIN dan OPERATOR dapat membuka form tambah.
      */}
      {currentUser.role !== 'PIMPINAN' && (
        <TouchableOpacity
          style={s.fab}
          onPress={() => {
            // Kosongkan pilihan agar form berada pada mode tambah.
            select(undefined);
            setScreen('EMPLOYEE_FORM');
          }}
        >
          <Ionicons
            name="add"
            size={32}
            color="#fff"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================================
// 5. STYLESHEET
// ============================================================
// Semua nama style dan nilainya dipertahankan dari file asli.
const s = StyleSheet.create({
  // Area konten daftar pegawai.
  c: {
    padding: 16,
    paddingBottom: 100,
  },
  // Tombol navigasi kembali.
  back: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    marginBottom: 12,
  },
  backt: {
    fontWeight: '800',
    color: '#312e81',
  },
  // Judul dan subjudul halaman.
  h: {
    fontSize: 26,
    fontWeight: '900',
    color: '#183153',
  },
  sub: {
    color: '#607d8b',
    marginBottom: 14,
  },
  // Kolom pencarian.
  search: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 13,
    elevation: 2,
  },
  // Filter kategori pegawai.
  filters: {
    flexDirection: 'row',
    gap: 7,
    marginVertical: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ede9fe',
  },
  active: {
    backgroundColor: '#6d28d9',
  },
  ct: {
    fontSize: 11,
    fontWeight: '800',
  },
  // Kartu dan foto pegawai.
  card: {
    backgroundColor: '#fff',
    borderRadius: 17,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    elevation: 2,
  },
  img: {
    width: 58,
    height: 58,
    borderRadius: 15,
  },
  // Avatar pengganti apabila URL foto kosong.
  avatarFallback: {
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Nama dan metadata pegawai.
  name: {
    fontWeight: '900',
    color: '#183153',
  },
  meta: {
    fontSize: 12,
    color: '#607d8b',
    marginTop: 3,
  },
  // Badge status AKTIF / NONAKTIF.
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  ba: {
    backgroundColor: '#dcfce7',
  },
  bn: {
    backgroundColor: '#fee2e2',
  },
  badget: {
    fontSize: 9,
    fontWeight: '900',
  },
  bat: {
    color: '#15803d',
  },
  bnt: {
    color: '#b91c1c',
  },
  // Tombol mengambang untuk menambah pegawai.
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 88,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#6d28d9',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  // Tampilan ketika hasil pencarian kosong.
  empty: {
    alignItems: 'center',
    padding: 30,
  },
  emptyt: {
    color: '#667085',
    marginTop: 8,
    fontWeight: '700',
  },
});
// ============================================================
// AKHIR FILE EmployeeListScreen.tsx
// ============================================================
