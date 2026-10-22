import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  Shield, 
  Check, 
  X, 
  Mail, 
  Phone, 
  Building,
  Key
} from 'lucide-react';
import { UserProfile, UserRole, SchoolUnit } from '../../types/uks';
import { DEMO_USERS } from '../../data/seedData';
import { useAuth } from '../../context/AuthContext';

export const UserManagement: React.FC = () => {
  const { currentUser, switchRole } = useAuth();
  const [usersList, setUsersList] = useState<UserProfile[]>(DEMO_USERS);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    role: 'guru',
    unit: 'SDIT',
    assignedClass: '5-A',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName || !formData.email) {
      alert('Mohon isi nama lengkap dan email pengguna!');
      return;
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      displayName: formData.displayName || '',
      email: formData.email || '',
      role: (formData.role as UserRole) || 'guru',
      unit: (formData.unit as SchoolUnit) || 'SDIT',
      assignedClass: formData.assignedClass,
      phoneNumber: formData.phoneNumber || '0812-0000-0000',
    };

    setUsersList([...usersList, newUser]);
    setIsAddOpen(false);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Super Admin Yayasan';
      case 'admin_uks': return 'Admin UKS / Petugas Medis';
      case 'guru': return 'Guru / Wali Kelas';
      case 'kepala_sekolah': return 'Kepala Sekolah';
      case 'orang_tua': return 'Orang Tua / Wali Murid';
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-100 text-purple-800 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Manajemen Pengguna & Hak Akses (RBAC)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan akun yayasan, petugas UKS, kepala sekolah, dewan guru, dan wali murid
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm shadow-purple-700/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Tambah Akun Pengguna
        </button>
      </div>

      {/* Permissions Matrix Information */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" />
          Matriks Hak Akses Berbasis Peran (Role-Based Access Control)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <strong className="text-purple-900 block mb-1">1. Super Admin Yayasan:</strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Akses total seluruh modul UKS, data lintas jenjang (RAIT/SDIT/SMPIT), manajemen pengguna, dan audit log.
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <strong className="text-emerald-900 block mb-1">2. Admin UKS / Petugas:</strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Pendaftaran kunjungan, rekam medis, inventaris obat, skrining fisik, dan notifikasi orang tua.
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <strong className="text-blue-900 block mb-1">3. Guru / Wali Kelas:</strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Melihat kondisi santri kelasnya, mengajukan bantuan UKS, memantau riwayat pemulihan siswa.
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <strong className="text-amber-900 block mb-1">4. Kepala Sekolah:</strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Monitoring statistik unit, laporan kesehatan berkala, evaluasi program, dan kesiapsiagaan darurat.
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 sm:col-span-2 md:col-span-1">
            <strong className="text-orange-900 block mb-1">5. Orang Tua / Wali:</strong>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Hanya melihat riwayat kesehatan ananda, menerima notifikasi penjemputan, dan update kontak darurat.
            </p>
          </div>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Unit Penugasan</th>
                <th className="py-3 px-4">Kontak Telepon</th>
                <th className="py-3 px-4 text-center">Ganti ke Peran Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{usr.displayName}</div>
                    <div className="text-[11px] text-slate-500">{usr.email}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      {getRoleLabel(usr.role)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {usr.unit || 'Semua Unit'} {usr.assignedClass ? `(Kelas ${usr.assignedClass})` : ''}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {usr.phoneNumber || '-'}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => switchRole(usr.role, usr)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        currentUser.role === usr.role && currentUser.email === usr.email
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {currentUser.role === usr.role && currentUser.email === usr.email ? 'Aktif' : 'Pilih Akun Ini'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH AKUN */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden text-xs">
            <div className="p-6 bg-purple-800 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200">
                  Manajemen Akun
                </span>
                <h3 className="text-lg font-bold">Tambah Akun Pengguna</h3>
              </div>
              <button onClick={() => setIsAddOpen(false)}>
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ustadz Ahmad Fauzi, S.Pd"
                  value={formData.displayName || ''}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Email *</label>
                <input
                  type="email"
                  required
                  placeholder="nama@insanharapan.sch.id"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Peran Pengguna (Role) *</label>
                <select
                  value={formData.role || 'guru'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="super_admin">Super Admin Yayasan</option>
                  <option value="admin_uks">Admin UKS / Petugas Medis</option>
                  <option value="guru">Guru / Wali Kelas</option>
                  <option value="kepala_sekolah">Kepala Sekolah</option>
                  <option value="orang_tua">Orang Tua / Wali Murid</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Sekolah</label>
                  <select
                    value={formData.unit || 'SDIT'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as SchoolUnit })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="RAIT">RAIT (TK)</option>
                    <option value="SDIT">SDIT</option>
                    <option value="SMPIT">SMPIT</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelas (Jika Guru)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 4-A"
                    value={formData.assignedClass || ''}
                    onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  placeholder="0812xxxxxxxx"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 text-white font-bold"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
