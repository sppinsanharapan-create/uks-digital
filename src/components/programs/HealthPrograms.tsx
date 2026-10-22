import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileText,
  X,
  Building
} from 'lucide-react';
import { HealthProgram } from '../../types/uks';
import { useAuth } from '../../context/AuthContext';

interface HealthProgramsProps {
  programs: HealthProgram[];
  onSaveProgram: (prog: HealthProgram) => Promise<void>;
}

export const HealthPrograms: React.FC<HealthProgramsProps> = ({
  programs,
  onSaveProgram,
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<HealthProgram>>({
    jenisProgram: 'Pendidikan Kesehatan',
    tanggal: new Date().toISOString().substring(0, 10),
    sasaran: 'Semua Jenjang',
    anggaran: 1000000,
    jumlahPeserta: 100,
    status: 'direncanakan',
    penanggungJawab: currentUser.displayName || 'Tim UKS Insan Harapan',
  });

  const handleOpenAdd = () => {
    setFormData({
      namaKegiatan: '',
      jenisProgram: 'Pendidikan Kesehatan',
      tanggal: new Date().toISOString().substring(0, 10),
      sasaran: 'Semua Jenjang',
      anggaran: 1000000,
      jumlahPeserta: 120,
      laporanHasil: '',
      status: 'direncanakan',
      penanggungJawab: currentUser.displayName || 'Ns. Siti Rahmawati, S.Kep',
    });
    setIsFormOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaKegiatan || !formData.penanggungJawab) {
      alert('Mohon isi nama kegiatan dan penanggung jawab!');
      return;
    }

    const newProg: HealthProgram = {
      id: `prog_${Date.now()}`,
      namaKegiatan: formData.namaKegiatan || '',
      jenisProgram: formData.jenisProgram || 'Pendidikan Kesehatan',
      tanggal: formData.tanggal || new Date().toISOString().substring(0, 10),
      penanggungJawab: formData.penanggungJawab || currentUser.displayName,
      sasaran: formData.sasaran || 'Semua Jenjang',
      anggaran: Number(formData.anggaran || 0),
      jumlahPeserta: Number(formData.jumlahPeserta || 0),
      laporanHasil: formData.laporanHasil || '',
      status: formData.status || 'direncanakan',
      createdAt: new Date().toISOString(),
    };

    await onSaveProgram(newProg);
    setIsFormOpen(false);
  };

  const filtered = programs.filter(p => 
    p.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.jenisProgram.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Program & Kegiatan UKS Sekolah (Trias UKS)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pendidikan kesehatan, pelayanan medis, pembinaan lingkungan sekolah sehat (PHBS), dan kegiatan bersama Puskesmas
          </p>
        </div>

        {currentUser.role !== 'orang_tua' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm shadow-emerald-700/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Tambah Agenda Program
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari program kesehatan, penanggung jawab..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-500"
          />
        </div>
      </div>

      {/* Programs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {p.jenisProgram}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  p.status === 'selesai' ? 'bg-slate-100 text-slate-700' :
                  p.status === 'berlangsung' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {p.status === 'selesai' ? 'Selesai Terlaksana' :
                   p.status === 'berlangsung' ? 'Sedang Berjalan' : 'Direncanakan'}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-3 leading-snug">
                {p.namaKegiatan}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{p.tanggal}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-teal-600" />
                  <span>Sasaran: <strong>{p.sasaran}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Peserta: <strong>{p.jumlahPeserta} santri</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  <span>Anggaran: <strong>Rp {p.anggaran.toLocaleString('id-ID')}</strong></span>
                </div>
              </div>

              {p.laporanHasil && (
                <div className="mt-3">
                  <span className="text-[11px] font-bold text-slate-700 block mb-0.5">Laporan & Evaluasi:</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    {p.laporanHasil}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>PJ: <strong className="text-slate-800">{p.penanggungJawab}</strong></span>
              <span className="text-[11px]">SIT Insan Harapan</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: TAMBAH PROGRAM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="p-6 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                  Agenda UKS
                </span>
                <h3 className="text-lg font-bold">Rencanakan Program Kesehatan Sekolah</h3>
              </div>
              <button onClick={() => setIsFormOpen(false)}>
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Kegiatan Program *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gerakan Sikat Gigi Massal & CTPS"
                  value={formData.namaKegiatan || ''}
                  onChange={(e) => setFormData({ ...formData, namaKegiatan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Program</label>
                  <select
                    value={formData.jenisProgram || 'Pendidikan Kesehatan'}
                    onChange={(e) => setFormData({ ...formData, jenisProgram: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Pendidikan Kesehatan">Pendidikan Kesehatan</option>
                    <option value="Pelayanan Kesehatan">Pelayanan Kesehatan</option>
                    <option value="Lingkungan Sehat">Lingkungan Sehat (PHBS)</option>
                    <option value="Pemberantasan Nyamuk">Pemberantasan Nyamuk (PSN)</option>
                    <option value="Imunisasi Puskesmas">Imunisasi Puskesmas</option>
                    <option value="Edukasi Gizi">Edukasi Gizi Halal-Thayyib</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sasaran Unit</label>
                  <select
                    value={formData.sasaran || 'Semua Jenjang'}
                    onChange={(e) => setFormData({ ...formData, sasaran: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Semua Jenjang">Semua Jenjang (RAIT, SDIT, SMPIT)</option>
                    <option value="RAIT">Khusus RAIT (TK)</option>
                    <option value="SDIT">Khusus SDIT</option>
                    <option value="SMPIT">Khusus SMPIT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal || ''}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimasi Peserta</label>
                  <input
                    type="number"
                    value={formData.jumlahPeserta || 0}
                    onChange={(e) => setFormData({ ...formData, jumlahPeserta: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Anggaran (Rp)</label>
                  <input
                    type="number"
                    value={formData.anggaran || 0}
                    onChange={(e) => setFormData({ ...formData, anggaran: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Penanggung Jawab *</label>
                  <input
                    type="text"
                    required
                    value={formData.penanggungJawab || ''}
                    onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Kegiatan</label>
                  <select
                    value={formData.status || 'direncanakan'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="direncanakan">Direncanakan</option>
                    <option value="berlangsung">Sedang Berlangsung</option>
                    <option value="selesai">Selesai Terlaksana</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Hasil / Ringkasan Evaluasi</label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan pelaksanaan dan rekomendasi perbaikan ke depan..."
                  value={formData.laporanHasil || ''}
                  onChange={(e) => setFormData({ ...formData, laporanHasil: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold"
                >
                  Simpan Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
