import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Student, 
  UksVisit, 
  HealthScreening, 
  MedicineItem, 
  InventoryLog, 
  FirstAidIncident, 
  ParentNotification, 
  HealthProgram, 
  AuditLog, 
  SchoolSetting 
} from '../types/uks';
import { 
  INITIAL_STUDENTS, 
  INITIAL_VISITS, 
  INITIAL_MEDICINES, 
  INITIAL_INVENTORY_LOGS, 
  INITIAL_SCREENINGS, 
  INITIAL_INCIDENTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_PROGRAMS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_SCHOOL_SETTING 
} from '../data/seedData';

// Storage keys for resilient local synchronization
const STORAGE_KEYS = {
  STUDENTS: 'uks_students_v1',
  VISITS: 'uks_visits_v1',
  MEDICINES: 'uks_medicines_v1',
  INVENTORY_LOGS: 'uks_inventory_logs_v1',
  SCREENINGS: 'uks_screenings_v1',
  INCIDENTS: 'uks_incidents_v1',
  NOTIFICATIONS: 'uks_notifications_v1',
  PROGRAMS: 'uks_programs_v1',
  AUDIT_LOGS: 'uks_audit_logs_v1',
  SETTINGS: 'uks_settings_v1',
};

// Simple event emitter for reactive updates across the app
type Listener = () => void;
const listeners: Set<Listener> = new Set();
export function subscribeToUksUpdates(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function notifySubscribers() {
  listeners.forEach(cb => {
    try { cb(); } catch (e) { console.error('Subscription error:', e); }
  });
}

// Local cache helper
function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    notifySubscribers();
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

export class UksDataService {
  // Initialize storage with seeds
  static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      setLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VISITS)) {
      setLocal(STORAGE_KEYS.VISITS, INITIAL_VISITS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDICINES)) {
      setLocal(STORAGE_KEYS.MEDICINES, INITIAL_MEDICINES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY_LOGS)) {
      setLocal(STORAGE_KEYS.INVENTORY_LOGS, INITIAL_INVENTORY_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCREENINGS)) {
      setLocal(STORAGE_KEYS.SCREENINGS, INITIAL_SCREENINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INCIDENTS)) {
      setLocal(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setLocal(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROGRAMS)) {
      setLocal(STORAGE_KEYS.PROGRAMS, INITIAL_PROGRAMS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      setLocal(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      setLocal(STORAGE_KEYS.SETTINGS, INITIAL_SCHOOL_SETTING);
    }
  }

  // --- AUDIT LOGGING ---
  static logAudit(userId: string, userName: string, userRole: string, action: string, detail: string): void {
    const logs = getLocal<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId,
      userName,
      userRole,
      action,
      detail,
    };
    setLocal(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]);

    // Optional firestore sync
    try {
      setDoc(doc(db, 'audit_logs', newLog.id), { ...newLog, serverTimestamp: serverTimestamp() }).catch(() => {});
    } catch {
      // Offline fallback
    }
  }

  // --- STUDENTS ---
  static getStudents(): Student[] {
    return getLocal<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  static async saveStudent(student: Student, actor?: { id: string; name: string; role: string }): Promise<void> {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === student.id || s.nis === student.nis);
    let updated: Student[];
    const isNew = index < 0;

    if (isNew) {
      const newStudent = { 
        ...student, 
        id: student.id || `std_${Date.now()}`,
        statusAktif: student.statusAktif ?? true,
        createdAt: new Date().toISOString()
      };
      updated = [newStudent, ...students];
    } else {
      updated = [...students];
      updated[index] = { ...updated[index], ...student };
    }

    setLocal(STORAGE_KEYS.STUDENTS, updated);

    if (actor) {
      this.logAudit(
        actor.id,
        actor.name,
        actor.role,
        isNew ? 'TAMBAH_SISWA' : 'UPDATE_SISWA',
        `${isNew ? 'Menambahkan' : 'Memperbarui'} siswa: ${student.namaLengkap} (NIS: ${student.nis}, Jenjang: ${student.jenjang})`
      );
    }

    // Try firestore sync
    try {
      const docRef = doc(db, 'students', student.id);
      await setDoc(docRef, student, { merge: true });
    } catch (err) {
      // Handled silently for offline or demo fallback
    }
  }

  static async deleteStudent(studentId: string, actor?: { id: string; name: string; role: string }): Promise<void> {
    const students = this.getStudents();
    const target = students.find(s => s.id === studentId);
    const updated = students.filter(s => s.id !== studentId);
    setLocal(STORAGE_KEYS.STUDENTS, updated);

    if (actor && target) {
      this.logAudit(
        actor.id,
        actor.name,
        actor.role,
        'HAPUS_SISWA',
        `Menghapus data siswa: ${target.namaLengkap} (NIS: ${target.nis})`
      );
    }

    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch {
      // offline fallback
    }
  }

  // --- UKS VISITS ---
  static getVisits(): UksVisit[] {
    return getLocal<UksVisit[]>(STORAGE_KEYS.VISITS, INITIAL_VISITS);
  }

  static async saveVisit(visit: UksVisit, actor?: { id: string; name: string; role: string }): Promise<void> {
    const visits = this.getVisits();
    const index = visits.findIndex(v => v.id === visit.id);
    let updated: UksVisit[];
    const isNew = index < 0;

    if (isNew) {
      const newVisit = {
        ...visit,
        id: visit.id || `vis_${Date.now()}`,
        createdAt: visit.createdAt || new Date().toISOString(),
      };
      updated = [newVisit, ...visits];
    } else {
      updated = [...visits];
      updated[index] = { ...updated[index], ...visit };
    }

    setLocal(STORAGE_KEYS.VISITS, updated);

    if (actor) {
      this.logAudit(
        actor.id,
        actor.name,
        actor.role,
        isNew ? 'PENDAFTARAN_KUNJUNGAN' : 'UPDATE_KUNJUNGAN',
        `${isNew ? 'Mendaftarkan' : 'Memperbarui'} kunjungan: ${visit.nomorKunjungan} (${visit.studentNama}) - Status: ${visit.status}`
      );
    }

    try {
      await setDoc(doc(db, 'visits', visit.id), visit, { merge: true });
    } catch {
      // offline fallback
    }
  }

  // --- MEDICINE INVENTORY ---
  static getMedicines(): MedicineItem[] {
    return getLocal<MedicineItem[]>(STORAGE_KEYS.MEDICINES, INITIAL_MEDICINES);
  }

  static async saveMedicine(item: MedicineItem, actor?: { id: string; name: string; role: string }): Promise<void> {
    const items = this.getMedicines();
    const index = items.findIndex(m => m.id === item.id);
    let updated: MedicineItem[];
    const isNew = index < 0;

    if (isNew) {
      const newItem = { ...item, id: item.id || `med_${Date.now()}` };
      updated = [newItem, ...items];
    } else {
      updated = [...items];
      updated[index] = { ...updated[index], ...item };
    }

    setLocal(STORAGE_KEYS.MEDICINES, updated);

    if (actor) {
      this.logAudit(
        actor.id,
        actor.name,
        actor.role,
        isNew ? 'TAMBAH_OBAT' : 'UPDATE_OBAT',
        `${isNew ? 'Menambah' : 'Memperbarui'} item: ${item.namaBarang} (Stok: ${item.jumlahStok} ${item.satuan})`
      );
    }

    try {
      await setDoc(doc(db, 'medicines_inventory', item.id), item, { merge: true });
    } catch {
      // offline fallback
    }
  }

  static async adjustMedicineStock(
    itemId: string, 
    qtyChange: number, 
    jenis: 'masuk' | 'keluar', 
    keterangan: string, 
    actor: { id: string; name: string; role: string }
  ): Promise<void> {
    const medicines = this.getMedicines();
    const target = medicines.find(m => m.id === itemId);
    if (!target) return;

    const newStock = Math.max(0, target.jumlahStok + (jenis === 'masuk' ? qtyChange : -qtyChange));
    target.jumlahStok = newStock;
    this.saveMedicine(target);

    // Record inventory log
    const logs = this.getInventoryLogs();
    const newLog: InventoryLog = {
      id: `log_${Date.now()}`,
      barangId: itemId,
      namaBarang: target.namaBarang,
      jenis,
      jumlah: qtyChange,
      tanggal: new Date().toISOString().substring(0, 10),
      keterangan,
      petugas: actor.name,
    };
    setLocal(STORAGE_KEYS.INVENTORY_LOGS, [newLog, ...logs]);

    this.logAudit(
      actor.id,
      actor.name,
      actor.role,
      jenis === 'masuk' ? 'STOK_MASUK' : 'STOK_KELUAR',
      `${jenis === 'masuk' ? 'Menambah' : 'Mengeluarkan'} stok ${qtyChange} ${target.satuan} ${target.namaBarang} - Ket: ${keterangan}`
    );
  }

  static getInventoryLogs(): InventoryLog[] {
    return getLocal<InventoryLog[]>(STORAGE_KEYS.INVENTORY_LOGS, INITIAL_INVENTORY_LOGS);
  }

  // --- HEALTH SCREENINGS ---
  static getScreenings(): HealthScreening[] {
    return getLocal<HealthScreening[]>(STORAGE_KEYS.SCREENINGS, INITIAL_SCREENINGS);
  }

  static async saveScreening(screening: HealthScreening, actor?: { id: string; name: string; role: string }): Promise<void> {
    const screenings = this.getScreenings();
    const index = screenings.findIndex(s => s.id === screening.id);
    let updated: HealthScreening[];
    const isNew = index < 0;

    // Calculate BMI and status
    const heightInMeters = screening.tinggiBadan / 100;
    const imt = heightInMeters > 0 ? Number((screening.beratBadan / (heightInMeters * heightInMeters)).toFixed(1)) : 0;
    let statusGizi: 'Gizi Kurang' | 'Normal' | 'Gizi Lebih' | 'Obesitas' = 'Normal';
    if (imt < 14) statusGizi = 'Gizi Kurang';
    else if (imt <= 19) statusGizi = 'Normal';
    else if (imt <= 23) statusGizi = 'Gizi Lebih';
    else statusGizi = 'Obesitas';

    const enriched: HealthScreening = {
      ...screening,
      imt,
      statusGizi,
      id: screening.id || `scr_${Date.now()}`,
      createdAt: screening.createdAt || new Date().toISOString(),
    };

    if (isNew) {
      updated = [enriched, ...screenings];
    } else {
      updated = [...screenings];
      updated[index] = enriched;
    }

    setLocal(STORAGE_KEYS.SCREENINGS, updated);

    if (actor) {
      this.logAudit(
        actor.id,
        actor.name,
        actor.role,
        isNew ? 'CATAT_SKRINING' : 'UPDATE_SKRINING',
        `Pemeriksaan kesehatan siswa: ${screening.studentNama} (TB: ${screening.tinggiBadan}cm, BB: ${screening.beratBadan}kg)`
      );
    }

    try {
      await setDoc(doc(db, 'health_screenings', enriched.id), enriched, { merge: true });
    } catch {
      // offline fallback
    }
  }

  // --- FIRST AID & EMERGENCY INCIDENTS ---
  static getIncidents(): FirstAidIncident[] {
    return getLocal<FirstAidIncident[]>(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
  }

  static async saveIncident(incident: FirstAidIncident, actor?: { id: string; name: string; role: string }): Promise<void> {
    const incidents = this.getIncidents();
    const index = incidents.findIndex(i => i.id === incident.id);
    let updated: FirstAidIncident[];
    const isNew = index < 0;

    const enriched = {
      ...incident,
      id: incident.id || `inc_${Date.now()}`,
      createdAt: incident.createdAt || new Date().toISOString(),
    };

    if (isNew) {
      updated = [enriched, ...incidents];
    } else {
      updated = [...incidents];
      updated[index] = enriched;
    }

    setLocal(STORAGE_KEYS.INCIDENTS, updated);

    if (actor) {
      this.logAudit(
        actor.id,
        actor.name,
        actor.role,
        isNew ? 'CATAT_KEJADIAN_DARURAT' : 'UPDATE_KEJADIAN_DARURAT',
        `Kejadian ${incident.isEmergency ? '[DARURAT] ' : ''}${incident.lokasiKejadian} - Korban: ${incident.studentNama}`
      );
    }

    try {
      await setDoc(doc(db, 'first_aid_incidents', enriched.id), enriched, { merge: true });
    } catch {
      // offline fallback
    }
  }

  // --- NOTIFICATIONS ---
  static getNotifications(): ParentNotification[] {
    return getLocal<ParentNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  static async createNotification(notif: Omit<ParentNotification, 'id' | 'timestamp' | 'dibaca'>, actor?: { id: string; name: string; role: string }): Promise<ParentNotification> {
    const list = this.getNotifications();
    const newNotif: ParentNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      dibaca: false,
    };
    setLocal(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...list]);

    if (actor) {
      this.logAudit(
        actor.id,
        actor.name,
        actor.role,
        'KIRIM_NOTIFIKASI',
        `Notifikasi ${notif.jenis} dikirim ke ${notif.studentNama} (${notif.nomorWali}) via ${notif.channel}`
      );
    }

    try {
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch {
      // offline
    }

    return newNotif;
  }

  // --- HEALTH PROGRAMS ---
  static getPrograms(): HealthProgram[] {
    return getLocal<HealthProgram[]>(STORAGE_KEYS.PROGRAMS, INITIAL_PROGRAMS);
  }

  static async saveProgram(prog: HealthProgram, actor?: { id: string; name: string; role: string }): Promise<void> {
    const progs = this.getPrograms();
    const index = progs.findIndex(p => p.id === prog.id);
    let updated: HealthProgram[];
    const isNew = index < 0;

    const enriched = {
      ...prog,
      id: prog.id || `prog_${Date.now()}`,
      createdAt: prog.createdAt || new Date().toISOString(),
    };

    if (isNew) {
      updated = [enriched, ...progs];
    } else {
      updated = [...progs];
      updated[index] = enriched;
    }

    setLocal(STORAGE_KEYS.PROGRAMS, updated);

    if (actor) {
      this.logAudit(
        actor.id,
        actor.name,
        actor.role,
        isNew ? 'TAMBAH_PROGRAM' : 'UPDATE_PROGRAM',
        `Program kesehatan: ${prog.namaKegiatan} (Status: ${prog.status})`
      );
    }

    try {
      await setDoc(doc(db, 'health_programs', enriched.id), enriched, { merge: true });
    } catch {
      // offline
    }
  }

  // --- AUDIT LOGS ---
  static getAuditLogs(): AuditLog[] {
    return getLocal<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  // --- SETTINGS ---
  static getSettings(): SchoolSetting {
    return getLocal<SchoolSetting>(STORAGE_KEYS.SETTINGS, INITIAL_SCHOOL_SETTING);
  }

  static async saveSettings(settings: SchoolSetting, actor?: { id: string; name: string; role: string }): Promise<void> {
    setLocal(STORAGE_KEYS.SETTINGS, settings);
    if (actor) {
      this.logAudit(
        actor.id,
        actor.name,
        actor.role,
        'UPDATE_PENGATURAN',
        'Memperbarui identitas dan pengaturan sistem UKS Digital'
      );
    }
    try {
      await setDoc(doc(db, 'settings', 'global_school_config'), settings, { merge: true });
    } catch {
      // offline
    }
  }

  // --- BACKUP & RESTORE ---
  static exportAllDataJSON(): string {
    const payload = {
      exportedAt: new Date().toISOString(),
      school: this.getSettings(),
      students: this.getStudents(),
      visits: this.getVisits(),
      medicines: this.getMedicines(),
      inventoryLogs: this.getInventoryLogs(),
      screenings: this.getScreenings(),
      incidents: this.getIncidents(),
      notifications: this.getNotifications(),
      programs: this.getPrograms(),
      auditLogs: this.getAuditLogs(),
    };
    return JSON.stringify(payload, null, 2);
  }

  static restoreAllDataJSON(jsonStr: string, actor: { id: string; name: string; role: string }): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.students) setLocal(STORAGE_KEYS.STUDENTS, data.students);
      if (data.visits) setLocal(STORAGE_KEYS.VISITS, data.visits);
      if (data.medicines) setLocal(STORAGE_KEYS.MEDICINES, data.medicines);
      if (data.inventoryLogs) setLocal(STORAGE_KEYS.INVENTORY_LOGS, data.inventoryLogs);
      if (data.screenings) setLocal(STORAGE_KEYS.SCREENINGS, data.screenings);
      if (data.incidents) setLocal(STORAGE_KEYS.INCIDENTS, data.incidents);
      if (data.notifications) setLocal(STORAGE_KEYS.NOTIFICATIONS, data.notifications);
      if (data.programs) setLocal(STORAGE_KEYS.PROGRAMS, data.programs);
      if (data.school) setLocal(STORAGE_KEYS.SETTINGS, data.school);

      this.logAudit(
        actor.id,
        actor.name,
        actor.role,
        'RESTORE_DATABASE',
        'Memulihkan seluruh basis data sistem dari berkas cadangan JSON'
      );
      return true;
    } catch (err) {
      console.error('Failed to restore data:', err);
      return false;
    }
  }

  // Reset to default seed
  static resetToSeedData(actor: { id: string; name: string; role: string }): void {
    setLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    setLocal(STORAGE_KEYS.VISITS, INITIAL_VISITS);
    setLocal(STORAGE_KEYS.MEDICINES, INITIAL_MEDICINES);
    setLocal(STORAGE_KEYS.INVENTORY_LOGS, INITIAL_INVENTORY_LOGS);
    setLocal(STORAGE_KEYS.SCREENINGS, INITIAL_SCREENINGS);
    setLocal(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
    setLocal(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setLocal(STORAGE_KEYS.PROGRAMS, INITIAL_PROGRAMS);
    setLocal(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    setLocal(STORAGE_KEYS.SETTINGS, INITIAL_SCHOOL_SETTING);

    this.logAudit(
      actor.id,
      actor.name,
      actor.role,
      'RESET_DATA_DEFAULT',
      'Mengembalikan basis data UKS ke data standar bawaan'
    );
  }
}

// Auto init on import
UksDataService.init();
