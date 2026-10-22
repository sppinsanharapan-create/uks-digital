import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Bed, 
  Car, 
  Ambulance, 
  Send, 
  X, 
  FileText, 
  Thermometer, 
  HeartPulse, 
  ShieldAlert,
  UserCheck,
  ChevronRight,
  Eye,
  MessageCircle,
  PhoneCall
} from 'lucide-react';
import { Student, UksVisit, VisitStatus, UrgencyLevel, SchoolUnit, ParentNotification } from '../../types/uks';
import { useAuth } from '../../context/AuthContext';

interface VisitRegistrationProps {
  students: Student[];
  visits: UksVisit[];
  onSaveVisit: (visit: UksVisit) => Promise<void>;
  onSendNotification: (notif: Omit<ParentNotification, 'id' | 'timestamp' | 'dibaca'>) => Promise<void>;
  preselectedStudent?: Student | null;
  onClearPreselectedStudent?: () => void;
}

export const VisitRegistration: React.FC<VisitRegistrationProps> = ({
  students,
  visits,
  onSaveVisit,
  onSendNotification,
  preselectedStudent,
  onClearPreselectedStudent,
}) => {
  const { currentUser } = useAuth();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState<string>('SEMUA');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('SEMUA');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailVisit, setDetailVisit] = useState<UksVisit | null>(null);
  const [statusUpdateVisit, setStatusUpdateVisit] = useState<UksVisit | null>(null);

  // New Visit Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<UksVisit>>({
    tingkatUrgensi: 'ringan',
    status: 'istirahat_dipantau',
    kategoriKeluhan: 'Demam / Suhu Tinggi',
    suhuTubuh: 37.0,
    pengantar: currentUser.role === 'guru' ? currentUser.displayName : 'Wali Kelas',
    petugas: currentUser.displayName || 'Ns. Siti Rahmawati, S.Kep',
  });

  // Automatically open modal if preselected student is passed
  React.useEffect(() => {
    if (preselectedStudent) {
      setSelectedStudentId(preselectedStudent.id);
      openAddFormWithStudent(preselectedStudent);
    }
  }, [preselectedStudent]);

  const openAddFormWithStudent = (student?: Student) => {
    const today = new Date();
    const dateCode = today.toISOString().substring(0, 10).replace(/-/g, '');
    const autoNumber = `UKS-${dateCode}-${String(visits.length + 1).padStart(3, '0')}`;
    const timeNow = today.toISOString().replace('T', ' ').substring(0, 16);

    const targetStudent = student || (selectedStudentId ? students.find(s => s.id === selectedStudentId) : students[0]);

    setFormData({
      nomorKunjungan: autoNumber,
      waktuMasuk: timeNow,
      studentId: targetStudent?.id || '',
      studentNis: targetStudent?.nis || '',
      studentNama: targetStudent?.namaLengkap || '',
      jenjang: targetStudent?.jenjang || 'SDIT',
      kelas: targetStudent?.kelas || '1-A',
      pengantar: currentUser.role === 'guru' ? currentUser.displayName : 'Guru Piket / Teman',
      keluhan: '',
      kategoriKeluhan: 'Demam / Suhu Tinggi',
      suhuTubuh: 37.2,
      tekananDarah: '100/70',
      tingkatUrgensi: 'ringan',
      pertolonganPertama: 'Tirah baring di kasur UKS, minum air hangat',
      petugas: currentUser.displayName || 'Ns. Siti Rahmawati, S.Kep',
      status: 'istirahat_dipantau',
      catatan: '',
      konfirmasiPenyerahan: '-',
      isEmergency: false,
    });
    setIsFormOpen(true);
  };

  const handleStudentSelectChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    const target = students.find(s => s.id === studentId);
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

  const currentSelectedStudentObj = useMemo(() => {
    return students.find(s => s.id === (formData.studentId || selectedStudentId));
  }, [students, formData.studentId, selectedStudentId]);

  const handleSaveVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentNama || !formData.keluhan || !formData.petugas) {
      alert('Mohon lengkapi nama siswa, keluhan, dan nama petugas!');
      return;
    }

    const isEmergency = formData.tingkatUrgensi === 'darurat';
    const newVisit: UksVisit = {
      id: `vis_${Date.now()}`,
      nomorKunjungan: formData.nomorKunjungan || `UKS-${Date.now()}`,
      studentId: formData.studentId || '',
      studentNis: formData.studentNis || '',
      studentNama: formData.studentNama || '',
      jenjang: (formData.jenjang as SchoolUnit) || 'SDIT',
      kelas: formData.kelas || '',
      waktuMasuk: formData.waktuMasuk || new Date().toISOString().substring(0, 16),
      waktuKeluar: formData.waktuKeluar || '',
      pengantar: formData.pengantar || 'Mandiri',
      keluhan: formData.keluhan || '',
      kategoriKeluhan: formData.kategoriKeluhan || 'Lainnya',
      suhuTubuh: formData.suhuTubuh ? Number(formData.suhuTubuh) : undefined,
      tekananDarah: formData.tekananDarah || '',
      detakNadi: formData.detakNadi ? Number(formData.detakNadi) : undefined,
      tingkatUrgensi: (formData.tingkatUrgensi as UrgencyLevel) || 'ringan',
      pertolonganPertama: formData.pertolonganPertama || '',
      obatDiberikan: formData.obatDiberikan || '',
      petugas: formData.petugas || currentUser.displayName,
      status: (formData.status as VisitStatus) || 'istirahat_dipantau',
      catatan: formData.catatan || '',
      konfirmasiPenyerahan: formData.konfirmasiPenyerahan || '-',
      isEmergency,
      parentNotified: false,
      createdAt: new Date().toISOString(),
    };

    await onSaveVisit(newVisit);

    // If status is dijemput or dirujuk, or emergency, auto-create notification for parents
    if (newVisit.status === 'dijemput_orang_tua' || newVisit.status === 'dirujuk_ke_faskes' || isEmergency) {
      const studentObj = students.find(s => s.id === newVisit.studentId);
      if (studentObj) {
        await onSendNotification({
          studentId: studentObj.id,
          studentNama: studentObj.namaLengkap,
          nis: studentObj.nis,
          jenis: newVisit.status === 'dirujuk_ke_faskes' ? 'rujukan' : 'jemput',
          judul: `Pemberitahuan UKS: ${studentObj.namaLengkap} (${newVisit.status === 'dirujuk_ke_faskes' ? 'Dirujuk ke Faskes' : 'Perlu Dijemput'})`,
          pesan: `Assalamu'alaikum Ayah/Bunda ${studentObj.namaWali}. Ananda ${studentObj.namaLengkap} (${studentObj.kelas}) saat ini sedang ditangani di Ruang UKS karena ${newVisit.keluhan}. Status: ${newVisit.status.replace(/_/g, ' ')}. Mohon kesediaannya untuk menjemput/berkoordinasi dengan petugas UKS ${newVisit.petugas}.`,
          nomorWali: studentObj.noTeleponDarurat,
          statusKirim: 'Terkirim',
          channel: 'WhatsApp',
        });
      }
    }

    setIsFormOpen(false);
    if (onClearPreselectedStudent) onClearPreselectedStudent();
  };

  // Quick WhatsApp notify helper
  const handleDirectWhatsApp = (visit: UksVisit) => {
    const student = students.find(s => s.id === visit.studentId || s.nis === visit.studentNis);
    const phone = student?.noTeleponDarurat?.replace(/\D/g, '') || '';
    const formattedPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone;

    const message = encodeURIComponent(
      `*PEMBERITAHUAN LAYANAN KESEHATAN UKS SIT INSAN HARAPAN BATAM*\n\n` +
      `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n` +
      `Yth. Ayah/Bunda ${student?.namaWali || 'Wali Murid'},\n\n` +
      `Kami menginformasikan bahwa ananda:\n` +
      `• *Nama:* ${visit.studentNama}\n` +
      `• *Kelas:* ${visit.jenjang} - ${visit.kelas}\n` +
      `• *Waktu Masuk UKS:* ${visit.waktuMasuk}\n` +
      `• *Keluhan:* ${visit.keluhan}\n` +
      `• *Suhu Tubuh:* ${visit.suhuTubuh ? visit.suhuTubuh + '°C' : '-'}\n` +
      `• *Tindakan Pertolongan:* ${visit.pertolonganPertama}\n` +
      `• *Status Saat Ini:* ${visit.status.replace(/_/g, ' ').toUpperCase()}\n\n` +
      `Catatan Petugas: ${visit.catatan || 'Ananda sedang dalam pemantauan tim medis UKS.'}\n\n` +
      `Petugas UKS: ${visit.petugas}\n` +
      `_SIT Insan Harapan Batam - Sehat Siswanya, Hebat Generasinya._`
    );

    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  // Handle Quick Status Change
  const handleUpdateStatus = async (visit: UksVisit, newStatus: VisitStatus, notes: string) => {
    const updatedVisit: UksVisit = {
      ...visit,
      status: newStatus,
      waktuKeluar: (newStatus === 'kembali_ke_kelas' || newStatus === 'dijemput_orang_tua' || newStatus === 'dirujuk_ke_faskes')
        ? new Date().toISOString().substring(0, 16)
        : visit.waktuKeluar,
      catatan: notes ? `${visit.catatan ? visit.catatan + ' | ' : ''}${notes}` : visit.catatan,
    };
    await onSaveVisit(updatedVisit);
    setStatusUpdateVisit(null);
  };

  // Filtered visits
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      const matchSearch = 
        v.studentNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.nomorKunjungan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.keluhan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.studentNis.includes(searchTerm);

      const matchUnit = selectedUnit === 'SEMUA' || v.jenjang === selectedUnit;
      const matchStatus = selectedStatus === 'SEMUA' || v.status === selectedStatus;
      const matchUrgency = selectedUrgency === 'SEMUA' || v.tingkatUrgensi === selectedUrgency;

      return matchSearch && matchUnit && matchStatus && matchUrgency;
    });
  }, [visits, searchTerm, selectedUnit, selectedStatus, selectedUrgency]);

  const totalPages = Math.max(1, Math.ceil(filteredVisits.length / itemsPerPage));
  const paginatedVisits = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVisits.slice(start, start + itemsPerPage);
  }, [filteredVisits, currentPage, itemsPerPage]);

  const getStatusBadge = (status: VisitStatus) => {
    switch (status) {
      case 'sedang_ditangani':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3" /> Sedang Ditangani</span>;
      case 'istirahat_dipantau':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200"><Bed className="w-3 h-3" /> Istirahat di UKS</span>;
      case 'kembali_ke_kelas':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Kembali ke Kelas</span>;
      case 'dijemput_orang_tua':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200"><Car className="w-3 h-3" /> Dijemput Wali</span>;
      case 'dirujuk_ke_faskes':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200"><Ambulance className="w-3 h-3" /> Dirujuk Faskes</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <ClipboardList className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pendaftaran & Kunjungan UKS
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan keluhan, pemeriksaan tanda vital, tindakan pertama, dan konfirmasi penyerahan siswa
          </p>
        </div>

        {currentUser.role !== 'orang_tua' && (
          <button
            onClick={() => openAddFormWithStudent()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm shadow-emerald-700/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Daftarkan Kunjungan Baru
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, NIS, no. kunjungan, keluhan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-emerald-500"
          >
            <option value="SEMUA">Semua Jenjang</option>
            <option value="RAIT">RAIT (TK)</option>
            <option value="SDIT">SDIT</option>
            <option value="SMPIT">SMPIT</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-emerald-500"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="sedang_ditangani">Sedang Ditangani</option>
            <option value="istirahat_dipantau">Istirahat di UKS</option>
            <option value="kembali_ke_kelas">Kembali ke Kelas</option>
            <option value="dijemput_orang_tua">Dijemput Orang Tua</option>
            <option value="dirujuk_ke_faskes">Dirujuk ke Faskes</option>
          </select>

          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-emerald-500"
          >
            <option value="SEMUA">Semua Tingkat Urgensi</option>
            <option value="ringan">Ringan (Hijau)</option>
            <option value="sedang">Sedang (Kuning)</option>
            <option value="darurat">Darurat (Merah)</option>
          </select>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">No. Kunjungan & Waktu</th>
                <th className="py-3 px-4">Siswa & Kelas</th>
                <th className="py-3 px-4">Keluhan & Kategori</th>
                <th className="py-3 px-4">Tanda Vital</th>
                <th className="py-3 px-4">Status & Petugas</th>
                <th className="py-3 px-4 text-center">Aksi & Notifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada data kunjungan UKS yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{v.nomorKunjungan}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {v.waktuMasuk}
                      </div>
                      {v.waktuKeluar && (
                        <div className="text-[10px] text-slate-400">
                          Selesai: {v.waktuKeluar}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{v.studentNama}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold">{v.jenjang}</span> - Kelas {v.kelas} (NIS: {v.studentNis})
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Pengantar: {v.pengantar}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-800 line-clamp-2">
                        {v.keluhan}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {v.kategoriKeluhan}
                        </span>
                        {v.tingkatUrgensi === 'darurat' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-800">
                            DARURAT
                          </span>
                        ) : v.tingkatUrgensi === 'sedang' ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            Sedang
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {v.suhuTubuh ? (
                        <div className={`font-bold flex items-center gap-1 ${
                          v.suhuTubuh >= 38 ? 'text-red-600' : 'text-slate-800'
                        }`}>
                          <Thermometer className="w-3.5 h-3.5" />
                          {v.suhuTubuh}°C
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                      {v.tekananDarah && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          TD: {v.tekananDarah} mmHg
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>{getStatusBadge(v.status)}</div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Oleh: <span className="font-medium">{v.petugas}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Detail Modal button */}
                        <button
                          onClick={() => setDetailVisit(v)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Lihat Detail Tindakan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* WhatsApp Notify Parent Button */}
                        <button
                          onClick={() => handleDirectWhatsApp(v)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Kirim Info via WhatsApp ke Wali Murid"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* Quick Update Status (Only for Admin UKS / Guru / Super Admin) */}
                        {currentUser.role !== 'orang_tua' && (
                          <button
                            onClick={() => setStatusUpdateVisit(v)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-[11px] font-semibold transition-colors"
                            title="Perbarui Status Kunjungan"
                          >
                            Update
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredVisits.length > 0 && (
          <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Menampilkan <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredVisits.length)}</span> dari <span className="font-bold text-slate-800">{filteredVisits.length}</span> kunjungan
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Sebelumnya
              </button>
              
              <span className="px-3 py-1.5 font-bold text-slate-800">
                Hal {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: DAFTARKAN KUNJUNGAN BARU */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 bg-linear-to-r from-emerald-800 to-teal-700 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                  Formulir Pelayanan UKS
                </span>
                <h2 className="text-lg font-bold">Pendaftaran Kunjungan Pasien UKS</h2>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVisitSubmit} className="p-6 space-y-4">
              
              {/* Auto Number & Datetime */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    No. Kunjungan (Otomatis)
                  </span>
                  <div className="text-xs font-bold text-slate-800">{formData.nomorKunjungan}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Waktu Masuk
                  </span>
                  <input
                    type="text"
                    value={formData.waktuMasuk || ''}
                    onChange={(e) => setFormData({ ...formData, waktuMasuk: e.target.value })}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Student Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pilih Siswa yang Datang ke UKS *
                </label>
                <select
                  value={formData.studentId || ''}
                  onChange={(e) => handleStudentSelectChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.namaLengkap} - {s.jenjang} Kelas {s.kelas} (NIS: {s.nis})
                    </option>
                  ))}
                </select>
              </div>

              {/* Instant Alert for Selected Student */}
              {currentSelectedStudentObj && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-950">
                    <span>{currentSelectedStudentObj.namaLengkap} ({currentSelectedStudentObj.jenjang} - {currentSelectedStudentObj.kelas})</span>
                    <span>Wali: {currentSelectedStudentObj.namaWali} ({currentSelectedStudentObj.noTeleponDarurat})</span>
                  </div>
                  {currentSelectedStudentObj.alergi && (
                    <div className="text-amber-900 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>PERHATIAN ALERGI: {currentSelectedStudentObj.alergi}</span>
                    </div>
                  )}
                  {currentSelectedStudentObj.kondisiKhusus && (
                    <div className="text-slate-600">
                      Kondisi: {currentSelectedStudentObj.kondisiKhusus}
                    </div>
                  )}
                </div>
              )}

              {/* Pengantar & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Guru / Petugas Pengantar
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Guru Pengantar / Teman Sekelas"
                    value={formData.pengantar || ''}
                    onChange={(e) => setFormData({ ...formData, pengantar: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kategori Keluhan
                  </label>
                  <select
                    value={formData.kategoriKeluhan || 'Demam / Suhu Tinggi'}
                    onChange={(e) => setFormData({ ...formData, kategoriKeluhan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  >
                    <option value="Demam / Suhu Tinggi">Demam / Suhu Tinggi</option>
                    <option value="Sakit Kepala / Pusing">Sakit Kepala / Pusing</option>
                    <option value="Sakit Perut / Kram / Mual">Sakit Perut / Kram / Mual</option>
                    <option value="Luka / Cedera / Keseleo">Luka / Cedera / Keseleo</option>
                    <option value="Mimisan / Pendarahan">Mimisan / Pendarahan</option>
                    <option value="Asma / Sesak Napas">Asma / Sesak Napas</option>
                    <option value="Pingsan / Kelelahan">Pingsan / Kelelahan Upacara</option>
                    <option value="Sakit Gigi / Gusi">Sakit Gigi / Gusi</option>
                    <option value="Alergi / Gatal-gatal">Alergi / Gatal-gatal</option>
                    <option value="Lainnya">Keluhan Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Keluhan detail */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Keluhan yang Disampaikan Siswa *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ceritakan keluhan yang dirasakan siswa..."
                  value={formData.keluhan || ''}
                  onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                />
              </div>

              {/* Tanda Vital */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Suhu Tubuh (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.suhuTubuh || ''}
                    onChange={(e) => setFormData({ ...formData, suhuTubuh: parseFloat(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tekanan Darah (mmHg)
                  </label>
                  <input
                    type="text"
                    placeholder="100/70"
                    value={formData.tekananDarah || ''}
                    onChange={(e) => setFormData({ ...formData, tekananDarah: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tingkat Urgensi
                  </label>
                  <select
                    value={formData.tingkatUrgensi || 'ringan'}
                    onChange={(e) => setFormData({ ...formData, tingkatUrgensi: e.target.value as UrgencyLevel })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  >
                    <option value="ringan">Ringan (Observasi biasa)</option>
                    <option value="sedang">Sedang (Perlu pemantauan)</option>
                    <option value="darurat">Darurat (Tindakan Segera)</option>
                  </select>
                </div>
              </div>

              {/* Tindakan Pertolongan Pertama */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pertolongan Pertama yang Diberikan *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Kompres hangat dahi, minum teh manis, oles minyak kayu putih, balut kassa steril..."
                  value={formData.pertolonganPertama || ''}
                  onChange={(e) => setFormData({ ...formData, pertolonganPertama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                />
              </div>

              {/* Status Akhir & Petugas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Status Kunjungan Awal *
                  </label>
                  <select
                    value={formData.status || 'istirahat_dipantau'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as VisitStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  >
                    <option value="sedang_ditangani">Sedang Ditangani</option>
                    <option value="istirahat_dipantau">Istirahat & Dipantau di UKS</option>
                    <option value="kembali_ke_kelas">Kembali ke Kelas</option>
                    <option value="dijemput_orang_tua">Dijemput Orang Tua / Wali</option>
                    <option value="dirujuk_ke_faskes">Dirujuk ke Faskes (Puskesmas/RS)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Petugas Medis UKS yang Menangani *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.petugas || ''}
                    onChange={(e) => setFormData({ ...formData, petugas: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>
              </div>

              {/* Catatan tambahan & serah terima */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan Tindakan Tambahan / Serah Terima
                </label>
                <input
                  type="text"
                  placeholder="Keterangan kondisi akhir atau penyerahan siswa"
                  value={formData.catatan || ''}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                />
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
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm"
                >
                  Simpan Kunjungan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL KUNJUNGAN */}
      {detailVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  Detail Rekam Kunjungan UKS
                </span>
                <h3 className="text-lg font-bold">{detailVisit.nomorKunjungan}</h3>
                <p className="text-xs text-slate-300">{detailVisit.waktuMasuk}</p>
              </div>
              <button 
                onClick={() => setDetailVisit(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{detailVisit.studentNama}</div>
                  <div className="text-slate-500">{detailVisit.jenjang} - Kelas {detailVisit.kelas} (NIS: {detailVisit.studentNis})</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Pengantar: {detailVisit.pengantar}</div>
                </div>
                <div>{getStatusBadge(detailVisit.status)}</div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="font-bold text-slate-700 block">Keluhan:</span>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                    {detailVisit.keluhan}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block">Tindakan Pertolongan Pertama:</span>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                    {detailVisit.pertolonganPertama}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-semibold block">Suhu Tubuh</span>
                    <span className="font-bold text-slate-800 text-sm">{detailVisit.suhuTubuh ? `${detailVisit.suhuTubuh}°C` : '-'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-semibold block">Petugas UKS</span>
                    <span className="font-bold text-slate-800 text-sm">{detailVisit.petugas}</span>
                  </div>
                </div>

                {detailVisit.catatan && (
                  <div>
                    <span className="font-bold text-slate-700 block">Catatan Tambahan:</span>
                    <p className="text-slate-600 mt-0.5 italic">{detailVisit.catatan}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDirectWhatsApp(detailVisit)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                Kirim WA ke Orang Tua
              </button>

              <button
                onClick={() => setDetailVisit(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE STATUS KUNJUNGAN CEPAT */}
      {statusUpdateVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Perbarui Status: {statusUpdateVisit.studentNama}
              </h3>
              <button onClick={() => setStatusUpdateVisit(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Pilih status penanganan terkini siswa di ruang UKS:
            </p>

            <div className="space-y-2">
              {[
                { status: 'kembali_ke_kelas', label: 'Kembali Belajar di Kelas', icon: CheckCircle2, color: 'hover:bg-emerald-50 text-emerald-800' },
                { status: 'dijemput_orang_tua', label: 'Dijemput Orang Tua / Wali', icon: Car, color: 'hover:bg-purple-50 text-purple-800' },
                { status: 'dirujuk_ke_faskes', label: 'Dirujuk ke Puskesmas / RS', icon: Ambulance, color: 'hover:bg-red-50 text-red-800' },
                { status: 'istirahat_dipantau', label: 'Masih Istirahat di Kasur UKS', icon: Bed, color: 'hover:bg-blue-50 text-blue-800' },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.status}
                    onClick={() => handleUpdateStatus(statusUpdateVisit, opt.status as VisitStatus, 'Status diperbarui oleh petugas')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 text-xs font-bold text-left transition-colors ${opt.color}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
