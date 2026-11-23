import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  EventItem,
  EventStatus,
  EventType,
  NotificationItem,
  Registration,
  UserAccount,
  UserRole,
} from './src/types';

interface StoredUser extends UserAccount {
  password: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  events: EventItem[];
  registrations: Registration[];
  notifications: NotificationItem[];
  pendingVerifications: Record<string, { code: string; user: StoredUser }>;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'sea-ifce-db.json');

const POSTER_TECH = '/src/assets/images/poster_tecnologia_ifce_1794858693692.jpg';
const POSTER_HEALTH = '/src/assets/images/poster_saude_bemestar_1794858693824.jpg';
const POSTER_VOZES = '/src/assets/images/poster_vozes_cultura_1794858693933.jpg';
const POSTER_ROBOTICA = '/src/assets/images/poster_oficina_robotica_1794858694324.jpg';
const POSTER_EXTENSAO = '/src/assets/images/poster_extensao_pesquisa_1794858694286.jpg';

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(plain: string, stored: string): boolean {
  if (!stored) return false;
  if (stored.startsWith('scrypt:')) {
    const [, salt, hashHex] = stored.split(':');
    if (!salt || !hashHex) return false;
    const derived = crypto.scryptSync(plain, salt, 64);
    const expected = Buffer.from(hashHex, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  }
  return plain === stored;
}

function signSessionToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, iat: Date.now() }),
    'utf-8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      uid?: string;
    };
    return parsed.uid || null;
  } catch {
    return null;
  }
}

function createInitialDb(): DatabaseSchema {
  const users: StoredUser[] = [
    {
      id: 'usr-admin-1',
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashPassword('1989'),
      matriculaOrCpf: 'ADMIN-IFCE-01',
      birthDate: '1989-01-01',
      role: UserRole.Admin,
      roleTitle: 'Admin',
      bio: 'Administrador geral do Sistema de Eventos Acadêmicos (SEA) do IFCE Campus Cedro. Responsável pela moderação de usuários, eventos e avisos oficiais.',
      blocked: false,
      followers: ['usr-docente-1', 'usr-estudante-1'],
      following: ['usr-docente-1', 'usr-docente-2'],
      showCreatedEventsOnProfile: true,
      notificationPrefs: {
        receiveNotifications: true,
        eventCreated: true,
        eventReminder: true,
      },
    },
    {
      id: 'usr-docente-1',
      name: 'Prof. Dr. Carlos Eduardo Lima',
      email: 'carlos.lima@gmail.com',
      password: hashPassword('123'),
      matriculaOrCpf: 'SIAPE 1849201',
      birthDate: '1984-05-14',
      role: UserRole.Docente,
      roleTitle: 'Docente — Sistemas de Informação',
      bio: 'Coordenador de projetos de pesquisa e extensão no IFCE Campus Cedro. Foco em Engenharia de Software, Computação Aplicada e Inclusão Digital no Centro-Sul Cearense.',
      blocked: false,
      followers: ['usr-estudante-1', 'usr-externo-1'],
      following: ['usr-docente-2'],
      showCreatedEventsOnProfile: true,
      notificationPrefs: {
        receiveNotifications: true,
        eventCreated: true,
        eventReminder: true,
      },
    },
    {
      id: 'usr-docente-2',
      name: 'Profa. Ma. Mariana Albuquerque',
      email: 'mariana.albuquerque@gmail.com',
      password: hashPassword('123'),
      matriculaOrCpf: 'SIAPE 2190443',
      birthDate: '1989-11-02',
      role: UserRole.Docente,
      roleTitle: 'Docente — Núcleo de Saúde e Humanidades',
      bio: 'Pesquisadora em Saúde Coletiva, Bem-Estar Estudantil e Ações Afirmativas no IFCE Campus Cedro.',
      blocked: false,
      followers: ['usr-docente-1', 'usr-estudante-1'],
      following: ['usr-docente-1'],
      showCreatedEventsOnProfile: true,
      notificationPrefs: {
        receiveNotifications: true,
        eventCreated: true,
        eventReminder: true,
      },
    },
    {
      id: 'usr-estudante-1',
      name: 'Ana Beatriz Ferreira',
      email: 'ana.ferreira@gmail.com',
      password: hashPassword('123'),
      matriculaOrCpf: '20241030400125',
      birthDate: '2004-03-22',
      role: UserRole.Estudante,
      roleTitle: 'Estudante — Bacharelado em Sistemas de Informação',
      bio: 'Graduanda em Sistemas de Informação e bolsista de Iniciação Científica (PIBIC/IFCE). Entusiasta de IA aplicada à educação.',
      blocked: false,
      followers: [],
      following: ['usr-docente-1', 'usr-docente-2'],
      showCreatedEventsOnProfile: true,
      notificationPrefs: {
        receiveNotifications: true,
        eventCreated: true,
        eventReminder: true,
      },
    },
    {
      id: 'usr-externo-1',
      name: 'João Pedro Vasconcelos',
      email: 'joao.vasconcelos@gmail.com',
      password: hashPassword('123'),
      matriculaOrCpf: '048.392.113-90',
      birthDate: '1999-08-19',
      role: UserRole.Externo,
      roleTitle: 'Participante Externo — Comunidade Regional',
      bio: 'Desenvolvedor full-stack egresso e participante ativo dos minicursos e eventos abertos à comunidade no Campus Cedro.',
      blocked: false,
      followers: [],
      following: ['usr-docente-1'],
      showCreatedEventsOnProfile: false,
      notificationPrefs: {
        receiveNotifications: true,
        eventCreated: false,
        eventReminder: true,
      },
    },
  ];

  const events: EventItem[] = [
    {
      id: 'evt-1',
      organizerId: 'usr-docente-1',
      organizerName: 'Prof. Dr. Carlos Eduardo Lima',
      organizerRoleTitle: 'Docente — Sistemas de Informação',
      title: 'XI Semana de Tecnologia e Inovação do IFCE Cedro',
      description:
        'Encontro acadêmico anual reunindo palestras, sessões técnicas de artigos científicos e oficinas práticas de prototipagem eletrônica, inteligência artificial e desenvolvimento web sustentável.',
      bannerUrl: POSTER_TECH,
      location: 'Auditório Principal — Bloco A',
      startDate: '2026-11-24',
      endDate: '2026-11-26',
      startTime: '08:30',
      endTime: '17:30',
      maxSlots: 120,
      registeredCount: 84,
      eventType: EventType.Palestra,
      status: EventStatus.EmAndamento,
      institutionalOnly: false,
      generateCertificate: true,
      workloadHours: 20,
      eventCode: 'Q87OP',
      createdAt: '2026-10-15T10:00:00.000Z',
      subevents: [
        {
          id: 'sub-101',
          title: 'Oficina de Prototipagem com Arduino e IoT',
          description: 'Sessão prática de sensores ambientais conectados à nuvem.',
          bannerUrl: POSTER_ROBOTICA,
          location: 'Laboratório de Hardware 02',
          startDate: '2026-11-25',
          endDate: '2026-11-25',
          startTime: '14:00',
          endTime: '17:00',
          maxSlots: 30,
          registeredCount: 24,
          eventType: EventType.Oficina,
          institutionalOnly: true,
          generateCertificate: true,
          workloadHours: 4,
        },
      ],
    },
    {
      id: 'evt-2',
      organizerId: 'usr-docente-2',
      organizerName: 'Profa. Ma. Mariana Albuquerque',
      organizerRoleTitle: 'Docente — Núcleo de Saúde e Humanidades',
      title: 'Palestra de Higiene, Saúde Mental e Autocuidado Acadêmico',
      description:
        'Roda orientativa sobre prevenção à saúde no ambiente escolar, ergonomia nos estudos e estratégias práticas de equilíbrio emocional durante o semestre letivo.',
      bannerUrl: POSTER_HEALTH,
      location: 'Auditório Principal',
      startDate: '2026-11-18',
      endDate: '2026-11-18',
      startTime: '14:00',
      endTime: '16:00',
      maxSlots: 60,
      registeredCount: 48,
      eventType: EventType.Palestra,
      status: EventStatus.EmBreve,
      institutionalOnly: false,
      generateCertificate: true,
      workloadHours: 2,
      eventCode: null,
      createdAt: '2026-11-01T09:00:00.000Z',
      subevents: [],
    },
    {
      id: 'evt-3',
      organizerId: 'usr-docente-2',
      organizerName: 'Profa. Ma. Mariana Albuquerque',
      organizerRoleTitle: 'Docente — Núcleo de Saúde e Humanidades',
      title: 'Vozes do Campus: Literatura, Diversidade e Cultura Regional',
      description:
        'Roda de conversa interdisciplinar com estudantes, docentes e escritores do Cariri e Centro-Sul sobre memória cultural, inclusão e produção literária contemporânea.',
      bannerUrl: POSTER_VOZES,
      location: 'Biblioteca Central — Sala Multimeios',
      startDate: '2026-11-20',
      endDate: '2026-11-20',
      startTime: '15:30',
      endTime: '17:30',
      maxSlots: 45,
      registeredCount: 31,
      eventType: EventType.RodaConversa,
      status: EventStatus.EmBreve,
      institutionalOnly: false,
      generateCertificate: true,
      workloadHours: 3,
      eventCode: null,
      createdAt: '2026-11-02T14:20:00.000Z',
      subevents: [],
    },
    {
      id: 'evt-4',
      organizerId: 'usr-docente-1',
      organizerName: 'Prof. Dr. Carlos Eduardo Lima',
      organizerRoleTitle: 'Docente — Sistemas de Informação',
      title: 'Minicurso de Robótica Educacional e Automação Industrial',
      description:
        'Introdução à cinemática de manipuladores robóticos, controle PID embarcado e programação em C++ para sistemas mecatrônicos.',
      bannerUrl: POSTER_ROBOTICA,
      location: 'Laboratório de Automação — Bloco C',
      startDate: '2026-11-28',
      endDate: '2026-11-29',
      startTime: '08:00',
      endTime: '12:00',
      maxSlots: 25,
      registeredCount: 19,
      eventType: EventType.MiniCurso,
      status: EventStatus.EmBreve,
      institutionalOnly: true,
      generateCertificate: true,
      workloadHours: 8,
      eventCode: null,
      createdAt: '2026-11-04T11:10:00.000Z',
      subevents: [],
    },
    {
      id: 'evt-5',
      organizerId: 'usr-docente-1',
      organizerName: 'Prof. Dr. Carlos Eduardo Lima',
      organizerRoleTitle: 'Docente — Sistemas de Informação',
      title: 'Seminário de Pesquisa, Extensão e Energias Renováveis',
      description:
        'Apresentação de artigos e relatórios de iniciação científica sobre sistemas fotovoltaicos, eficiência energética no semiárido e tecnologias sociais.',
      bannerUrl: POSTER_EXTENSAO,
      location: 'Auditório de Engenharia — Bloco B',
      startDate: '2026-10-12',
      endDate: '2026-10-13',
      startTime: '09:00',
      endTime: '18:00',
      maxSlots: 90,
      registeredCount: 88,
      eventType: EventType.Palestra,
      status: EventStatus.Finalizado,
      institutionalOnly: false,
      generateCertificate: true,
      workloadHours: 12,
      eventCode: 'CED26',
      createdAt: '2026-09-20T08:00:00.000Z',
      subevents: [],
    },
    {
      id: 'evt-6',
      organizerId: 'usr-docente-2',
      organizerName: 'Profa. Ma. Mariana Albuquerque',
      organizerRoleTitle: 'Docente — Núcleo de Saúde e Humanidades',
      title: 'Oficina de Escrita Científica e Normas ABNT para Artigos',
      description:
        'Workshop prático para estruturar resumos expandidos, artigos completos e citações científicas para periódicos e anais de congressos.',
      bannerUrl: POSTER_EXTENSAO,
      location: 'Sala 04 — Pós-Graduação',
      startDate: '2026-11-22',
      endDate: '2026-11-22',
      startTime: '09:00',
      endTime: '12:00',
      maxSlots: 40,
      registeredCount: 27,
      eventType: EventType.Oficina,
      status: EventStatus.EmBreve,
      institutionalOnly: true,
      generateCertificate: true,
      workloadHours: 4,
      eventCode: null,
      createdAt: '2026-11-05T15:00:00.000Z',
      subevents: [],
    },
    {
      id: 'evt-7',
      organizerId: 'usr-docente-2',
      organizerName: 'Profa. Ma. Mariana Albuquerque',
      organizerRoleTitle: 'Docente — Núcleo de Saúde e Humanidades',
      title: 'Mostra Integrada de Projetos Culturais e Esportivos',
      description:
        'Exposição aberta de grupos artísticos, projetos de extensão comunitária e torneios estudantis integrados ao calendário acadêmico.',
      bannerUrl: POSTER_VOZES,
      location: 'Ginásio Poliesportivo — IFCE Cedro',
      startDate: '2026-12-03',
      endDate: '2026-12-03',
      startTime: '13:30',
      endTime: '17:30',
      maxSlots: 150,
      registeredCount: 64,
      eventType: EventType.Outros,
      status: EventStatus.EmBreve,
      institutionalOnly: false,
      generateCertificate: true,
      workloadHours: 4,
      eventCode: null,
      createdAt: '2026-11-08T12:00:00.000Z',
      subevents: [],
    },
  ];

  const registrations: Registration[] = [
    {
      id: 'reg-1',
      eventId: 'evt-1',
      userId: 'usr-estudante-1',
      status: 'cadastrado',
      registeredAt: '2026-11-10T10:00:00.000Z',
    },
    {
      id: 'reg-2',
      eventId: 'evt-5',
      userId: 'usr-estudante-1',
      status: 'presente',
      checkedInCode: 'CED26',
      certificateCode: 'SEA-IFCE-2026-CED26-8410',
      registeredAt: '2026-10-01T08:30:00.000Z',
      checkedInAt: '2026-10-12T09:15:00.000Z',
    },
    {
      id: 'reg-3',
      eventId: 'evt-2',
      userId: 'usr-docente-1',
      status: 'cadastrado',
      registeredAt: '2026-11-11T14:00:00.000Z',
    },
    {
      id: 'reg-4',
      eventId: 'evt-5',
      userId: 'usr-docente-1',
      status: 'presente',
      checkedInCode: 'CED26',
      certificateCode: 'SEA-IFCE-2026-CED26-1102',
      registeredAt: '2026-10-01T11:00:00.000Z',
      checkedInAt: '2026-10-12T09:20:00.000Z',
    },
    {
      id: 'reg-5',
      eventId: 'evt-5',
      userId: 'usr-externo-1',
      status: 'presente',
      checkedInCode: 'CED26',
      certificateCode: 'SEA-IFCE-2026-CED26-5592',
      registeredAt: '2026-10-02T16:00:00.000Z',
      checkedInAt: '2026-10-12T09:25:00.000Z',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'not-1',
      category: 'Docentes',
      senderName: 'Profa. Mariana Albuquerque',
      senderRole: 'Docente',
      title: 'Palestra de Higiene e Autocuidado',
      message: 'haverá um atraso de 10 minutos na abertura do auditório, aguardem.',
      timestamp: '16 de Nov às 13:40',
      read: false,
      type: 'info',
    },
    {
      id: 'not-2',
      category: 'Eventos',
      senderName: 'Sistema SEA',
      title: 'Lembrete de início',
      message: 'O evento "XI Semana de Tecnologia e Inovação" está com credenciamento aberto (código Q87OP).',
      timestamp: '16 de Nov às 13:10',
      read: false,
      type: 'reminder',
    },
  ];

  return {
    users,
    events,
    registrations,
    notifications,
    pendingVerifications: {},
  };
}

function loadDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = createInitialDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    let changed = false;

    parsed.events = (parsed.events || []).map((e) => {
      if ((e.eventType as string) === 'Simpósio') {
        changed = true;
        return { ...e, eventType: EventType.Palestra };
      }
      return e;
    });

    parsed.users = (parsed.users || []).map((u) => {
      const next = { ...u };
      if (next.email.endsWith('@ifce.edu.br')) {
        next.email = next.email.replace(/@ifce\.edu\.br$/i, '@gmail.com');
        changed = true;
      } else if (next.email.endsWith('@aluno.ifce.edu.br')) {
        next.email = next.email.replace(/@aluno\.ifce\.edu\.br$/i, '@gmail.com');
        changed = true;
      }
      if (next.password && !next.password.startsWith('scrypt:')) {
        next.password = hashPassword(next.password);
        changed = true;
      }
      if (next.blocked === undefined) {
        next.blocked = false;
        changed = true;
      }
      return next;
    });

    if (!parsed.users.some((u) => u.email.toLowerCase() === 'admin@gmail.com')) {
      const initialAdmin = createInitialDb().users.find((u) => u.id === 'usr-admin-1');
      if (initialAdmin) {
        parsed.users.unshift(initialAdmin);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch {
    const initial = createInitialDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function saveDb(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function sanitizeUser(u: StoredUser): UserAccount {
  const { password: _pwd, ...rest } = u;
  return rest;
}

function randomCode(len = 5): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  let db = loadDb();

  function getAuthUser(req: express.Request): StoredUser | undefined {
    const authHeader = req.header('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const uid = verifySessionToken(token);
      if (uid) {
        const found = db.users.find((u) => u.id === uid && !u.blocked);
        if (found) return found;
      }
    }
    return undefined;
  }

  // Bootstrap application data
  app.get('/api/bootstrap', (req, res) => {
    const currentUser = getAuthUser(req);
    res.json({
      user: currentUser ? sanitizeUser(currentUser) : null,
      users: db.users.map(sanitizeUser),
      events: db.events,
      registrations: db.registrations,
      notifications: db.notifications,
    });
  });

  // Login (Admin enters via Docente selector with admin@gmail.com / 1989)
  app.post('/api/auth/login', (req, res) => {
    const { identifier, password, expectedRole } = req.body as {
      identifier: string;
      password: string;
      expectedRole?: UserRole;
    };
    const normalized = (identifier || '').trim().toLowerCase();
    const user = db.users.find(
      (u) =>
        u.email.toLowerCase() === normalized ||
        u.matriculaOrCpf.toLowerCase() === normalized
    );

    if (!user || !verifyPassword(password || '', user.password)) {
      res.status(401).json({
        error: 'Credenciais inválidas. Verifique seu e-mail/matrícula e senha.',
      });
      return;
    }

    if (user.blocked) {
      res.status(403).json({
        error: 'Esta conta está suspensa pela administração do SEA.',
      });
      return;
    }

    const roleMatches =
      !expectedRole ||
      user.role === expectedRole ||
      (user.role === UserRole.Admin && expectedRole === UserRole.Docente);

    if (!roleMatches) {
      res.status(403).json({
        error: `Esta conta pertence ao perfil "${user.role}". Selecione o perfil correspondente ou entre com outro e-mail.`,
      });
      return;
    }

    const token = signSessionToken(user.id);
    res.json({ user: sanitizeUser(user), token });
  });

  // Multi-step registration: any valid email (Gmail / personal / academic)
  app.post('/api/auth/register', (req, res) => {
    const {
      name,
      email,
      password,
      matriculaOrCpf,
      birthDate,
      role,
      roleTitle,
      bio,
      avatarUrl,
    } = req.body as Partial<StoredUser>;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    if (role === UserRole.Admin) {
      res.status(403).json({ error: 'Não é permitido cadastrar conta administrativa por esta rota.' });
      return;
    }

    const emailLower = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
      return;
    }

    if (db.users.some((u) => u.email.toLowerCase() === emailLower)) {
      res.status(409).json({ error: 'Já existe uma conta cadastrada com este e-mail.' });
      return;
    }

    const code = String(Math.floor(10000 + Math.random() * 90000));
    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      password: hashPassword(password),
      matriculaOrCpf: (matriculaOrCpf || '').trim() || 'Não informado',
      birthDate: birthDate || '2000-01-01',
      role,
      roleTitle:
        (roleTitle || '').trim() ||
        (role === UserRole.Docente
          ? 'Docente — IFCE Campus Cedro'
          : role === UserRole.Estudante
            ? 'Estudante — IFCE Campus Cedro'
            : 'Participante Externo'),
      bio: (bio || '').trim() || 'Membro da comunidade acadêmica do SEA IFCE.',
      avatarUrl,
      blocked: false,
      followers: [],
      following: [],
      showCreatedEventsOnProfile: true,
      notificationPrefs: {
        receiveNotifications: true,
        eventCreated: true,
        eventReminder: true,
      },
    };

    db.pendingVerifications[emailLower] = { code, user: newUser };
    saveDb(db);

    res.json({
      verificationRequired: true,
      email: newUser.email,
      demoCode: code,
    });
  });

  // Verify 5-digit code and finalize registration
  app.post('/api/auth/verify', (req, res) => {
    const { email, code } = req.body as { email: string; code: string };
    const emailLower = (email || '').trim().toLowerCase();
    const pending = db.pendingVerifications[emailLower];
    if (!pending) {
      res.status(404).json({ error: 'Solicitação de verificação não encontrada.' });
      return;
    }
    if (pending.code !== (code || '').trim()) {
      res.status(400).json({ error: 'Código de verificação inválido. Tente novamente.' });
      return;
    }

    db.users.push(pending.user);
    delete db.pendingVerifications[emailLower];
    saveDb(db);
    const token = signSessionToken(pending.user.id);
    res.json({ user: sanitizeUser(pending.user), token });
  });

  // Update profile / account / notification settings / admin moderation
  app.put('/api/users/:id', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    const isAdmin = authUser.role === UserRole.Admin;
    if (authUser.id !== req.params.id && !isAdmin) {
      res.status(403).json({ error: 'Sem permissão para editar este usuário.' });
      return;
    }

    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const {
      name,
      roleTitle,
      bio,
      email,
      password,
      role,
      matriculaOrCpf,
      blocked,
      avatarUrl,
      showCreatedEventsOnProfile,
      notificationPrefs,
    } = req.body as Partial<StoredUser>;

    if (name !== undefined) user.name = name;
    if (roleTitle !== undefined) user.roleTitle = roleTitle;
    if (bio !== undefined) user.bio = bio;
    if (email !== undefined) user.email = email;
    if (matriculaOrCpf !== undefined) user.matriculaOrCpf = matriculaOrCpf;
    if (password && password.trim().length > 0) user.password = hashPassword(password.trim());
    if (role !== undefined) {
      if (role === UserRole.Admin && !isAdmin) {
        res.status(403).json({ error: 'Apenas administradores podem atribuir perfil Admin.' });
        return;
      }
      user.role = role;
    }
    if (blocked !== undefined && isAdmin) {
      if (user.id === authUser.id && blocked) {
        res.status(400).json({ error: 'Não é possível bloquear sua própria conta.' });
        return;
      }
      user.blocked = Boolean(blocked);
    }
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (showCreatedEventsOnProfile !== undefined) {
      user.showCreatedEventsOnProfile = showCreatedEventsOnProfile;
    }
    if (notificationPrefs !== undefined) {
      user.notificationPrefs = { ...user.notificationPrefs, ...notificationPrefs };
    }

    saveDb(db);
    res.json({ user: sanitizeUser(user) });
  });

  app.delete('/api/users/:id', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    const isAdmin = authUser.role === UserRole.Admin;
    if (authUser.id !== req.params.id && !isAdmin) {
      res.status(403).json({ error: 'Sem permissão para excluir este usuário.' });
      return;
    }
    if (isAdmin && authUser.id === req.params.id && req.query.adminAction === 'true') {
      res.status(400).json({ error: 'Não é possível excluir a conta administrativa ativa por aqui.' });
      return;
    }

    const idx = db.users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }
    db.users.splice(idx, 1);
    db.registrations = db.registrations.filter((r) => r.userId !== req.params.id);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Follow / unfollow organizer
  app.post('/api/users/:id/follow', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    const target = db.users.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const followerId = authUser.id;
    const isFollowing = target.followers.includes(followerId);
    if (isFollowing) {
      target.followers = target.followers.filter((id) => id !== followerId);
      authUser.following = authUser.following.filter((id) => id !== target.id);
    } else {
      target.followers.push(followerId);
      authUser.following.push(target.id);
    }
    saveDb(db);
    res.json({
      following: !isFollowing,
      target: sanitizeUser(target),
      follower: sanitizeUser(authUser),
    });
  });

  // Create event
  app.post('/api/events', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    if (authUser.role !== UserRole.Docente && authUser.role !== UserRole.Admin) {
      res.status(403).json({ error: 'Apenas docentes e administradores podem criar eventos.' });
      return;
    }

    const body = req.body as Partial<EventItem>;
    const newEvent: EventItem = {
      id: `evt-${Date.now()}`,
      organizerId: authUser.id,
      organizerName: authUser.name,
      organizerRoleTitle: authUser.roleTitle,
      title: body.title?.trim() || 'Novo Evento Acadêmico',
      description: body.description?.trim() || 'Evento acadêmico do IFCE Campus Cedro.',
      bannerUrl: body.bannerUrl || POSTER_TECH,
      location: body.location?.trim() || 'Auditório Principal',
      startDate: body.startDate || '2026-12-01',
      endDate: body.endDate || body.startDate || '2026-12-01',
      startTime: body.startTime || '08:00',
      endTime: body.endTime || '12:00',
      maxSlots: Number(body.maxSlots) || 50,
      registeredCount: 0,
      eventType: body.eventType || EventType.Palestra,
      status: body.status || EventStatus.EmAndamento,
      institutionalOnly: Boolean(body.institutionalOnly),
      generateCertificate: body.generateCertificate !== false,
      workloadHours: Number(body.workloadHours) || 4,
      eventCode: null,
      subevents: Array.isArray(body.subevents) ? body.subevents : [],
      createdAt: new Date().toISOString(),
    };

    db.events.unshift(newEvent);
    db.notifications.unshift({
      id: `not-${Date.now()}`,
      category: 'Eventos',
      senderName: authUser.name,
      senderRole: authUser.roleTitle,
      title: 'Novo evento publicado',
      message: `O evento "${newEvent.title}" já está aberto para inscrições.`,
      timestamp: 'Agora mesmo',
      read: false,
      type: 'info',
    });
    saveDb(db);
    res.status(201).json({ event: newEvent });
  });

  // Update event
  app.put('/api/events/:id', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    const evt = db.events.find((e) => e.id === req.params.id);
    if (!evt) {
      res.status(404).json({ error: 'Evento não encontrado.' });
      return;
    }
    if (authUser.role !== UserRole.Admin && evt.organizerId !== authUser.id) {
      res.status(403).json({ error: 'Sem permissão para editar este evento.' });
      return;
    }

    const { id: _ignoreId, organizerId: _ignoreOrg, ...allowedUpdates } =
      req.body as Partial<EventItem>;
    Object.assign(evt, allowedUpdates);
    saveDb(db);
    res.json({ event: evt });
  });

  // Send announcement for event ("Enviar aviso")
  app.post('/api/events/:id/announce', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    const evt = db.events.find((e) => e.id === req.params.id);
    if (!evt) {
      res.status(404).json({ error: 'Evento não encontrado.' });
      return;
    }
    if (authUser.role !== UserRole.Admin && evt.organizerId !== authUser.id) {
      res.status(403).json({ error: 'Sem permissão para enviar avisos deste evento.' });
      return;
    }
    const { message } = req.body as { message?: string };
    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Escreva a mensagem do aviso.' });
      return;
    }

    const notification: NotificationItem = {
      id: `not-${Date.now()}`,
      category: 'Docentes',
      senderName: authUser.name,
      senderRole: authUser.role === UserRole.Admin ? 'Admin' : 'Docente',
      title: evt.title,
      message: message.trim(),
      timestamp: 'Agora mesmo',
      read: false,
      type: 'info',
    };
    db.notifications.unshift(notification);
    saveDb(db);
    res.status(201).json({ notification });
  });

  // Delete or Cancel event
  app.delete('/api/events/:id', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    const idx = db.events.findIndex((e) => e.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Evento não encontrado.' });
      return;
    }
    const evt = db.events[idx];
    if (authUser.role !== UserRole.Admin && evt.organizerId !== authUser.id) {
      res.status(403).json({ error: 'Sem permissão para remover este evento.' });
      return;
    }

    if (req.query.hard === 'true') {
      db.events.splice(idx, 1);
      db.registrations = db.registrations.filter((r) => r.eventId !== evt.id);
      saveDb(db);
      res.json({ deleted: true });
      return;
    }

    evt.status = EventStatus.Cancelado;
    db.notifications.unshift({
      id: `not-${Date.now()}`,
      category: 'Eventos',
      senderName: authUser.name,
      title: 'Evento cancelado',
      message: `O evento "${evt.title}" foi cancelado.`,
      timestamp: 'Agora mesmo',
      read: false,
      type: 'alert',
    });
    saveDb(db);
    res.json({ event: evt });
  });

  // Generate check-in attendance code
  app.post('/api/events/:id/generate-code', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    const evt = db.events.find((e) => e.id === req.params.id);
    if (!evt) {
      res.status(404).json({ error: 'Evento não encontrado.' });
      return;
    }
    if (authUser.role !== UserRole.Admin && evt.organizerId !== authUser.id) {
      res.status(403).json({ error: 'Sem permissão para gerar código deste evento.' });
      return;
    }
    if (!evt.eventCode) {
      evt.eventCode = randomCode(5);
    }
    evt.status = EventStatus.EmAndamento;
    saveDb(db);
    res.json({ event: evt });
  });

  // Finish event
  app.post('/api/events/:id/finish', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    const evt = db.events.find((e) => e.id === req.params.id);
    if (!evt) {
      res.status(404).json({ error: 'Evento não encontrado.' });
      return;
    }
    if (authUser.role !== UserRole.Admin && evt.organizerId !== authUser.id) {
      res.status(403).json({ error: 'Sem permissão para finalizar este evento.' });
      return;
    }
    if (!evt.eventCode) {
      evt.eventCode = randomCode(5);
    }
    evt.status = EventStatus.Finalizado;
    saveDb(db);
    res.json({ event: evt });
  });

  // Register in event (or subevent)
  app.post('/api/events/:id/register', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    const { subeventId } = req.body as { subeventId?: string };
    const evt = db.events.find((e) => e.id === req.params.id);
    if (!evt) {
      res.status(404).json({ error: 'Evento não encontrado.' });
      return;
    }

    if (evt.institutionalOnly && authUser.role === UserRole.Externo) {
      res.status(403).json({
        error: 'Este evento é exclusivo para estudantes e docentes cadastrados no IFCE.',
      });
      return;
    }

    const existing = db.registrations.find(
      (r) =>
        r.eventId === evt.id &&
        r.userId === authUser.id &&
        (r.subeventId || undefined) === (subeventId || undefined) &&
        r.status !== 'cancelado'
    );
    if (existing) {
      res.status(409).json({ error: 'Você já possui inscrição ativa neste evento.' });
      return;
    }

    if (subeventId) {
      const sub = evt.subevents.find((s) => s.id === subeventId);
      if (!sub) {
        res.status(404).json({ error: 'Subevento não encontrado.' });
        return;
      }
      if (sub.registeredCount >= sub.maxSlots) {
        res.status(400).json({ error: 'Não há mais vagas disponíveis para este subevento.' });
        return;
      }
      sub.registeredCount += 1;
    } else {
      if (evt.registeredCount >= evt.maxSlots) {
        res.status(400).json({ error: 'Não há mais vagas disponíveis para este evento.' });
        return;
      }
      evt.registeredCount += 1;
    }

    const reg: Registration = {
      id: `reg-${Date.now()}`,
      eventId: evt.id,
      subeventId,
      userId: authUser.id,
      status: 'cadastrado',
      registeredAt: new Date().toISOString(),
    };
    db.registrations.unshift(reg);
    saveDb(db);
    res.status(201).json({ registration: reg, event: evt });
  });

  // Unregister from event
  app.delete('/api/events/:id/register', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    const subeventId = req.query.subeventId as string | undefined;
    const evt = db.events.find((e) => e.id === req.params.id);
    if (!evt) {
      res.status(404).json({ error: 'Inscrição não encontrada.' });
      return;
    }
    const idx = db.registrations.findIndex(
      (r) =>
        r.eventId === evt.id &&
        r.userId === authUser.id &&
        (r.subeventId || undefined) === (subeventId || undefined) &&
        r.status !== 'cancelado'
    );
    if (idx === -1) {
      res.status(404).json({ error: 'Inscrição ativa não encontrada.' });
      return;
    }
    db.registrations.splice(idx, 1);
    if (subeventId) {
      const sub = evt.subevents.find((s) => s.id === subeventId);
      if (sub && sub.registeredCount > 0) sub.registeredCount -= 1;
    } else if (evt.registeredCount > 0) {
      evt.registeredCount -= 1;
    }
    saveDb(db);
    res.json({ removed: true, event: evt });
  });

  // Participant validates attendance using event code -> auto-generates certificate code
  app.post('/api/registrations/:id/checkin', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    const reg = db.registrations.find((r) => r.id === req.params.id);
    if (!reg) {
      res.status(404).json({ error: 'Inscrição não encontrada.' });
      return;
    }
    if (reg.userId !== authUser.id && authUser.role !== UserRole.Admin) {
      res.status(403).json({ error: 'Sem permissão para validar esta inscrição.' });
      return;
    }
    const evt = db.events.find((e) => e.id === reg.eventId);
    if (!evt) {
      res.status(404).json({ error: 'Evento não encontrado.' });
      return;
    }

    const { code } = req.body as { code: string };
    const cleanCode = (code || '').trim().toUpperCase();
    if (!evt.eventCode) {
      res.status(400).json({
        error: 'O organizador ainda não liberou o código de presença para este evento.',
      });
      return;
    }
    if (cleanCode !== evt.eventCode.toUpperCase()) {
      res.status(400).json({ error: 'Código de presença incorreto. Confira com o organizador.' });
      return;
    }

    reg.status = 'presente';
    reg.checkedInCode = evt.eventCode;
    reg.checkedInAt = new Date().toISOString();
    reg.certificateCode = `SEA-IFCE-2026-${evt.eventCode}-${Math.floor(1000 + Math.random() * 9000)}`;
    saveDb(db);
    res.json({ registration: reg });
  });

  // Organizer or Admin toggles attendee presence directly
  app.post('/api/registrations/:id/toggle-presence', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    const reg = db.registrations.find((r) => r.id === req.params.id);
    if (!reg) {
      res.status(404).json({ error: 'Inscrição não encontrada.' });
      return;
    }
    const evt = db.events.find((e) => e.id === reg.eventId);
    if (!evt) {
      res.status(404).json({ error: 'Evento não encontrado.' });
      return;
    }
    if (authUser.role !== UserRole.Admin && evt.organizerId !== authUser.id) {
      res.status(403).json({ error: 'Sem permissão para alterar presença neste evento.' });
      return;
    }

    if (reg.status === 'presente') {
      reg.status = 'cadastrado';
      reg.checkedInCode = undefined;
      reg.checkedInAt = undefined;
      reg.certificateCode = undefined;
    } else {
      const code = evt.eventCode || randomCode(5);
      evt.eventCode = code;
      reg.status = 'presente';
      reg.checkedInCode = code;
      reg.checkedInAt = new Date().toISOString();
      reg.certificateCode = `SEA-IFCE-2026-${code}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    saveDb(db);
    res.json({ registration: reg, event: evt });
  });

  // Mark notifications read
  app.post('/api/notifications/read', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: 'Autenticação necessária.' });
      return;
    }
    db.notifications.forEach((n) => {
      n.read = true;
    });
    saveDb(db);
    res.json({ notifications: db.notifications });
  });

  // Vite middleware or production static serving
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`SEA IFCE server running on http://0.0.0.0:${port}`);
  });
}

startServer();
