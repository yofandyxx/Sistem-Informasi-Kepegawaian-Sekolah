/**
 * ============================================================
 *
 *
 * KONSEP PENTING:
 * - React Hooks (useState, useMemo)
 * - File Management dan Base64 (expo-file-system)
 * - Async/Await dan REST API (melalui AppContext)
 * - Role-Based Access Control (ADMIN/OPERATOR/PIMPINAN)
 * - Modal, Search, Filtering, Conditional Rendering
 *
 * ============================================================
 */

// 1. IMPORT LIBRARY, KOMPONEN UI, DAN APP CONTEXT
import React, {
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
// 2. DAFTAR KATEGORI DOKUMEN YANG DAPAT DIPILIH
const TYPES = [
  'SK',
  'Ijazah',
  'Sertifikat',
  'Foto',
  'Surat Tugas',
  'Lainnya',
];
// Batas maksimal ukuran dokumen PDF/JPG/PNG: 5 MB.
const MAX_FILE_SIZE =
  5 * 1024 * 1024;

// 3. KOMPONEN UTAMA HALAMAN DOKUMEN
export default function Docs() {
  const {
    documents,
    employees,
    setScreen,
    currentUser,
    uploadDocument,
    deleteDocument,
  } = useApp();
  const [
    type,
    setType,
  ] = useState('SK');
  const [
    selectedEmployeeId,
    setSelectedEmployeeId,
  ] = useState('');
  const [
    employeeModalVisible,
    setEmployeeModalVisible,
  ] = useState(false);
  const [
    employeeSearch,
    setEmployeeSearch,
  ] = useState('');
  const [
    uploading,
    setUploading,
  ] = useState(false);
  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(null);
  // 4. RBAC: hanya ADMIN dan OPERATOR boleh upload/hapus.
  const canManageDocuments =
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'OPERATOR';
  // Temukan pegawai sesuai ID yang dipilih pada dropdown.
  const selectedEmployee =
    employees.find(
      item =>
        item.employee_id ===
        selectedEmployeeId
    );
  // Dropdown hanya menampilkan hasil pencarian nama/NIP.
  const filteredEmployees =
    useMemo(() => {
      const keyword =
        employeeSearch
          .trim()
          .toLowerCase();
      if (!keyword) {
        return employees;
      }
      return employees.filter(
        employee =>
          employee.name
            .toLowerCase()
            .includes(keyword) ||
          employee.nip
            .toLowerCase()
            .includes(keyword)
      );
    }, [employees, employeeSearch]);
  // Setelah pegawai dipilih, daftar utama hanya menampilkan
  // dokumen milik pegawai tersebut. Jika belum dipilih,
  // seluruh dokumen tetap ditampilkan.
  const visibleDocuments =
    useMemo(() => {
      if (!selectedEmployeeId) {
        return documents;
      }
      return documents.filter(
        document =>
          document.employee_id ===
          selectedEmployeeId
      );
    }, [documents, selectedEmployeeId]);
  // 5. Tentukan MIME type dari informasi picker atau ekstensi file.
  const getSupportedMimeType = (fileName: string, pickerMime?: string | null): string | null => {
    const ext = fileName.toLowerCase().split('.').pop();
    const byExtension: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };
    const fromExtension = byExtension[ext || ''];
    const normalizedMime = (pickerMime || '').toLowerCase().split(';')[0].trim();
    const byMime: Record<string, string> = {
      'application/pdf': 'application/pdf',
      'image/jpeg': 'image/jpeg',
      'image/jpg': 'image/jpeg',
      'image/png': 'image/png',
    };
    const fromMime = byMime[normalizedMime];
    // Tolak apabila ekstensi dan MIME yang sama-sama dikenal saling bertentangan.
    if (fromExtension && fromMime && fromExtension !== fromMime) return null;
    return fromMime || fromExtension || null;
  };

  const normalizeDocumentFileName = (fileName: string | undefined, mimeType: string): string => {
    const defaultExtension = mimeType === 'application/pdf' ? 'pdf' :
      mimeType === 'image/png' ? 'png' : 'jpg';
    const base = (fileName?.trim() || `dokumen_${Date.now()}`)
      .replace(/[\\/:*?"<>|]/g, '_');
    return /\.(pdf|jpe?g|png)$/i.test(base) ? base : `${base}.${defaultExtension}`;
  };
  // Ubah ukuran byte menjadi Byte, KB, atau MB untuk ditampilkan.
  const formatFileSize =
    (bytes: number): string => {
      if (bytes < 1024) {
        return `${bytes} Byte`;
      }
      if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
      }
      return `${(
        bytes /
        1024 /
        1024
      ).toFixed(2)} MB`;
    };
  // 6. Buka URL dokumen menggunakan aplikasi yang tersedia pada perangkat.
  const openDocument =
    async (
      fileUrl: string,
      documentName: string
    ) => {
      const url =
        fileUrl?.trim();
      if (!url) {
        Alert.alert(
          'Dokumen Tidak Tersedia',
          'URL dokumen belum tersedia.'
        );
        return;
      }
      try {
        const supported =
          await Linking.canOpenURL(url);
        if (!supported) {
          Alert.alert(
            'Tidak Dapat Membuka Dokumen',
            `${documentName} tidak dapat dibuka pada perangkat ini.`
          );
          return;
        }
        await Linking.openURL(url);
      } catch (error) {
        console.error(
          'OPEN DOCUMENT ERROR:',
          error
        );
        Alert.alert(
          'Tidak Dapat Membuka Dokumen',
          `${documentName} tidak dapat dibuka.`
        );
      }
    };
  // 7. Simpan pilihan pegawai, bersihkan pencarian, lalu tutup modal.
  const chooseEmployee =
    (employeeId: string) => {
      setSelectedEmployeeId(
        employeeId
      );
      setEmployeeSearch('');
      setEmployeeModalVisible(false);
    };
  // 8. Dua tombol terpisah agar Android tidak salah membuka galeri gambar.
  const checkUploadAccess = (): boolean => {
    if (!selectedEmployeeId) {
      Alert.alert('Pegawai Belum Dipilih', 'Silakan pilih pegawai pemilik dokumen terlebih dahulu.');
      return false;
    }
    if (!canManageDocuments) {
      Alert.alert('Akses Dibatasi', 'Role PIMPINAN hanya dapat melihat dokumen.');
      return false;
    }
    return true;
  };

  const uploadPdf = () => {
    if (!checkUploadAccess()) return;
    console.log('[PDF BUTTON] Tombol PDF ditekan');
    void pickPdf();
  };

  const uploadImage = () => {
    if (!checkUploadAccess()) return;
    console.log('[IMAGE BUTTON] Tombol JPG/PNG ditekan');
    void pickImage();
  };

  const confirmUpload = (
    fileName: string,
    mimeType: string,
    size: number,
    getBase64: () => Promise<string>
  ) => {
    if (size > MAX_FILE_SIZE) {
      Alert.alert('File Terlalu Besar', 'Ukuran dokumen maksimal 5 MB.');
      return;
    }
    Alert.alert(
      'Konfirmasi Upload',
      `Pegawai: ${selectedEmployee?.name || selectedEmployeeId}\n\nJenis: ${type}\n\nFile: ${fileName}\n\nUkuran: ${formatFileSize(size)}`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Upload', onPress: () => { void processUpload(fileName, mimeType, getBase64); } },
      ]
    );
  };

  // FIX 8: jalur alternatif membaca URI PDF menggunakan React Native fetch + Blob.
  // Beberapa versi Expo Go menolak pembacaan langsung cache DocumentPicker.
  const readPdfAsBase64 = async (uri: string): Promise<string> => {
    console.log('[PDF READ] Mencoba fetch Blob:', uri.split('/').pop());
    try {
      const response = await fetch(uri);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (!blob.size) throw new Error('Blob PDF kosong.');
      if (blob.size > MAX_FILE_SIZE) throw new Error('PDF melebihi 5 MB.');
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('FileReader tidak dapat membaca Blob PDF.'));
        reader.readAsDataURL(blob);
      });
      const base64 = dataUrl.split(',')[1] || '';
      if (!base64) throw new Error('Base64 PDF kosong.');
      console.log('[PDF READ] Blob berhasil dibaca:', blob.size);
      return base64;
    } catch (blobError) {
      console.warn('[PDF READ] fetch/Blob gagal:', blobError);
      try {
        const base64 = await LegacyFileSystem.readAsStringAsync(uri, {
          encoding: LegacyFileSystem.EncodingType.Base64,
        });
        if (!base64) throw new Error('Base64 PDF kosong.');
        console.log('[PDF READ] FileSystem berhasil');
        return base64;
      } catch (fsError) {
        console.error('[PDF READ] FileSystem gagal:', fsError);
        throw new Error(
          'Android/Expo Go tidak memberikan akses baca PDF yang dipilih. ' +
          'Metode fetch/Blob dan FileSystem sama-sama gagal. ' +
          'Kirim log [PDF READ] untuk pemeriksaan berikutnya.'
        );
      }
    }
  };

  const pickPdf = async () => {
    try {
      console.log('[PDF PICKER START] Meminta dokumen PDF dari Android');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: false,
        copyToCacheDirectory: true,
      });
      console.log('[PDF PICKER RESULT]', result.canceled ? 'Dibatalkan' : 'File dipilih');
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      console.log('[PDF PICKER]', {
        name: asset.name,
        mimeType: asset.mimeType,
        size: asset.size,
      });
      const mimeType = getSupportedMimeType(asset.name, asset.mimeType);
      if (mimeType !== 'application/pdf') {
        Alert.alert('Format Tidak Didukung', 'Silakan pilih dokumen PDF.');
        return;
      }
      const fileName = normalizeDocumentFileName(asset.name, mimeType);
      confirmUpload(fileName, mimeType, asset.size ?? 0, () => readPdfAsBase64(asset.uri));
    } catch (error) {
      console.error('PDF PICKER ERROR:', error);
      Alert.alert('Gagal Memilih PDF', error instanceof Error ? error.message : 'Tidak dapat memilih PDF.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
        base64: true,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const mimeType = getSupportedMimeType(asset.fileName || '', asset.mimeType);
      if (mimeType !== 'image/png' && mimeType !== 'image/jpeg') {
        Alert.alert('Format Tidak Didukung', 'Pilih gambar JPG, JPEG, atau PNG.');
        return;
      }
      const fileName = normalizeDocumentFileName(asset.fileName || undefined, mimeType);
      console.log('[IMAGE PICKER]', { name: fileName, mimeType, size: asset.fileSize, hasBase64: !!asset.base64 });
      if (!asset.base64) {
        Alert.alert('Gagal Membaca Gambar', 'Image Picker tidak mengembalikan Base64.');
        return;
      }
      // Ukuran Base64 digunakan sebagai perkiraan apabila fileSize tidak tersedia.
      const estimatedSize = asset.fileSize ?? Math.floor(asset.base64.length * 3 / 4);
      const imageBase64 = asset.base64;
      confirmUpload(fileName, mimeType, estimatedSize, async () => imageBase64);
    } catch (error) {
      console.error('IMAGE PICKER ERROR:', error);
      Alert.alert('Gagal Memilih Gambar', error instanceof Error ? error.message : 'Tidak dapat memilih gambar.');
    }
  };

  // 9. Kirim Base64 melalui AppContext tanpa mengubah kontrak API.
  const processUpload = async (
    safeFileName: string,
    mimeType: string,
    getBase64: () => Promise<string>
  ) => {
    try {
      setUploading(true);
      const base64 = await getBase64();
      if (!base64) throw new Error('Gagal membaca dokumen sebagai Base64.');
      await uploadDocument({
        employee_id: selectedEmployeeId,
        jenis_dokumen: type,
        nama_dokumen: safeFileName,
        file_base64: base64,
        mime_type: mimeType,
        uploaded_by: currentUser.username,
      });
      Alert.alert('Upload Berhasil', `${safeFileName} berhasil diupload dan data dokumen telah diperbarui.`);
    } catch (error) {
      console.error('UPLOAD DOCUMENT ERROR:', error);
      Alert.alert('Upload Gagal', error instanceof Error ? error.message : 'Dokumen gagal diupload.');
    } finally {
      setUploading(false);
    }
  };
  // 10. Tampilkan dialog konfirmasi sebelum penghapusan permanen.
  const confirmDelete =
    (
      documentId: string,
      documentName: string
    ) => {
      if (!canManageDocuments) {
        Alert.alert(
          'Akses Dibatasi',
          'Role PIMPINAN hanya dapat melihat dokumen.'
        );
        return;
      }
      Alert.alert(
        'Hapus Dokumen?',
        `${documentName}\n\nDokumen akan dihapus dari Cloudinary dan Google Sheets. Tindakan ini tidak dapat dibatalkan.`,
        [
          {
            text: 'Batal',
            style: 'cancel',
          },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: async () => {
              await processDelete(
                documentId,
                documentName
              );
            },
          },
        ]
      );
    };
  // 11. Hapus melalui AppContext; kelola loading dan kesalahan.
  const processDelete =
    async (
      documentId: string,
      documentName: string
    ) => {
      try {
        setDeletingId(documentId);
        await deleteDocument(
          documentId
        );
        Alert.alert(
          'Dokumen Dihapus',
          `${documentName} berhasil dihapus.`
        );
      } catch (error) {
        console.error(
          'DELETE DOCUMENT ERROR:',
          error
        );
        Alert.alert(
          'Gagal Menghapus Dokumen',
          error instanceof Error
            ? error.message
            : 'Dokumen gagal dihapus.'
        );
      } finally {
        setDeletingId(null);
      }
    };
  // 12. RENDER UI: daftar dokumen dan modal pemilihan pegawai.
  return (
    <>
      <ScrollView
        contentContainerStyle={s.c}
      >
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
        <Text style={s.h}>
          Dokumen Pegawai
        </Text>
        <Text style={s.sub}>
          Pilih pegawai melalui dropdown. Dokumen dapat dibuka,
          diupload, dan dihapus sesuai hak akses pengguna.
        </Text>
        <Text style={s.label}>
          Pilih Pegawai
        </Text>
        <TouchableOpacity
          style={s.dropdown}
          onPress={() =>
            setEmployeeModalVisible(true)
          }
        >
          <View style={s.dropdownIcon}>
            <Ionicons
              name="person"
              size={20}
              color="#6d28d9"
            />
          </View>
          <View style={s.dropdownTextBox}>
            <Text
              style={
                selectedEmployee
                  ? s.dropdownValue
                  : s.dropdownPlaceholder
              }
            >
              {selectedEmployee
                ? selectedEmployee.name
                : 'Pilih pegawai...'}
            </Text>
            {selectedEmployee && (
              <Text style={s.dropdownSub}>
                NIP: {selectedEmployee.nip} • {selectedEmployee.position}
              </Text>
            )}
          </View>
          <Ionicons
            name="chevron-down"
            size={20}
            color="#64748b"
          />
        </TouchableOpacity>
        {selectedEmployeeId && (
          <TouchableOpacity
            style={s.showAll}
            onPress={() =>
              setSelectedEmployeeId('')
            }
          >
            <Ionicons
              name="layers-outline"
              size={16}
              color="#6d28d9"
            />
            <Text style={s.showAllText}>
              Tampilkan semua dokumen
            </Text>
          </TouchableOpacity>
        )}
        {canManageDocuments && (
          <>
            <Text style={s.label}>
              Jenis Dokumen
            </Text>
            <View style={s.types}>
              {TYPES.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    s.type,
                    type === item && s.typeOn,
                  ]}
                  onPress={() => setType(item)}
                >
                  <Text
                    style={[
                      s.typet,
                      type === item && s.typeTextOn,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 9, marginTop: 12, marginBottom: 10 }}>
              <TouchableOpacity
                style={[s.upload, { flex: 1, marginTop: 0, marginBottom: 0, backgroundColor: '#4338ca' }, uploading && s.uploadDisabled]}
                onPress={uploadPdf}
                disabled={uploading}
              >
                {uploading ? <ActivityIndicator size="small" color="#ffffff" /> : <Ionicons name="document-text" size={21} color="#ffffff" />}
                <Text style={s.ut}>Pilih PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.upload, { flex: 1, marginTop: 0, marginBottom: 0 }, uploading && s.uploadDisabled]}
                onPress={uploadImage}
                disabled={uploading}
              >
                {uploading ? <ActivityIndicator size="small" color="#ffffff" /> : <Ionicons name="images" size={21} color="#ffffff" />}
                <Text style={s.ut}>Pilih JPG/PNG</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        {!canManageDocuments && (
          <View style={s.readOnly}>
            <Ionicons
              name="eye"
              size={20}
              color="#92400e"
            />
            <Text style={s.readOnlyText}>
              Role PIMPINAN memiliki akses baca dokumen.
            </Text>
          </View>
        )}
        <View style={s.listTitleRow}>
          <Text style={s.label}>
            {selectedEmployee
              ? `Dokumen ${selectedEmployee.name}`
              : 'Semua Dokumen'}
          </Text>
          <View style={s.countBadge}>
            <Text style={s.countText}>
              {visibleDocuments.length}
            </Text>
          </View>
        </View>
        {visibleDocuments.length === 0 && (
          <View style={s.empty}>
            <Ionicons
              name="folder-open-outline"
              size={35}
              color="#94a3b8"
            />
            <Text style={s.emptyText}>
              Belum ada dokumen untuk pilihan ini.
            </Text>
          </View>
        )}
        {visibleDocuments.map(document => {
          const employee =
            employees.find(
              item =>
                item.employee_id ===
                document.employee_id
            );
          const isDeleting =
            deletingId ===
            document.document_id;
          return (
            <View
              key={document.document_id}
              style={s.card}
            >
              <View style={s.icon}>
                <Ionicons
                  name={
                    document.file_format === 'PDF'
                      ? 'document-text'
                      : 'image'
                  }
                  size={28}
                  color="#6d28d9"
                />
              </View>
              <View style={s.cardContent}>
                <Text style={s.n}>
                  {document.document_name}
                </Text>
                <Text style={s.m}>
                  {employee?.name || document.employee_id}
                </Text>
                <Text style={s.m}>
                  {document.document_type} • {document.file_format}
                </Text>
                <View style={s.actions}>
                  <TouchableOpacity
                    style={s.openButton}
                    onPress={() =>
                      openDocument(
                        document.file_url,
                        document.document_name
                      )
                    }
                  >
                    <Ionicons
                      name="open-outline"
                      size={17}
                      color="#4338ca"
                    />
                    <Text style={s.openButtonText}>
                      Buka
                    </Text>
                  </TouchableOpacity>
                  {canManageDocuments && (
                    <TouchableOpacity
                      style={s.deleteButton}
                      disabled={isDeleting}
                      onPress={() =>
                        confirmDelete(
                          document.document_id,
                          document.document_name
                        )
                      }
                    >
                      {isDeleting ? (
                        <ActivityIndicator
                          size="small"
                          color="#b91c1c"
                        />
                      ) : (
                        <Ionicons
                          name="trash-outline"
                          size={17}
                          color="#b91c1c"
                        />
                      )}
                      <Text style={s.deleteButtonText}>
                        {isDeleting
                          ? 'Menghapus...'
                          : 'Hapus'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <Modal
        visible={employeeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setEmployeeModalVisible(false)
        }
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <View>
                <Text style={s.modalTitle}>
                  Pilih Pegawai
                </Text>
                <Text style={s.modalSubtitle}>
                  Cari berdasarkan nama atau NIP
                </Text>
              </View>
              <TouchableOpacity
                style={s.closeButton}
                onPress={() => {
                  setEmployeeSearch('');
                  setEmployeeModalVisible(false);
                }}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>
            <View style={s.searchBox}>
              <Ionicons
                name="search"
                size={19}
                color="#64748b"
              />
              <TextInput
                value={employeeSearch}
                onChangeText={setEmployeeSearch}
                placeholder="Cari nama atau NIP..."
                placeholderTextColor="#94a3b8"
                style={s.searchInput}
                autoCapitalize="none"
              />
              {!!employeeSearch && (
                <TouchableOpacity
                  onPress={() =>
                    setEmployeeSearch('')
                  }
                >
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              style={s.employeeList}
              keyboardShouldPersistTaps="handled"
            >
              {filteredEmployees.map(employee => {
                const active =
                  selectedEmployeeId ===
                  employee.employee_id;
                return (
                  <TouchableOpacity
                    key={employee.employee_id}
                    style={[
                      s.employeeOption,
                      active && s.employeeOptionActive,
                    ]}
                    onPress={() =>
                      chooseEmployee(
                        employee.employee_id
                      )
                    }
                  >
                    <View style={s.employeeAvatar}>
                      <Ionicons
                        name="person"
                        size={19}
                        color={
                          active
                            ? '#ffffff'
                            : '#6d28d9'
                        }
                      />
                    </View>
                    <View style={s.employeeOptionText}>
                      <Text
                        style={[
                          s.employeeName,
                          active && s.employeeTextActive,
                        ]}
                      >
                        {employee.name}
                      </Text>
                      <Text
                        style={[
                          s.employeeNip,
                          active && s.employeeTextActive,
                        ]}
                      >
                        NIP: {employee.nip}
                      </Text>
                      <Text
                        style={[
                          s.employeePosition,
                          active && s.employeeTextActive,
                        ]}
                      >
                        {employee.position}
                      </Text>
                    </View>
                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={21}
                        color="#ffffff"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
              {filteredEmployees.length === 0 && (
                <View style={s.noResult}>
                  <Ionicons
                    name="search-outline"
                    size={28}
                    color="#94a3b8"
                  />
                  <Text style={s.noResultText}>
                    Pegawai tidak ditemukan.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

// 13. STYLESHEET: seluruh gaya visual dipertahankan dari file asli.
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
  h: {
    fontSize: 26,
    fontWeight: '900',
    color: '#183153',
  },
  sub: {
    color: '#607d8b',
    marginBottom: 16,
    lineHeight: 20,
  },
  label: {
    fontWeight: '900',
    color: '#183153',
    marginTop: 12,
    marginBottom: 9,
  },
  dropdown: {
    minHeight: 64,
    padding: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownTextBox: {
    flex: 1,
  },
  dropdownValue: {
    fontWeight: '900',
    color: '#312e81',
    fontSize: 13,
  },
  dropdownPlaceholder: {
    color: '#64748b',
    fontWeight: '700',
  },
  dropdownSub: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 3,
  },
  showAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  showAllText: {
    color: '#6d28d9',
    fontSize: 12,
    fontWeight: '800',
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  type: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#ede9fe',
  },
  typeOn: {
    backgroundColor: '#6d28d9',
  },
  typet: {
    fontSize: 11,
    fontWeight: '800',
    color: '#312e81',
  },
  typeTextOn: {
    color: '#ffffff',
  },
  upload: {
    backgroundColor: '#6d28d9',
    padding: 14,
    borderRadius: 15,
    marginTop: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadDisabled: {
    opacity: 0.65,
  },
  ut: {
    color: '#ffffff',
    fontWeight: '900',
  },
  readOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    marginBottom: 10,
  },
  readOnlyText: {
    flex: 1,
    color: '#92400e',
    fontWeight: '700',
    fontSize: 12,
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: 13,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  countText: {
    color: '#6d28d9',
    fontSize: 11,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 17,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    elevation: 2,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  n: {
    fontWeight: '900',
    color: '#183153',
  },
  m: {
    fontSize: 12,
    color: '#607d8b',
    marginTop: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
  },
  openButtonText: {
    color: '#4338ca',
    fontSize: 11,
    fontWeight: '900',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    color: '#b91c1c',
    fontSize: 11,
    fontWeight: '900',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
    backgroundColor: '#f8fafc',
    borderRadius: 15,
  },
  emptyText: {
    color: '#64748b',
    marginTop: 7,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    maxHeight: '78%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  modalTitle: {
    color: '#183153',
    fontSize: 19,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 13,
    paddingHorizontal: 11,
    backgroundColor: '#f8fafc',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    color: '#183153',
    fontSize: 13,
  },
  employeeList: {
    flexGrow: 0,
  },
  employeeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 11,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
  },
  employeeOptionActive: {
    backgroundColor: '#6d28d9',
  },
  employeeAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeOptionText: {
    flex: 1,
  },
  employeeName: {
    fontWeight: '900',
    color: '#312e81',
    fontSize: 13,
  },
  employeeNip: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  employeePosition: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  employeeTextActive: {
    color: '#ffffff',
  },
  noResult: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noResultText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 7,
  },
});
