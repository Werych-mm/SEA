export enum UserRole {
  Admin = 'admin',
  Docente = 'docente',
  Estudante = 'estudante',
  Externo = 'externo',
}

export enum EventType {
  Palestra = 'Palestra',
  Oficina = 'Oficina',
  RodaConversa = 'Roda de conversa',
  MiniCurso = 'Mini curso',
  Outros = 'Outros',
}

export enum EventStatus {
  EmBreve = 'Em breve',
  EmAndamento = 'Em andamento',
  Finalizado = 'Finalizado',
  Cancelado = 'Cancelado',
}

export interface NotificationPrefs {
  receiveNotifications: boolean;
  eventCreated: boolean;
  eventReminder: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  matriculaOrCpf: string;
  birthDate: string;
  role: UserRole;
  roleTitle: string;
  bio: string;
  avatarUrl?: string;
  blocked?: boolean;
  followers: string[];
  following: string[];
  showCreatedEventsOnProfile: boolean;
  notificationPrefs: NotificationPrefs;
}

export interface SubeventItem {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxSlots: number;
  registeredCount: number;
  eventType: EventType;
  institutionalOnly: boolean;
  generateCertificate: boolean;
  workloadHours: number;
}

export interface EventItem {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerRoleTitle: string;
  title: string;
  description: string;
  bannerUrl: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxSlots: number;
  registeredCount: number;
  eventType: EventType;
  status: EventStatus;
  institutionalOnly: boolean;
  generateCertificate: boolean;
  workloadHours: number;
  eventCode: string | null;
  subevents: SubeventItem[];
  createdAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  subeventId?: string;
  userId: string;
  status: 'cadastrado' | 'presente' | 'cancelado';
  checkedInCode?: string;
  certificateCode?: string;
  registeredAt: string;
  checkedInAt?: string;
}

export interface NotificationItem {
  id: string;
  category: 'Eventos' | 'Docentes' | 'Sistema';
  senderName: string;
  senderRole?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'reminder' | 'alert';
}

export type AppSection =
  | 'home'
  | 'management'
  | 'create'
  | 'registrations'
  | 'my-events'
  | 'profile'
  | 'settings'
  | 'help'
  | 'event-detail'
  | 'category';

export interface CertificateData {
  participantName: string;
  participantDocument: string;
  participantRole: string;
  eventTitle: string;
  eventType: string;
  eventDate: string;
  eventLocation: string;
  workloadHours: number;
  organizerName: string;
  organizerRole: string;
  certificateCode: string;
  issuedAt: string;
  kind: 'participacao' | 'apresentacao';
  paperTitle?: string;
}
