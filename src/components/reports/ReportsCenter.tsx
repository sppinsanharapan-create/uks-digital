import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Filter, 
  Calendar, 
  Users, 
  ClipboardList, 
  Pill, 
  Activity, 
  Building,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  Student, 
  UksVisit, 
  MedicineItem, 
  HealthScreening, 
  HealthProgram, 
  SchoolSetting, 
  SchoolUnit 
} from '../../types/uks';
import { useAuth } from '../../context/AuthContext';
import { PrintHeader } from '../common/PrintHeader';

interface ReportsCenterProps {
  students: Student[];
  visits: UksVisit[];
  medicines: MedicineItem[];
  screenings: HealthScreening[];
  programs: HealthProgram[];
  settings: SchoolSetting;
}

export const ReportsCenter: React.FC<ReportsCenterProps> = ({
  students,
  visits,
  medicines,
  screenings,
  programs,
  settings,
}) => {
  const { currentUser } = useAuth();

  // Selected report type
  const [reportType, setReportType] = useState<
    'kunjungan' | 'rujukan' | 'skrining' | 'inventaris' | 'program' | 'statistik'
  >('kunjungan');

  // Filters
  const [selectedUnit, setSelectedUnit] = useState<string>('SEMUA');
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().substring(0, 10));

  // Filtered Visits for report
  const reportVisits = useMemo(() => {
    return visits.filter(v => {
      const matchUnit = selectedUnit === 'SEMUA' || v.jenjang === selectedUnit;
      const vDate = v.waktuMasuk.substring(0, 10);
      const matchDate = (!startDate || vDate >= startDate) && (!endDate || vDate <= endDate);
      return matchUnit && matchDate;
    });
  }, [visits, selectedUnit, startDate, endDate]);

  // Filtered Referrals
  const reportReferrals = useMemo(() => {
    return reportVisits.filter(v => v.status === 'dirujuk_ke_faskes' || v.status === 'dijemput_orang_tua');
  }, [reportVisits]);

  // Filtered Screenings
  const reportScreenings = useMemo(() => {
    return screenings.filter(sc => {
      const matchUnit = selectedUnit === 'SEMUA' || sc.jenjang === selectedUnit;
      const matchDate = (!startDate || sc.tanggal >= startDate) && (!endDate || sc.tanggal <= endDate);
      return matchUnit && matchDate;
    });
  }, [screenings, selectedUnit, startDate, endDate]);

  // Filtered Medicines
  const reportMedicines = useMemo(() => {
    return medicines;
  }, [medicines]);

  // Export current table to Excel
  const handleExportExcel = () => {
    let sheetData: any[] = [];
    let fileName = `Laporan_UKS_${reportType}_${new Date().toISOString().substring(0, 10)}`;

    if (reportType === 'kunjungan') {
      sheetData = reportVisits.map(v => ({
        'No. Kunjungan': v.nomorKunjungan,
        'Waktu Masuk': v.waktuMasuk,
        'Nama Siswa': v.studentNama,
        NIS: v.studentNis,
        Jenjang: v.jenjang,
        Kelas: v.kelas,
        Pengantar: v.pengantar,
        Keluhan: v.keluhan,
        Kategori: v.kategoriKeluhan,
        'Suhu (°C)': v.suhuTubuh || '-',
        'Tekanan Darah': v.tekananDarah || '-',
        'Pertolongan Pertama': v.pertolonganPertama,
        'Obat Diberikan': v.obatDiberikan || '-',
        Status: v.status,
        Petugas: v.petugas,
      }));
    } else if (reportType === 'rujukan') {
      sheetData = reportReferrals.map(v => ({
        'No. Kunjungan': v.nomorKunjungan,
        'Nama Siswa': v.studentNama,
        Kelas: `${v.jenjang} - ${v.kelas}`,
        Waktu: v.waktuMasuk,
        Keluhan: v.keluhan,
        Tindakan: v.pertolonganPertama,
        Status: v.status === 'dirujuk_ke_faskes' ? 'Dirujuk ke Faskes' : 'Dijemput Orang Tua',
        'Catatan Penyerahan': v.catatan || '-',
        Petugas: v.petugas,
      }));
    } else if (reportType === 'skrining') {
      sheetData = reportScreenings.map(sc => ({
        Tanggal: sc.tanggal,
        'Nama Siswa': sc.studentNama,
        Kelas: `${sc.jenjang} - ${sc.kelas}`,
        'Tinggi (cm)': sc.tinggiBadan,
        'Berat (kg)': sc.beratBadan,
        IMT: sc.imt,
        'Status Gizi': sc.statusGizi,
        Penglihatan: sc.pemeriksaanPenglihatan,
        'Gigi & Mulut': sc.kesehatanGigiMulut,
        'Kebersihan Diri': sc.kebersihanDiri,
        Rekomendasi: sc.rekomendasiTindakLanjut || '-',
        Pemeriksa: sc.petugasPemeriksa,
      }));
    } else if (reportType === 'inventaris') {
      sheetData = reportMedicines.map(m => ({
        'Nama Barang': m.namaBarang,
        Kategori: m.kategori,
        'Stok Saat Ini': `${m.jumlahStok} ${m.satuan}`,
        'Batas Minimum': `${m.stokMinimum} ${m.satuan}`,
        'Tanggal Expired': m.tanggalKadaluwarsa,
        Batch: m.nomorBatch || '-',
        'Sumber Pengadaan': m.sumberPengadaan,
        Lokasi: m.lokasiPenyimpanan || 'UKS',
      }));
    } else if (reportType === 'program') {
      sheetData = programs.map(p => ({
        'Nama Kegiatan': p.namaKegiatan,
        Kategori: p.jenisProgram,
        Tanggal: p.tanggal,
        Sasaran: p.sasaran,
        Peserta: p.jumlahPeserta,
        Anggaran: p.anggaran,
        PJ: p.penanggungJawab,
        Status: p.status,
        'Laporan Hasil': p.laporanHasil,
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan_UKS');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const reportTitles: Record<string, string> = {
    kunjungan: 'Laporan Rekapitulasi Kunjungan UKS',
    rujukan: 'Laporan Siswa Dirujuk ke Faskes & Dijemput Wali',
    skrining: 'Laporan Pemeriksaan Kesehatan Berkala & Skrining IMT',
    inventaris: 'Laporan Stok Obat, Alat P3K, & Logistik UKS',
    program: 'Laporan Realisasi Program Trias UKS Sekolah',
    statistik: 'Laporan Statistik Tren Kesehatan & Keluhan Siswa',
  };

  return (
    <div className="space-y-6">

      {/* Header (Screen only) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pusat Laporan & Rekapitulasi UKS
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ekspor resmi dokumen kesehatan, rekap kunjungan, dan pencetakan kop surat SIT Insan Harapan Batam
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Ekspor Excel
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm shadow-emerald-700/20 transition-all hover:scale-[1.02]"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan Resmi
          </button>
        </div>
      </div>

      {/* Filter and Report Type Selector (Screen only) */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">
            Pilih Jenis Laporan:
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'kunjungan', label: '1. Kunjungan UKS', icon: ClipboardList },
              { id: 'rujukan', label: '2. Rujukan & Penjemputan', icon: Activity },
              { id: 'skrining', label: '3. Skrining Kesehatan', icon: Users },
              { id: 'inventaris', label: '4. Stok Obat & P3K', icon: Pill },
              { id: 'program', label: '5. Program Trias UKS', icon: Building },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setReportType(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    reportType === tab.id
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date and Unit Filter */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            Filter Data:
          </div>

          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-emerald-500"
          >
            <option value="SEMUA">Semua Jenjang (RAIT, SDIT, SMPIT)</option>
            <option value="RAIT">RAIT (TK Islam Terpadu)</option>
            <option value="SDIT">SDIT (SD Islam Terpadu)</option>
            <option value="SMPIT">SMPIT (SMP Islam Terpadu)</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-medium"
            />
            <span>Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* REPORT CONTENT VIEW (VISIBLE IN BOTH SCREEN & PRINT) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 print:p-0 print:border-none print:shadow-none">
        
        {/* Official Letterhead (PrintHeader) */}
        <PrintHeader 
          setting={settings} 
          title={reportTitles[reportType]} 
          subtitle={selectedUnit === 'SEMUA' ? 'Seluruh Unit SIT Insan Harapan Batam' : `Unit ${selectedUnit}`}
          period={`${startDate} s/d ${endDate}`}
        />

        {/* TABLE 1: KUNJUNGAN */}
        {reportType === 'kunjungan' && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 font-bold text-slate-800 text-[11px] uppercase">
                  <th className="py-2.5 px-3 border border-slate-200">No</th>
                  <th className="py-2.5 px-3 border border-slate-200">Waktu Masuk</th>
                  <th className="py-2.5 px-3 border border-slate-200">Nama Siswa & NIS</th>
                  <th className="py-2.5 px-3 border border-slate-200">Kelas</th>
                  <th className="py-2.5 px-3 border border-slate-200">Keluhan</th>
                  <th className="py-2.5 px-3 border border-slate-200">Pertolongan Pertama</th>
                  <th className="py-2.5 px-3 border border-slate-200">Status Akhir</th>
                  <th className="py-2.5 px-3 border border-slate-200">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportVisits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data kunjungan pada periode ini.
                    </td>
                  </tr>
                ) : (
                  reportVisits.map((v, i) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 border border-slate-200 text-center">{i + 1}</td>
                      <td className="py-2 px-3 border border-slate-200 whitespace-nowrap">{v.waktuMasuk}</td>
                      <td className="py-2 px-3 border border-slate-200 font-bold text-slate-900">
                        {v.studentNama} <span className="font-normal text-slate-500">({v.studentNis})</span>
                      </td>
                      <td className="py-2 px-3 border border-slate-200">{v.jenjang} - {v.kelas}</td>
                      <td className="py-2 px-3 border border-slate-200">{v.keluhan}</td>
                      <td className="py-2 px-3 border border-slate-200">{v.pertolonganPertama}</td>
                      <td className="py-2 px-3 border border-slate-200 font-semibold">{v.status.replace(/_/g, ' ')}</td>
                      <td className="py-2 px-3 border border-slate-200">{v.petugas}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE 2: RUJUKAN & PENJEMPUTAN */}
        {reportType === 'rujukan' && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 font-bold text-slate-800 text-[11px] uppercase">
                  <th className="py-2.5 px-3 border border-slate-200">No</th>
                  <th className="py-2.5 px-3 border border-slate-200">Waktu</th>
                  <th className="py-2.5 px-3 border border-slate-200">Nama Siswa</th>
                  <th className="py-2.5 px-3 border border-slate-200">Kelas</th>
                  <th className="py-2.5 px-3 border border-slate-200">Keluhan & Kondisi</th>
                  <th className="py-2.5 px-3 border border-slate-200">Tindakan Rujukan / Penjemputan</th>
                  <th className="py-2.5 px-3 border border-slate-200">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Alhamdulillah tidak ada rujukan gawat darurat pada periode ini.
                    </td>
                  </tr>
                ) : (
                  reportReferrals.map((v, i) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 border border-slate-200 text-center">{i + 1}</td>
                      <td className="py-2 px-3 border border-slate-200 whitespace-nowrap">{v.waktuMasuk}</td>
                      <td className="py-2 px-3 border border-slate-200 font-bold text-slate-900">{v.studentNama}</td>
                      <td className="py-2 px-3 border border-slate-200">{v.jenjang} - {v.kelas}</td>
                      <td className="py-2 px-3 border border-slate-200">{v.keluhan}</td>
                      <td className="py-2 px-3 border border-slate-200 font-semibold text-rose-800">
                        {v.status === 'dirujuk_ke_faskes' ? 'Dirujuk ke Faskes' : 'Dijemput Orang Tua'} ({v.catatan || 'Ditangani sesuai SOP'})
                      </td>
                      <td className="py-2 px-3 border border-slate-200">{v.petugas}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE 3: SKRINING KESEHATAN */}
        {reportType === 'skrining' && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 font-bold text-slate-800 text-[11px] uppercase">
                  <th className="py-2.5 px-3 border border-slate-200">No</th>
                  <th className="py-2.5 px-3 border border-slate-200">Nama Siswa</th>
                  <th className="py-2.5 px-3 border border-slate-200">Kelas</th>
                  <th className="py-2.5 px-3 border border-slate-200">TB (cm)</th>
                  <th className="py-2.5 px-3 border border-slate-200">BB (kg)</th>
                  <th className="py-2.5 px-3 border border-slate-200">IMT & Gizi</th>
                  <th className="py-2.5 px-3 border border-slate-200">Mata & Gigi</th>
                  <th className="py-2.5 px-3 border border-slate-200">Rekomendasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportScreenings.map((sc, i) => (
                  <tr key={sc.id}>
                    <td className="py-2 px-3 border border-slate-200 text-center">{i + 1}</td>
                    <td className="py-2 px-3 border border-slate-200 font-bold">{sc.studentNama}</td>
                    <td className="py-2 px-3 border border-slate-200">{sc.jenjang} - {sc.kelas}</td>
                    <td className="py-2 px-3 border border-slate-200 text-center">{sc.tinggiBadan}</td>
                    <td className="py-2 px-3 border border-slate-200 text-center">{sc.beratBadan}</td>
                    <td className="py-2 px-3 border border-slate-200">{sc.imt} ({sc.statusGizi})</td>
                    <td className="py-2 px-3 border border-slate-200">{sc.kesehatanGigiMulut}</td>
                    <td className="py-2 px-3 border border-slate-200">{sc.rekomendasiTindakLanjut || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE 4: INVENTARIS */}
        {reportType === 'inventaris' && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 font-bold text-slate-800 text-[11px] uppercase">
                  <th className="py-2.5 px-3 border border-slate-200">No</th>
                  <th className="py-2.5 px-3 border border-slate-200">Nama Obat / Alat Medis</th>
                  <th className="py-2.5 px-3 border border-slate-200">Kategori</th>
                  <th className="py-2.5 px-3 border border-slate-200">Stok Tersedia</th>
                  <th className="py-2.5 px-3 border border-slate-200">Batas Min</th>
                  <th className="py-2.5 px-3 border border-slate-200">Tgl Kadaluwarsa</th>
                  <th className="py-2.5 px-3 border border-slate-200">Sumber Pengadaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportMedicines.map((m, i) => (
                  <tr key={m.id}>
                    <td className="py-2 px-3 border border-slate-200 text-center">{i + 1}</td>
                    <td className="py-2 px-3 border border-slate-200 font-bold">{m.namaBarang}</td>
                    <td className="py-2 px-3 border border-slate-200">{m.kategori}</td>
                    <td className="py-2 px-3 border border-slate-200 font-bold">{m.jumlahStok} {m.satuan}</td>
                    <td className="py-2 px-3 border border-slate-200">{m.stokMinimum} {m.satuan}</td>
                    <td className="py-2 px-3 border border-slate-200">{m.tanggalKadaluwarsa}</td>
                    <td className="py-2 px-3 border border-slate-200">{m.sumberPengadaan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLE 5: PROGRAM */}
        {reportType === 'program' && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 font-bold text-slate-800 text-[11px] uppercase">
                  <th className="py-2.5 px-3 border border-slate-200">No</th>
                  <th className="py-2.5 px-3 border border-slate-200">Nama Kegiatan</th>
                  <th className="py-2.5 px-3 border border-slate-200">Kategori</th>
                  <th className="py-2.5 px-3 border border-slate-200">Tanggal</th>
                  <th className="py-2.5 px-3 border border-slate-200">Sasaran & Peserta</th>
                  <th className="py-2.5 px-3 border border-slate-200">Penanggung Jawab</th>
                  <th className="py-2.5 px-3 border border-slate-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {programs.map((p, i) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3 border border-slate-200 text-center">{i + 1}</td>
                    <td className="py-2 px-3 border border-slate-200 font-bold">{p.namaKegiatan}</td>
                    <td className="py-2 px-3 border border-slate-200">{p.jenisProgram}</td>
                    <td className="py-2 px-3 border border-slate-200">{p.tanggal}</td>
                    <td className="py-2 px-3 border border-slate-200">{p.sasaran} ({p.jumlahPeserta} anak)</td>
                    <td className="py-2 px-3 border border-slate-200">{p.penanggungJawab}</td>
                    <td className="py-2 px-3 border border-slate-200 font-semibold">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signature Section for Print */}
        <div className="mt-12 pt-4 flex justify-between items-end text-xs text-slate-800">
          <div>
            <p className="text-[11px] text-slate-500">
              Dokumen resmi Sistem UKS Digital SIT Insan Harapan Batam.<br />
              Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
            </p>
          </div>

          <div className="text-center w-64">
            <p>Batam, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-semibold text-slate-700 mt-1">Koordinator UKS SIT Insan Harapan</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-900">{settings.kontakPetugasUks.split('(')[1]?.replace(')', '') || 'Ns. Siti Rahmawati, S.Kep'}</p>
            <p className="text-[11px] text-slate-500">NIPY. 2019.08.042</p>
          </div>
        </div>

      </div>

    </div>
  );
};
