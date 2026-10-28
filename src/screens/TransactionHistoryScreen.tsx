
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import type { TransactionAction } from '../types';

const labels: Record<TransactionAction, string> = { CREATE: 'Tambah', UPDATE: 'Ubah', DELETE: 'Hapus', UPLOAD: 'Upload', LOGIN: 'Login', LOGOUT: 'Logout' };
const colors: Record<TransactionAction, string> = { CREATE: '#15803d', UPDATE: '#2563eb', DELETE: '#dc2626', UPLOAD: '#9333ea', LOGIN: '#0f766e', LOGOUT: '#64748b' };

export default function TransactionHistoryScreen() {
  const { transactions, setScreen } = useApp();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => transactions.filter(item => `${item.description} ${item.actor} ${item.action}`.toLowerCase().includes(query.toLowerCase())), [transactions, query]);

  return <View style={styles.page}>
    <TouchableOpacity style={styles.back} onPress={() => setScreen('HOME')}><Ionicons name="arrow-back" size={20} color="#183153" /><Text style={styles.backText}>Kembali</Text></TouchableOpacity>
    <Text style={styles.title}>Riwayat Transaksi</Text>
    <Text style={styles.subtitle}>Catatan aktivitas pengguna pada aplikasi.</Text>
    <TextInput value={query} onChangeText={setQuery} placeholder="Cari aktivitas atau pengguna..." style={styles.search} />
    <FlatList data={filtered} keyExtractor={item => item.transaction_id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>Belum ada riwayat transaksi.</Text>} renderItem={({ item }) => <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: colors[item.action] }]}><Ionicons name="time-outline" size={20} color="#fff" /></View>
      <View style={styles.content}><View style={styles.row}><Text style={styles.action}>{labels[item.action]}</Text><Text style={styles.date}>{new Date(item.created_at).toLocaleString('id-ID')}</Text></View><Text style={styles.description}>{item.description}</Text><Text style={styles.actor}>Oleh @{item.actor}</Text></View>
    </View>} />
  </View>;
}

const styles = StyleSheet.create({ page: { flex: 1, padding: 16, backgroundColor: '#f6f5fb' }, back: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 18 }, backText: { color: '#183153', fontWeight: '700' }, title: { fontSize: 24, fontWeight: '900', color: '#183153' }, subtitle: { color: '#667085', marginTop: 4, marginBottom: 15 }, search: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: '#e4e7ec' }, list: { paddingTop: 12, paddingBottom: 25 }, card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 13, marginBottom: 10, elevation: 2 }, icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 11 }, content: { flex: 1 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, action: { fontWeight: '900', color: '#183153' }, date: { fontSize: 10, color: '#98a2b3' }, description: { marginTop: 5, color: '#344054' }, actor: { marginTop: 5, fontSize: 11, color: '#667085' }, empty: { textAlign: 'center', color: '#667085', marginTop: 30 } });
