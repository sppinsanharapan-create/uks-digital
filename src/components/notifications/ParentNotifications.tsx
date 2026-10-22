import React, { useState } from 'react';
import { 
  BellRing, 
  Send, 
  MessageCircle, 
  Mail, 
  CheckCheck, 
  Clock, 
  Search, 
  Plus, 
  User, 
  X,
  Sparkles
} from 'lucide-react';
import { ParentNotification, Student } from '../../types/uks';
import { useAuth } from '../../context/AuthContext';

interface ParentNotificationsProps {
  notifications: ParentNotification[];
  students: Student[];
  onSendNotification: (notif: Omit<ParentNotification, 'id' | 'timestamp' | 'dibaca'>) => Promise<void>;
}

export const ParentNotifications: React.FC<ParentNotificationsProps> = ({
  notifications,
  students,
  onSendNotification,
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Compose State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std_01');
  const [templateType, setTemplateType] = useState<'kunjungan' | 'jemput' | 'rujukan' | 'skrining' | 'program'>('kunjungan');
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const templates = {
    kunjungan: {
      judul: 'Informasi Kunjungan UKS: Siswa Sedang Beristirahat',
      pesan: (nama: string, wali: string, kelas: string) => 
        `Assalamu’alaikum Warahmatullahi Wabarakatuh.\n\nYth. Bapak/Ibu ${wali},\nKami menginformasikan bahwa ananda ${nama} (${kelas}) saat ini sedang berada di Ruang UKS Insan Harapan untuk beristirahat dan dipantau oleh tim medis sekolah. Ananda dalam penanganan baik. Jika kondisi belum membaik, kami akan menghubungi kembali.\n\nWassalamu’alaikum,\nTim UKS SIT Insan Harapan Batam`,
    },
    jemput: {
      judul: 'Pemberitahuan Penjemputan Siswa dari Ruang UKS',
      pesan: (nama: string, wali: string, kelas: string) => 
        `Assalamu’alaikum Warahmatullahi Wabarakatuh.\n\nYth. Bapak/Ibu ${wali},\nBerdasarkan observasi kesehatan di ruang UKS, ananda ${nama} (${kelas}) disarankan untuk pulang dan beristirahat di rumah. Mohon kesediaannya untuk dapat menjemput ananda di Ruang UKS Insan Harapan.\n\nKonfirmasi penjemputan dapat membalas pesan ini.\nTim UKS SIT Insan Harapan Batam`,
    },
    rujukan: {
      judul: 'Pemberitahuan Rekomendasi Rujukan Medis Lanjutan',
      pesan: (nama: string, wali: string, kelas: string) => 
        `Assalamu’alaikum Warahmatullahi Wabarakatuh.\n\nYth. Bapak/Ibu ${wali},\nTim UKS SIT Insan Harapan menginformasikan bahwa ananda ${nama} (${kelas}) telah menerima pertolongan pertama. Untuk memastikan penanganan tuntas, tim medis menyarankan ananda diperiksa lebih lanjut ke fasilitas kesehatan rujukan (Puskesmas/Dokter).\n\nTim UKS SIT Insan Harapan Batam`,
    },
    skrining: {
      judul: 'Pengumuman Jadwal Skrining Kesehatan Berkala Siswa',
      pesan: (nama: string, wali: string, kelas: string) => 
        `Assalamu’alaikum Warahmatullahi Wabarakatuh.\n\nYth. Seluruh Orang Tua / Wali Murid SIT Insan Harapan,\nInsya Allah sekolah akan menyelenggarakan Pemeriksaan Kesehatan Berkala dan Skrining Gigi bersama Tim Puskesmas pada pekan ini. Mohon ananda sarapan bergizi dari rumah dan memotong kuku rapi.\n\nTim UKS SIT Insan Harapan Batam`,
    },
    program: {
      judul: 'Undangan Kegiatan Edukasi Pola Hidup Bersih & Sehat (PHBS)',
      pesan: (nama: string, wali: string, kelas: string) => 
        `Bismillaah. Mari bersama wujudkan generasi sehat dan cerdas dengan membiasakan bekal bergizi seimbang halal-thayyib dan cuci tangan pakai sabun.\n\nSIT Insan Harapan Batam - Sehat Siswanya, Hebat Generasinya.`,
    },
  };

  const handleApplyTemplate = (type: keyof typeof templates) => {
    setTemplateType(type);
    const tmpl = templates[type];
    setCustomTitle(tmpl.judul);
    setCustomMessage(tmpl.pesan(currentStudent?.namaLengkap || 'Siswa', currentStudent?.namaWali || 'Wali Murid', currentStudent?.kelas || ''));
  };

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const target = students.find(s => s.id === id);
    if (target) {
      const tmpl = templates[templateType];
      setCustomMessage(tmpl.pesan(target.namaLengkap, target.namaWali, target.kelas));
    }
  };

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customMessage) {
      alert('Mohon isi judul dan pesan notifikasi!');
      return;
    }

    await onSendNotification({
      studentId: currentStudent.id,
      studentNama: currentStudent.namaLengkap,
      nis: currentStudent.nis,
      jenis: templateType,
      judul: customTitle,
      pesan: customMessage,
      nomorWali: currentStudent.noTeleponDarurat,
      statusKirim: 'Terkirim',
      channel: 'WhatsApp',
    });

    setIsComposeOpen(false);
  };

  const handleOpenWhatsApp = (notif: ParentNotification) => {
    const phone = notif.nomorWali.replace(/\D/g, '');
    const formatted = phone.startsWith('0') ? '62' + phone.substring(1) : phone;
    const text = encodeURIComponent(`*${notif.judul}*\n\n${notif.pesan}`);
    window.open(`https://wa.me/${formatted}?text=${text}`, '_blank');
  };

  const filtered = notifications.filter(n =>
    n.studentNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.pesan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
              <BellRing className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pemberitahuan & Notifikasi Orang Tua
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Saluran komunikasi resmi UKS ke wali murid via WhatsApp resmi, Email, dan Dashboard
          </p>
        </div>

        {currentUser.role !== 'orang_tua' && (
          <button
            onClick={() => {
              handleApplyTemplate('kunjungan');
              setIsComposeOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Send className="w-4 h-4" />
            Kirim Notifikasi Baru
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari notifikasi, santri, atau isi pesan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-indigo-500"
          />
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {filtered.map(notif => (
          <div key={notif.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  notif.jenis === 'jemput' ? 'bg-amber-100 text-amber-800' :
                  notif.jenis === 'rujukan' ? 'bg-red-100 text-red-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {notif.jenis.toUpperCase()}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{notif.judul}</h3>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{notif.timestamp}</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              {notif.pesan}
            </p>

            <div className="flex flex-wrap items-center justify-between text-xs pt-1">
              <div className="text-slate-500 text-[11px]">
                Tujuan: <strong className="text-slate-800">{notif.studentNama}</strong> (No. HP: {notif.nomorWali}) • Saluran: <span className="font-semibold text-emerald-700">{notif.channel}</span>
              </div>

              <button
                onClick={() => handleOpenWhatsApp(notif)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Buka di WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: COMPOSE NOTIFICATION */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="p-6 bg-indigo-700 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">
                  Komunikasi Wali Murid
                </span>
                <h3 className="text-lg font-bold">Kirim Pemberitahuan Kesehatan</h3>
              </div>
              <button onClick={() => setIsComposeOpen(false)}>
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSendSubmit} className="p-6 space-y-4 text-xs">
              
              {/* Select Student */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Santri *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-indigo-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.namaLengkap} ({s.jenjang} - {s.kelas}) • Wali: {s.namaWali} ({s.noTeleponDarurat})
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Buttons */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Gunakan Template Pesan Resmi:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'kunjungan', label: 'Di UKS Dipantau' },
                    { key: 'jemput', label: 'Perlu Dijemput' },
                    { key: 'rujukan', label: 'Rekomendasi Rujukan' },
                    { key: 'skrining', label: 'Jadwal Skrining' },
                  ].map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => handleApplyTemplate(t.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                        templateType === t.key 
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-800' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Notifikasi *</label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Isi Pesan WhatsApp / SMS *</label>
                <textarea
                  rows={5}
                  required
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Kirim Pesan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
