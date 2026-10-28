/**
 * ============================================================
 
 *
 * KONSEP PEMBELAJARAN:
 * 1. React Context API dan pemilihan data pegawai.
 * 2. Array filter() dan map().
 * 3. Conditional rendering dan Role Based Access Control.
 * 4. Alert konfirmasi serta async/await.
 * 5. Reusable component dan StyleSheet.
 *
 * ============================================================
 */

// 1. IMPORT LIBRARY DAN KOMPONEN
import React from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  Image,
  View,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Card, Button } from '../componnents/UI';

// 2. KOMPONEN DETAIL PEGAWAI
export default function Detail() {
  // Mengambil data dan fungsi bersama dari AppContext.
  const {
    selected,
    setScreen,
    select,
    remove,
    documents,
    currentUser,
  } = useApp();

  // Jika tidak ada pegawai terpilih, halaman tidak dirender.
  if (!selected) {
    return null;
  }

  // Menghitung dokumen yang memiliki employee_id sama.
  const docs = documents.filter(
    (d) => d.employee_id === selected.employee_id
  );

  // 3. KONFIRMASI DAN PROSES HAPUS PEGAWAI
  const del = () => {
    Alert.alert(
      'Hapus Pegawai',
      'Yakin menghapus data ini?',
      [
        {
          text: 'Batal',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            // Menunggu penghapusan data selesai.
            await remove(selected.employee_id);
            // Mengosongkan pilihan lalu kembali ke daftar pegawai.
            select(undefined);
            setScreen('EMPLOYEES');
          },
        },
      ]
    );
  };

  // 4. TAMPILAN HALAMAN DETAIL
  return (
    <ScrollView contentContainerStyle={s.c}>
      {/* Tombol kembali ke daftar pegawai. */}
      <TouchableOpacity
        onPress={() => setScreen('EMPLOYEES')}
        style={s.back}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color="#312e81"
        />
        <Text style={s.backt}>
          Kembali ke Data Kepegawaian
        </Text>
      </TouchableOpacity>

      {/* Header berisi foto, nama, jabatan, dan status. */}
      <View style={s.head}>
        {/* Jangan mengirim URI kosong ke Image. */}
        {selected.photo_url?.trim() ? (
          <Image
            source={{ uri: selected.photo_url }}
            style={s.img}
          />
        ) : (
          // Avatar pengganti ketika URL foto kosong.
          <View style={[s.img, s.avatarFallback]}>
            <Ionicons
              name="person"
              size={48}
              color="#6d28d9"
            />
          </View>
        )}
        <Text style={s.name}>{selected.name}</Text>
        <Text style={s.white}>{selected.position}</Text>

        {/* Warna badge bergantung pada status pegawai. */}
        <View
          style={[
            s.badge,
            selected.status === 'AKTIF' ? s.ba : s.bn,
          ]}
        >
          <Text
            style={[
              s.bt,
              selected.status === 'AKTIF' ? s.bat : s.bnt,
            ]}
          >
            {selected.status === 'AKTIF'
              ? 'AKTIF'
              : 'TIDAK AKTIF'}
          </Text>
        </View>
      </View>

      {/* Data label-nilai dibuat menjadi baris dengan map(). */}
      <Card>
        {[
          ['NIP', selected.nip],
          [
            'Jenis',
            selected.type === 'GURU'
              ? 'Guru'
              : 'Tenaga Kependidikan',
          ],
          ['Pendidikan', selected.education],
          ['Telepon', selected.phone],
          ['Email', selected.email],
          [
            'Status',
            selected.status === 'AKTIF' ? 'Aktif' : 'Tidak Aktif',
          ],
          ['Dokumen', `${docs.length} file`],
        ].map((x) => (
          <View key={x[0]} style={s.r}>
            <Text style={s.k}>{x[0]}</Text>
            <Text style={s.v}>{x[1]}</Text>
          </View>
        ))}
      </Card>

      {/* ADMIN dan OPERATOR dapat membuka formulir edit. */}
      {currentUser.role !== 'PIMPINAN' && (
        <Button
          title="Edit Pegawai"
          icon="create"
          onPress={() => setScreen('EMPLOYEE_FORM')}
        />
      )}

      {/* Hanya ADMIN yang melihat tombol hapus pegawai. */}
      {currentUser.role === 'ADMIN' && (
        <Button
          title="Hapus Pegawai"
          icon="trash"
          danger
          onPress={del}
        />
      )}
    </ScrollView>
  );
}

// 5. STYLESHEET: NILAI DESAIN ASLI DIPERTAHANKAN
const s = StyleSheet.create({
  c: {
    padding: 16,
    paddingBottom: 100,
  },
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
  head: {
    backgroundColor: '#312e81',
    padding: 22,
    borderRadius: 22,
    alignItems: 'center',
    marginBottom: 14,
  },
  img: {
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#fff',
  },
  // Warna dan posisi avatar jika foto tidak tersedia.
  avatarFallback: {
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 10,
    textAlign: 'center',
  },
  white: {
    color: '#dbeafe',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 9,
  },
  ba: {
    backgroundColor: '#dcfce7',
  },
  bn: {
    backgroundColor: '#fee2e2',
  },
  bt: {
    fontSize: 10,
    fontWeight: '900',
  },
  bat: {
    color: '#15803d',
  },
  bnt: {
    color: '#b91c1c',
  },
  r: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eef2f6',
  },
  k: {
    fontSize: 11,
    color: '#78909c',
    fontWeight: '800',
  },
  v: {
    fontWeight: '700',
    marginTop: 3,
  },
});
// AKHIR FILE EmployeeDetailScreen.tsx
