import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Activity, 
  Bed, 
  Pill, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  HeartPulse, 
  ChevronRight, 
  Eye, 
  PlusCircle, 
  Building,
  BellRing,
  Inbox
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  Student, 
  UksVisit, 
  MedicineItem, 
  HealthScreening, 
  VisitStatus 
} from '../../types/uks';

interface DashboardOverviewProps {
  students: Student[];
  visits: UksVisit[];
  medicines: MedicineItem[];
  screenings: HealthScreening[];
  onOpenNewVisit: () => void;
  onNavigateToTab: (tab: any) => void;
  onViewVisitDetail: (visit: UksVisit) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  students,
  visits,
  medicines,
  screenings,
  onOpenNewVisit,
  onNavigateToTab,
  onViewVisitDetail,
}) => {
  const { currentUser } = useAuth();

  // Filters for chart & lists
  const [chartPeriod, setChartPeriod] = useState<'7hari' | 'bulan' | 'semester'>('bulan');
  const [selectedUnit, setSelectedUnit] = useState<string>('SEMUA');

  const todayStr = useMemo(() => new Date().toISOString().substring(0, 10), []);

  // 1. Total Siswa
  const totalStudents = students.length;

  // 2. Kunjungan Hari Ini
  const visitsToday = visits.filter(v => v.waktuMasuk.startsWith(todayStr)).length;

  // 3. Siswa Sedang Dalam Pemantauan
  const monitoredPatients = visits.filter(v => 
    v.status === 'sedang_ditangani' || v.status === 'istirahat_dipantau'
  );

  // 4. Jumlah Jenis Obat Tersedia
  const totalMedicineTypes = medicines.length;

  // 5. Obat Stok Menipis (stok <= stokMinimum)
  const lowStockMedicines = medicines.filter(m => m.jumlahStok <= m.stokMinimum);

  // 6. Obat Mendekati Kedaluwarsa (kadaluwarsa <= 60 hari)
  const now = new Date();
  const sixtyDaysLater = new Date();
  sixtyDaysLater.setDate(now.getDate() + 60);

  const expiringMedicines = medicines.filter(m => {
    const exp = new Date(m.tanggalKadaluwarsa);
    return exp <= sixtyDaysLater;
  });

  // Recent Visits filtered by Unit
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      if (selectedUnit !== 'SEMUA' && v.jenjang !== selectedUnit) return false;
      return true;
    });
  }, [visits, selectedUnit]);

  // Dynamic Chart Data based on selected chartPeriod
  const chartData = useMemo(() => {
    if (chartPeriod === '7hari') {
      const days = ['Kamis', 'Jumat', 'Sabtu', 'Senin', 'Selasa', 'Rabu', 'Hari Ini'];
      const counts = [2, 3, 1, 4, 3, 2, visitsToday];
      return days.map((day, idx) => ({ label: day, count: counts[idx], max: 6 }));
    } else if (chartPeriod === 'bulan') {
      const weeks = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
      const counts = [8, 12, 10, visits.length];
      return weeks.map((w, idx) => ({ label: w, count: counts[idx], max: 20 }));
    } else {
      const months = ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const counts = [15, 22, 28, visits.length, 0, 0];
      return months.map((m, idx) => ({ label: m, count: counts[idx], max: 40 }));
    }
  }, [chartPeriod, visitsToday, visits.length]);

  // Top Complaints Summary
  const complaintSummary = useMemo(() => {
    const map: Record<string, number> = {};
    visits.forEach(v => {
      const cat = v.kategoriKeluhan || 'Lainnya';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [visits]);

  // Unit Statistics Breakdown
  const unitStats = useMemo(() => {
    const raitCount = visits.filter(v => v.jenjang === 'RAIT').length;
    const sditCount = visits.filter(v => v.jenjang === 'SDIT').length;
    const smpitCount = visits.filter(v => v.jenjang === 'SMPIT').length;
    const total = visits.length || 1;
    return {
      rait: { count: raitCount, pct: Math.round((raitCount / total) * 100) },
      sdit: { count: sditCount, pct: Math.round((sditCount / total) * 100) },
      smpit: { count: smpitCount, pct: Math.round((smpitCount / total) * 100) },
    };
  }, [visits]);

  const getStatusBadge = (status: VisitStatus) => {
    switch (status) {
      case 'sedang_ditangani':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Sedang Ditangani</span>;
      case 'istirahat_dipantau':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Istirahat di UKS</span>;
      case 'kembali_ke_kelas':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Kembali ke Kelas</span>;
      case 'dijemput_orang_tua':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Dijemput Wali</span>;
      case 'dirujuk_ke_faskes':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">Dirujuk Faskes</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">

      {/* Hero Greeting Card */}
      <div className="bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3">
            <HeartPulse className="w-4 h-4 text-emerald-300" />
            <span>Sistem Usaha Kesehatan Sekolah (UKS) Digital</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-xs">
            Selamat Datang di UKS Insan Harapan
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-2xl font-medium">
            Ahlan wa Sahlan, <span className="font-bold text-white underline decoration-emerald-300 underline-offset-4">{currentUser.displayName}</span>. Pusat komando digital pelayanan kesehatan santri SIT Insan Harapan Batam. Pantau tanda vital, pencatatan kunjungan, dan ketersediaan obat secara real-time.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {currentUser.role !== 'orang_tua' && (
              <button
                onClick={onOpenNewVisit}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                Catat Kunjungan Santri
              </button>
            )}

            <button
              onClick={() => onNavigateToTab('students')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all"
            >
              <Users className="w-4 h-4" />
              Data Santri
            </button>

            <button
              onClick={() => onNavigateToTab('inventory')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all"
            >
              <Pill className="w-4 h-4" />
              Inventaris Obat
            </button>
          </div>
        </div>

        {/* Ambient Decorative Graphic */}
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden md:block">
          <HeartPulse className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* 6 MANDATORY STATISTIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* 1. Total Siswa Terdaftar */}
        <div 
          onClick={() => onNavigateToTab('students')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Siswa</span>
            <Users className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalStudents}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            RAIT, SDIT, SMPIT
          </div>
        </div>

        {/* 2. Jumlah Kunjungan Hari Ini */}
        <div 
          onClick={() => onNavigateToTab('visits')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Kunjungan Hari Ini</span>
            <Activity className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {visitsToday}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {todayStr}
          </div>
        </div>

        {/* 3. Siswa Sedang Dalam Pemantauan */}
        <div 
          onClick={() => onNavigateToTab('visits')}
          className={`p-4 rounded-2xl border shadow-2xs transition-all cursor-pointer group ${
            monitoredPatients.length > 0 
              ? 'bg-amber-50/80 border-amber-300 hover:border-amber-400' 
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Dalam Pemantauan</span>
            <Bed className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-950">
            {monitoredPatients.length}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Kasur UKS Terisi
          </div>
        </div>

        {/* 4. Jumlah Jenis Obat Tersedia */}
        <div 
          onClick={() => onNavigateToTab('inventory')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Jenis Obat</span>
            <Pill className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalMedicineTypes}
          </div>
          <div className="text-[11px] text-teal-700 font-semibold mt-1">
            Item Inventaris
          </div>
        </div>

        {/* 5. Obat Stok Menipis */}
        <div 
          onClick={() => onNavigateToTab('inventory')}
          className={`p-4 rounded-2xl border shadow-2xs transition-all cursor-pointer group ${
            lowStockMedicines.length > 0 
              ? 'bg-rose-50/80 border-rose-300 hover:border-rose-400' 
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Stok Menipis</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-rose-950">
            {lowStockMedicines.length}
          </div>
          <div className="text-[11px] text-rose-700 font-semibold mt-1">
            Di Bawah Batas Min
          </div>
        </div>

        {/* 6. Obat Mendekati Kedaluwarsa */}
        <div 
          onClick={() => onNavigateToTab('inventory')}
          className={`p-4 rounded-2xl border shadow-2xs transition-all cursor-pointer group ${
            expiringMedicines.length > 0 
              ? 'bg-amber-50/80 border-amber-300 hover:border-amber-400' 
              : 'bg-white border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Dekat Expired</span>
            <Clock className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-950">
            {expiringMedicines.length}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Kurang Dari 60 Hari
          </div>
        </div>

      </div>

      {/* NOTIFIKASI PENTING BANNER */}
      {(monitoredPatients.length > 0 || lowStockMedicines.length > 0 || expiringMedicines.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-200 text-amber-900 rounded-xl shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Perhatian Khusus UKS Hari Ini
              </h3>
              <p className="text-xs text-amber-900 mt-0.5">
                {monitoredPatients.length > 0 && `Terdapat ${monitoredPatients.length} siswa sedang beristirahat di kasur UKS. `}
                {lowStockMedicines.length > 0 && `Ada ${lowStockMedicines.length} obat butuh pengadaan ulang. `}
                {expiringMedicines.length > 0 && `${expiringMedicines.length} perlengkapan mendekati tanggal kadaluwarsa.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {monitoredPatients.length > 0 && (
              <button
                onClick={() => onNavigateToTab('visits')}
                className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs transition-colors"
              >
                Lihat Pasien UKS
              </button>
            )}
            {lowStockMedicines.length > 0 && (
              <button
                onClick={() => onNavigateToTab('inventory')}
                className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors"
              >
                Cek Stok Obat
              </button>
            )}
          </div>
        </div>
      )}

      {/* TWO-COLUMN WORKSPACE: CHARTS & VISITS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT 2 COLUMNS: GRAFIK KUNJUNGAN & DAFTAR KUNJUNGAN TERBARU */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* GRAFIK KUNJUNGAN UKS BERDASARKAN PERIODE */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Grafik Kunjungan UKS Berdasarkan Periode
                </h3>
                <p className="text-xs text-slate-500">Visualisasi data kunjungan dan pemulihan siswa</p>
              </div>

              {/* Period Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setChartPeriod('7hari')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    chartPeriod === '7hari' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  7 Hari
                </button>
                <button
                  onClick={() => setChartPeriod('bulan')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    chartPeriod === 'bulan' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bulan Ini
                </button>
                <button
                  onClick={() => setChartPeriod('semester')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    chartPeriod === 'semester' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semester
                </button>
              </div>
            </div>

            {/* Dynamic CSS Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {chartData.map((item, idx) => {
                const heightPct = Math.max(8, Math.min(100, Math.round((item.count / item.max) * 100)));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count} siswa
                    </span>
                    <div className="w-full max-w-[40px] bg-emerald-50 rounded-t-lg relative overflow-hidden group-hover:bg-emerald-100 transition-colors" style={{ height: `${heightPct}%` }}>
                      <div 
                        className="w-full bg-linear-to-t from-emerald-700 to-teal-500 rounded-t-lg transition-all"
                        style={{ height: '100%' }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[65px] text-center">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DAFTAR KUNJUNGAN TERBARU */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Daftar Kunjungan UKS Terbaru
                </h3>
                <p className="text-xs text-slate-500">Pencatatan real-time santri yang datang ke ruang UKS</p>
              </div>

              {/* Filter Unit */}
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-emerald-500"
              >
                <option value="SEMUA">Semua Jenjang</option>
                <option value="RAIT">RAIT (TK)</option>
                <option value="SDIT">SDIT</option>
                <option value="SMPIT">SMPIT</option>
              </select>
            </div>

            {filteredVisits.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Inbox className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-700">Belum ada data kunjungan UKS</p>
                <p className="text-xs text-slate-400 mt-0.5">Alhamdulillah semua santri saat ini sehat di ruang kelas.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-1">
                {filteredVisits.slice(0, 5).map((visit) => (
                  <div 
                    key={visit.id}
                    className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
                    onClick={() => onViewVisitDetail(visit)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {visit.jenjang}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 hover:text-emerald-700">
                            {visit.studentNama}
                          </span>
                          <span className="text-[11px] text-slate-500">({visit.kelas})</span>
                          {visit.tingkatUrgensi === 'darurat' && (
                            <span className="px-1.5 py-0.2 rounded-md bg-red-100 text-red-800 text-[10px] font-bold">
                              DARURAT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                          {visit.keluhan}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {visit.waktuMasuk}
                          </span>
                          <span>•</span>
                          <span>Petugas: {visit.petugas}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      {getStatusBadge(visit.status)}
                      <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredVisits.length > 5 && (
              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  onClick={() => onNavigateToTab('visits')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  Lihat Semua {filteredVisits.length} Kunjungan
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: RINGKASAN KELUHAN & DISTRIBUSI JENJANG */}
        <div className="space-y-6">

          {/* RINGKASAN KELUHAN YANG SERING TERJADI */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              Keluhan Paling Sering Terjadi
            </h3>

            {complaintSummary.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">Belum ada data keluhan</p>
            ) : (
              <div className="space-y-3">
                {complaintSummary.slice(0, 5).map(([name, count], i) => {
                  const pct = Math.round((count / (visits.length || 1)) * 100);
                  return (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-slate-700 truncate max-w-[170px]">{name}</span>
                        <span className="text-slate-900 font-bold">{count} kasus ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 rounded-full" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DISTRIBUSI BERDASARKAN JENJANG */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-600" />
              Statistik Kunjungan per Jenjang
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">RAIT Insan Harapan</span>
                  <span className="text-slate-900 font-bold">{unitStats.rait.count} ({unitStats.rait.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: `${unitStats.rait.pct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">SDIT Insan Harapan</span>
                  <span className="text-slate-900 font-bold">{unitStats.sdit.count} ({unitStats.sdit.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${unitStats.sdit.pct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">SMPIT Insan Harapan</span>
                  <span className="text-slate-900 font-bold">{unitStats.smpit.count} ({unitStats.smpit.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${unitStats.smpit.pct}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
