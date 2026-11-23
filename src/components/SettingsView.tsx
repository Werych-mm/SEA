import React, { useState } from 'react';
import {
  User,
  Bell,
  Info,
  LogOut,
  XCircle,
  ChevronDown,
  ChevronRight,
  Camera,
  Calendar,
  Megaphone,
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface SettingsViewProps {
  user: UserAccount;
  initialTab?: 'perfil' | 'conta' | 'notificacoes' | 'sobre';
  onUpdateUser: (updates: Partial<UserAccount> & { password?: string }) => Promise<void>;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
}

export function SettingsView({
  user,
  initialTab = 'perfil',
  onUpdateUser,
  onLogout,
  onDeleteAccount,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'perfil' | 'conta' | 'notificacoes' | 'sobre'>(
    initialTab
  );
  const [accountAccordionOpen, setAccountAccordionOpen] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);

  // Profile fields
  const [name, setName] = useState(user.name);
  const [roleTitle, setRoleTitle] = useState(user.roleTitle);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  // Account fields
  const [email, setEmail] = useState(user.email);
  const [newPassword, setNewPassword] = useState('');
  const [role, setRole] = useState<UserRole>(user.role);

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState(user.notificationPrefs);
  const [showEvents, setShowEvents] = useState(user.showCreatedEventsOnProfile);
  const [aboutModal, setAboutModal] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  function notifySaved() {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function saveProfileEdits() {
    await onUpdateUser({ name, roleTitle, bio, avatarUrl });
    setEditingProfile(false);
    notifySaved();
  }

  async function saveAccountEdits() {
    await onUpdateUser({
      email,
      role,
      ...(newPassword.trim() ? { password: newPassword.trim() } : {}),
    });
    setNewPassword('');
    notifySaved();
  }

  async function saveNotificationEdits() {
    await onUpdateUser({ notificationPrefs: notifPrefs });
    notifySaved();
  }

  async function toggleShowCreatedEvents() {
    const next = !showEvents;
    setShowEvents(next);
    await onUpdateUser({ showCreatedEventsOnProfile: next });
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Settings Menu (Screenshot 7) */}
          <aside className="md:col-span-4 lg:col-span-3 md:border-r border-slate-100 md:pr-6 space-y-1.5">
            <div>
              <button
                type="button"
                onClick={() => setAccountAccordionOpen((o) => !o)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                <span className="inline-flex items-center gap-2.5">
                  <User className="w-4 h-4 text-sky-600" />
                  Minha conta
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    accountAccordionOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {accountAccordionOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('perfil');
                      setEditingProfile(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                      activeTab === 'perfil'
                        ? 'bg-slate-200/80 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('conta')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                      activeTab === 'conta'
                        ? 'bg-slate-200/80 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Conta
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('notificacoes')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                activeTab === 'notificacoes'
                  ? 'bg-slate-200/80 text-slate-900 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bell className="w-4 h-4 text-slate-500" />
              Notificações
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sobre')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                activeTab === 'sobre'
                  ? 'bg-slate-200/80 text-slate-900 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Info className="w-4 h-4 text-slate-500" />
              Sobre
            </button>

            <div className="my-3 border-t border-slate-100" />

            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>

            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              Excluir conta
            </button>
          </aside>

          {/* Right Settings Content */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            {savedNotice && (
              <div className="rounded-xl bg-[#EBF9EF] border border-[#8CE8A4] px-4 py-2 text-xs font-semibold text-emerald-900">
                Alterações salvas com sucesso!
              </div>
            )}

            {/* TAB 1: Perfil (View & Edit modes matching Screenshot 7) */}
            {activeTab === 'perfil' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">Perfil</h2>
                  {editingProfile && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Foto, nome, cargo e biografia.
                    </p>
                  )}
                </div>

                <div className="border border-slate-200 rounded-2xl p-6">
                  {!editingProfile ? (
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                      <div className="text-center shrink-0">
                        <div className="w-24 h-24 rounded-full bg-[#EBF9EF] border-2 border-[#8CE8A4] overflow-hidden flex items-center justify-center text-3xl font-bold text-emerald-700 mx-auto">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            name.charAt(0)
                          )}
                        </div>
                        <div className="font-bold text-sm text-slate-900 mt-3">{name}</div>
                        <div className="text-xs text-slate-500">{roleTitle}</div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between w-full gap-4">
                        <div className="bg-slate-100 rounded-2xl p-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {bio}
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingProfile(true)}
                            className="px-5 py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-xs cursor-pointer"
                          >
                            Editar perfil
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                        <div className="sm:col-span-5 space-y-3 flex flex-col items-center">
                          <label className="relative cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-[#EBF9EF] border-2 border-[#8CE8A4] overflow-hidden flex items-center justify-center text-3xl font-bold text-emerald-700">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                name.charAt(0)
                              )}
                            </div>
                            <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                              <Camera className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="hidden"
                            />
                          </label>

                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                          <input
                            type="text"
                            value={roleTitle}
                            onChange={(e) => setRoleTitle(e.target.value)}
                            placeholder="Cargo"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-7">
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Biografia
                          </label>
                          <textarea
                            rows={6}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setName(user.name);
                            setRoleTitle(user.roleTitle);
                            setBio(user.bio);
                            setEditingProfile(false);
                          }}
                          className="px-5 py-2 rounded-xl bg-[#BCE7FA] hover:bg-[#9cdbf7] text-slate-900 font-semibold text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={saveProfileEdits}
                          className="px-5 py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-xs cursor-pointer"
                        >
                          Salvar edições
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Conta */}
            {activeTab === 'conta' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">Conta</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    E-mail, senha e tipo de usuário.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Deixe vazio para manter"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  <div className="max-w-xs">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipo Usuário
                    </label>
                    <select
                      value={role}
                      disabled={user.role === UserRole.Admin}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white disabled:bg-slate-50"
                    >
                      {user.role === UserRole.Admin && (
                        <option value={UserRole.Admin}>Admin</option>
                      )}
                      <option value={UserRole.Docente}>Docente</option>
                      <option value={UserRole.Estudante}>Estudante</option>
                      <option value={UserRole.Externo}>Participante externo</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(user.email);
                        setRole(user.role);
                        setNewPassword('');
                      }}
                      className="px-5 py-2 rounded-xl bg-[#BCE7FA] hover:bg-[#9cdbf7] text-slate-900 font-semibold text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={saveAccountEdits}
                      className="px-5 py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-xs cursor-pointer"
                    >
                      Salvar edições
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Notificações */}
            {activeTab === 'notificacoes' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">Notificações</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure como deseja receber suas notificações.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl p-6 space-y-4">
                  {[
                    {
                      key: 'receiveNotifications' as const,
                      label: 'Receber notificações',
                      icon: Bell,
                    },
                    {
                      key: 'eventCreated' as const,
                      label: 'Evento criado por quem você segue',
                      icon: Calendar,
                    },
                    {
                      key: 'eventReminder' as const,
                      label: 'Lembrete de evento próximo',
                      icon: Megaphone,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const enabled = notifPrefs[item.key];
                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between gap-4 border border-slate-200 rounded-xl px-4 py-3"
                      >
                        <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-800">
                          <Icon className="w-4 h-4 text-slate-500" />
                          <span>{item.label}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setNotifPrefs((prev) => ({
                              ...prev,
                              [item.key]: !prev[item.key],
                            }))
                          }
                          className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                            enabled ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                              enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setNotifPrefs(user.notificationPrefs)}
                      className="px-5 py-2 rounded-xl bg-[#BCE7FA] hover:bg-[#9cdbf7] text-slate-900 font-semibold text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={saveNotificationEdits}
                      className="px-5 py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-xs cursor-pointer"
                    >
                      Salvar edições
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Sobre */}
            {activeTab === 'sobre' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">Sobre</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Informações institucionais e documentos do SEA IFCE.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl p-6 space-y-3">
                  {[
                    {
                      id: 'conta',
                      title: 'Sobre sua conta',
                      body: `Conta vinculada ao e-mail ${user.email} (${user.matriculaOrCpf}) no perfil ${user.roleTitle}.`,
                    },
                    {
                      id: 'privacidade',
                      title: 'Política de privacidade',
                      body: 'Seus dados cadastrais são utilizados exclusivamente para gestão de inscrições, controle de frequência e emissão de certificados digitais autenticados pelo IFCE Campus Cedro.',
                    },
                    {
                      id: 'termos',
                      title: 'Termos de uso',
                      body: 'A emissão de certificados depende da validação de presença pelo código do evento gerado pela coordenação organizadora.',
                    },
                  ].map((item) => (
                    <div key={item.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setAboutModal(aboutModal === item.id ? null : item.id)
                        }
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 cursor-pointer"
                      >
                        <span>{item.title}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                      {aboutModal === item.id && (
                        <div className="mt-2 px-4 py-3 rounded-xl bg-slate-50 text-xs text-slate-600 leading-relaxed">
                          {item.body}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Toggle (Screenshot 7) */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggleShowCreatedEvents}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  showEvents ? 'bg-sky-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    showEvents ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-semibold text-slate-700">
                Mostrar seus eventos criados no perfil
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <h3 className="font-display font-bold text-lg text-slate-900">
              Excluir conta permanentemente?
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Esta ação removerá seu perfil e suas inscrições ativas no SEA IFCE.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onDeleteAccount}
                className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                Excluir conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
