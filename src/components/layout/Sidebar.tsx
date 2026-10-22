import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Stethoscope, 
  Pill, 
  FileSpreadsheet, 
  Settings,
  ShieldAlert, 
  BellRing, 
  CalendarCheck, 
  UserCheck, 
  History, 
  Heart,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/uks';

export type TabKey = 
  | 'dashboard'
  | 'students'
  | 'visits'
  | 'screenings'
  | 'inventory'
  | 'reports'
  | 'settings'
  | 'first_aid'
  | 'notifications'
  | 'programs'
  | 'users'
  | 'audit';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isOpen: boolean;
  onClose: () => void;
  activeVisitsCount: number;
  lowStockCount: number;
}

interface MenuItem {
  id: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
  badge?: number;
  badgeColor?: string;
  section?: 'utama' | 'tambahan';
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onSelectTab, 
  isOpen, 
  onClose,
  activeVisitsCount,
  lowStockCount
}) => {
  const { currentUser, hasPermission } = useAuth();

  // Primary 7 modules as requested in brief + 5 supporting modules
  const menuItems: MenuItem[] = [
    // Menu Utama
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['super_admin', 'admin_uks', 'guru', 'kepala_sekolah', 'orang_tua'],
      section: 'utama',
    },
    {
      id: 'students',
      label: 'Data Siswa',
      icon: Users,
      allowedRoles: ['super_admin', 'admin_uks', 'guru', 'kepala_sekolah'],
      section: 'utama',
    },
    {
      id: 'visits',
      label: 'Kunjungan UKS',
      icon: ClipboardList,
      allowedRoles: ['super_admin', 'admin_uks', 'guru', 'kepala_sekolah', 'orang_tua'],
      badge: activeVisitsCount > 0 ? activeVisitsCount : undefined,
      badgeColor: 'bg-emerald-500 text-white',
      section: 'utama',
    },
    {
      id: 'screenings',
      label: 'Pemeriksaan Kesehatan',
      icon: Stethoscope,
      allowedRoles: ['super_admin', 'admin_uks', 'guru', 'kepala_sekolah', 'orang_tua'],
      section: 'utama',
    },
    {
      id: 'inventory',
      label: 'Inventaris Obat & P3K',
      icon: Pill,
      allowedRoles: ['super_admin', 'admin_uks'],
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
      section: 'utama',
    },
    {
      id: 'reports',
      label: 'Laporan & Rekapitulasi',
      icon: FileSpreadsheet,
      allowedRoles: ['super_admin', 'admin_uks', 'kepala_sekolah', 'guru'],
      section: 'utama',
    },
    {
      id: 'settings',
      label: 'Pengaturan Sistem',
      icon: Settings,
      allowedRoles: ['super_admin', 'admin_uks'],
      section: 'utama',
    },

    // Layanan Lanjutan & Keamanan
    {
      id: 'first_aid',
      label: 'Pertolongan Pertama (SOS)',
      icon: ShieldAlert,
      allowedRoles: ['super_admin', 'admin_uks', 'guru', 'kepala_sekolah'],
      section: 'tambahan',
    },
    {
      id: 'notifications',
      label: 'Notifikasi Orang Tua',
      icon: BellRing,
      allowedRoles: ['super_admin', 'admin_uks', 'guru', 'orang_tua'],
      section: 'tambahan',
    },
    {
      id: 'programs',
      label: 'Program Kesehatan (PHBS)',
      icon: CalendarCheck,
      allowedRoles: ['super_admin', 'admin_uks', 'guru', 'kepala_sekolah'],
      section: 'tambahan',
    },
    {
      id: 'users',
      label: 'Manajemen Pengguna (RBAC)',
      icon: UserCheck,
      allowedRoles: ['super_admin'],
      section: 'tambahan',
    },
    {
      id: 'audit',
      label: 'Audit Log Aktivitas',
      icon: History,
      allowedRoles: ['super_admin', 'admin_uks'],
      section: 'tambahan',
    },
  ];

  const primaryItems = menuItems.filter(m => m.section === 'utama' && hasPermission(m.allowedRoles));
  const secondaryItems = menuItems.filter(m => m.section === 'tambahan' && hasPermission(m.allowedRoles));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sticky Desktop & Off-Canvas Mobile Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200/90
        flex flex-col transition-transform duration-300 ease-in-out shadow-xs
        lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:translate-x-0 lg:z-10 lg:rounded-2xl lg:my-6 lg:border lg:shadow-2xs
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Header in sidebar */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-600 fill-emerald-600" />
            <span className="font-bold text-slate-800 text-sm">UKS Insan Harapan</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
          
          {/* Section: Menu Utama */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Utama
            </div>
            <div className="space-y-1">
              {primaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold
                      transition-all duration-150 group text-left
                      ${isActive 
                        ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20' 
                        : 'text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Layanan Lanjutan & Keamanan */}
          {secondaryItems.length > 0 && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Layanan & Keamanan
              </div>
              <div className="space-y-1">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`
                        w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold
                        transition-all duration-150 group text-left
                        ${isActive 
                          ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20' 
                          : 'text-slate-600 hover:bg-emerald-50/60 hover:text-emerald-800'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'
                        }`} />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* School Footer Badge */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
          <div className="bg-emerald-800 text-white p-3 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                UKS Siaga
              </span>
            </div>
            <p className="text-xs font-bold leading-tight">
              SIT Insan Harapan
            </p>
            <p className="text-[10px] text-emerald-200 italic mt-0.5">
              Sehat Siswanya, Hebat Generasinya
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
