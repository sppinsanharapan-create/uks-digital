export type SchoolUnit = 'RAIT' | 'SDIT' | 'SMPIT';

export type UserRole = 
  | 'super_admin'     // Super Admin Yayasan
  | 'admin_uks'       // Petugas UKS
  | 'guru'            // Guru / Wali Kelas
  | 'kepala_sekolah'  // Kepala Sekolah
  | 'orang_tua';      // Orang Tua / Wali Murid

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  unit?: SchoolUnit | 'SEMUA';
  assignedClass?: string;
  linkedStudentNis?: string; // For orang_tua
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface Student {
  id: string;
  nis: string;
  namaLengkap: string;
  jenjang: SchoolUnit;
  kelas: string;
  jenisKelamin: 'L' | 'P';
  tanggalLahir: string;
  namaWali: string;
  noTeleponDarurat: string;
  emailWali?: string;
  alamat?: string;
  golonganDarah?: 'A' | 'B' | 'AB' | 'O' | '-';
  alergi?: string;
  kondisiKhusus?: string;
  catatanKebutuhanKhusus?: string;
  statusAktif: boolean;
  createdAt?: string;
}

export type UrgencyLevel = 'ringan' | 'sedang' | 'darurat';

export type VisitStatus = 
  | 'sedang_ditangani'
  | 'istirahat_dipantau'
  | 'kembali_ke_kelas'
  | 'dijemput_orang_tua'
  | 'dirujuk_ke_faskes';

export interface UksVisit {
  id: string;
  nomorKunjungan: string;
  studentId: string;
  studentNis: string;
  studentNama: string;
  jenjang: SchoolUnit;
  kelas: string;
  waktuMasuk: string;
  waktuKeluar?: string;
  pengantar: string;
  keluhan: string;
  kategoriKeluhan: string;
  suhuTubuh?: number;
  tekananDarah?: string;
  detakNadi?: number;
  tingkatUrgensi: UrgencyLevel;
  pertolonganPertama: string;
  obatDiberikan?: string;
  petugas: string;
  status: VisitStatus;
  catatan?: string;
  konfirmasiPenyerahan?: string;
  isEmergency?: boolean;
  parentNotified?: boolean;
  createdAt: string;
}

export interface HealthScreening {
  id: string;
  studentId: string;
  studentNis: string;
  studentNama: string;
  jenjang: SchoolUnit;
  kelas: string;
  tanggal: string;
  tinggiBadan: number; // cm
  beratBadan: number;  // kg
  imt?: number;
  statusGizi?: 'Gizi Kurang' | 'Normal' | 'Gizi Lebih' | 'Obesitas';
  suhuTubuh?: number;
  pemeriksaanPenglihatan: string; // Mata kanan / kiri normal / rabun
  kebersihanDiri: string;         // Kuku, rambut, kulit, telinga
  kesehatanGigiMulut: string;     // Karies, gigi berlubang, karang gigi, bersih
  catatanPemeriksaan?: string;
  rekomendasiTindakLanjut?: string;
  petugasPemeriksa: string;
  tahunAjaran: string;
  semester: string;
  createdAt: string;
}

export interface MedicineItem {
  id: string;
  namaBarang: string;
  kategori: 'Obat Bebas' | 'Obat Bebas Terbatas' | 'Obat Luar' | 'Perlengkapan P3K' | 'Alat Kesehatan' | 'APD';
  satuan: string; // tablet, botol, strip, roll, pcs, box
  jumlahStok: number;
  stokMinimum: number;
  tanggalKadaluwarsa: string;
  nomorBatch?: string;
  tanggalMasuk: string;
  sumberPengadaan: string;
  lokasiPenyimpanan?: string;
  petugasPencatat: string;
  keterangan?: string;
}

export interface InventoryLog {
  id: string;
  barangId: string;
  namaBarang: string;
  jenis: 'masuk' | 'keluar';
  jumlah: number;
  tanggal: string;
  keterangan: string;
  petugas: string;
}

export interface FirstAidIncident {
  id: string;
  studentId: string;
  studentNis: string;
  studentNama: string;
  jenjang: SchoolUnit;
  kelas: string;
  waktuKejadian: string;
  lokasiKejadian: string; // Lapangan Olahraga, Ruang Kelas, Tangga, Kantin, Toilet, dll
  kronologi: string;
  keluhanKondisi: string;
  tindakanAwal: string;
  petugas: string;
  kontakWaliDihubungi: string;
  statusWaliDihubungi?: 'Tersambung' | 'Belum Diangkat' | 'Kirim Pesan WA';
  hasilPemantauan: string;
  rekomendasiLanjutan: string;
  faskesRujukan?: string;
  statusSelesai: boolean;
  isEmergency: boolean;
  createdAt: string;
}

export interface ParentNotification {
  id: string;
  studentId: string;
  studentNama: string;
  nis: string;
  jenis: 'kunjungan' | 'jemput' | 'rujukan' | 'skrining' | 'program';
  judul: string;
  pesan: string;
  nomorWali: string;
  statusKirim: 'Terkirim' | 'Gagal' | 'Menunggu';
  channel: 'WhatsApp' | 'Email' | 'Sistem';
  timestamp: string;
  dibaca: boolean;
}

export interface HealthProgram {
  id: string;
  namaKegiatan: string;
  jenisProgram: 'Pendidikan Kesehatan' | 'Pelayanan Kesehatan' | 'Lingkungan Sehat' | 'Pemberantasan Nyamuk' | 'Imunisasi Puskesmas' | 'Edukasi Gizi';
  tanggal: string;
  penanggungJawab: string;
  sasaran: 'Semua Jenjang' | 'RAIT' | 'SDIT' | 'SMPIT';
  anggaran: number;
  jumlahPeserta: number;
  laporanHasil: string;
  dokumentasiUrl?: string;
  status: 'direncanakan' | 'berlangsung' | 'selesai';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  detail: string;
}

export interface SchoolSetting {
  id?: string;
  yayasanName: string;
  schoolName: string;
  tagline: string;
  alamat: string;
  telepon: string;
  email: string;
  tahunAjaranAktif: string;
  puskesmasRujukan: string;
  teleponAmbulans: string;
  kontakPetugasUks: string;
}
