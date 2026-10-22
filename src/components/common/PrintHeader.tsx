import React from 'react';
import { SchoolSetting } from '../../types/uks';

interface PrintHeaderProps {
  setting: SchoolSetting;
  title: string;
  subtitle?: string;
  period?: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ setting, title, subtitle, period }) => {
  return (
    <div className="border-b-2 border-slate-900 pb-3 mb-6">
      <div className="flex items-center gap-4">
        {/* Emblem / Logo */}
        <div className="w-16 h-16 rounded-xl bg-emerald-700 text-white flex flex-col items-center justify-center font-bold shadow-sm shrink-0">
          <span className="text-xs uppercase tracking-tighter text-emerald-200">SIT</span>
          <span className="text-lg leading-tight font-black">IH</span>
          <span className="text-[9px] uppercase tracking-widest text-emerald-200">Batam</span>
        </div>

        {/* Institution Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            {setting.yayasanName}
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase leading-snug">
            {setting.schoolName}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            {setting.alamat} | Telp: {setting.telepon}
          </p>
          <p className="text-[11px] text-emerald-700 italic font-semibold">
            Unit Layanan: Usaha Kesehatan Sekolah (UKS) Digital • &ldquo;{setting.tagline}&rdquo;
          </p>
        </div>
      </div>

      {/* Decorative double rule */}
      <div className="mt-3 pt-2 border-t border-slate-400 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-700">
        <div>
          <span className="font-bold uppercase text-slate-900">{title}</span>
          {subtitle && <span className="ml-2 text-slate-600">({subtitle})</span>}
        </div>
        {period && (
          <div className="text-slate-500 font-medium">
            Periode: <span className="font-semibold text-slate-800">{period}</span>
          </div>
        )}
      </div>
    </div>
  );
};
