/**
 * ============================================================
 * PROJECT 06 - SISTEM INFORMASI KEPEGAWAIAN SEKOLAH
 * File        : ReportsScreen.tsx
 * Lokasi File : src/screens/ReportsScreen.tsx
 * Fungsi      : Preview dan ekspor laporan PDF dan Excel/SpreadsheetML.
 * Dibuat oleh : Amrizal, S.Kom., M.Kom.
 *
 * Konsep penting:
 * - Report Generation dan useMemo
 * - expo-print dan expo-sharing
 * - File System dan Base64
 * - SpreadsheetML (.xls)
 * - Escaping HTML/XML
 * ============================================================
 */
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { EncodingType, writeAsStringAsync } from 'expo-file-system/legacy';
import { useApp } from '../context/AppContext';

/** Mengamankan teks yang dimasukkan ke dokumen HTML atau XML. */
const esc = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

/** Format tanggal dan waktu sesuai lokal Indonesia. */
const dateLabel = () => new Date().toLocaleString('id-ID');

// ============================================================
// SCREEN LAPORAN KEPEGAWAIAN
// ============================================================
export default function ReportsScreen() {
  const { employees, setScreen } = useApp();
  const [preview, setPreview] = useState(false);
  const [exporting, setExporting] = useState<'PDF' | 'EXCEL' | null>(null);

  /** Menghitung statistik ulang hanya ketika daftar pegawai berubah. */
  const stats = useMemo(
    () => ({
      total: employees.length,
      guru: employees.filter(e => e.type === 'GURU').length,
      tendik: employees.filter(e => e.type === 'TENAGA_KEPENDIDIKAN').length,
      aktif: employees.filter(e => e.status === 'AKTIF').length,
      nonaktif: employees.filter(e => e.status === 'NONAKTIF').length,
    }),
    [employees]
  );

  // ============================================================
  // MEMBANGUN HTML LAPORAN UNTUK PDF
  // ============================================================
  const pdfHtml = () => {
    const rows = employees
      .map(
        (e, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${esc(e.nip)}</td>
            <td>${esc(e.name)}</td>
            <td>${e.type === 'GURU' ? 'Guru' : 'Tendik'}</td>
            <td>${esc(e.position)}</td>
            <td>${esc(e.education)}</td>
            <td>${e.status === 'AKTIF' ? 'Aktif' : 'Tidak Aktif'}</td>
          </tr>`
      )
      .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #1f2937; padding: 24px; }
    h1 { text-align: center; font-size: 20px; margin: 4px; }
    h2 { text-align: center; font-size: 15px; margin: 4px; color: #4338ca; }
    .meta { text-align: center; font-size: 10px; color: #667085; margin-bottom: 18px; }
    .stats { display: flex; gap: 8px; margin: 14px 0; }
    .stat { border: 1px solid #ddd6fe; border-radius: 8px; padding: 8px; flex: 1; text-align: center; }
    .num { font-size: 18px; font-weight: bold; color: #6d28d9; }
    .lab { font-size: 8px; color: #667085; }
    table { width: 100%; border-collapse: collapse; font-size: 9px; }
    th { background: #312e81; color: white; padding: 7px; border: 1px solid #312e81; }
    td { padding: 6px; border: 1px solid #d0d5dd; }
    .footer { margin-top: 18px; font-size: 8px; color: #667085; text-align: right; }
  </style>
</head>
<body>
  <h1>SISTEM INFORMASI KEPEGAWAIAN SEKOLAH</h1>
  <h2>LAPORAN DATA KEPEGAWAIAN</h2>
  <div class="meta">Project 06 • Dicetak ${esc(dateLabel())}</div>
  <div class="stats">
    <div class="stat"><div class="num">${stats.total}</div><div class="lab">TOTAL</div></div>
    <div class="stat"><div class="num">${stats.guru}</div><div class="lab">GURU</div></div>
    <div class="stat"><div class="num">${stats.tendik}</div><div class="lab">TENDIK</div></div>
    <div class="stat"><div class="num">${stats.aktif}</div><div class="lab">AKTIF</div></div>
    <div class="stat"><div class="num">${stats.nonaktif}</div><div class="lab">TIDAK AKTIF</div></div>
  </div>
  <table>
    <thead><tr><th>No</th><th>NIP</th><th>Nama</th><th>Jenis</th><th>Jabatan</th><th>Pendidikan</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Total ${stats.total} pegawai • Sistem Informasi Kepegawaian</div>
</body>
</html>`;
  };

  // ============================================================
  // EKSPOR PDF
  // ============================================================
  const exportPdf = async () => {
    try {
      setExporting('PDF');
      // expo-print menghasilkan PDF Base64 agar dapat ditulis ke cache aplikasi.
      // Cara ini menghindari kendala izin READ pada URI hasil expo-print.
      const result = await Print.printToFileAsync({
        html: pdfHtml(),
        base64: true,
      });
      if (!result.base64) {
        throw new Error('Data PDF Base64 tidak tersedia.');
      }
      const pdfFile = new File(
        Paths.cache,
        `Laporan_Kepegawaian_${Date.now()}.pdf`
      );
      await writeAsStringAsync(pdfFile.uri, result.base64, {
        encoding: EncodingType.Base64,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfFile.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Bagikan Laporan PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Berhasil', `File dibuat di: ${pdfFile.uri}`);
      }
    } catch (error) {
      Alert.alert(
        'Export PDF Gagal',
        error instanceof Error ? error.message : 'Gagal membuat PDF.'
      );
    } finally {
      setExporting(null);
    }
  };

  // ============================================================
  // EKSPOR EXCEL DENGAN FORMAT SPREADSHEETML (.XLS)
  // ============================================================
  const exportExcel = async () => {
    try {
      setExporting('EXCEL');
      // NIP disimpan sebagai String agar angka nol awal tidak hilang.
      const rows = employees
        .map(
          (e, i) => `
<Row>
  <Cell><Data ss:Type="Number">${i + 1}</Data></Cell>
  <Cell><Data ss:Type="String">${esc(e.nip)}</Data></Cell>
  <Cell><Data ss:Type="String">${esc(e.name)}</Data></Cell>
  <Cell><Data ss:Type="String">${e.type === 'GURU' ? 'Guru' : 'Tendik'}</Data></Cell>
  <Cell><Data ss:Type="String">${esc(e.position)}</Data></Cell>
  <Cell><Data ss:Type="String">${esc(e.education)}</Data></Cell>
  <Cell><Data ss:Type="String">${e.status === 'AKTIF' ? 'Aktif' : 'Tidak Aktif'}</Data></Cell>
</Row>`
        )
        .join('');

      const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Kepegawaian">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">No</Data></Cell>
        <Cell><Data ss:Type="String">NIP</Data></Cell>
        <Cell><Data ss:Type="String">Nama</Data></Cell>
        <Cell><Data ss:Type="String">Jenis</Data></Cell>
        <Cell><Data ss:Type="String">Jabatan</Data></Cell>
        <Cell><Data ss:Type="String">Pendidikan</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
      </Row>
      ${rows}
    </Table>
  </Worksheet>
</Workbook>`;

      const file = new File(
        Paths.cache,
        `Laporan_Kepegawaian_${Date.now()}.xls`
      );
      file.create({ overwrite: true });
      file.write(xml);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/vnd.ms-excel',
          dialogTitle: 'Bagikan Laporan Excel',
        });
      } else {
        Alert.alert('Excel Berhasil', `File dibuat di: ${file.uri}`);
      }
    } catch (error) {
      Alert.alert(
        'Export Excel Gagal',
        error instanceof Error ? error.message : 'Gagal membuat Excel.'
      );
    } finally {
      setExporting(null);
    }
  };

  // ============================================================
  // TAMPILAN HALAMAN LAPORAN
  // ============================================================
  return (
    <ScrollView contentContainerStyle={s.p}>
      {/* Navigasi kembali ke dashboard. */}
      <TouchableOpacity onPress={() => setScreen('HOME')} style={s.back}>
        <Ionicons name="arrow-back" size={20} color="#312e81" />
        <Text style={s.backt}>Kembali ke Dashboard</Text>
      </TouchableOpacity>

      <Text style={s.h}>Laporan Kepegawaian</Text>
      <Text style={s.sub}>
        Preview, ekspor PDF, dan file Excel aktual dari data Google Sheets.
      </Text>

      {/* Kartu statistik berdasarkan data pegawai saat ini. */}
      <View style={s.row}>
        {Object.entries(stats).map(([key, value]) => (
          <View style={s.card} key={key}>
            <Text style={s.n}>{value}</Text>
            <Text style={s.lab}>
              {key === 'nonaktif' ? 'TIDAK AKTIF' : key.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>

      {/* Tombol untuk membuka atau menutup preview. */}
      <TouchableOpacity
        style={s.primary}
        onPress={() => setPreview(!preview)}
      >
        <Ionicons
          name={preview ? 'close-circle' : 'eye'}
          size={20}
          color="#fff"
        />
        <Text style={s.bt}>
          {preview ? 'Tutup Preview' : 'Preview Laporan'}
        </Text>
      </TouchableOpacity>

      {/* Tabel preview hanya ditampilkan jika preview bernilai true. */}
      {preview && (
        <View style={s.paper}>
          <View style={s.docHead}>
            <Text style={s.org}>SISTEM INFORMASI KEPEGAWAIAN SEKOLAH</Text>
            <Text style={s.ph}>LAPORAN DATA KEPEGAWAIAN</Text>
            <Text style={s.small}>Project 06 • {dateLabel()}</Text>
          </View>
          <View style={s.summary}>
            <Text style={s.small}>Total: {stats.total}</Text>
            <Text style={s.small}>Guru: {stats.guru}</Text>
            <Text style={s.small}>Tendik: {stats.tendik}</Text>
            <Text style={s.small}>Aktif: {stats.aktif}</Text>
            <Text style={s.small}>Tidak Aktif: {stats.nonaktif}</Text>
          </View>
          <ScrollView horizontal>
            <View>
              <View style={[s.tr, s.th]}>
                <Text style={[s.no, s.tht]}>No</Text>
                <Text style={[s.name, s.tht]}>Nama / NIP</Text>
                <Text style={[s.jenis, s.tht]}>Jenis</Text>
                <Text style={[s.pend, s.tht]}>Pendidikan</Text>
                <Text style={[s.status, s.tht]}>Status</Text>
              </View>
              {employees.map((e, i) => (
                <View style={s.tr} key={e.employee_id}>
                  <Text style={s.no}>{i + 1}</Text>
                  <View style={s.name}>
                    <Text style={s.cellStrong}>{e.name}</Text>
                    <Text style={s.cellSub}>{e.nip}</Text>
                  </View>
                  <Text style={s.jenis}>
                    {e.type === 'GURU' ? 'Guru' : 'Tendik'}
                  </Text>
                  <Text style={s.pend}>{e.education}</Text>
                  <Text
                    style={[
                      s.status,
                      {
                        color: e.status === 'AKTIF' ? '#15803d' : '#b91c1c',
                        fontWeight: '800',
                      },
                    ]}
                  >
                    {e.status === 'AKTIF' ? 'Aktif' : 'Tidak Aktif'}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Ekspor dinonaktifkan ketika salah satu proses masih berjalan. */}
      <View style={s.actions}>
        <TouchableOpacity
          style={s.pdf}
          onPress={exportPdf}
          disabled={!!exporting}
        >
          {exporting === 'PDF' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="document-text" size={20} color="#fff" />
          )}
          <Text style={s.bt}>PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.xls}
          onPress={exportExcel}
          disabled={!!exporting}
        >
          {exporting === 'EXCEL' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="grid" size={20} color="#fff" />
          )}
          <Text style={s.bt}>EXCEL</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ============================================================
// STYLE HALAMAN LAPORAN
// ============================================================
const s = StyleSheet.create({
  p: { padding: 18, paddingBottom: 100 },
  back: { flexDirection: 'row', gap: 7, alignItems: 'center', marginBottom: 14 },
  backt: { fontWeight: '800', color: '#312e81' },
  h: { fontSize: 26, fontWeight: '900', color: '#183153' },
  sub: { color: '#667085', marginVertical: 7, lineHeight: 18 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginVertical: 15 },
  card: { width: '31%', minWidth: 96, backgroundColor: '#fff', padding: 13, borderRadius: 18, elevation: 2 },
  n: { fontSize: 22, fontWeight: '900', color: '#6d28d9' },
  lab: { fontSize: 9, color: '#667085', fontWeight: '800' },
  primary: { backgroundColor: '#6d28d9', padding: 15, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  bt: { color: '#fff', fontWeight: '900' },
  paper: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginTop: 14, borderWidth: 1, borderColor: '#e4e7ec' },
  docHead: { alignItems: 'center', paddingBottom: 10, borderBottomWidth: 2, borderColor: '#344054' },
  org: { fontSize: 10, fontWeight: '800', color: '#475467' },
  ph: { fontWeight: '900', fontSize: 15, color: '#183153', marginTop: 3 },
  small: { fontSize: 9, color: '#667085' },
  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, paddingVertical: 9 },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e4e7ec', minHeight: 44, alignItems: 'center' },
  th: { backgroundColor: '#312e81', minHeight: 34 },
  tht: { color: '#fff', fontWeight: '900' },
  no: { width: 36, padding: 5, fontSize: 10 },
  name: { width: 180, padding: 5, fontSize: 10 },
  jenis: { width: 70, padding: 5, fontSize: 10 },
  pend: { width: 150, padding: 5, fontSize: 10 },
  status: { width: 82, padding: 5, fontSize: 10 },
  cellStrong: { fontSize: 10, fontWeight: '800' },
  cellSub: { fontSize: 8, color: '#667085' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  pdf: { flex: 1, backgroundColor: '#d1495b', padding: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 7 },
  xls: { flex: 1, backgroundColor: '#0f766e', padding: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 7 },
});
