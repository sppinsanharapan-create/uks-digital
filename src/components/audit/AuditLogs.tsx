import React, { useState } from 'react';
import { 
  History, 
  Search, 
  ShieldCheck, 
  Clock, 
  User, 
  FileText,
  Lock
} from 'lucide-react';
import { AuditLog } from '../../types/uks';

interface AuditLogsProps {
  logs: AuditLog[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('SEMUA');

  const filteredLogs = logs.filter(l => {
    const matchSearch = 
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchAction = selectedAction === 'SEMUA' || l.action === selectedAction;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-slate-100 text-slate-800 rounded-xl">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Audit Log & Jejak Aktivitas Keamanan
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak setiap perubahan data kesehatan siswa, transaksi obat, dan riwayat otentikasi sistem
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Audit Enkripsi Aktif</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama petugas, aksi, atau detail..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-slate-500"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700"
        >
          <option value="SEMUA">Semua Jenis Aksi</option>
          <option value="PENDAFTARAN_KUNJUNGAN">Pendaftaran Kunjungan</option>
          <option value="UPDATE_STATUS_KUNJUNGAN">Update Status Kunjungan</option>
          <option value="TAMBAH_SISWA">Tambah / Update Siswa</option>
          <option value="STOK_MASUK">Stok Obat Masuk</option>
          <option value="STOK_KELUAR">Stok Obat Keluar</option>
          <option value="KIRIM_NOTIFIKASI">Kirim Notifikasi</option>
          <option value="GANTI_PERAN">Ganti Peran</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Peran</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Detail Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {l.timestamp}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {l.userName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {l.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-800 text-[11px]">
                    {l.action}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md">
                    {l.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
