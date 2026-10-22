import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabKey } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { StudentDatabase } from './components/students/StudentDatabase';
import { VisitRegistration } from './components/visits/VisitRegistration';
import { HealthScreenings } from './components/screenings/HealthScreenings';
import { MedicineInventory } from './components/inventory/MedicineInventory';
import { FirstAidIncidents } from './components/firstaid/FirstAidIncidents';
import { ParentNotifications } from './components/notifications/ParentNotifications';
import { HealthPrograms } from './components/programs/HealthPrograms';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { UserManagement } from './components/users/UserManagement';
import { AuditLogs } from './components/audit/AuditLogs';
import { SystemSettings } from './components/settings/SystemSettings';
import { UksDataService, subscribeToUksUpdates } from './services/uksService';
import { 
  Student, 
  UksVisit, 
  MedicineItem, 
  InventoryLog, 
  HealthScreening, 
  FirstAidIncident, 
  ParentNotification, 
  HealthProgram, 
  AuditLog, 
  SchoolSetting 
} from './types/uks';
import { Home, ChevronRight } from 'lucide-react';

const TAB_TITLES: Record<TabKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Utama', subtitle: 'Ringkasan kesehatan santri dan aktivitas UKS secara real-time' },
  students: { title: 'Master Data Siswa', subtitle: 'Basis data rekam kesehatan, kontak darurat, dan riwayat alergi santri' },
  visits: { title: 'Pendaftaran Kunjungan UKS', subtitle: 'Pencatatan keluhan, pemeriksaan tanda vital, dan pemantauan santri' },
  screenings: { title: 'Pemeriksaan Kesehatan Berkala', subtitle: 'Skrining antropometri TB/BB/IMT, penglihatan, dan kesehatan gigi' },
  inventory: { title: 'Inventaris Obat & Perlengkapan P3K', subtitle: 'Pengelolaan stok obat, tanggal kedaluwarsa, dan pencatatan mutasi' },
  reports: { title: 'Laporan & Rekapitulasi', subtitle: 'Cetak resmi berkop surat SIT Insan Harapan dan ekspor data ke Excel' },
  settings: { title: 'Pengaturan Sistem & Profil', subtitle: 'Konfigurasi identitas lembaga, faskes rujukan, dan pencadangan JSON' },
  first_aid: { title: 'Pertolongan Pertama & Insiden', subtitle: 'Penanganan kedaruratan, kronologi kejadian, dan rujukan faskes' },
  notifications: { title: 'Pemberitahuan Orang Tua', subtitle: 'Komunikasi resmi hasil observasi dan penjemputan via WhatsApp' },
  programs: { title: 'Program Kesehatan (Trias UKS)', subtitle: 'Pendidikan kesehatan, PHBS, imunisasi, dan kegiatan UKS' },
  users: { title: 'Manajemen Pengguna (RBAC)', subtitle: 'Pengaturan peran, hak akses, dan akun staf/petugas' },
  audit: { title: 'Audit Log Sistem', subtitle: 'Jejak audit keamanan dan perubahan data sensitif kesehatan' },
};

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data states
  const [students, setStudents] = useState<Student[]>(() => UksDataService.getStudents());
  const [visits, setVisits] = useState<UksVisit[]>(() => UksDataService.getVisits());
  const [medicines, setMedicines] = useState<MedicineItem[]>(() => UksDataService.getMedicines());
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => UksDataService.getInventoryLogs());
  const [screenings, setScreenings] = useState<HealthScreening[]>(() => UksDataService.getScreenings());
  const [incidents, setIncidents] = useState<FirstAidIncident[]>(() => UksDataService.getIncidents());
  const [notifications, setNotifications] = useState<ParentNotification[]>(() => UksDataService.getNotifications());
  const [programs, setPrograms] = useState<HealthProgram[]>(() => UksDataService.getPrograms());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => UksDataService.getAuditLogs());
  const [settings, setSettings] = useState<SchoolSetting>(() => UksDataService.getSettings());

  // Transient action states
  const [preselectedStudentForVisit, setPreselectedStudentForVisit] = useState<Student | null>(null);

  // Subscribe to persistent updates
  useEffect(() => {
    const unsub = subscribeToUksUpdates(() => {
      setStudents(UksDataService.getStudents());
      setVisits(UksDataService.getVisits());
      setMedicines(UksDataService.getMedicines());
      setInventoryLogs(UksDataService.getInventoryLogs());
      setScreenings(UksDataService.getScreenings());
      setIncidents(UksDataService.getIncidents());
      setNotifications(UksDataService.getNotifications());
      setPrograms(UksDataService.getPrograms());
      setAuditLogs(UksDataService.getAuditLogs());
      setSettings(UksDataService.getSettings());
    });
    return () => unsub();
  }, []);

  // Compute stats for badges
  const activeVisitsCount = visits.filter(v => v.status === 'sedang_ditangani' || v.status === 'istirahat_dipantau').length;
  const lowStockCount = medicines.filter(m => m.jumlahStok <= m.stokMinimum).length;
  const unreadNotifsCount = notifications.filter(n => !n.dibaca).length;

  // Handlers
  const handleSaveStudent = async (student: Student) => {
    await UksDataService.saveStudent(student, {
      id: currentUser.id,
      name: currentUser.displayName,
      role: currentUser.role,
    });
  };

  const handleDeleteStudent = async (studentId: string) => {
    await UksDataService.deleteStudent(studentId, {
      id: currentUser.id,
      name: currentUser.displayName,
      role: currentUser.role,
    });
  };

  const handleSaveVisit = async (visit: UksVisit) => {
    await UksDataService.saveVisit(visit, {
      id: currentUser.id,
      name: currentUser.displayName,
      role: currentUser.role,
    });
  };

  const handleSaveMedicine = async (item: MedicineItem) => {
    await UksDataService.saveMedicine(item, {
      id: currentUser.id,
      name: currentUser.displayName,
      role: currentUser.role,
    });
  };

  const handleAdjustStock = async (itemId: string, qty: number, jenis: 'masuk' | 'keluar', ket: string) => {
    await UksDataService.adjustMedicineStock(itemId, qty, jenis, ket, {
      id: currentUser.id,
      name: currentUser.displayName,
      role: currentUser.role,
    });
  };

  const handleSaveScreening = async (screening: HealthScreening) => {
    await UksDataService.saveScreening(screening, {
      id: currentUser.id,
      name: currentUser.displayName,
      role: currentUser.role,
    });
  };

  const handleSaveIncident = async (incident: FirstAidIncident) => {
    await UksDataService.saveIncident(incident, {
      id: currentUser.id,
      name: currentUser.displayName,
      role: currentUser.role,
    });
  };

  const handleSendNotification = async (notif: Omit<ParentNotification, 'id' | 'timestamp' | 'dibaca'>) => {
    await UksDataService.createNotification(notif, {
      id: currentUser.id,
      name: currentUser.displayName,
      role: currentUser.role,
    });
  };

  const handleSaveProgram = async (prog: HealthProgram) => {
    await UksDataService.saveProgram(prog, {
      id: currentUser.id,
      name: currentUser.displayName,
      role: currentUser.role,
    });
  };

  const handleSaveSettings = async (newSettings: SchoolSetting) => {
    await UksDataService.saveSettings(newSettings, {
      id: currentUser.id,
      name: currentUser.displayName,
      role: currentUser.role,
    });
  };

  const handleOpenVisitWithStudent = (student: Student) => {
    setPreselectedStudentForVisit(student);
    setActiveTab('visits');
  };

  const currentTabMeta = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      
      {/* Top Header / Navbar */}
      <Navbar
        settings={settings}
        unreadNotifsCount={unreadNotifsCount}
        notifications={notifications}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenNotifications={() => setActiveTab('notifications')}
      />

      {/* Main Container with Sticky Sidebar and Scrollable Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 gap-6 items-start">
        
        {/* Sticky Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeVisitsCount={activeVisitsCount}
          lowStockCount={lowStockCount}
        />

        {/* Content Area with Breadcrumbs & Active Module */}
        <main className="flex-1 min-w-0 py-6 pb-16">
          
          {/* Breadcrumb & Section Subtitle (Hidden during print) */}
          <div className="no-print mb-5 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium" aria-label="Breadcrumb">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Beranda</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-bold text-slate-900">
                {currentTabMeta.title}
              </span>
            </nav>

            <span className="text-[11px] text-slate-400 italic">
              {currentTabMeta.subtitle}
            </span>
          </div>

          {/* Tab Views */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              students={students}
              visits={visits}
              medicines={medicines}
              screenings={screenings}
              onOpenNewVisit={() => setActiveTab('visits')}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onViewVisitDetail={() => setActiveTab('visits')}
            />
          )}

          {activeTab === 'students' && (
            <StudentDatabase
              students={students}
              visits={visits}
              screenings={screenings}
              onSaveStudent={handleSaveStudent}
              onDeleteStudent={handleDeleteStudent}
              onOpenVisitWithStudent={handleOpenVisitWithStudent}
            />
          )}

          {activeTab === 'visits' && (
            <VisitRegistration
              students={students}
              visits={visits}
              onSaveVisit={handleSaveVisit}
              onSendNotification={handleSendNotification}
              preselectedStudent={preselectedStudentForVisit}
              onClearPreselectedStudent={() => setPreselectedStudentForVisit(null)}
            />
          )}

          {activeTab === 'screenings' && (
            <HealthScreenings
              students={students}
              screenings={screenings}
              onSaveScreening={handleSaveScreening}
            />
          )}

          {activeTab === 'inventory' && (
            <MedicineInventory
              medicines={medicines}
              inventoryLogs={inventoryLogs}
              onSaveMedicine={handleSaveMedicine}
              onAdjustStock={handleAdjustStock}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsCenter
              students={students}
              visits={visits}
              medicines={medicines}
              screenings={screenings}
              programs={programs}
              settings={settings}
            />
          )}

          {activeTab === 'settings' && (
            <SystemSettings
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {activeTab === 'first_aid' && (
            <FirstAidIncidents
              students={students}
              incidents={incidents}
              onSaveIncident={handleSaveIncident}
            />
          )}

          {activeTab === 'notifications' && (
            <ParentNotifications
              notifications={notifications}
              students={students}
              onSendNotification={handleSendNotification}
            />
          )}

          {activeTab === 'programs' && (
            <HealthPrograms
              programs={programs}
              onSaveProgram={handleSaveProgram}
            />
          )}

          {activeTab === 'users' && (
            <UserManagement />
          )}

          {activeTab === 'audit' && (
            <AuditLogs logs={auditLogs} />
          )}

        </main>

      </div>

      {/* Global Footer (Hidden in print) */}
      <footer className="no-print mt-auto border-t border-slate-200/90 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-800">
            {settings.schoolName} — {settings.yayasanName}
          </p>
          <p>
            {settings.tagline} • Sistem UKS Digital Terpadu untuk Sekolah & Pesantren
          </p>
          <p className="text-[11px] text-slate-400">
            Layanan Darurat: 119 • Faskes Rujukan: {settings.puskesmasRujukan} • Petugas Jaga: {settings.kontakPetugasUks}
          </p>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
