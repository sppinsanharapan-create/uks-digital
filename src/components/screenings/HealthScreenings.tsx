import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Smile, 
  Sparkles, 
  Printer, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  X,
  FileText
} from 'lucide-react';
import { Student, HealthScreening, SchoolUnit } from '../../types/uks';
import { useAuth } from '../../context/AuthContext';

interface HealthScreeningsProps {
  students: Student[];
  screenings: HealthScreening[];
  onSaveScreening: (screening: HealthScreening) => Promise<void>;
}

export const HealthScreenings: React.FC<HealthScreeningsProps> = ({
  students,
  screenings,
  onSaveScreening,
}) => {
  const { currentUser } = useAuth();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('SEMUA');
  const [selectedStatusGizi, setSelectedStatusGizi] = useState<string>('SEMUA');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailScreening, setDetailScreening] = useState<HealthScreening | null>(null);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<HealthScreening>>({
    tanggal: new Date().toISOString().substring(0, 10),
    tinggiBadan: 135,
    beratBadan: 30,
    suhuTubuh: 36.6,
    pemeriksaanPenglihatan: 'Visus 6/6 (Normal)',
    kebersihanDiri: 'Kuku pendek bersih, rambut rapi, telinga bersih',
    kesehatanGigiMulut: 'Gigi bersih, bebas karang gigi & karies',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    petugasPemeriksa: currentUser.displayName || 'Ns. Siti Rahmawati, S.Kep',
    rekomendasiTindakLanjut: 'Pertahankan kebersihan diri dan pola makan gizi seimbang',
  });

  const handleOpenAdd = () => {
    const targetStudent = students[0];
    setSelectedStudentId(targetStudent?.id || '');
    setFormData({
      studentId: targetStudent?.id || '',
      studentNis: targetStudent?.nis || '',
      studentNama: targetStudent?.namaLengkap || '',
      jenjang: targetStudent?.jenjang || 'SDIT',
      kelas: targetStudent?.kelas || '1-A',
      tanggal: new Date().toISOString().substring(0, 10),
      tinggiBadan: 135,
      beratBadan: 30,
      suhuTubuh: 36.6,
      pemeriksaanPenglihatan: 'Visus 6/6 (Normal kedua mata)',
      kebersihanDiri: 'Kuku bersih, rambut rapi, hygiene telinga baik',
      kesehatanGigiMulut: 'Gigi terawat, tidak ada karies berlubang aktif',
      rekomendasiTindakLanjut: 'Gizi seimbang dan sikat gigi teratur setelah makan & sebelum tidur',
      tahunAjaran: '2026/2027',
      semester: 'Ganjil',
      petugasPemeriksa: currentUser.displayName || 'Ns. Siti Rahmawati, S.Kep',
    });
    setIsFormOpen(true);
  };

  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const target = students.find(s => s.id === id);
    if (target) {
      setFormData(prev => ({
        ...prev,
        studentId: target.id,
        studentNis: target.nis,
        studentNama: target.namaLengkap,
        jenjang: target.jenjang,
        kelas: target.kelas,
      }));
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentNama || !formData.tinggiBadan || !formData.beratBadan) {
      alert('Mohon lengkapi data siswa, tinggi badan, dan berat badan!');
      return;
    }

    const newScreening: HealthScreening = {
      id: `scr_${Date.now()}`,
      studentId: formData.studentId || '',
      studentNis: formData.studentNis || '',
      studentNama: formData.studentNama || '',
      jenjang: (formData.jenjang as SchoolUnit) || 'SDIT',
      kelas: formData.kelas || '',
      tanggal: formData.tanggal || new Date().toISOString().substring(0, 10),
      tinggiBadan: Number(formData.tinggiBadan),
      beratBadan: Number(formData.beratBadan),
      suhuTubuh: formData.suhuTubuh ? Number(formData.suhuTubuh) : 36.5,
      pemeriksaanPenglihatan: formData.pemeriksaanPenglihatan || 'Normal',
      kebersihanDiri: formData.kebersihanDiri || 'Bersih',
      kesehatanGigiMulut: formData.kesehatanGigiMulut || 'Bersih',
      catatanPemeriksaan: formData.catatanPemeriksaan || '',
      rekomendasiTindakLanjut: formData.rekomendasiTindakLanjut || '',
      petugasPemeriksa: formData.petugasPemeriksa || currentUser.displayName,
      tahunAjaran: formData.tahunAjaran || '2026/2027',
      semester: formData.semester || 'Ganjil',
      createdAt: new Date().toISOString(),
    };

    await onSaveScreening(newScreening);
    setIsFormOpen(false);
  };

  // Filtered Screenings
  const filteredScreenings = useMemo(() => {
    return screenings.filter(sc => {
      const matchSearch = 
        sc.studentNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sc.studentNis.includes(searchTerm) ||
        sc.petugasPemeriksa.toLowerCase().includes(searchTerm.toLowerCase());

      const matchUnit = selectedUnit === 'SEMUA' || sc.jenjang === selectedUnit;
      const matchGizi = selectedStatusGizi === 'SEMUA' || sc.statusGizi === selectedStatusGizi;

      return matchSearch && matchUnit && matchGizi;
    });
  }, [screenings, searchTerm, selectedUnit, selectedStatusGizi]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-teal-100 text-teal-800 rounded-xl">
              <Stethoscope className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pemeriksaan Kesehatan Berkala (Skrining UKS)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengukuran antropometri (TB/BB/IMT), visus penglihatan, kebersihan diri, dan kesehatan gigi santri
          </p>
        </div>

        {currentUser.role !== 'orang_tua' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm shadow-teal-700/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Catat Pemeriksaan Baru
          </button>
        )}
      </div>

      {/* Important Medical Disclaimer Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <strong>Pemberitahuan Regulasi Medis:</strong> Hasil skrining berkala UKS merupakan langkah deteksi dini tumbuh kembang dan kebersihan sekolah. Hasil skrining <strong>bukan merupakan diagnosis medis definitif</strong>. Apabila ditemukan indikasi gangguan penglihatan atau karies aktif, UKS menerbitkan surat rekomendasi rujukan ke Puskesmas / Rumah Sakit rujukan.
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari santri, NIS, petugas pemeriksa..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-teal-500"
          >
            <option value="SEMUA">Semua Jenjang</option>
            <option value="RAIT">RAIT (TK)</option>
            <option value="SDIT">SDIT</option>
            <option value="SMPIT">SMPIT</option>
          </select>

          <select
            value={selectedStatusGizi}
            onChange={(e) => setSelectedStatusGizi(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-teal-500"
          >
            <option value="SEMUA">Semua Status Gizi</option>
            <option value="Normal">Normal</option>
            <option value="Gizi Kurang">Gizi Kurang</option>
            <option value="Gizi Lebih">Gizi Lebih</option>
            <option value="Obesitas">Obesitas</option>
          </select>
        </div>
      </div>

      {/* Screenings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Santri & Kelas</th>
                <th className="py-3 px-4">Tanggal & Periode</th>
                <th className="py-3 px-4">Antropometri & IMT</th>
                <th className="py-3 px-4">Gigi, Mulut & Visus</th>
                <th className="py-3 px-4">Kebersihan Diri</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredScreenings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada data skrining kesehatan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredScreenings.map((sc) => (
                  <tr key={sc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sc.studentNama}</div>
                      <div className="text-[11px] text-slate-500">
                        {sc.jenjang} - Kelas {sc.kelas} (NIS: {sc.studentNis})
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{sc.tanggal}</div>
                      <div className="text-[11px] text-slate-500">{sc.tahunAjaran} ({sc.semester})</div>
                      <div className="text-[10px] text-slate-400">Pemeriksa: {sc.petugasPemeriksa}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{sc.tinggiBadan} cm</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-slate-900">{sc.beratBadan} kg</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-600 font-semibold">IMT: {sc.imt}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          sc.statusGizi === 'Normal' ? 'bg-emerald-100 text-emerald-800' :
                          sc.statusGizi === 'Gizi Kurang' ? 'bg-amber-100 text-amber-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {sc.statusGizi || 'Normal'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate">
                        Gigi: {sc.kesehatanGigiMulut}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Mata: {sc.pemeriksaanPenglihatan}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-slate-700 font-medium truncate">
                        {sc.kebersihanDiri}
                      </div>
                      {sc.rekomendasiTindakLanjut && (
                        <div className="text-[11px] text-teal-700 font-medium mt-0.5 truncate">
                          Rek: {sc.rekomendasiTindakLanjut}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setDetailScreening(sc)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                        title="Lihat Detail Pemeriksaan"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD SCREENING */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 bg-teal-800 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200">
                  Formulir Skrining Berkala
                </span>
                <h2 className="text-lg font-bold">Catat Pemeriksaan Kesehatan Santri</h2>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4">
              
              {/* Select Student */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pilih Santri yang Diperiksa *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-teal-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.namaLengkap} ({s.jenjang} - {s.kelas}, NIS: {s.nis})
                    </option>
                  ))}
                </select>
              </div>

              {/* Antropometri */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tinggi Badan (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.tinggiBadan || ''}
                    onChange={(e) => setFormData({ ...formData, tinggiBadan: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Berat Badan (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.beratBadan || ''}
                    onChange={(e) => setFormData({ ...formData, beratBadan: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Suhu Tubuh (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.suhuTubuh || ''}
                    onChange={(e) => setFormData({ ...formData, suhuTubuh: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* Pemeriksaan Fisik & Higienitas */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Pemeriksaan Penglihatan Sederhana (Snellen Chart)
                  </label>
                  <input
                    type="text"
                    value={formData.pemeriksaanPenglihatan || ''}
                    onChange={(e) => setFormData({ ...formData, pemeriksaanPenglihatan: e.target.value })}
                    placeholder="Contoh: Visus 6/6 normal kedua mata, atau rabun jauh mata kiri"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kebersihan Diri (Kuku, Kulit, Rambut, Telinga)
                  </label>
                  <input
                    type="text"
                    value={formData.kebersihanDiri || ''}
                    onChange={(e) => setFormData({ ...formData, kebersihanDiri: e.target.value })}
                    placeholder="Contoh: Kuku bersih dipotong rapi, rambut bersih, serumen telinga minimal"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kesehatan Gigi dan Mulut
                  </label>
                  <input
                    type="text"
                    value={formData.kesehatanGigiMulut || ''}
                    onChange={(e) => setFormData({ ...formData, kesehatanGigiMulut: e.target.value })}
                    placeholder="Contoh: Bebas karies, atau ada karies gigi geraham perlu ditambal"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Rekomendasi Tindak Lanjut Tenaga Kesehatan
                  </label>
                  <input
                    type="text"
                    value={formData.rekomendasiTindakLanjut || ''}
                    onChange={(e) => setFormData({ ...formData, rekomendasiTindakLanjut: e.target.value })}
                    placeholder="Contoh: Rujuk ke poli gigi Puskesmas, evaluasi kacamata ke optik"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-teal-500"
                  />
                </div>
              </div>

              {/* Petugas & Periode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Petugas / Tenaga Medis Pemeriksa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.petugasPemeriksa || ''}
                    onChange={(e) => setFormData({ ...formData, petugasPemeriksa: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tanggal Pemeriksaan
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal || ''}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-teal-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm"
                >
                  Simpan Skrining
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL SKRINING */}
      {detailScreening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="p-6 bg-teal-800 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200">
                  Hasil Skrining Berkala UKS
                </span>
                <h3 className="text-lg font-bold">{detailScreening.studentNama}</h3>
                <p className="text-xs text-teal-100">{detailScreening.jenjang} - Kelas {detailScreening.kelas} (NIS: {detailScreening.studentNis})</p>
              </div>
              <button 
                onClick={() => setDetailScreening(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px]">Tinggi Badan</span>
                  <span className="font-bold text-slate-900 text-sm">{detailScreening.tinggiBadan} cm</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px]">Berat Badan</span>
                  <span className="font-bold text-slate-900 text-sm">{detailScreening.beratBadan} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px]">IMT / Gizi</span>
                  <span className="font-bold text-teal-700 text-sm">{detailScreening.imt} ({detailScreening.statusGizi})</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 block">Kesehatan Gigi & Mulut:</span>
                  <p className="text-slate-800 mt-0.5">{detailScreening.kesehatanGigiMulut}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 block">Pemeriksaan Penglihatan:</span>
                  <p className="text-slate-800 mt-0.5">{detailScreening.pemeriksaanPenglihatan}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 block">Kebersihan Diri & Higienitas:</span>
                  <p className="text-slate-800 mt-0.5">{detailScreening.kebersihanDiri}</p>
                </div>

                {detailScreening.rekomendasiTindakLanjut && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 block">Rekomendasi Tenaga Kesehatan:</span>
                    <p className="text-emerald-950 mt-0.5">{detailScreening.rekomendasiTindakLanjut}</p>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Pemeriksa: <strong>{detailScreening.petugasPemeriksa}</strong></span>
                <span>Tanggal: {detailScreening.tanggal}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailScreening(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
