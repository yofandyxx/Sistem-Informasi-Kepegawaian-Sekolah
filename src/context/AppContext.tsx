import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { employees as initialEmployees, documents as initialDocuments } from '../constants/sampleData';
import type { DocumentItem, Employee, Screen, Transaction, TransactionAction, User } from '../types';
import { deleteDocument as apiDeleteDocument, deleteEmployee as apiDeleteEmployee, getDocuments, getEmployees, saveEmployee as apiSaveEmployee, uploadDocument as apiUploadDocument } from '../serviceS/api';
import { USE_DEMO_DATA } from '../config/api';

interface AppContextValue {
  employees: Employee[];
  documents: DocumentItem[];
  users: User[];
  transactions: Transaction[];
  currentUser: User;
  screen: Screen;
  isLoggedIn: boolean;
  setScreen: (screen: Screen) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  addTransaction: (action: TransactionAction, description: string) => void;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  selected?: Employee;
  select: (employee?: Employee) => void;
  save: (employee: Employee) => Promise<void>;
  remove: (employeeId: string) => Promise<void>;
  uploadDocument: (payload: any) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
}

const users: User[] = [
  {
    user_id: 'USR-001',
    name: 'Administrator Sistem',
    username: 'admin',
    role: 'ADMIN',
    status: 'AKTIF',
    employee_id: '',
    created_at: '2026-01-01T08:00:00+07:00',
    last_login: '',
  },
  {
    user_id: 'USR-002',
    name: 'Operator Kepegawaian',
    username: 'operator',
    role: 'OPERATOR',
    status: 'AKTIF',
    employee_id: '',
    created_at: '2026-01-01T08:00:00+07:00',
    last_login: '',
  },
  {
    user_id: 'USR-003',
    name: 'Kepala Sekolah',
    username: 'pimpinan',
    role: 'PIMPINAN',
    status: 'AKTIF',
    employee_id: '',
    created_at: '2026-01-01T08:00:00+07:00',
    last_login: '',
  },
];

// Password demo harus sesuai dengan data akun pada tabel pengguna.
const passwords: Record<string, string> = { admin: '123456', operator: '123456', pimpinan: '123456' };
const Context = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: React.PropsWithChildren) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [currentUser, setCurrentUser] = useState<User>(users[0]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [screen, setScreen] = useState<Screen>('HOME');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selected, select] = useState<Employee | undefined>();

  useEffect(() => {
    // Mode demo: jangan memanggil Apps Script sebelum endpoint Web App
    // mengembalikan JSON yang valid.
    if (USE_DEMO_DATA) return;

    let active = true;
    Promise.all([getEmployees(), getDocuments()]).then(([loadedEmployees, loadedDocuments]) => {
      if (active) {
        setEmployees(loadedEmployees);
        setDocuments(loadedDocuments);
      }
    }).catch(error => console.warn('Gagal memuat data API, memakai data awal:', error));
    return () => { active = false; };
  }, []);

  const save = async (employee: Employee) => {
    await apiSaveEmployee(employee);
    setEmployees(previous => {
      const exists = previous.some(item => item.employee_id === employee.employee_id);
      return exists ? previous.map(item => item.employee_id === employee.employee_id ? employee : item) : [...previous, employee];
    });
    addTransaction('UPDATE', `Data pegawai ${employee.name} disimpan`);
  };
  const remove = async (employeeId: string) => {
    const employee = employees.find(item => item.employee_id === employeeId);
    await apiDeleteEmployee(employeeId);
    setEmployees(previous => previous.filter(item => item.employee_id !== employeeId));
    if (employee) addTransaction('DELETE', `Data pegawai ${employee.name} dihapus`);
  };
  const uploadDocument = async (payload: any) => {
    await apiUploadDocument(payload);
    const latestDocuments = await getDocuments();
    setDocuments(latestDocuments);
    addTransaction('UPLOAD', `Dokumen ${payload.nama_dokumen} diupload`);
  };
  const deleteDocument = async (documentId: string) => {
    await apiDeleteDocument(documentId);
    setDocuments(previous => previous.filter(item => item.document_id !== documentId));
    addTransaction('DELETE', `Dokumen ${documentId} dihapus`);
  };
  const addTransaction = (action: TransactionAction, description: string) => {
    setTransactions(previous => [{
      transaction_id: `TRX-${Date.now()}`,
      action,
      description,
      actor: currentUser.username,
      created_at: new Date().toISOString(),
    }, ...previous]);
  };

  const login = async (username: string, password: string) => {
    const account = users.find(user => user.username.toLowerCase() === username.trim().toLowerCase());
    if (!account || passwords[account.username] !== password) throw new Error('Username atau password tidak sesuai.');
    setCurrentUser(account);
    setIsLoggedIn(true);
    setScreen('HOME');
    setTransactions(previous => [{ transaction_id: `TRX-${Date.now()}`, action: 'LOGIN', description: 'Login ke aplikasi', actor: account.username, created_at: new Date().toISOString() }, ...previous]);
  };

  const logout = () => {
    addTransaction('LOGOUT', 'Logout dari aplikasi');
    setIsLoggedIn(false);
    setScreen('HOME');
  };

  const value = useMemo(() => ({ employees, documents, users, transactions, currentUser, screen, isLoggedIn, selected, setScreen, login, logout, addTransaction, setEmployees, setDocuments, select, save, remove, uploadDocument, deleteDocument }), [employees, documents, transactions, currentUser, screen, isLoggedIn, selected]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(Context);
  if (!value) throw new Error('useApp harus digunakan di dalam AppProvider.');
  return value;
}
