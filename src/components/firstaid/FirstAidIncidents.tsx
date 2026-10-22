import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  PhoneCall, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FileText, 
  X,
  Hospital,
  Activity
} from 'lucide-react';
import { FirstAidIncident, Student, SchoolUnit } from '../../types/uks';
import { useAuth } from '../../context/AuthContext';

interface FirstAidIncidentsProps {
  students: Student[];
  incidents: FirstAidIncident[];
  onSaveIncident: (incident: FirstAidIncident) => Promise<void>;
}

export const FirstAidIncidents: React.FC<FirstAidIncidentsProps> = ({
  students,
  incidents,
  onSaveIncident,
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailIncident, setDetailIncident] = useState<FirstAidIncident | null>(null);

  const [formData, setFormData] = useState<Partial<FirstAidIncident>>({
    waktuKejadian: new Date().toISOString().replace('T', ' ').substring(0, 16),
    lokasiKejadian: 'Lapangan Olahraga SIT',
    isEmergency: false,
    statusSelesai: false,
    petugas: currentUser.displayName || 'Ns. Siti Rahmawati, S.Kep',
  });

  const handleOpenAdd = () => {
    const std = students[0];
    setFormData({
      studentId: std?.id || '',
      studentNis: std?.nis || '',
      studentNama: std?.namaLengkap || '',
      jenjang: std?.jenjang || 'SDIT',
      kelas: std?.kelas || '1-A',
      waktuKejadian: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lokasiKejadian: 'Lapangan Olahraga SIT',
      kronologi: '',
      keluhanKondisi: '',
      tindakanAwal: '',
      petugas: currentUser.displayName || 'Ns. Siti Rahmawati, S.Kep',
      kontakWaliDihubungi: std?.noTeleponDarurat || '',
      statusWaliDihubungi: 'Tersambung',
      hasilPemantauan: '',
      rekomendasiLanjutan: '',
      faskesRujukan: '',
      statusSelesai: false,
      isEmergency: false,
    });
    setIsFormOpen(true);
  };

  const handleStudentSelect = (studentId: string) => {
    const std = students.find(s => s.id === studentId);
    if (std) {
      setFormData(prev => ({
        ...prev,
        studentId: std.id,
        studentNis: std.nis,
        studentNama: std.namaLengkap,
        jenjang: std.jenjang,
        kelas: std.kelas,
        kontakWaliDihubungi: std.noTeleponDarurat,
      }));
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentNama || !formData.lokasiKejadian || !formData.tindakanAwal) {
      alert('Mohon lengkapi identitas santri, lokasi kejadian, dan tindakan awal!');
      return;
    }

    const newIncident: FirstAidIncident = {
      id: `inc_${Date.now()}`,
      studentId: formData.studentId || '',
      studentNis: formData.studentNis || '',
      studentNama: formData.studentNama || '',
      jenjang: (formData.jenjang as SchoolUnit) || 'SDIT',
      kelas: formData.kelas || '',
      waktuKejadian: formData.waktuKejadian || new Date().toISOString().substring(0, 16),
      lokasiKejadian: formData.lokasiKejadian || 'Lingkungan Sekolah',
      kronologi: formData.kronologi || '',
      keluhanKondisi: formData.keluhanKondisi || '',
      tindakanAwal: formData.tindakanAwal || '',
      petugas: formData.petugas || currentUser.displayName,
      kontakWaliDihubungi: formData.kontakWaliDihubungi || '',
      statusWaliDihubungi: formData.statusWaliDihubungi || 'Tersambung',
      hasilPemantauan: formData.hasilPemantauan || '',
      rekomendasiLanjutan: formData.rekomendasiLanjutan || '',
      faskesRujukan: formData.faskesRujukan || '',
      statusSelesai: formData.statusSelesai ?? true,
      isEmergency: formData.isEmergency ?? false,
      createdAt: new Date().toISOString(),
    };

    await onSaveIncident(newIncident);
    setIsFormOpen(false);
  };

  const filtered = incidents.filter(inc => 
    inc.studentNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.lokasiKejadian.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.tindakanAwal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-100 text-rose-800 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pertolongan Pertama & Kejadian Khusus (First Aid)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan insiden cedera, kronologi kejadian, penanganan awal medis, dan alur rujukan faskes
          </p>
        </div>

        {currentUser.role !== 'orang_tua' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Catat Insiden / Pertolongan
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
            placeholder="Cari santri, lokasi kejadian, tindakan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-rose-500"
          />
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 text-slate-400">
            Tidak ada catatan kejadian darurat atau pertolongan pertama khusus.
          </div>
        ) : (
          filtered.map(inc => (
            <div 
              key={inc.id}
              className={`p-5 rounded-2xl border bg-white shadow-2xs transition-all hover:border-slate-300 ${
                inc.isEmergency ? 'border-l-4 border-l-red-500' : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {inc.isEmergency && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                      STATUS DARURAT
                    </span>
                  )}
                  <h3 className="font-bold text-slate-900 text-sm">{inc.studentNama}</h3>
                  <span className="text-xs text-slate-500">({inc.jenjang} - {inc.kelas})</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {inc.waktuKejadian}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    {inc.lokasiKejadian}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">Kronologi Kejadian:</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {inc.kronologi}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">Tindakan Pertolongan Pertama:</span>
                  <p className="text-slate-800 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 font-medium leading-relaxed">
                    {inc.tindakanAwal}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                <div>
                  Petugas: <strong className="text-slate-800">{inc.petugas}</strong> • 
                  Kontak Wali: <strong className="text-slate-800">{inc.kontakWaliDihubungi} ({inc.statusWaliDihubungi || 'Tersambung'})</strong>
                </div>

                {inc.faskesRujukan && (
                  <div className="text-red-700 font-bold flex items-center gap-1">
                    <Hospital className="w-3.5 h-3.5" />
                    Rujukan: {inc.faskesRujukan}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: CATAT INSIDEN */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 bg-rose-700 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-200">
                  Formulir Pertolongan Pertama
                </span>
                <h3 className="text-lg font-bold">Pencatatan Insiden & Pertolongan Pertama</h3>
              </div>
              <button onClick={() => setIsFormOpen(false)}>
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-red-950 block">Tandai Sebagai Keadaan Darurat?</span>
                  <span className="text-slate-500 text-[11px]">Memerlukan rujukan faskes segera dan koordinasi cepat</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isEmergency}
                  onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
                  className="w-5 h-5 text-red-600 rounded-md focus:ring-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Santri yang Mengalami Kejadian *</label>
                <select
                  value={formData.studentId || ''}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.namaLengkap} - {s.jenjang} Kelas {s.kelas} (Wali: {s.namaWali} - {s.noTeleponDarurat})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Waktu Kejadian *</label>
                  <input
                    type="text"
                    required
                    value={formData.waktuKejadian || ''}
                    onChange={(e) => setFormData({ ...formData, waktuKejadian: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lokasi Kejadian *</label>
                  <input
                    type="text"
                    required
                    placeholder="Lapangan Futsal, Tangga Gedung SMPIT, dsb."
                    value={formData.lokasiKejadian || ''}
                    onChange={(e) => setFormData({ ...formData, lokasiKejadian: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kronologi Singkat Kejadian *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Bagaimana kronologi kejadian dan kondisi awal siswa..."
                  value={formData.kronologi || ''}
                  onChange={(e) => setFormData({ ...formData, kronologi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tindakan Pertolongan Pertama yang Diberikan *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Pembidaian, kompres es (RICE), desinfeksi luka dengan povidone iodine..."
                  value={formData.tindakanAwal || ''}
                  onChange={(e) => setFormData({ ...formData, tindakanAwal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kontak Wali yang Dihubungi</label>
                  <input
                    type="text"
                    value={formData.kontakWaliDihubungi || ''}
                    onChange={(e) => setFormData({ ...formData, kontakWaliDihubungi: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fasilitas Kesehatan Rujukan (Jika Perlu)</label>
                  <input
                    type="text"
                    placeholder="Puskesmas Tiban / RSUD Embung Fatimah"
                    value={formData.faskesRujukan || ''}
                    onChange={(e) => setFormData({ ...formData, faskesRujukan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold"
                >
                  Simpan Insiden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
