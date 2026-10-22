import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Save, 
  Building, 
  Phone, 
  Mail, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  HeartHandshake,
  AlertTriangle
} from 'lucide-react';
import { SchoolSetting } from '../../types/uks';
import { useAuth } from '../../context/AuthContext';
import { UksDataService } from '../../services/uksService';

interface SystemSettingsProps {
  settings: SchoolSetting;
  onSaveSettings: (settings: SchoolSetting) => Promise<void>;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  settings,
  onSaveSettings,
}) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<SchoolSetting>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    const jsonStr = UksDataService.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_UKS_Insan_Harapan_Batam_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const ok = UksDataService.restoreAllDataJSON(text, {
          id: currentUser.id,
          name: currentUser.displayName,
          role: currentUser.role,
        });
        if (ok) {
          alert('Pencadangan berhasil dipulihkan! Sistem dimuat ulang.');
          window.location.reload();
        } else {
          alert('Gagal memulihkan file cadangan. Format JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetData = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh database UKS ke data contoh bawaan?')) {
      UksDataService.resetToSeedData({
        id: currentUser.id,
        name: currentUser.displayName,
        role: currentUser.role,
      });
      alert('Basis data telah diatur ulang ke data standar.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-slate-100 text-slate-800 rounded-xl">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pengaturan Sistem & Profil Lembaga
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi identitas yayasan, faskes rujukan Puskesmas, tahun ajaran aktif, dan pencadangan data
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Pengaturan berhasil disimpan!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT 2 COLUMNS: INSTITUTION FORM */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-700" />
              Identitas Lembaga & Kop Surat Resmi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Yayasan *</label>
                <input
                  type="text"
                  required
                  value={formData.yayasanName}
                  onChange={(e) => setFormData({ ...formData, yayasanName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Sekolah / Unit *</label>
                <input
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Slogan / Tagline UKS *</label>
                <input
                  type="text"
                  required
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tahun Ajaran Aktif *</label>
                <input
                  type="text"
                  required
                  value={formData.tahunAjaranAktif}
                  onChange={(e) => setFormData({ ...formData, tahunAjaranAktif: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap Kampus SIT Insan Harapan</label>
              <textarea
                rows={2}
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Telepon Sekolah / UKS</label>
                <input
                  type="text"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Resmi UKS</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
            </div>

            <h2 className="text-sm font-bold text-slate-900 pt-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Phone className="w-4 h-4 text-red-600" />
              Kontak Kedaruratan & Faskes Rujukan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Puskesmas / Klinik Rujukan Utama</label>
                <input
                  type="text"
                  value={formData.puskesmasRujukan}
                  onChange={(e) => setFormData({ ...formData, puskesmasRujukan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hotline Ambulans / RSUD Batam</label>
                <input
                  type="text"
                  value={formData.teleponAmbulans}
                  onChange={(e) => setFormData({ ...formData, teleponAmbulans: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Koordinator / Petugas Jaga UKS</label>
                <input
                  type="text"
                  value={formData.kontakPetugasUks}
                  onChange={(e) => setFormData({ ...formData, kontakPetugasUks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-2 shadow-sm shadow-emerald-700/20"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: BACKUP, RESTORE & GUIDE */}
        <div className="space-y-4">
          
          {/* Backup & Restore */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Pencadangan & Pemulihan Basis Data
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unduh salinan lengkap database dalam format JSON untuk arsip berkala, atau pulihkan dari cadangan sebelumnya.
            </p>

            <div className="space-y-2 pt-1">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportJSON} 
                accept=".json" 
                className="hidden" 
              />

              <button
                type="button"
                onClick={handleExportJSON}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                Unduh Cadangan JSON (Backup)
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                <Upload className="w-4 h-4 text-blue-700" />
                Pulihkan dari File JSON (Restore)
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetData}
                className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset ke Data Awal Bawaan
              </button>
            </div>
          </div>

          {/* User Guide Card */}
          <div className="bg-emerald-900 text-white p-5 rounded-2xl space-y-3 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Petunjuk Operasional UKS
            </h3>
            <ul className="text-xs text-emerald-100 space-y-2 list-disc list-inside leading-relaxed">
              <li>Pencatatan kunjungan menggunakan nomor otomatis harian.</li>
              <li>Peringatan alergi dan penyakit kronis muncul seketika saat nama siswa dipilih.</li>
              <li>Gunakan tombol WhatsApp untuk menghubungi wali murid dengan format resmi.</li>
              <li>Laporan dapat dicetak langsung dengan kop surat Yayasan Harapan Ibu Kepri.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
