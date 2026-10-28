/**
 * ============================================================
 * PROJECT 06 - SISTEM INFORMASI KEPEGAWAIAN SEKOLAH
 * ============================================================
 *
 * KONSEP PENTING:
 * 1. Form State       : Mengelola nilai input.
 * 2. Validation       : Memeriksa kelengkapan dan NIP unik.
 * 3. Image Picker     : Memilih foto dari galeri Android.
 * 4. Cloudinary       : Penyimpanan foto melalui backend.
 * 5. Async/Await      : Menunggu proses upload dan simpan.
 * 6. RBAC             : Membatasi akses berdasarkan role.
 * 7. Conditional UI   : Menampilkan foto atau avatar default.
 * 8. Reusable UI      : Menggunakan Field dan Button.
 *
 * ============================================================
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
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Memilih gambar dari galeri perangkat.
import * as ImagePicker from 'expo-image-picker';

// Menampilkan ikon pada tombol dan avatar.
import { Ionicons } from '@expo/vector-icons';

// Mengakses state dan fungsi global aplikasi.
import { useApp } from '../context/AppContext';

// Komponen input dan tombol yang dapat digunakan ulang.
import {
  Field,
  Button,
} from '../componnents/UI';

// Definisi tipe data pegawai.
import {
  Employee,
  EmployeeStatus,
  EmployeeType,
} from '../types';

// Service komunikasi REST API.
import * as api from '../serviceS/api';

// ============================================================
// 2. SCREEN FORM PEGAWAI
// ============================================================

export default function EmployeeFormScreen() {
  // Mengambil data dan fungsi dari AppContext.
  const {
    selected,
    save,
    setScreen,
    employees,
    currentUser,
  } = useApp();

  // Menandai proses upload foto sedang berjalan.
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Menandai proses penyimpanan data sedang berjalan.
  const [saving, setSaving] = useState(false);

  // ==========================================================
  // 3. STATE FORM PEGAWAI
  // ==========================================================

  /**
   * Jika selected tersedia, form digunakan untuk edit.
   * Jika tidak, form menggunakan data awal pegawai baru.
   *
   * employee_id awal dibentuk dari jumlah pegawai.
   * Penentuan ID final tetap mengikuti service/backend.
   */
  const [data, setData] = useState<Employee>(
    selected || {
      employee_id: `EMP-${String(
        employees.length + 1
      ).padStart(3, '0')}`,
      nip: '',
      name: '',
      type: 'GURU',
      position: '',
      education: '',
      phone: '',
      email: '',
      photo_url: '',
      status: 'AKTIF',
    }
  );

  // ==========================================================
  // 4. FUNGSI MENGUBAH NILAI FIELD
  // ==========================================================

  /**
   * Memperbarui satu properti object data.
   *
   * keyof Employee membatasi nama field
   * agar sesuai dengan properti Employee.
   *
   * Spread operator mempertahankan field lainnya.
   */
  const set = (
    key: keyof Employee,
    value: string
  ) =>
    setData(valueData => ({
      ...valueData,
      [key]: value,
    }));

  // ==========================================================
  // 5. MEMILIH DAN MENGUPLOAD FOTO PEGAWAI
  // ==========================================================

  /**
   * Alur:
   * 1. Meminta izin akses galeri.
   * 2. Membuka pemilih gambar.
   * 3. Memeriksa apakah pengguna membatalkan.
   * 4. Memeriksa data Base64 gambar.
   * 5. Menentukan MIME type dan nama file.
   * 6. Mengirim file melalui REST API.
   * 7. Menyimpan secure_url ke state form.
   */
  const pickAndUploadPhoto = async () => {
    try {
      // Meminta izin akses galeri Android.
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      // Menghentikan proses jika izin ditolak.
      if (!permission.granted) {
        Alert.alert(
          'Izin Dibutuhkan',
          'Izinkan aplikasi mengakses galeri untuk memilih foto pegawai.'
        );
        return;
      }

      // Membuka galeri untuk memilih satu gambar.
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
          base64: true,
        });

      // Tidak melanjutkan jika pengguna membatalkan.
      if (result.canceled) {
        return;
      }

      // Mengambil gambar pertama yang dipilih.
      const asset = result.assets[0];

      // Base64 diperlukan untuk proses upload.
      if (!asset.base64) {
        throw new Error('Base64 foto tidak tersedia.');
      }

      // Menentukan format gambar.
      const mimeType =
        asset.mimeType === 'image/png'
          ? 'image/png'
          : 'image/jpeg';

      // Menggunakan nama file asli atau membuat nama otomatis.
      const fileName =
        asset.fileName ||
        `foto_${Date.now()}.${
          mimeType === 'image/png' ? 'png' : 'jpg'
        }`;

      // Mengaktifkan indikator proses upload.
      setUploadingPhoto(true);

      // Mengirim foto melalui service REST API.
      const uploaded = await api.uploadEmployeePhoto({
        file_base64: asset.base64,
        mime_type: mimeType,
        file_name: fileName,
      });

      // Menyimpan URL Cloudinary ke form.
      set('photo_url', uploaded.secure_url);

      Alert.alert(
        'Berhasil',
        'Foto berhasil diupload ke Cloudinary. URL sudah diisikan otomatis.'
      );
    } catch (error) {
      // Menampilkan pesan apabila proses upload gagal.
      Alert.alert(
        'Upload Foto Gagal',
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat upload foto.'
      );
    } finally {
      // Mengakhiri indikator upload.
      setUploadingPhoto(false);
    }
  };

  // ==========================================================
  // 6. VALIDASI DAN PENYIMPANAN PEGAWAI
  // ==========================================================

  /**
   * Proses:
   * 1. Memeriksa field wajib.
   * 2. Memeriksa duplikasi NIP.
   * 3. Mengirim data melalui AppContext.
   * 4. Menampilkan notifikasi.
   * 5. Kembali ke daftar pegawai.
   */
  const submit = async () => {
    // Memastikan field wajib sudah diisi.
    if (
      !data.nip.trim() ||
      !data.name.trim() ||
      !data.position.trim() ||
      !data.education.trim()
    ) {
      Alert.alert(
        'Validasi',
        'NIP, nama, jabatan, dan pendidikan wajib diisi.'
      );
      return;
    }

    // Memeriksa NIP yang telah digunakan pegawai lain.
    if (
      employees.some(
        x =>
          x.nip === data.nip &&
          x.employee_id !== data.employee_id
      )
    ) {
      Alert.alert(
        'Validasi',
        'NIP sudah terdaftar.'
      );
      return;
    }

    try {
      // Menandai proses penyimpanan berlangsung.
      setSaving(true);

      // Memanggil fungsi save dari AppContext.
      await save(data);

      Alert.alert(
        'Berhasil',
        'Data pegawai tersimpan.'
      );

      // Kembali ke daftar pegawai.
      setScreen('EMPLOYEES');
    } catch (error) {
      Alert.alert(
        'Gagal Menyimpan',
        error instanceof Error
          ? error.message
          : 'Data pegawai gagal disimpan.'
      );
    } finally {
      // Mengakhiri indikator penyimpanan.
      setSaving(false);
    }
  };

  // ==========================================================
  // 7. PEMBATASAN AKSES BERDASARKAN ROLE
  // ==========================================================

  /**
   * ADMIN dan OPERATOR dapat membuka form.
   * PIMPINAN hanya memiliki akses baca.
   */
  const canEdit =
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'OPERATOR';

  if (!canEdit) {
    return (
      <View style={s.denied}>
        <Ionicons
          name="lock-closed"
          size={42}
          color="#6d28d9"
        />
        <Text style={s.deniedTitle}>
          Akses Terbatas
        </Text>
        <Text style={s.deniedText}>
          Role PIMPINAN hanya dapat melihat data.
        </Text>
        <Button
          title="Kembali"
          onPress={() => setScreen('EMPLOYEES')}
          icon="arrow-back"
        />
      </View>
    );
  }

  // ==========================================================
  // 8. TAMPILAN FORM PEGAWAI
  // ==========================================================

  return (
    <ScrollView contentContainerStyle={s.container}>
      {/* Judul berubah berdasarkan mode tambah atau edit. */}
      <Text style={s.title}>
        {selected ? 'Edit' : 'Tambah'} Pegawai
      </Text>

      <Text style={s.subtitle}>
        Lengkapi identitas dan foto pegawai.
        Foto disimpan di Cloudinary.
      </Text>

      {/* ======================================================
          8.1 FOTO PEGAWAI
         ====================================================== */}

      <View style={s.photoCard}>
        {/* Foto ditampilkan jika URL tersedia. */}
        {data.photo_url ? (
          <Image
            source={{
              uri: data.photo_url,
            }}
            style={s.photo}
          />
        ) : (
          // Avatar default ketika URL foto kosong.
          <View
            style={[
              s.photo,
              s.photoFallback,
            ]}
          >
            <Ionicons
              name="person"
              size={52}
              color="#8b5cf6"
            />
          </View>
        )}

        <View style={s.photoInfo}>
          <Text style={s.photoTitle}>
            Foto Pegawai
          </Text>

          <Text style={s.photoHint}>
            JPG/PNG • maksimal 5 MB
          </Text>

          {/* Tombol upload dinonaktifkan saat proses berjalan. */}
          <TouchableOpacity
            style={s.uploadButton}
            onPress={pickAndUploadPhoto}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons
                name="cloud-upload-outline"
                size={18}
                color="#fff"
              />
            )}

            <Text style={s.uploadText}>
              {uploadingPhoto
                ? 'Mengupload...'
                : 'Pilih & Upload Foto'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ======================================================
          8.2 IDENTITAS PEGAWAI
         ====================================================== */}

      <Field
        label="NIP *"
        value={data.nip}
        onChangeText={v => set('nip', v)}
        keyboardType="numeric"
      />

      <Field
        label="Nama Lengkap *"
        value={data.name}
        onChangeText={v => set('name', v)}
      />

      {/* ======================================================
          8.3 JENIS PEGAWAI
         ====================================================== */}

      <Text style={s.label}>
        Jenis Pegawai
      </Text>

      <View style={s.row}>
        {(
          [
            'GURU',
            'TENAGA_KEPENDIDIKAN',
          ] as EmployeeType[]
        ).map(x => (
          <TouchableOpacity
            key={x}
            style={[
              s.chip,
              data.type === x && s.chipOn,
            ]}
            onPress={() =>
              setData({
                ...data,
                type: x,
              })
            }
          >
            <Text
              style={[
                s.chipText,
                data.type === x && s.chipTextOn,
              ]}
            >
              {x === 'GURU'
                ? 'Guru'
                : 'Tenaga Kependidikan'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ======================================================
          8.4 STATUS KEPEGAWAIAN
         ====================================================== */}

      <Text style={s.label}>
        Status Kepegawaian
      </Text>

      <View style={s.row}>
        {(
          [
            'AKTIF',
            'NONAKTIF',
          ] as EmployeeStatus[]
        ).map(x => (
          <TouchableOpacity
            key={x}
            style={[
              s.chip,
              data.status === x &&
                (x === 'AKTIF'
                  ? s.active
                  : s.inactive),
            ]}
            onPress={() =>
              setData({
                ...data,
                status: x,
              })
            }
          >
            <Text
              style={[
                s.chipText,
                data.status === x && s.chipTextOn,
              ]}
            >
              {x === 'AKTIF'
                ? 'Aktif'
                : 'Tidak Aktif'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ======================================================
          8.5 DATA JABATAN DAN KONTAK
         ====================================================== */}

      <Field
        label="Jabatan *"
        value={data.position}
        onChangeText={v => set('position', v)}
      />

      <Field
        label="Pendidikan *"
        value={data.education}
        onChangeText={v => set('education', v)}
      />

      <Field
        label="Telepon"
        value={data.phone}
        onChangeText={v => set('phone', v)}
        keyboardType="phone-pad"
      />

      <Field
        label="Email"
        value={data.email}
        onChangeText={v => set('email', v)}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Field
        label="URL Foto (Cloudinary)"
        value={data.photo_url}
        onChangeText={v => set('photo_url', v)}
        autoCapitalize="none"
      />

      {/* ======================================================
          8.6 TOMBOL SIMPAN DAN BATAL
         ====================================================== */}

      <Button
        title={
          saving
            ? 'Menyimpan...'
            : 'Simpan Data Pegawai'
        }
        onPress={submit}
        icon="save"
      />

      <Button
        title="Batal"
        onPress={() => setScreen('EMPLOYEES')}
        icon="close"
        danger
      />
    </ScrollView>
  );
}

// ============================================================
// 9. STYLESHEET / PENGATURAN TAMPILAN
// ============================================================

/**
 * Semua nilai style asli dipertahankan.
 * Pengaturan dikelompokkan berdasarkan bagian tampilan.
 */
const s = StyleSheet.create({
  // Kontainer utama form.
  container: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: '#f8fafc',
  },

  // Judul halaman.
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#183153',
  },

  // Keterangan di bawah judul.
  subtitle: {
    color: '#667085',
    lineHeight: 19,
    marginTop: 4,
    marginBottom: 16,
  },

  // Kartu foto pegawai.
  photoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
    elevation: 2,
  },

  // Ukuran dan bentuk foto.
  photo: {
    width: 92,
    height: 92,
    borderRadius: 22,
  },

  // Avatar pengganti jika foto belum tersedia.
  photoFallback: {
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Kontainer informasi foto.
  photoInfo: {
    flex: 1,
  },

  // Judul bagian foto.
  photoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#183153',
  },

  // Petunjuk format foto.
  photoHint: {
    fontSize: 11,
    color: '#667085',
    marginTop: 3,
    marginBottom: 9,
  },

  // Tombol upload foto.
  uploadButton: {
    backgroundColor: '#6d28d9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  // Teks pada tombol upload.
  uploadText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
  },

  // Label pilihan jenis dan status pegawai.
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#455a64',
    marginBottom: 7,
  },

  // Kontainer pilihan berbentuk chip.
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 13,
    flexWrap: 'wrap',
  },

  // Tampilan pilihan sebelum dipilih.
  chip: {
    backgroundColor: '#e7eef6',
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 12,
  },

  // Pilihan jenis pegawai yang aktif.
  chipOn: {
    backgroundColor: '#6d28d9',
  },

  // Pilihan status AKTIF.
  active: {
    backgroundColor: '#16a34a',
  },

  // Pilihan status NONAKTIF.
  inactive: {
    backgroundColor: '#dc2626',
  },

  // Teks pilihan normal.
  chipText: {
    fontWeight: '700',
    color: '#344054',
  },

  // Teks pilihan yang sedang aktif.
  chipTextOn: {
    color: '#fff',
  },

  // Kontainer halaman akses terbatas.
  denied: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Judul akses terbatas.
  deniedTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },

  // Pesan akses terbatas.
  deniedText: {
    color: '#667085',
    marginVertical: 10,
  },
});

// ============================================================
// AKHIR FILE EmployeeFormScreen.tsx
// ============================================================
