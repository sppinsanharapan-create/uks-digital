import React, { useState } from 'react';
import { 
  HeartPulse, 
  ShieldAlert, 
  Bell, 
  ChevronDown, 
  LogOut, 
  LogIn, 
  Check, 
  Menu,
  Sparkles,
  School,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, SchoolSetting, ParentNotification } from '../../types/uks';
import { EmergencyModal } from '../common/EmergencyModal';

interface NavbarProps {
  onToggleSidebar: () => void;
  settings: SchoolSetting;
  unreadNotifsCount: number;
  notifications: ParentNotification[];
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onToggleSidebar, 
  settings, 
  unreadNotifsCount, 
  notifications,
  onOpenNotifications 
}) => {
  const { currentUser, switchRole, loginWithGoogle, logout, firebaseUser } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'super_admin', label: 'Super Admin Yayasan', desc: 'Akses penuh yayasan & seluruh unit' },
    { role: 'admin_uks', label: 'Admin UKS / Petugas Medis', desc: 'Pelayanan medis, obat & kunjungan' },
    { role: 'guru', label: 'Guru / Wali Kelas', desc: 'Pemantauan siswa kelas binaan' },
    { role: 'kepala_sekolah', label: 'Kepala Sekolah', desc: 'Monitoring statistik & program unit' },
    { role: 'orang_tua', label: 'Orang Tua / Wali Murid', desc: 'Info & status kesehatan ananda' },
  ];

  const currentRoleInfo = rolesList.find(r => r.role === currentUser.role) || rolesList[1];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            
            {/* Left: Mobile Toggle & Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
                aria-label="Buka Menu Navigasi"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-linear-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-700/20 shrink-0">
                  <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                      UKS DIGITAL
                    </span>
                    <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                      Sistem Terpadu
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-1 truncate max-w-[210px] sm:max-w-none">
                    <School className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{settings.schoolName}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Actions, Notification, Role & Emergency */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Emergency SOS Button */}
              <button
                onClick={() => setEmergencyOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse"
                title="Protokol Kedaruratan Medis UKS"
              >
                <ShieldAlert className="w-4 h-4 text-white" />
                <span className="hidden md:inline">SOS DARURAT</span>
                <span className="md:hidden">SOS</span>
              </button>

              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200"
                  title="Pemberitahuan Kesehatan"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popup */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-700" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Pemberitahuan Terbaru ({notifications.length})
                        </h4>
                      </div>
                      <button 
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400">
                          Belum ada pemberitahuan baru.
                        </div>
                      ) : (
                        notifications.slice(0, 4).map(n => (
                          <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                              <span className="truncate max-w-[200px]">{n.studentNama}</span>
                              <span className="text-[10px] font-normal text-slate-400">{n.timestamp}</span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">
                              {n.judul}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="px-3 pt-2.5 border-t border-slate-100 text-center">
                      <button
                        onClick={() => {
                          setNotifDropdownOpen(false);
                          onOpenNotifications();
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1 w-full py-1 rounded-lg hover:bg-emerald-50"
                      >
                        <span>Lihat Seluruh Notifikasi</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile & Role Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-slate-50 transition-all shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.displayName.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                      {currentUser.displayName}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-700">
                      {currentRoleInfo.label}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Profil & Akun
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {currentUser.displayName}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {currentUser.email}
                      </div>
                      <div className="mt-1.5 inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {currentRoleInfo.label}
                      </div>
                    </div>

                    {/* Role Switcher */}
                    <div className="px-3 py-2">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Ganti Peran Pengguna:
                      </div>
                      <div className="space-y-1">
                        {rolesList.map((item) => (
                          <button
                            key={item.role}
                            onClick={() => {
                              switchRole(item.role);
                              setRoleMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                              currentUser.role === item.role 
                                ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200' 
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{item.label}</span>
                                {currentUser.role === item.role && (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {item.desc}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 px-3 pt-2">
                      {!firebaseUser ? (
                        <button
                          onClick={() => {
                            loginWithGoogle();
                            setRoleMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <LogIn className="w-4 h-4 text-emerald-600" />
                          Masuk dengan Akun Google
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            logout();
                            setRoleMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-red-600" />
                          Keluar Sesi
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Emergency Protocol Modal */}
      <EmergencyModal 
        isOpen={emergencyOpen} 
        onClose={() => setEmergencyOpen(false)} 
        settings={settings} 
      />
    </>
  );
};
