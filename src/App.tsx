import React, { useEffect, useState, useCallback } from 'react';
import { BellPlus, X, Trash2 } from 'lucide-react';
import {
  AppSection,
  CertificateData,
  EventItem,
  EventType,
  NotificationItem,
  Registration,
  UserAccount,
  UserRole,
} from './types';
import { AuthFlow } from './components/AuthFlow';
import { AppShell } from './components/AppShell';
import { HomeView } from './components/HomeView';
import { CreateEventView } from './components/CreateEventView';
import { EventDetailView } from './components/EventDetailView';
import { MyRegistrationsView } from './components/MyRegistrationsView';
import { MyEventsView } from './components/MyEventsView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { HelpView } from './components/HelpView';
import { AdminManagementView } from './components/AdminManagementView';
import { CertificateModal } from './components/CertificateModal';

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [bootstrapped, setBootstrapped] = useState(false);

  const [section, setSection] = useState<AppSection>('home');
  const [returnAfterEdit, setReturnAfterEdit] = useState<AppSection>('my-events');
  const [categoryFilter, setCategoryFilter] = useState<EventType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<'perfil' | 'conta' | 'notificacoes' | 'sobre'>(
    'perfil'
  );
  const [certificateModal, setCertificateModal] = useState<CertificateData | null>(null);
  const [announceEvent, setAnnounceEvent] = useState<EventItem | null>(null);
  const [announceMessage, setAnnounceMessage] = useState('');
  const [announceSubmitting, setAnnounceSubmitting] = useState(false);
  const [deleteEventTarget, setDeleteEventTarget] = useState<EventItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: 'ok' | 'err' } | null>(null);

  function showToast(msg: string, kind: 'ok' | 'err' = 'ok') {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3200);
  }

  function buildAuthHeaders(
    tokenOverride?: string | null,
    extra: Record<string, string> = {}
  ): Record<string, string> {
    const token = tokenOverride !== undefined ? tokenOverride : authToken;
    const headers: Record<string, string> = { ...extra };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  const loadBootstrap = useCallback(
    async (tokenOverride?: string | null) => {
      const token = tokenOverride !== undefined ? tokenOverride : authToken;
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch('/api/bootstrap', { headers });
      const data = await res.json();
      setAllUsers(data.users || []);
      setEvents(data.events || []);
      setRegistrations(data.registrations || []);
      setNotifications(data.notifications || []);
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
        if (token) {
          setAuthToken(null);
        }
      }
      setBootstrapped(true);
    },
    [authToken]
  );

  useEffect(() => {
    loadBootstrap(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAuthenticated(loggedInUser: UserAccount, token: string) {
    setAuthToken(token);
    setUser(loggedInUser);
    setSection('home');
    loadBootstrap(token);
  }

  function handleLogout() {
    setAuthToken(null);
    setUser(null);
    setSection('home');
  }

  function handleSessionError(status: number, errorMessage?: string) {
    if (status === 401) {
      setAuthToken(null);
      setUser(null);
      showToast(errorMessage || 'Sua sessão expirou. Entre novamente.', 'err');
      return true;
    }
    return false;
  }

  function handleNavigate(nextSection: AppSection, category: EventType | 'all' = 'all') {
    setCategoryFilter(category);
    setEditingEvent(null);
    setSection(nextSection);
  }

  async function handleRegisterEvent(eventId: string, subeventId?: string) {
    if (!user || !authToken) return;
    const res = await fetch(`/api/events/${eventId}/register`, {
      method: 'POST',
      headers: buildAuthHeaders(undefined, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ subeventId }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (!handleSessionError(res.status, data.error)) {
        showToast(data.error || 'Não foi possível concluir a inscrição.', 'err');
      }
      return;
    }
    showToast('Inscrição confirmada no evento!');
    await loadBootstrap();
  }

  async function handleUnregisterEvent(eventId: string, subeventId?: string) {
    if (!user || !authToken) return;
    const q = subeventId ? `?subeventId=${encodeURIComponent(subeventId)}` : '';
    const res = await fetch(`/api/events/${eventId}/register${q}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    });
    if (res.ok) {
      showToast('Inscrição removida.');
      await loadBootstrap();
    } else {
      const data = await res.json().catch(() => ({}));
      if (!handleSessionError(res.status, data.error)) {
        showToast(data.error || 'Não foi possível remover a inscrição.', 'err');
      }
    }
  }

  async function handleQuickCardRegister(evt: EventItem) {
    if (!user) return;
    const isRegistered = registrations.some(
      (r) =>
        r.eventId === evt.id &&
        r.userId === user.id &&
        !r.subeventId &&
        r.status !== 'cancelado'
    );
    if (isRegistered) {
      setSelectedEventId(evt.id);
      setSection('event-detail');
    } else {
      await handleRegisterEvent(evt.id);
    }
  }

  async function handleSaveEvent(payload: Partial<EventItem>, isEdit: boolean) {
    if (!user || !authToken) return;
    const url = isEdit && payload.id ? `/api/events/${payload.id}` : '/api/events';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: buildAuthHeaders(undefined, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      showToast(isEdit ? 'Evento atualizado com sucesso!' : 'Evento publicado com sucesso!');
      setEditingEvent(null);
      setSection(isEdit ? returnAfterEdit : 'my-events');
      setReturnAfterEdit('my-events');
      await loadBootstrap();
    } else {
      const d = await res.json().catch(() => ({}));
      if (!handleSessionError(res.status, d.error)) {
        showToast(d.error || 'Erro ao salvar evento.', 'err');
      }
    }
  }

  async function handleCancelEvent(eventId: string) {
    if (!user || !authToken) return;
    const res = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    });
    if (res.ok) {
      showToast('Evento cancelado.');
      await loadBootstrap();
    } else {
      const d = await res.json().catch(() => ({}));
      if (!handleSessionError(res.status, d.error)) {
        showToast(d.error || 'Erro ao cancelar evento.', 'err');
      }
    }
  }

  async function handleDeleteEventPermanently(eventId: string) {
    if (!user || !authToken) return;
    const res = await fetch(`/api/events/${eventId}?hard=true`, {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    });
    if (res.ok) {
      showToast('Evento excluído permanentemente.');
      await loadBootstrap();
    } else {
      const d = await res.json().catch(() => ({}));
      if (!handleSessionError(res.status, d.error)) {
        showToast(d.error || 'Erro ao excluir evento.', 'err');
      }
    }
  }

  async function handleSendAnnouncementSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !authToken || !announceEvent || !announceMessage.trim()) return;
    setAnnounceSubmitting(true);
    try {
      const res = await fetch(`/api/events/${announceEvent.id}/announce`, {
        method: 'POST',
        headers: buildAuthHeaders(undefined, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ message: announceMessage.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (!handleSessionError(res.status, data.error)) {
          showToast(data.error || 'Não foi possível enviar o aviso.', 'err');
        }
        return;
      }
      showToast('Aviso enviado para as notificações dos participantes!');
      setAnnounceEvent(null);
      setAnnounceMessage('');
      await loadBootstrap();
    } finally {
      setAnnounceSubmitting(false);
    }
  }

  async function handleGenerateCode(eventId: string) {
    if (!user || !authToken) return;
    const res = await fetch(`/api/events/${eventId}/generate-code`, {
      method: 'POST',
      headers: buildAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      showToast(`Código de presença gerado: ${data.event.eventCode}`);
      await loadBootstrap();
    } else {
      const d = await res.json().catch(() => ({}));
      if (!handleSessionError(res.status, d.error)) {
        showToast(d.error || 'Erro ao gerar código.', 'err');
      }
    }
  }

  async function handleFinishEvent(eventId: string) {
    if (!user || !authToken) return;
    const res = await fetch(`/api/events/${eventId}/finish`, {
      method: 'POST',
      headers: buildAuthHeaders(),
    });
    if (res.ok) {
      showToast('Evento encerrado e movido para finalizados.');
      await loadBootstrap();
    } else {
      const d = await res.json().catch(() => ({}));
      if (!handleSessionError(res.status, d.error)) {
        showToast(d.error || 'Erro ao encerrar evento.', 'err');
      }
    }
  }

  async function handleCheckIn(registrationId: string, code: string) {
    if (!user || !authToken) return;
    const res = await fetch(`/api/registrations/${registrationId}/checkin`, {
      method: 'POST',
      headers: buildAuthHeaders(undefined, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) {
      handleSessionError(res.status, data.error);
      throw new Error(data.error || 'Código inválido.');
    }
    showToast('Presença validada! Certificado liberado automaticamente.');
    await loadBootstrap();
  }

  async function handleTogglePresence(registrationId: string) {
    if (!user || !authToken) return;
    const res = await fetch(`/api/registrations/${registrationId}/toggle-presence`, {
      method: 'POST',
      headers: buildAuthHeaders(),
    });
    if (res.ok) {
      showToast('Lista de presença atualizada.');
      await loadBootstrap();
    } else {
      const d = await res.json().catch(() => ({}));
      if (!handleSessionError(res.status, d.error)) {
        showToast(d.error || 'Erro ao atualizar presença.', 'err');
      }
    }
  }

  async function handleToggleFollow(targetId: string) {
    if (!user || !authToken) return;
    const res = await fetch(`/api/users/${targetId}/follow`, {
      method: 'POST',
      headers: buildAuthHeaders(undefined, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const data = await res.json();
      showToast(data.following ? 'Você agora segue este organizador.' : 'Deixou de seguir.');
      await loadBootstrap();
    } else {
      const d = await res.json().catch(() => ({}));
      if (!handleSessionError(res.status, d.error)) {
        showToast(d.error || 'Erro ao atualizar seguidor.', 'err');
      }
    }
  }

  async function handleUpdateUser(
    updates: Partial<UserAccount> & { password?: string },
    targetUserId?: string
  ) {
    if (!user || !authToken) return;
    const uid = targetUserId || user.id;
    const res = await fetch(`/api/users/${uid}`, {
      method: 'PUT',
      headers: buildAuthHeaders(undefined, { 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      showToast(targetUserId ? 'Usuário atualizado com sucesso!' : 'Dados atualizados com sucesso!');
      await loadBootstrap();
    } else {
      const d = await res.json().catch(() => ({}));
      if (!handleSessionError(res.status, d.error)) {
        showToast(d.error || 'Não foi possível salvar as alterações.', 'err');
      }
    }
  }

  async function handleAdminDeleteUser(targetUserId: string) {
    if (!user || !authToken) return;
    const res = await fetch(`/api/users/${targetUserId}?adminAction=true`, {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    });
    if (res.ok) {
      showToast('Usuário removido do sistema.');
      await loadBootstrap();
    } else {
      const d = await res.json().catch(() => ({}));
      if (!handleSessionError(res.status, d.error)) {
        showToast(d.error || 'Não foi possível excluir o usuário.', 'err');
      }
    }
  }

  async function handleDeleteAccount() {
    if (!user || !authToken) return;
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(),
    });
    if (res.ok) {
      handleLogout();
    } else {
      const d = await res.json().catch(() => ({}));
      showToast(d.error || 'Erro ao excluir conta.', 'err');
    }
  }

  async function handleMarkNotificationsRead() {
    if (!authToken) return;
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: buildAuthHeaders(),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  if (!bootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3FCF5] text-emerald-900 text-sm font-medium">
        Carregando SEA IFCE...
      </div>
    );
  }

  if (!user) {
    return <AuthFlow onAuthenticated={handleAuthenticated} />;
  }

  const selectedEvent = selectedEventId
    ? events.find((e) => e.id === selectedEventId)
    : undefined;
  const viewedProfileUser = profileUserId
    ? allUsers.find((u) => u.id === profileUserId) || user
    : user;

  return (
    <>
      <AppShell
        user={user}
        activeSection={section}
        activeCategoryFilter={categoryFilter}
        searchQuery={searchQuery}
        notifications={notifications}
        onNavigate={handleNavigate}
        onSearchChange={setSearchQuery}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onOpenOwnProfile={() => {
          setProfileUserId(user.id);
          setSection('profile');
        }}
      >
        {(section === 'home' || section === 'category') && (
          <HomeView
            user={user}
            events={events}
            registrations={registrations}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            onResetCategory={() => {
              setCategoryFilter('all');
              setSection('home');
            }}
            onOpenCategory={(type) => {
              setCategoryFilter(type);
              setSection(type === 'all' ? 'home' : 'category');
            }}
            onOpenDetail={(id) => {
              setSelectedEventId(id);
              setSection('event-detail');
            }}
            onRegisterClick={handleQuickCardRegister}
            onEditEvent={(evt) => {
              setEditingEvent(evt);
              setReturnAfterEdit(section === 'category' ? 'category' : 'home');
              setSection('create');
            }}
            onSendAnnouncement={(evt) => {
              setAnnounceEvent(evt);
              setAnnounceMessage('');
            }}
            onDeleteEvent={(evt) => setDeleteEventTarget(evt)}
          />
        )}

        {section === 'management' && user.role === UserRole.Admin && (
          <AdminManagementView
            currentUser={user}
            users={allUsers}
            events={events}
            onUpdateUser={(uid, updates) => handleUpdateUser(updates, uid)}
            onDeleteUser={handleAdminDeleteUser}
            onEditEvent={(evt) => {
              setEditingEvent(evt);
              setReturnAfterEdit('management');
              setSection('create');
            }}
            onCancelEvent={handleCancelEvent}
            onDeleteEventPermanently={handleDeleteEventPermanently}
          />
        )}

        {section === 'create' && (
          <CreateEventView
            user={user}
            editingEvent={editingEvent}
            onSaveEvent={handleSaveEvent}
            onCancel={() => {
              setEditingEvent(null);
              setSection(returnAfterEdit);
              setReturnAfterEdit('my-events');
            }}
          />
        )}

        {section === 'event-detail' && selectedEvent && (
          <EventDetailView
            event={selectedEvent}
            currentUser={user}
            organizer={allUsers.find((u) => u.id === selectedEvent.organizerId)}
            registrations={registrations}
            onBack={() => setSection('home')}
            onRegister={handleRegisterEvent}
            onUnregister={handleUnregisterEvent}
            onToggleFollow={handleToggleFollow}
            onOpenOrganizerProfile={(orgId) => {
              setProfileUserId(orgId);
              setSection('profile');
            }}
          />
        )}

        {section === 'registrations' && (
          <MyRegistrationsView
            user={user}
            events={events}
            registrations={registrations}
            onOpenDetail={(id) => {
              setSelectedEventId(id);
              setSection('event-detail');
            }}
            onCheckIn={handleCheckIn}
            onOpenCertificate={setCertificateModal}
          />
        )}

        {section === 'my-events' && (
          <MyEventsView
            user={user}
            events={events}
            registrations={registrations}
            allUsers={allUsers}
            onOpenDetail={(id) => {
              setSelectedEventId(id);
              setSection('event-detail');
            }}
            onEditEvent={(evt) => {
              setEditingEvent(evt);
              setReturnAfterEdit('my-events');
              setSection('create');
            }}
            onCancelEvent={handleCancelEvent}
            onSendAnnouncement={(evt) => {
              setAnnounceEvent(evt);
              setAnnounceMessage('');
            }}
            onGenerateCode={handleGenerateCode}
            onFinishEvent={handleFinishEvent}
            onTogglePresence={handleTogglePresence}
          />
        )}

        {section === 'profile' && (
          <ProfileView
            profileUser={viewedProfileUser}
            currentUser={user}
            events={events}
            onBack={() => setSection('home')}
            onEditProfile={() => {
              setSettingsTab('perfil');
              setSection('settings');
            }}
            onSaveOwnProfile={async (updates) => {
              await handleUpdateUser(updates);
            }}
            onToggleFollow={handleToggleFollow}
            onOpenEventDetail={(id) => {
              setSelectedEventId(id);
              setSection('event-detail');
            }}
          />
        )}

        {section === 'settings' && (
          <SettingsView
            user={user}
            initialTab={settingsTab}
            onUpdateUser={(updates) => handleUpdateUser(updates)}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        {section === 'help' && <HelpView />}
      </AppShell>

      {certificateModal && (
        <CertificateModal
          certificate={certificateModal}
          onClose={() => setCertificateModal(null)}
        />
      )}

      {/* Enviar aviso modal (three-dots menu) */}
      {announceEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSendAnnouncementSubmit}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#EBF9EF] text-emerald-700 flex items-center justify-center">
                  <BellPlus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Enviar aviso</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[260px]">
                    {announceEvent.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAnnounceEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mensagem aos participantes
              </label>
              <textarea
                rows={4}
                required
                value={announceMessage}
                onChange={(e) => setAnnounceMessage(e.target.value)}
                placeholder="Ex.: O evento começará com 10 minutos de atraso no Auditório Principal..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAnnounceEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={announceSubmitting || !announceMessage.trim()}
                className="px-5 py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] disabled:opacity-60 text-emerald-950 text-xs font-semibold cursor-pointer"
              >
                {announceSubmitting ? 'Enviando...' : 'Enviar aviso'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Excluir evento modal (three-dots menu on HomeView) */}
      {deleteEventTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setDeleteEventTarget(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">Excluir evento?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              &ldquo;{deleteEventTarget.title}&rdquo; será removido permanentemente do sistema. Você
              também pode apenas cancelar para manter o histórico.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={async () => {
                  setDeleteSubmitting(true);
                  try {
                    await handleDeleteEventPermanently(deleteEventTarget.id);
                    setDeleteEventTarget(null);
                  } finally {
                    setDeleteSubmitting(false);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-[#FF7A7A] hover:bg-[#f46464] text-white text-xs font-semibold cursor-pointer"
              >
                {deleteSubmitting ? 'Excluindo...' : 'Excluir permanentemente'}
              </button>
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={async () => {
                  setDeleteSubmitting(true);
                  try {
                    await handleCancelEvent(deleteEventTarget.id);
                    setDeleteEventTarget(null);
                  } finally {
                    setDeleteSubmitting(false);
                  }
                }}
                className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold cursor-pointer"
              >
                Apenas cancelar evento
              </button>
              <button
                type="button"
                onClick={() => setDeleteEventTarget(null)}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold border ${
              toast.kind === 'err'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-[#EBF9EF] border-[#7BE495] text-emerald-950'
            }`}
          >
            {toast.msg}
          </div>
        </div>
      )}
    </>
  );
}
