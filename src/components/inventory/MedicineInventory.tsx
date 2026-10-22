import React, { useState, useMemo } from 'react';
import { 
  Pill, 
  Plus, 
  Search, 
  AlertTriangle, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight, 
  History, 
  PackageCheck, 
  X, 
  FileSpreadsheet,
  CheckCircle,
  ShieldCheck,
  Building,
  Calendar
} from 'lucide-react';
import { MedicineItem, InventoryLog } from '../../types/uks';
import { useAuth } from '../../context/AuthContext';

interface MedicineInventoryProps {
  medicines: MedicineItem[];
  inventoryLogs: InventoryLog[];
  onSaveMedicine: (item: MedicineItem) => Promise<void>;
  onAdjustStock: (itemId: string, qty: number, jenis: 'masuk' | 'keluar', ket: string) => Promise<void>;
}

export const MedicineInventory: React.FC<MedicineInventoryProps> = ({
  medicines,
  inventoryLogs,
  onSaveMedicine,
  onAdjustStock,
}) => {
  const { currentUser } = useAuth();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [activeTab, setActiveTab] = useState<'daftar_obat' | 'riwayat_mutasi' | 'rekap_pengadaan'>('daftar_obat');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedMedicineForAdjust, setSelectedMedicineForAdjust] = useState<MedicineItem | null>(null);

  // Form add state
  const [formData, setFormData] = useState<Partial<MedicineItem>>({
    kategori: 'Obat Bebas',
    satuan: 'botol',
    jumlahStok: 10,
    stokMinimum: 5,
    tanggalMasuk: new Date().toISOString().substring(0, 10),
    tanggalKadaluwarsa: '2028-01-01',
    sumberPengadaan: 'Pengadaan Rutin Yayasan',
    petugasPencatat: currentUser.displayName || 'Ns. Siti Rahmawati, S.Kep',
  });

  // Adjust state
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'masuk' | 'keluar'>('keluar');
  const [adjustNote, setAdjustNote] = useState<string>('');

  // 60-day expiry threshold
  const now = new Date();
  const sixtyDaysLater = new Date();
  sixtyDaysLater.setDate(now.getDate() + 60);

  // Warning lists
  const lowStockItems = useMemo(() => {
    return medicines.filter(m => m.jumlahStok <= m.stokMinimum);
  }, [medicines]);

  const expiringItems = useMemo(() => {
    return medicines.filter(m => {
      const exp = new Date(m.tanggalKadaluwarsa);
      return exp <= sixtyDaysLater;
    });
  }, [medicines]);

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => {
      const matchSearch = 
        m.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.nomorBatch && m.nomorBatch.toLowerCase().includes(searchTerm.toLowerCase())) ||
        m.sumberPengadaan.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = selectedCategory === 'SEMUA' || m.kategori === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [medicines, searchTerm, selectedCategory]);

  const handleOpenAdd = () => {
    setFormData({
      namaBarang: '',
      kategori: 'Obat Bebas',
      satuan: 'botol',
      jumlahStok: 10,
      stokMinimum: 5,
      tanggalMasuk: new Date().toISOString().substring(0, 10),
      tanggalKadaluwarsa: '2028-01-01',
      nomorBatch: `BTH-${Date.now().toString().substring(6)}`,
      sumberPengadaan: 'Pengadaan Rutin Yayasan',
      lokasiPenyimpanan: 'Lemari Obat Utama',
      petugasPencatat: currentUser.displayName || 'Ns. Siti Rahmawati, S.Kep',
      keterangan: '',
    });
    setIsAddOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaBarang || formData.jumlahStok === undefined) {
      alert('Mohon isi nama barang dan jumlah stok!');
      return;
    }

    const newItem: MedicineItem = {
      id: `med_${Date.now()}`,
      namaBarang: formData.namaBarang || '',
      kategori: formData.kategori || 'Obat Bebas',
      satuan: formData.satuan || 'pcs',
      jumlahStok: Number(formData.jumlahStok),
      stokMinimum: Number(formData.stokMinimum || 3),
      tanggalKadaluwarsa: formData.tanggalKadaluwarsa || '2028-01-01',
      nomorBatch: formData.nomorBatch || '',
      tanggalMasuk: formData.tanggalMasuk || new Date().toISOString().substring(0, 10),
      sumberPengadaan: formData.sumberPengadaan || 'Yayasan Harapan Ibu Kepri',
      lokasiPenyimpanan: formData.lokasiPenyimpanan || 'UKS',
      petugasPencatat: formData.petugasPencatat || currentUser.displayName,
      keterangan: formData.keterangan || '',
    };

    await onSaveMedicine(newItem);
    setIsAddOpen(false);
  };

  const handleOpenAdjust = (item: MedicineItem) => {
    setSelectedMedicineForAdjust(item);
    setAdjustQty(1);
    setAdjustType('keluar');
    setAdjustNote('Pemakaian pertolongan pertama siswa di UKS');
    setIsAdjustOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicineForAdjust || adjustQty <= 0) return;
    await onAdjustStock(selectedMedicineForAdjust.id, adjustQty, adjustType, adjustNote);
    setIsAdjustOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Pill className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Stok Obat & Perlengkapan UKS
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen inventaris obat bebas, antiseptik, perban P3K, alat medis, dan rekap mutasi stok
          </p>
        </div>

        {currentUser.role !== 'orang_tua' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm shadow-amber-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Tambah Item Obat / P3K
          </button>
        )}
      </div>

      {/* WARNING BANNERS */}
      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  {lowStockItems.length} Barang Menipis (Di Bawah Batas Minimum)
                </h3>
                <div className="mt-1 space-y-1 text-xs text-amber-900">
                  {lowStockItems.map(m => (
                    <div key={m.id} className="flex justify-between">
                      <span>• {m.namaBarang}</span>
                      <strong className="text-red-700">Sisa: {m.jumlahStok} {m.satuan} (Min: {m.stokMinimum})</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {expiringItems.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
              <Clock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                  {expiringItems.length} Barang Mendekati Tanggal Kedaluwarsa
                </h3>
                <div className="mt-1 space-y-1 text-xs text-rose-900">
                  {expiringItems.map(m => (
                    <div key={m.id} className="flex justify-between">
                      <span>• {m.namaBarang}</span>
                      <strong className="text-rose-700">Exp: {m.tanggalKadaluwarsa}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('daftar_obat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'daftar_obat' 
              ? 'bg-amber-100 text-amber-900' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Daftar Stok Tersedia ({medicines.length})
        </button>

        <button
          onClick={() => setActiveTab('riwayat_mutasi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'riwayat_mutasi' 
              ? 'bg-amber-100 text-amber-900' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Riwayat Keluar / Masuk ({inventoryLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('rekap_pengadaan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'rekap_pengadaan' 
              ? 'bg-amber-100 text-amber-900' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Rekap Kebutuhan Pengadaan
        </button>
      </div>

      {/* TAB 1: DAFTAR OBAT */}
      {activeTab === 'daftar_obat' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama obat, nomor batch, sumber..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-amber-500"
              >
                <option value="SEMUA">Semua Kategori</option>
                <option value="Obat Bebas">Obat Bebas</option>
                <option value="Obat Bebas Terbatas">Obat Bebas Terbatas</option>
                <option value="Obat Luar">Obat Luar</option>
                <option value="Perlengkapan P3K">Perlengkapan P3K</option>
                <option value="Alat Kesehatan">Alat Kesehatan</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Barang & Kategori</th>
                    <th className="py-3 px-4">Jumlah Stok</th>
                    <th className="py-3 px-4">Batas Minimum</th>
                    <th className="py-3 px-4">Tanggal Expired</th>
                    <th className="py-3 px-4">Batch & Pengadaan</th>
                    <th className="py-3 px-4 text-center">Mutasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredMedicines.map((m) => {
                    const isLow = m.jumlahStok <= m.stokMinimum;
                    const isExp = new Date(m.tanggalKadaluwarsa) <= sixtyDaysLater;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{m.namaBarang}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="px-2 py-0.2 rounded-md bg-slate-100 font-semibold">{m.kategori}</span>
                            <span>•</span>
                            <span>{m.lokasiPenyimpanan || 'Rak UKS'}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className={`font-black text-sm ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                            {m.jumlahStok} <span className="text-xs font-semibold text-slate-500">{m.satuan}</span>
                          </div>
                          {isLow && (
                            <span className="text-[10px] font-bold text-red-600 uppercase">
                              Stok Kritis
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {m.stokMinimum} {m.satuan}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className={`font-bold ${isExp ? 'text-rose-600' : 'text-slate-700'}`}>
                            {m.tanggalKadaluwarsa}
                          </div>
                          {isExp && (
                            <span className="text-[10px] font-bold text-rose-600">
                              Dekat Kadaluwarsa
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{m.sumberPengadaan}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Batch: {m.nomorBatch || '-'} • Masuk: {m.tanggalMasuk}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenAdjust(m)}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition-colors"
                          >
                            Ubah Stok
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT MUTASI STOK */}
      {activeTab === 'riwayat_mutasi' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Riwayat Barang Masuk dan Keluar (Log Transaksi UKS)
            </h3>
            <span className="text-xs text-slate-500">Total {inventoryLogs.length} transaksi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama Barang</th>
                  <th className="py-3 px-4">Jenis Transaksi</th>
                  <th className="py-3 px-4">Jumlah</th>
                  <th className="py-3 px-4">Keterangan Penggunaan</th>
                  <th className="py-3 px-4">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-700">{log.tanggal}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.namaBarang}</td>
                    <td className="py-3 px-4">
                      {log.jenis === 'masuk' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <ArrowDownRight className="w-3 h-3" /> Barang Masuk
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <ArrowUpRight className="w-3 h-3" /> Pemakaian Keluar
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.jumlah}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{log.keterangan}</td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{log.petugas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REKAP KEBUTUHAN PENGADAAN */}
      {activeTab === 'rekap_pengadaan' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Rekap Usulan Pengadaan Obat & Perlengkapan UKS
              </h3>
              <p className="text-xs text-slate-500">
                Daftar barang yang perlu segera dipesan atau diajukan ke Bagian Sarpras Yayasan Harapan Ibu Kepri
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs"
            >
              Cetak Usulan Pengadaan
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-800">Semua Stok Obat Aman</p>
              <p className="text-xs text-slate-400">Seluruh persediaan obat dan perlengkapan berada di atas batas minimum.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map(item => (
                <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.namaBarang}</h4>
                    <p className="text-slate-500 mt-0.5">Kategori: {item.kategori} • Sumber: {item.sumberPengadaan}</p>
                    <p className="text-amber-800 font-semibold mt-1">
                      Stok saat ini: {item.jumlahStok} {item.satuan} | Batas Minimum: {item.stokMinimum} {item.satuan}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-semibold">Rekomendasi Pemesanan:</span>
                    <span className="text-sm font-black text-emerald-700">
                      +{(item.stokMinimum * 2) - item.jumlahStok} {item.satuan}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: TAMBAH OBAT */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="p-6 bg-amber-600 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200">
                  Inventaris UKS
                </span>
                <h3 className="text-lg font-bold">Tambah Obat / Alat Medis</h3>
              </div>
              <button onClick={() => setIsAddOpen(false)}>
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Barang *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Paracetamol Sirup 120mg/5ml"
                  value={formData.namaBarang || ''}
                  onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={formData.kategori || 'Obat Bebas'}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Obat Bebas">Obat Bebas</option>
                    <option value="Obat Bebas Terbatas">Obat Bebas Terbatas</option>
                    <option value="Obat Luar">Obat Luar</option>
                    <option value="Perlengkapan P3K">Perlengkapan P3K</option>
                    <option value="Alat Kesehatan">Alat Kesehatan</option>
                    <option value="APD">APD</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    placeholder="botol, tablet, box, strip, pcs"
                    value={formData.satuan || ''}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah Stok Awal *</label>
                  <input
                    type="number"
                    required
                    value={formData.jumlahStok || 0}
                    onChange={(e) => setFormData({ ...formData, jumlahStok: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batas Minimum Stok *</label>
                  <input
                    type="number"
                    required
                    value={formData.stokMinimum || 3}
                    onChange={(e) => setFormData({ ...formData, stokMinimum: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Kedaluwarsa</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggalKadaluwarsa || ''}
                    onChange={(e) => setFormData({ ...formData, tanggalKadaluwarsa: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Batch</label>
                  <input
                    type="text"
                    value={formData.nomorBatch || ''}
                    onChange={(e) => setFormData({ ...formData, nomorBatch: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sumber Pengadaan</label>
                <input
                  type="text"
                  placeholder="Pengadaan Rutin Yayasan / Puskesmas / Donasi"
                  value={formData.sumberPengadaan || ''}
                  onChange={(e) => setFormData({ ...formData, sumberPengadaan: e.target.value })}
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
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UBAH STOK (MUTASI) */}
      {isAdjustOpen && selectedMedicineForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700">Catat Mutasi Stok</span>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5">{selectedMedicineForAdjust.namaBarang}</h3>
              </div>
              <button onClick={() => setIsAdjustOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <p className="text-slate-600">
              Stok saat ini: <strong className="text-slate-900">{selectedMedicineForAdjust.jumlahStok} {selectedMedicineForAdjust.satuan}</strong>
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('keluar')}
                    className={`p-2.5 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      adjustType === 'keluar' ? 'bg-amber-100 border-amber-300 text-amber-900' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Pemakaian Keluar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('masuk')}
                    className={`p-2.5 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      adjustType === 'masuk' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" /> Pasokan Masuk
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jumlah ({selectedMedicineForAdjust.satuan})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan / Keperluan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Diberikan untuk siswa pusing di UKS"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
