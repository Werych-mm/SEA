import React, { useEffect, useState, useCallback } from 'react';
import {
  AppSection,
  CertificateData,
  EventItem,
  EventType,
  NotificationItem,
  Registration,
  UserAccount,
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
import { CertificateModal } from './components/CertificateModal';

const STORAGE_KEY = 'sea_ifce_user_id';

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [bootstrapped, setBootstrapped] = useState(false);

  const [section, setSection] = useState<AppSection>('home');
  const [categoryFilter, setCategoryFilter] = useState<EventType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<'perfil' | 'conta' | 'notificacoes' | 'sobre'>(
    'perfil'
  );
  const [certificateModal, setCertificateModal] = useState<CertificateData | null>(null);
  const [toast, setToast] = useState<{ msg: string; kind: 'ok' | 'err' } | null>(null);

  function showToast(msg: string, kind: 'ok' | 'err' = 'ok') {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3200);
  }

  const loadBootstrap = useCallback(async (uid?: string | null) => {
    const savedId = uid ?? localStorage.getItem(STORAGE_KEY);
    const headers: Record<string, string> = {};
    if (savedId) headers['x-user-id'] = savedId;

    const res = await fetch('/api/bootstrap', { headers });
    const data = await res.json();
    setAllUsers(data.users || []);
    setEvents(data.events || []);
    setRegistrations(data.registrations || []);
    setNotifications(data.notifications || []);
    if (data.user) {
      setUser(data.user);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    }
    setBootstrapped(true);
  }, []);

  useEffect(() => {
    loadBootstrap();
  }, [loadBootstrap]);

  function handleAuthenticated(loggedInUser: UserAccount) {
    localStorage.setItem(STORAGE_KEY, loggedInUser.id);
    setUser(loggedInUser);
    setSection('home');
    loadBootstrap(loggedInUser.id);
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setSection('home');
  }

  function handleNavigate(nextSection: AppSection, category: EventType | 'all' = 'all') {
    setCategoryFilter(category);
    setEditingEvent(null);
    setSection(nextSection);
  }

  async function handleRegisterEvent(eventId: string, subeventId?: string) {
    if (!user) return;
    const res = await fetch(`/api/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, subeventId }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || 'Não foi possível concluir a inscrição.', 'err');
      return;
    }
    showToast('Inscrição confirmada no evento!');
    await loadBootstrap(user.id);
  }

  async function handleUnregisterEvent(eventId: string, subeventId?: string) {
    if (!user) return;
    const q = subeventId ? `?subeventId=${encodeURIComponent(subeventId)}` : '';
    const res = await fetch(`/api/events/${eventId}/register${q}`, {
      method: 'DELETE',
      headers: { 'x-user-id': user.id },
    });
    if (res.ok) {
      showToast('Inscrição removida.');
      await loadBootstrap(user.id);
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
    if (!user) return;
    const url = isEdit && payload.id ? `/api/events/${payload.id}` : '/api/events';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      showToast(isEdit ? 'Evento atualizado com sucesso!' : 'Evento publicado com sucesso!');
      setEditingEvent(null);
      setSection('my-events');
      await loadBootstrap(user.id);
    } else {
      const d = await res.json();
      showToast(d.error || 'Erro ao salvar evento.', 'err');
    }
  }

  async function handleCancelEvent(eventId: string) {
    if (!user) return;
    const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Evento cancelado.');
      await loadBootstrap(user.id);
    }
  }

  async function handleGenerateCode(eventId: string) {
    if (!user) return;
    const res = await fetch(`/api/events/${eventId}/generate-code`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      showToast(`Código de presença gerado: ${data.event.eventCode}`);
      await loadBootstrap(user.id);
    }
  }

  async function handleFinishEvent(eventId: string) {
    if (!user) return;
    const res = await fetch(`/api/events/${eventId}/finish`, { method: 'POST' });
    if (res.ok) {
      showToast('Evento encerrado e movido para finalizados.');
      await loadBootstrap(user.id);
    }
  }

  async function handleCheckIn(registrationId: string, code: string) {
    if (!user) return;
    const res = await fetch(`/api/registrations/${registrationId}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Código inválido.');
    }
    showToast('Presença validada! Certificado liberado automaticamente.');
    await loadBootstrap(user.id);
  }

  async function handleTogglePresence(registrationId: string) {
    if (!user) return;
    const res = await fetch(`/api/registrations/${registrationId}/toggle-presence`, {
      method: 'POST',
    });
    if (res.ok) {
      showToast('Lista de presença atualizada.');
      await loadBootstrap(user.id);
    }
  }

  async function handleToggleFollow(targetId: string) {
    if (!user) return;
    const res = await fetch(`/api/users/${targetId}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerId: user.id }),
    });
    if (res.ok) {
      const data = await res.json();
      showToast(data.following ? 'Você agora segue este organizador.' : 'Deixou de seguir.');
      await loadBootstrap(user.id);
    }
  }

  async function handleUpdateUser(updates: Partial<UserAccount> & { password?: string }) {
    if (!user) return;
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      await loadBootstrap(user.id);
    }
  }

  async function handleDeleteAccount() {
    if (!user) return;
    await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
    handleLogout();
  }

  async function handleMarkNotificationsRead() {
    await fetch('/api/notifications/read', { method: 'POST' });
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
          />
        )}

        {section === 'create' && (
          <CreateEventView
            user={user}
            editingEvent={editingEvent}
            onSaveEvent={handleSaveEvent}
            onCancel={() => {
              setEditingEvent(null);
              setSection('my-events');
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
              setSection('create');
            }}
            onCancelEvent={handleCancelEvent}
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
            onUpdateUser={handleUpdateUser}
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
