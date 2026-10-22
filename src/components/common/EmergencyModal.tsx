import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, HeartPulse, X, CheckCircle } from 'lucide-react';
import { SchoolSetting } from '../../types/uks';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SchoolSetting;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, settings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border-2 border-red-500 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-linear-to-r from-red-600 to-rose-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">PROTOKOL KEDARURATAN MEDIS UKS</h2>
              <p className="text-xs text-red-100 font-medium">SIT Insan Harapan Batam • Tanggap Cepat & Rujukan</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Direct Hotline buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a 
              href="tel:119"
              className="flex items-center gap-3 p-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 transition-colors group"
            >
              <div className="p-3 bg-red-600 text-white rounded-xl group-hover:scale-105 transition-transform">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-red-700 uppercase tracking-wider">Hotline Ambulans Darurat</div>
                <div className="text-xl font-black text-red-950">119</div>
                <div className="text-[11px] text-slate-500">Nasional & Batam Emergency</div>
              </div>
            </a>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors">
              <div className="p-3 bg-amber-600 text-white rounded-xl">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Faskes Rujukan Terdekat</div>
                <div className="text-sm font-bold text-slate-900 leading-tight">{settings.puskesmasRujukan}</div>
                <div className="text-[11px] text-slate-600 mt-0.5">Kontak: {settings.teleponAmbulans}</div>
              </div>
            </div>
          </div>

          {/* Action Steps */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Urutan Langkah Penanganan Darurat:
            </h3>
            <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
              <li><strong className="text-slate-900">Nilai Kesadaran & Pernapasan (A-B-C):</strong> Pastikan jalan napas paten, pantau saturasi oksigen jika sesak.</li>
              <li><strong className="text-slate-900">Hubungi Petugas Medis UKS:</strong> Segera hubungi {settings.kontakPetugasUks}.</li>
              <li><strong className="text-slate-900">Kontak Orang Tua / Wali Segera:</strong> Jangan menunda komunikasi kondisi darurat siswa.</li>
              <li><strong className="text-slate-900">Persiapan Evakuasi / Ambulans:</strong> Jika henti napas, fraktur terbuka, atau penurunan kesadaran, langsung rujuk ke RSUD Embung Fatimah.</li>
              <li><strong className="text-slate-900">Laporkan ke Kepala Sekolah:</strong> Informasikan kronologi kepada penanggung jawab unit sekolah.</li>
            </ol>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Sistem UKS Digital membantu dokumentasi dan rujukan. <strong>Tindakan medis tidak boleh ditunda</strong> demi pengisian aplikasi. Tangani keselamatan siswa terlebih dahulu.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Tutup Protokol
          </button>
        </div>
      </div>
    </div>
  );
};
