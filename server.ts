import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  EventItem,
  EventStatus,
  EventType,
  NotificationItem,
  PaperSubmission,
  Registration,
  SubmissionStatus,
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
  submissions: PaperSubmission[];
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

function createInitialDb(): DatabaseSchema {
  const users: StoredUser[] = [
    {
      id: 'usr-docente-1',
      name: 'Prof. Dr. Carlos Eduardo Lima',
      email: 'carlos.lima@ifce.edu.br',
      password: '123',
      matriculaOrCpf: 'SIAPE 1849201',
      birthDate: '1984-05-14',
      role: UserRole.Docente,
      roleTitle: 'Docente — Sistemas de Informação',
      bio: 'Coordenador de projetos de pesquisa e extensão no IFCE Campus Cedro. Foco em Engenharia de Software, Computação Aplicada e Inclusão Digital no Centro-Sul Cearense.',
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
      email: 'mariana.albuquerque@ifce.edu.br',
      password: '123',
      matriculaOrCpf: 'SIAPE 2190443',
      birthDate: '1989-11-02',
      role: UserRole.Docente,
      roleTitle: 'Docente — Núcleo de Saúde e Humanidades',
      bio: 'Pesquisadora em Saúde Coletiva, Bem-Estar Estudantil e Ações Afirmativas no IFCE Campus Cedro.',
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
      email: 'ana.ferreira@aluno.ifce.edu.br',
      password: '123',
      matriculaOrCpf: '20241030400125',
      birthDate: '2004-03-22',
      role: UserRole.Estudante,
      roleTitle: 'Estudante — Bacharelado em Sistemas de Informação',
      bio: 'Graduanda em Sistemas de Informação e bolsista de Iniciação Científica (PIBIC/IFCE). Entusiasta de IA aplicada à educação.',
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
      password: '123',
      matriculaOrCpf: '048.392.113-90',
      birthDate: '1999-08-19',
      role: UserRole.Externo,
      roleTitle: 'Participante Externo — Comunidade Regional',
      bio: 'Desenvolvedor full-stack egresso e participante ativo dos simpósios e minicursos abertos à comunidade no Campus Cedro.',
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
      eventType: EventType.Simposio,
      status: EventStatus.EmAndamento,
      institutionalOnly: false,
      generateCertificate: true,
      acceptSubmissions: true,
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
      acceptSubmissions: false,
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
      acceptSubmissions: true,
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
      acceptSubmissions: false,
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
      acceptSubmissions: true,
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
      acceptSubmissions: false,
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
      acceptSubmissions: false,
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

  const submissions: PaperSubmission[] = [
    {
      id: 'subm-1',
      eventId: 'evt-1',
      eventTitle: 'XI Semana de Tecnologia e Inovação do IFCE Cedro',
      authorId: 'usr-estudante-1',
      authorName: 'Ana Beatriz Ferreira',
      authorEmail: 'ana.ferreira@aluno.ifce.edu.br',
      coAuthors: 'Prof. Dr. Carlos Eduardo Lima',
      title: 'Monitoramento Inteligente de Irrigação Agrícola no Semiárido Cearense via IoT',
      abstract:
        'Este trabalho apresenta o desenvolvimento e validação em campo de um sistema de baixo custo baseado em microcontroladores ESP32 e sensores de umidade do solo para otimizar o consumo hídrico na agricultura familiar da região Centro-Sul do Ceará.',
      track: 'Sistemas Embarcados e IoT',
      keywords: 'IoT; Agricultura Familiar; Eficiência Hídrica; ESP32',
      fileName: 'artigo_irrigacao_iot_ifce2026.pdf',
      fileSize: '1.4 MB',
      status: SubmissionStatus.Aprovado,
      reviewerFeedback:
        'Excelente fundamentação metodológica e resultados experimentais consistentes com a realidade regional.',
      submittedAt: '2026-11-05T16:40:00.000Z',
      certificateCode: 'SEA-ART-2026-1094',
    },
    {
      id: 'subm-2',
      eventId: 'evt-5',
      eventTitle: 'Seminário de Pesquisa, Extensão e Energias Renováveis',
      authorId: 'usr-externo-1',
      authorName: 'João Pedro Vasconcelos',
      authorEmail: 'joao.vasconcelos@gmail.com',
      coAuthors: 'Profa. Ma. Mariana Albuquerque',
      title: 'Análise de Desempenho Fotovoltaico em Coberturas Escolares Públicas',
      abstract:
        'Avaliação comparativa de geração solar distribuída em edificações públicas municipais utilizando dados telemétricos de 12 meses.',
      track: 'Energias Renováveis e Sustentabilidade',
      keywords: 'Energia Solar; Eficiência Energética; Escolas Públicas',
      fileName: 'analise_fotovoltaica_cedro.pdf',
      fileSize: '2.1 MB',
      status: SubmissionStatus.EmAvaliacao,
      submittedAt: '2026-11-12T09:15:00.000Z',
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
    {
      id: 'not-3',
      category: 'Eventos',
      senderName: 'Comitê Científico',
      title: 'Submissão avaliada',
      message: 'Um artigo submetido recebeu parecer favorável para apresentação oral.',
      timestamp: '15 de Nov às 18:45',
      read: true,
      type: 'info',
    },
  ];

  return {
    users,
    events,
    registrations,
    submissions,
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
    return JSON.parse(raw) as DatabaseSchema;
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

  // Bootstrap all application data
  app.get('/api/bootstrap', (req, res) => {
    const userId = req.header('x-user-id') || (req.query.userId as string | undefined);
    const currentUser = userId ? db.users.find((u) => u.id === userId) : undefined;
    res.json({
      user: currentUser ? sanitizeUser(currentUser) : null,
      users: db.users.map(sanitizeUser),
      events: db.events,
      registrations: db.registrations,
      submissions: db.submissions,
      notifications: db.notifications,
    });
  });

  // Institutional & external login
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

    if (!user || user.password !== password) {
      res.status(401).json({
        error: 'Credenciais inválidas. Verifique seu e-mail institucional/matrícula e senha.',
      });
      return;
    }

    if (expectedRole && user.role !== expectedRole) {
      res.status(403).json({
        error: `Esta conta pertence ao perfil "${user.role}". Selecione o perfil correspondente ou entre com outro e-mail.`,
      });
      return;
    }

    res.json({ user: sanitizeUser(user) });
  });

  // Multi-step registration: request 5-digit verification code
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

    const emailLower = email.trim().toLowerCase();
    if (role === UserRole.Docente && !emailLower.endsWith('@ifce.edu.br')) {
      res.status(400).json({
        error: 'Docentes devem utilizar o e-mail institucional (@ifce.edu.br).',
      });
      return;
    }
    if (
      role === UserRole.Estudante &&
      !(emailLower.endsWith('@aluno.ifce.edu.br') || emailLower.endsWith('@ifce.edu.br'))
    ) {
      res.status(400).json({
        error: 'Estudantes devem utilizar o e-mail acadêmico (@aluno.ifce.edu.br).',
      });
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
      password,
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
    res.json({ user: sanitizeUser(pending.user) });
  });

  // Update profile / account / notification settings
  app.put('/api/users/:id', (req, res) => {
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
      avatarUrl,
      showCreatedEventsOnProfile,
      notificationPrefs,
    } = req.body as Partial<StoredUser>;

    if (name !== undefined) user.name = name;
    if (roleTitle !== undefined) user.roleTitle = roleTitle;
    if (bio !== undefined) user.bio = bio;
    if (email !== undefined) user.email = email;
    if (password && password.trim().length > 0) user.password = password;
    if (role !== undefined) user.role = role;
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
    const target = db.users.find((u) => u.id === req.params.id);
    const { followerId } = req.body as { followerId: string };
    const follower = db.users.find((u) => u.id === followerId);
    if (!target || !follower) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const isFollowing = target.followers.includes(followerId);
    if (isFollowing) {
      target.followers = target.followers.filter((id) => id !== followerId);
      follower.following = follower.following.filter((id) => id !== target.id);
    } else {
      target.followers.push(followerId);
      follower.following.push(target.id);
    }
    saveDb(db);
    res.json({
      following: !isFollowing,
      target: sanitizeUser(target),
      follower: sanitizeUser(follower),
    });
  });

  // Create event
  app.post('/api/events', (req, res) => {
    const body = req.body as Partial<EventItem> & { organizerId: string };
    const organizer = db.users.find((u) => u.id === body.organizerId);
    if (!organizer) {
      res.status(404).json({ error: 'Organizador não encontrado.' });
      return;
    }

    const newEvent: EventItem = {
      id: `evt-${Date.now()}`,
      organizerId: organizer.id,
      organizerName: organizer.name,
      organizerRoleTitle: organizer.roleTitle,
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
      acceptSubmissions: Boolean(body.acceptSubmissions),
      workloadHours: Number(body.workloadHours) || 4,
      eventCode: null,
      subevents: Array.isArray(body.subevents) ? body.subevents : [],
      createdAt: new Date().toISOString(),
    };

    db.events.unshift(newEvent);
    db.notifications.unshift({
      id: `not-${Date.now()}`,
      category: 'Eventos',
      senderName: organizer.name,
      senderRole: organizer.roleTitle,
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
    const evt = db.events.find((e) => e.id === req.params.id);
    if (!evt) {
      res.status(404).json({ error: 'Evento não encontrado.' });
      return;
    }
    Object.assign(evt, req.body);
    saveDb(db);
    res.json({ event: evt });
  });

  // Delete / Cancel event
  app.delete('/api/events/:id', (req, res) => {
    const evt = db.events.find((e) => e.id === req.params.id);
    if (!evt) {
      res.status(404).json({ error: 'Evento não encontrado.' });
      return;
    }
    evt.status = EventStatus.Cancelado;
    db.notifications.unshift({
      id: `not-${Date.now()}`,
      category: 'Eventos',
      senderName: evt.organizerName,
      title: 'Evento cancelado',
      message: `O evento "${evt.title}" foi cancelado pelo organizador.`,
      timestamp: 'Agora mesmo',
      read: false,
      type: 'alert',
    });
    saveDb(db);
    res.json({ event: evt });
  });

  // Generate check-in attendance code
  app.post('/api/events/:id/generate-code', (req, res) => {
    const evt = db.events.find((e) => e.id === req.params.id);
    if (!evt) {
      res.status(404).json({ error: 'Evento não encontrado.' });
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
    const evt = db.events.find((e) => e.id === req.params.id);
    if (!evt) {
      res.status(404).json({ error: 'Evento não encontrado.' });
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
    const { userId, subeventId } = req.body as { userId: string; subeventId?: string };
    const evt = db.events.find((e) => e.id === req.params.id);
    const user = db.users.find((u) => u.id === userId);
    if (!evt || !user) {
      res.status(404).json({ error: 'Evento ou usuário não encontrado.' });
      return;
    }

    if (evt.institutionalOnly && user.role === UserRole.Externo) {
      res.status(403).json({
        error: 'Este evento é exclusivo para estudantes e docentes com login institucional do IFCE.',
      });
      return;
    }

    const existing = db.registrations.find(
      (r) =>
        r.eventId === evt.id &&
        r.userId === userId &&
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
      userId,
      status: 'cadastrado',
      registeredAt: new Date().toISOString(),
    };
    db.registrations.unshift(reg);
    saveDb(db);
    res.status(201).json({ registration: reg, event: evt });
  });

  // Unregister from event
  app.delete('/api/events/:id/register', (req, res) => {
    const userId = req.header('x-user-id') || (req.query.userId as string);
    const subeventId = req.query.subeventId as string | undefined;
    const evt = db.events.find((e) => e.id === req.params.id);
    if (!evt || !userId) {
      res.status(404).json({ error: 'Inscrição não encontrada.' });
      return;
    }
    const idx = db.registrations.findIndex(
      (r) =>
        r.eventId === evt.id &&
        r.userId === userId &&
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

  // Organizer toggles attendee presence directly
  app.post('/api/registrations/:id/toggle-presence', (req, res) => {
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

  // Submit paper / article
  app.post('/api/submissions', (req, res) => {
    const {
      eventId,
      authorId,
      coAuthors,
      title,
      abstract,
      track,
      keywords,
      fileName,
      fileSize,
    } = req.body as Partial<PaperSubmission>;

    const evt = db.events.find((e) => e.id === eventId);
    const author = db.users.find((u) => u.id === authorId);
    if (!evt || !author) {
      res.status(404).json({ error: 'Evento ou autor não encontrado.' });
      return;
    }

    const submission: PaperSubmission = {
      id: `subm-${Date.now()}`,
      eventId: evt.id,
      eventTitle: evt.title,
      authorId: author.id,
      authorName: author.name,
      authorEmail: author.email,
      coAuthors: (coAuthors || '').trim(),
      title: (title || '').trim() || 'Artigo sem título',
      abstract: (abstract || '').trim(),
      track: (track || '').trim() || 'Tecnologia e Inovação',
      keywords: (keywords || '').trim() || 'IFCE; Pesquisa',
      fileName: fileName || 'artigo_submetido.pdf',
      fileSize: fileSize || '1.2 MB',
      status: SubmissionStatus.EmAvaliacao,
      submittedAt: new Date().toISOString(),
    };

    db.submissions.unshift(submission);
    db.notifications.unshift({
      id: `not-${Date.now()}`,
      category: 'Docentes',
      senderName: author.name,
      senderRole: author.roleTitle,
      title: 'Nova submissão de artigo',
      message: `Artigo "${submission.title}" submetido para "${evt.title}".`,
      timestamp: 'Agora mesmo',
      read: false,
      type: 'info',
    });
    saveDb(db);
    res.status(201).json({ submission });
  });

  // Review / update article submission status
  app.patch('/api/submissions/:id', (req, res) => {
    const subm = db.submissions.find((s) => s.id === req.params.id);
    if (!subm) {
      res.status(404).json({ error: 'Submissão não encontrada.' });
      return;
    }
    const { status, reviewerFeedback } = req.body as {
      status: SubmissionStatus;
      reviewerFeedback?: string;
    };
    subm.status = status;
    if (reviewerFeedback !== undefined) {
      subm.reviewerFeedback = reviewerFeedback;
    }
    if (status === SubmissionStatus.Aprovado && !subm.certificateCode) {
      subm.certificateCode = `SEA-ART-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    db.notifications.unshift({
      id: `not-${Date.now()}`,
      category: 'Eventos',
      senderName: 'Comitê Científico',
      title: 'Atualização de artigo',
      message: `Seu artigo "${subm.title}" foi marcado como "${status}".`,
      timestamp: 'Agora mesmo',
      read: false,
      type: 'info',
    });
    saveDb(db);
    res.json({ submission: subm });
  });

  // Mark notifications read
  app.post('/api/notifications/read', (_req, res) => {
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
