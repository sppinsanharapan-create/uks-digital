import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Heart, 
  Phone, 
  Calendar, 
  FileText, 
  X,
  Stethoscope,
  Activity,
  Printer
} from 'lucide-react';
import { Student, SchoolUnit, UksVisit, HealthScreening } from '../../types/uks';
import { useAuth } from '../../context/AuthContext';

interface StudentDatabaseProps {
  students: Student[];
  visits: UksVisit[];
  screenings: HealthScreening[];
  onSaveStudent: (student: Student) => Promise<void>;
  onDeleteStudent: (studentId: string) => Promise<void>;
  onOpenVisitWithStudent?: (student: Student) => void;
}

export const StudentDatabase: React.FC<StudentDatabaseProps> = ({
  students,
  visits,
  screenings,
  onSaveStudent,
  onDeleteStudent,
  onOpenVisitWithStudent,
}) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('SEMUA');
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Student>>({
    jenjang: 'SDIT',
    jenisKelamin: 'L',
    statusAktif: true,
  });

  // Extract unique classes
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (selectedUnit === 'SEMUA' || s.jenjang === selectedUnit) {
        set.add(s.kelas);
      }
    });
    return Array.from(set).sort();
  }, [students, selectedUnit]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = 
        s.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.includes(searchTerm) ||
        (s.namaWali && s.namaWali.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchUnit = selectedUnit === 'SEMUA' || s.jenjang === selectedUnit;
      const matchClass = selectedClass === 'SEMUA' || s.kelas === selectedClass;

      return matchSearch && matchUnit && matchClass;
    });
  }, [students, searchTerm, selectedUnit, selectedClass]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      nis: `2026${Math.floor(1000 + Math.random() * 9000)}`,
      namaLengkap: '',
      jenjang: 'SDIT',
      kelas: '1-A',
      jenisKelamin: 'L',
      tanggalLahir: '2018-05-10',
      namaWali: '',
      noTeleponDarurat: '',
      emailWali: '',
      alamat: '',
      golonganDarah: 'O',
      alergi: '',
      kondisiKhusus: '',
      catatanKebutuhanKhusus: '',
      statusAktif: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ ...student });
    setIsFormOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap || !formData.nis || !formData.kelas || !formData.namaWali) {
      alert('Mohon lengkapi data wajib (NIS, Nama Lengkap, Kelas, dan Nama Wali)!');
      return;
    }

    const newOrUpdated: Student = {
      id: editingStudent ? editingStudent.id : `std_${Date.now()}`,
      nis: formData.nis || '',
      namaLengkap: formData.namaLengkap || '',
      jenjang: (formData.jenjang as SchoolUnit) || 'SDIT',
      kelas: formData.kelas || '',
      jenisKelamin: (formData.jenisKelamin as 'L' | 'P') || 'L',
      tanggalLahir: formData.tanggalLahir || '',
      namaWali: formData.namaWali || '',
      noTeleponDarurat: formData.noTeleponDarurat || '',
      emailWali: formData.emailWali || '',
      alamat: formData.alamat || '',
      golonganDarah: formData.golonganDarah || 'O',
      alergi: formData.alergi || '',
      kondisiKhusus: formData.kondisiKhusus || '',
      catatanKebutuhanKhusus: formData.catatanKebutuhanKhusus || '',
      statusAktif: formData.statusAktif ?? true,
    };

    await onSaveStudent(newOrUpdated);
    setIsFormOpen(false);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredStudents.map(s => ({
      NIS: s.nis,
      'Nama Lengkap': s.namaLengkap,
      Jenjang: s.jenjang,
      Kelas: s.kelas,
      'Jenis Kelamin': s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      'Tanggal Lahir': s.tanggalLahir,
      'Golongan Darah': s.golonganDarah || '-',
      'Nama Wali': s.namaWali,
      'No. HP Darurat': s.noTeleponDarurat,
      'Riwayat Alergi': s.alergi || '-',
      'Kondisi Khusus': s.kondisiKhusus || '-',
      Alamat: s.alamat || '-',
      Status: s.statusAktif ? 'Aktif' : 'Non-Aktif',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Siswa_UKS');
    XLSX.writeFile(workbook, `Data_Siswa_UKS_Insan_Harapan_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  // Import from Excel
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        let importedCount = 0;
        for (const row of data) {
          const nis = String(row.NIS || row.nis || `2026${Math.floor(1000 + Math.random() * 9000)}`);
          const nama = row['Nama Lengkap'] || row.Nama || row.namaLengkap || 'Siswa Baru';
          const jenjang = (row.Jenjang || 'SDIT') as SchoolUnit;
          const kelas = String(row.Kelas || '1-A');
          const jk = (row['Jenis Kelamin'] === 'Perempuan' || row.jk === 'P') ? 'P' : 'L';

          const s: Student = {
            id: `std_imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            nis,
            namaLengkap: nama,
            jenjang,
            kelas,
            jenisKelamin: jk,
            tanggalLahir: row['Tanggal Lahir'] || '2017-01-01',
            namaWali: row['Nama Wali'] || 'Wali Murid',
            noTeleponDarurat: String(row['No. HP Darurat'] || row.Telepon || '081200000000'),
            alamat: row.Alamat || 'Batam',
            alergi: row['Riwayat Alergi'] || row.Alergi || '',
            kondisiKhusus: row['Kondisi Khusus'] || '',
            catatanKebutuhanKhusus: row['Catatan Kebutuhan Khusus'] || '',
            statusAktif: true,
          };
          await onSaveStudent(s);
          importedCount++;
        }

        alert(`Berhasil mengimpor ${importedCount} data siswa ke basis data UKS.`);
      } catch (err) {
        alert('Gagal membaca file Excel. Pastikan format kolom sesuai (NIS, Nama Lengkap, Jenjang, Kelas, Nama Wali, No. HP Darurat).');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">

      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Database Master Siswa
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data rekam kesehatan, riwayat alergi, dan kontak darurat RAIT, SDIT, dan SMPIT
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportExcel} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />

          {currentUser.role !== 'orang_tua' && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                title="Impor dari berkas Excel"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                Impor Excel
              </button>

              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                title="Ekspor ke berkas Excel"
              >
                <Download className="w-4 h-4 text-slate-600" />
                Ekspor Excel
              </button>

              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm shadow-emerald-700/20 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                Tambah Siswa
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, NIS, atau nama wali..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            Jenjang:
          </div>
          <select
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.target.value);
              setSelectedClass('SEMUA');
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-emerald-500"
          >
            <option value="SEMUA">Semua Jenjang</option>
            <option value="RAIT">RAIT (TK)</option>
            <option value="SDIT">SDIT</option>
            <option value="SMPIT">SMPIT</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-emerald-500"
          >
            <option value="SEMUA">Semua Kelas</option>
            {availableClasses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-4">Jenjang & Kelas</th>
                <th className="py-3 px-4">Wali & Kontak Darurat</th>
                <th className="py-3 px-4">Riwayat Alergi & Medis</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data siswa yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => {
                  const studentVisitsCount = visits.filter(v => v.studentId === s.id || v.studentNis === s.nis).length;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{s.namaLengkap}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>NIS: {s.nis}</span>
                          <span>•</span>
                          <span>{s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">Gol. {s.golonganDarah || '-'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          s.jenjang === 'RAIT' ? 'bg-pink-100 text-pink-800' :
                          s.jenjang === 'SDIT' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-indigo-100 text-indigo-800'
                        }`}>
                          {s.jenjang}
                        </span>
                        <div className="font-semibold text-slate-700 mt-1">
                          Kelas {s.kelas}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{s.namaWali}</div>
                        <a 
                          href={`tel:${s.noTeleponDarurat}`}
                          className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {s.noTeleponDarurat}
                        </a>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {s.alergi ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{s.alergi}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Bebas alergi</span>
                        )}
                        {s.kondisiKhusus && (
                          <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                            {s.kondisiKhusus}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Aktif
                        </span>
                        {studentVisitsCount > 0 && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            {studentVisitsCount}x ke UKS
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setDetailStudent(s)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Lihat Rekam Medis Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {currentUser.role !== 'orang_tua' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(s)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                title="Ubah Data"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {onOpenVisitWithStudent && (
                                <button
                                  onClick={() => onOpenVisitWithStudent(s)}
                                  className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                                  title="Daftarkan Kunjungan UKS"
                                >
                                  <Stethoscope className="w-4 h-4" />
                                </button>
                              )}

                              {currentUser.role === 'super_admin' && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Hapus data siswa ${s.namaLengkap}?`)) {
                                      onDeleteStudent(s.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                                  title="Hapus Data Siswa"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredStudents.length > 0 && (
          <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Menampilkan <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> dari <span className="font-bold text-slate-800">{filteredStudents.length}</span> santri
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

      {/* MODAL: ADD / EDIT STUDENT */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingStudent ? 'Perbarui Data Siswa' : 'Tambah Siswa Baru'}
                </h2>
                <p className="text-xs text-slate-500">
                  SIT Insan Harapan Batam (RAIT • SDIT • SMPIT)
                </p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor Induk Siswa (NIS) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nis || ''}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaLengkap || ''}
                    onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Jenjang Sekolah *
                  </label>
                  <select
                    value={formData.jenjang || 'SDIT'}
                    onChange={(e) => setFormData({ ...formData, jenjang: e.target.value as SchoolUnit })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  >
                    <option value="RAIT">RAIT (TK Islam Terpadu)</option>
                    <option value="SDIT">SDIT (SD Islam Terpadu)</option>
                    <option value="SMPIT">SMPIT (SMP Islam Terpadu)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kelas / Rombel *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 4-A, TK-B, 8-Ikhwan"
                    value={formData.kelas || ''}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={formData.jenisKelamin || 'L'}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  >
                    <option value="L">Laki-laki (Ikhwan)</option>
                    <option value="P">Perempuan (Akhwat)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Golongan Darah
                  </label>
                  <select
                    value={formData.golonganDarah || 'O'}
                    onChange={(e) => setFormData({ ...formData, golonganDarah: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="-">Belum Diketahui</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalLahir || ''}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Orang Tua / Wali *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namaWali || ''}
                    onChange={(e) => setFormData({ ...formData, namaWali: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    No. Telepon / WhatsApp Darurat *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0812xxxxxxxx"
                    value={formData.noTeleponDarurat || ''}
                    onChange={(e) => setFormData({ ...formData, noTeleponDarurat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Wali Murid
                  </label>
                  <input
                    type="email"
                    value={formData.emailWali || ''}
                    onChange={(e) => setFormData({ ...formData, emailWali: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Alamat Domisili Siswa (Batam)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Perum Tiban Indah Blok C No. 12"
                  value={formData.alamat || ''}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                />
              </div>

              {/* Health Notes Section */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Informasi Kesehatan & Alergi Khusus
                </h3>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Riwayat Alergi (Makanan / Obat-obatan / Suhu)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Alergi udang, telur, parasetamol, dingin ekstrem"
                    value={formData.alergi || ''}
                    onChange={(e) => setFormData({ ...formData, alergi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kondisi Kesehatan Penting / Catatan Wali
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Riwayat asma, mudah mimisan jika kepanasan, kacamata minus"
                    value={formData.kondisiKhusus || ''}
                    onChange={(e) => setFormData({ ...formData, kondisiKhusus: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kebutuhan Pertolongan Khusus Terverifikasi
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Bawa inhaler sendiri di tas, jika sesak segera hubungi ibu"
                    value={formData.catatanKebutuhanKhusus || ''}
                    onChange={(e) => setFormData({ ...formData, catatanKebutuhanKhusus: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
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
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL STUDENT HEALTH CARD & TIMELINE */}
      {detailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 bg-linear-to-r from-emerald-800 to-teal-700 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-200">
                  REKAM KESEHATAN SISWA • UKS SIT INSAN HARAPAN
                </span>
                <h2 className="text-xl font-black mt-0.5">{detailStudent.namaLengkap}</h2>
                <p className="text-xs text-emerald-100">
                  NIS: {detailStudent.nis} • {detailStudent.jenjang} Kelas {detailStudent.kelas} • Gol. Darah: {detailStudent.golonganDarah || '-'}
                </p>
              </div>
              <button
                onClick={() => setDetailStudent(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Profile Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Wali Murid</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{detailStudent.namaWali}</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">{detailStudent.noTeleponDarurat}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Alamat</span>
                  <p className="text-xs font-medium text-slate-800 mt-0.5 line-clamp-2">{detailStudent.alamat || 'Batam'}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Tanggal Lahir</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{detailStudent.tanggalLahir}</p>
                  <p className="text-[11px] text-slate-500">JK: {detailStudent.jenisKelamin === 'L' ? 'Ikhwan' : 'Akhwat'}</p>
                </div>
              </div>

              {/* Medical Notice */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Peringatan Khusus Medis & Alergi
                </h4>
                <p className="text-xs text-amber-950 font-medium">
                  <strong>Alergi:</strong> {detailStudent.alergi || 'Tidak ada riwayat alergi.'}
                </p>
                <p className="text-xs text-amber-950 font-medium mt-1">
                  <strong>Kondisi Khusus:</strong> {detailStudent.kondisiKhusus || 'Sehat / Tidak ada kondisi kronis.'}
                </p>
                {detailStudent.catatanKebutuhanKhusus && (
                  <p className="text-xs text-amber-950 font-medium mt-1">
                    <strong>Tindakan Pertama Wali:</strong> {detailStudent.catatanKebutuhanKhusus}
                  </p>
                )}
              </div>

              {/* UKS Visits Timeline */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Riwayat Kunjungan ke Ruang UKS
                </h3>
                {visits.filter(v => v.studentId === detailStudent.id || v.studentNis === detailStudent.nis).length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl text-center">
                    Belum pernah berkunjung ke UKS (Alhamdulillah siswa sehat wal afiat).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {visits.filter(v => v.studentId === detailStudent.id || v.studentNis === detailStudent.nis).map(v => (
                      <div key={v.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{v.nomorKunjungan} • {v.waktuMasuk}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">{v.status}</span>
                        </div>
                        <p className="text-slate-600 font-medium"><strong>Keluhan:</strong> {v.keluhan}</p>
                        <p className="text-slate-600"><strong>Tindakan:</strong> {v.pertolonganPertama}</p>
                        {v.suhuTubuh && <p className="text-slate-500 text-[11px]">Suhu: {v.suhuTubuh}°C • Petugas: {v.petugas}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Health Screenings Timeline */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Riwayat Pemeriksaan Kesehatan Berkala (Skrining)
                </h3>
                {screenings.filter(s => s.studentId === detailStudent.id || s.studentNis === detailStudent.nis).length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl text-center">
                    Belum ada riwayat skrining berkala untuk siswa ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {screenings.filter(s => s.studentId === detailStudent.id || s.studentNis === detailStudent.nis).map(sc => (
                      <div key={sc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>Tanggal: {sc.tanggal} ({sc.tahunAjaran} - {sc.semester})</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">{sc.statusGizi || 'Normal'}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 py-1">
                          <div>TB: <strong>{sc.tinggiBadan} cm</strong></div>
                          <div>BB: <strong>{sc.beratBadan} kg</strong></div>
                          <div>IMT: <strong>{sc.imt || '-'}</strong></div>
                          <div>Penglihatan: <strong>{sc.pemeriksaanPenglihatan}</strong></div>
                        </div>
                        <p className="text-slate-600 text-[11px]"><strong>Gigi & Mulut:</strong> {sc.kesehatanGigiMulut}</p>
                        {sc.rekomendasiTindakLanjut && (
                          <p className="text-emerald-800 font-medium text-[11px]"><strong>Rekomendasi:</strong> {sc.rekomendasiTindakLanjut}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Kartu Siswa
              </button>
              <button
                onClick={() => setDetailStudent(null)}
                className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
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
