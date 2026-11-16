import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  UserCheck,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Camera,
  ShieldCheck,
} from 'lucide-react';
import { SeaLogo } from './BrandLogo';
import { UserAccount, UserRole } from '../types';

interface AuthFlowProps {
  onAuthenticated: (user: UserAccount) => void;
}

type AuthStep =
  | 'role-select'
  | 'login'
  | 'reg-dados'
  | 'reg-perfil'
  | 'reg-email'
  | 'reg-verify'
  | 'reg-done';

export function AuthFlow({ onAuthenticated }: AuthFlowProps) {
  const [step, setStep] = useState<AuthStep>('role-select');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Docente);

  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Registration fields
  const [fullName, setFullName] = useState('');
  const [matriculaOrCpf, setMatriculaOrCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [regEmail, setRegEmail] = useState('');

  // Verification
  const [digits, setDigits] = useState(['', '', '', '', '']);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<UserAccount | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabels: Record<UserRole, string> = {
    [UserRole.Docente]: 'Docente',
    [UserRole.Estudante]: 'Estudante',
    [UserRole.Externo]: 'Participante externo',
  };

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
          expectedRole: selectedRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Falha ao entrar.');
        return;
      }
      onAuthenticated(data.user);
    } catch {
      setError('Erro de conexão com o servidor institucional.');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickDemoLogin(role: UserRole) {
    setError(null);
    setLoading(true);
    const demoCreds: Record<UserRole, { identifier: string; password: string }> = {
      [UserRole.Docente]: { identifier: 'carlos.lima@ifce.edu.br', password: '123' },
      [UserRole.Estudante]: {
        identifier: 'ana.ferreira@aluno.ifce.edu.br',
        password: '123',
      },
      [UserRole.Externo]: { identifier: 'joao.vasconcelos@gmail.com', password: '123' },
    };
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoCreds[role]),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao acessar conta de demonstração.');
        return;
      }
      onAuthenticated(data.user);
    } catch {
      setError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleRequestVerification(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: regEmail,
          password: regPassword,
          matriculaOrCpf,
          birthDate,
          role: selectedRole,
          roleTitle,
          bio,
          avatarUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao enviar verificação.');
        return;
      }
      setDemoCode(data.demoCode);
      setStep('reg-verify');
    } catch {
      setError('Erro de conexão ao registrar conta.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const code = digits.join('');
    if (code.length < 5) {
      setError('Digite os 5 dígitos do código de verificação.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Código inválido.');
        return;
      }
      setCreatedUser(data.user);
      setStep('reg-done');
    } catch {
      setError('Erro ao verificar código.');
    } finally {
      setLoading(false);
    }
  }

  function handleDigitChange(index: number, value: string) {
    const clean = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < 4) {
      const el = document.getElementById(`otp-digit-${index + 1}`);
      el?.focus();
    }
  }

  const emailPlaceholder =
    selectedRole === UserRole.Docente
      ? 'nome.sobrenome@ifce.edu.br'
      : selectedRole === UserRole.Estudante
        ? 'nome.sobrenome@aluno.ifce.edu.br'
        : 'seu.email@exemplo.com';

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden flex items-center justify-center p-6 lg:p-12">
      {/* Organic Figma corner waves (top-left green, bottom-left sky blue) */}
      <svg
        viewBox="0 0 400 320"
        className="pointer-events-none absolute -top-12 -left-16 w-[340px] md:w-[420px] opacity-90"
        aria-hidden="true"
      >
        <path
          d="M0 0 H330 C270 60, 290 135, 200 175 C115 215, 95 275, 0 300 Z"
          fill="#6EE792"
        />
      </svg>
      <svg
        viewBox="0 0 420 340"
        className="pointer-events-none absolute -bottom-16 -left-12 w-[360px] md:w-[450px] opacity-90"
        aria-hidden="true"
      >
        <path
          d="M0 340 V80 C95 110, 125 185, 225 210 C315 235, 340 295, 405 340 Z"
          fill="#5CC8F2"
        />
      </svg>

      {/* Main split container matching Screenshot 8 */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left brand showcase */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left px-4 py-6">
          <SeaLogo size="lg" showSubtitle />
          <p className="mt-6 max-w-md text-sm text-slate-600 leading-relaxed hidden lg:block">
            Plataforma oficial do <strong className="text-slate-800">IFCE Campus Cedro</strong> para
            organização de simpósios, palestras, submissão de artigos científicos e emissão
            automática de certificados verificáveis.
          </p>
        </div>

        {/* Right Card */}
        <div className="w-full max-w-[440px] mx-auto bg-white rounded-3xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] border border-slate-100 p-7 sm:p-9">
          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: Role Selection ("Bem vindo ao SEA!") */}
          {step === 'role-select' && (
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 text-center">
                Bem vindo ao SEA!
              </h1>
              <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
                Selecione seu perfil de usuário para acessar os eventos acadêmicos do IFCE Campus
                Cedro.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  {
                    role: UserRole.Docente,
                    title: 'Docente',
                    desc: 'Login institucional @ifce.edu.br · Criar eventos e avaliar artigos',
                    icon: GraduationCap,
                  },
                  {
                    role: UserRole.Estudante,
                    title: 'Estudante',
                    desc: 'Login acadêmico @aluno.ifce.edu.br · Inscrições e submissão',
                    icon: BookOpen,
                  },
                  {
                    role: UserRole.Externo,
                    title: 'Participante externo',
                    desc: 'Comunidade externa · Eventos abertos e certificados',
                    icon: UserCheck,
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = selectedRole === opt.role;
                  return (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => {
                        setSelectedRole(opt.role);
                        setError(null);
                      }}
                      className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'border-[#4ADE80] bg-[#F2FDF5] shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            active
                              ? 'bg-[#C1F4CC] text-emerald-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900">{opt.title}</div>
                          <div className="text-[11px] text-slate-500 truncate">{opt.desc}</div>
                        </div>
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          active ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                        }`}
                      >
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setStep('login')}
                className="mt-6 w-full py-2.5 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-sm transition-colors cursor-pointer"
              >
                Continuar
              </button>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 text-center mb-2.5">
                  Acesso rápido de demonstração:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickDemoLogin(UserRole.Docente)}
                    className="py-1.5 px-2 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/60 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    Docente
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickDemoLogin(UserRole.Estudante)}
                    className="py-1.5 px-2 rounded-lg border border-slate-200 hover:border-sky-400 hover:bg-sky-50/60 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    Estudante
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickDemoLogin(UserRole.Externo)}
                    className="py-1.5 px-2 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    Externo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Login */}
          {step === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep('role-select');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
                <span className="text-xs font-medium text-sky-700">
                  Perfil: {roleLabels[selectedRole]}
                </span>
              </div>

              <h1 className="font-display text-2xl font-bold text-slate-900 text-center">Login</h1>
              <p className="text-xs text-slate-500 text-center mt-1">
                Entre com sua conta institucional do IFCE
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    {selectedRole === UserRole.Externo
                      ? 'E-mail ou CPF'
                      : 'E-mail institucional ou Matrícula'}
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={emailPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-2.5 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Autenticando...' : 'Entrar'}
              </button>

              <div className="mt-4 text-center text-xs text-slate-500">
                Não possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep('reg-dados');
                  }}
                  className="text-sky-600 font-semibold hover:underline cursor-pointer"
                >
                  Cadastre-se
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Demo ({roleLabels[selectedRole]}): senha 123</span>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(selectedRole)}
                  className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  Entrar direto
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Registration - Seus dados */}
          {step === 'reg-dados' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (regPassword !== regConfirmPassword) {
                  setError('As senhas digitadas não coincidem.');
                  return;
                }
                setError(null);
                setStep('reg-perfil');
              }}
            >
              <button
                type="button"
                onClick={() => setStep('login')}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-3 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <h2 className="font-display text-xl font-bold text-slate-900 text-center">
                Seus dados
              </h2>
              <p className="text-xs text-slate-500 text-center mt-1">
                Etapa 1 de 4 · Cadastro ({roleLabels[selectedRole]})
              </p>

              <div className="mt-5 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {selectedRole === UserRole.Externo ? 'CPF' : 'Matrícula / SIAPE'}
                    </label>
                    <input
                      type="text"
                      required
                      value={matriculaOrCpf}
                      onChange={(e) => setMatriculaOrCpf(e.target.value)}
                      placeholder={selectedRole === UserRole.Externo ? '000.000.000-00' : '20261030...'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nascimento
                    </label>
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cargo / Curso
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder={
                      selectedRole === UserRole.Docente
                        ? 'Docente — Engenharia / Computação'
                        : selectedRole === UserRole.Estudante
                          ? 'Estudante — Sistemas de Informação'
                          : 'Comunidade Externa'
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Senha</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Confirmar
                    </label>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-5 w-full py-2.5 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-sm transition-colors cursor-pointer"
              >
                Continuar
              </button>
            </form>
          )}

          {/* STEP 4: Registration - Perfil */}
          {step === 'reg-perfil' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep('reg-email');
              }}
            >
              <button
                type="button"
                onClick={() => setStep('reg-dados')}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-3 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <h2 className="font-display text-xl font-bold text-slate-900 text-center">Perfil</h2>
              <p className="text-xs text-slate-500 text-center mt-1">
                Etapa 2 de 4 · Personalize sua apresentação acadêmica
              </p>

              <div className="mt-5 flex flex-col items-center">
                <label className="relative cursor-pointer group">
                  <div className="w-20 h-20 rounded-full bg-[#EBF9EF] border-2 border-[#7BE495] overflow-hidden flex items-center justify-center text-emerald-700 font-bold text-xl">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (fullName || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm">
                    <Camera className="w-3.5 h-3.5" />
                  </span>
                  <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                </label>
                <span className="text-[11px] text-slate-500 mt-2">
                  Clique para enviar foto (opcional)
                </span>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Biografia acadêmica
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte sobre suas áreas de pesquisa, curso ou interesses..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="mt-5 w-full py-2.5 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-sm transition-colors cursor-pointer"
              >
                Continuar
              </button>
            </form>
          )}

          {/* STEP 5: Registration - Email institucional */}
          {step === 'reg-email' && (
            <form onSubmit={handleRequestVerification}>
              <button
                type="button"
                onClick={() => setStep('reg-perfil')}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-3 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <h2 className="font-display text-xl font-bold text-slate-900 text-center">E-mail</h2>
              <p className="text-xs text-slate-500 text-center mt-1 leading-relaxed">
                {selectedRole === UserRole.Docente
                  ? 'Informe seu e-mail institucional (@ifce.edu.br) para validação.'
                  : selectedRole === UserRole.Estudante
                    ? 'Informe seu e-mail acadêmico (@aluno.ifce.edu.br) para validação.'
                    : 'Informe seu e-mail para recebimento de certificados e código de verificação.'}
              </p>

              <div className="mt-5">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  E-mail {selectedRole !== UserRole.Externo ? 'institucional' : ''}
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder={emailPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-2.5 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-sm transition-colors cursor-pointer"
              >
                {loading ? 'Enviando código...' : 'Continuar'}
              </button>
            </form>
          )}

          {/* STEP 6: Registration - Verificação 5 dígitos */}
          {step === 'reg-verify' && (
            <form onSubmit={handleVerifyCode}>
              <button
                type="button"
                onClick={() => setStep('reg-email')}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-3 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <div className="flex justify-center mb-2">
                <div className="w-11 h-11 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900 text-center">
                Verificação
              </h2>
              <p className="text-xs text-slate-500 text-center mt-1">
                Digite o código de 5 dígitos enviado para <strong>{regEmail}</strong>
              </p>

              {demoCode && (
                <div className="mt-3 rounded-xl bg-[#EEFBF2] border border-[#A6DFB6] px-3 py-2 text-center text-xs text-emerald-900">
                  Código de verificação gerado:{' '}
                  <span className="font-mono font-bold tracking-widest">{demoCode}</span>
                </div>
              )}

              <div className="mt-5 flex justify-center gap-2.5">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-digit-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    className="w-11 h-12 text-center font-mono text-lg font-bold rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-2.5 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-sm transition-colors cursor-pointer"
              >
                {loading ? 'Validando...' : 'Criar conta'}
              </button>
            </form>
          )}

          {/* STEP 7: Cadastro finalizado */}
          {step === 'reg-done' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#EBF9EF] text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Cadastro finalizado!
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Seja muito bem-vindo ao SEA IFCE Campus Cedro!
              </p>
              <button
                type="button"
                onClick={() => {
                  if (createdUser) onAuthenticated(createdUser);
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-sm transition-colors cursor-pointer"
              >
                Página inicial
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
