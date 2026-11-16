export enum UserRole {
  Docente = 'docente',
  Estudante = 'estudante',
  Externo = 'externo',
}

export enum EventType {
  Palestra = 'Palestra',
  Oficina = 'Oficina',
  RodaConversa = 'Roda de conversa',
  MiniCurso = 'Mini curso',
  Simposio = 'Simpósio',
  Outros = 'Outros',
}

export enum EventStatus {
  EmBreve = 'Em breve',
  EmAndamento = 'Em andamento',
  Finalizado = 'Finalizado',
  Cancelado = 'Cancelado',
}

export enum SubmissionStatus {
  EmAvaliacao = 'Em avaliação',
  Aprovado = 'Aprovado',
  RevisaoSolicitada = 'Revisão solicitada',
  Rejeitado = 'Rejeitado',
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
  acceptSubmissions: boolean;
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

export interface PaperSubmission {
  id: string;
  eventId: string;
  eventTitle: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  coAuthors: string;
  title: string;
  abstract: string;
  track: string;
  keywords: string;
  fileName: string;
  fileSize: string;
  status: SubmissionStatus;
  reviewerFeedback?: string;
  submittedAt: string;
  certificateCode?: string;
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
  | 'create'
  | 'registrations'
  | 'my-events'
  | 'submissions'
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
