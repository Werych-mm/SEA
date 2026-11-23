import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit3,
  UserPlus,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { EventItem, EventStatus, UserAccount } from '../types';
import { formatShortDate } from './EventCard';

interface ProfileViewProps {
  profileUser: UserAccount;
  currentUser: UserAccount;
  events: EventItem[];
  onBack: () => void;
  onEditProfile: () => void;
  onSaveOwnProfile?: (updates: { name: string; bio: string }) => Promise<void>;
  onToggleFollow: (targetId: string) => Promise<void>;
  onOpenEventDetail: (eventId: string) => void;
}

export function ProfileView({
  profileUser,
  currentUser,
  events,
  onBack,
  onSaveOwnProfile,
  onToggleFollow,
  onOpenEventDetail,
}: ProfileViewProps) {
  const isOwn = profileUser.id === currentUser.id;
  const isFollowing = currentUser.following.includes(profileUser.id);

  const [inlineEditing, setInlineEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profileUser.name);
  const [bioInput, setBioInput] = useState(profileUser.bio);
  const [saving, setSaving] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  useEffect(() => {
    setInlineEditing(false);
    setShowAllEvents(false);
    setNameInput(profileUser.name);
    setBioInput(profileUser.bio);
  }, [profileUser.id, profileUser.name, profileUser.bio]);

  const userEvents = profileUser.showCreatedEventsOnProfile
    ? events.filter(
        (e) => e.organizerId === profileUser.id && e.status !== EventStatus.Cancelado
      )
    : [];

  async function handleSaveInline() {
    if (!onSaveOwnProfile) return;
    setSaving(true);
    try {
      await onSaveOwnProfile({ name: nameInput.trim() || profileUser.name, bio: bioInput.trim() });
      setInlineEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border border-[#B7ECC6] rounded-3xl p-6 sm:p-8 shadow-xs">
        {showAllEvents ? (
          /* Expanded 3-Column Organizer Events Grid (matches Screenshot 202242 right) */
          <div className="space-y-5">
            <div className="text-center border-b border-[#B7ECC6] pb-3">
              <h2 className="font-display text-xl font-bold text-slate-900">Eventos</h2>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium tabular-nums">
                • {userEvents.length} eventos totais
              </span>
              <button
                type="button"
                onClick={() => setShowAllEvents(false)}
                className="text-sky-600 font-semibold hover:underline cursor-pointer"
              >
                Voltar ao perfil geral
              </button>
            </div>

            {userEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-xs text-slate-500">
                Nenhum evento publicado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => onOpenEventDetail(evt.id)}
                    className="bg-white border border-slate-200 rounded-2xl p-3 flex gap-3 cursor-pointer hover:border-[#7BE495] transition-colors shadow-xs"
                  >
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={evt.bannerUrl}
                        alt={evt.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 bg-[#B7F2C7] text-emerald-950 text-[9px] font-semibold px-1.5 py-0.5 rounded">
                        {evt.eventType}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display font-bold text-sm text-slate-900 truncate">
                          {evt.title}
                        </h3>
                        <div className="mt-1 space-y-0.5 text-xs text-slate-600 tabular-nums">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{formatShortDate(evt.startDate)}</span>
                            <span className="text-sky-500">—</span>
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{evt.startTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{evt.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 tabular-nums inline-flex items-center justify-end gap-1">
                        <Users className="w-3 h-3" />
                        vagas: {evt.registeredCount}/{evt.maxSlots}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Profile Card (matches Screenshots 202150 & 202242) */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 relative">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 mb-5 cursor-pointer"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-full bg-[#EBF9EF] border-2 border-[#8CE8A4] overflow-hidden flex items-center justify-center text-3xl font-bold text-emerald-700 shrink-0">
                  {profileUser.avatarUrl ? (
                    <img
                      src={profileUser.avatarUrl}
                      alt={profileUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profileUser.name.charAt(0)
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {inlineEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-300 font-display text-lg font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                      <Edit3 className="w-4 h-4 text-slate-500 shrink-0" />
                    </div>
                  ) : (
                    <h1 className="font-display text-xl font-bold text-slate-900 truncate">
                      {profileUser.name}
                    </h1>
                  )}
                  <p className="text-sm text-slate-500 mt-0.5">{profileUser.roleTitle}</p>
                  <div className="text-xs font-semibold text-slate-700 mt-2 tabular-nums">
                    {profileUser.followers.length} seguidores
                  </div>

                  {!isOwn && (
                    <button
                      type="button"
                      onClick={() => onToggleFollow(profileUser.id)}
                      className={`mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isFollowing
                          ? 'bg-[#BCEFD0] text-emerald-950'
                          : 'bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          Seguindo
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          Seguir organizador
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {inlineEditing ? (
                <textarea
                  rows={4}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="mt-6 w-full rounded-2xl border border-slate-300 p-4 text-xs sm:text-sm text-slate-700 leading-relaxed focus:outline-none focus:border-emerald-500 resize-none"
                />
              ) : (
                <div className="mt-6 bg-slate-100/90 rounded-2xl p-4 text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[110px]">
                  {profileUser.bio || 'Sem biografia cadastrada.'}
                </div>
              )}

              {isOwn && (
                <div className="mt-5 flex justify-end gap-2.5">
                  {inlineEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setNameInput(profileUser.name);
                          setBioInput(profileUser.bio);
                          setInlineEditing(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleSaveInline}
                        className="px-5 py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 text-xs font-semibold cursor-pointer"
                      >
                        {saving ? 'Salvando...' : 'Salvar edições'}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setInlineEditing(true)}
                      title="Editar perfil"
                      className="w-11 h-11 rounded-full bg-[#BCE7FA] hover:bg-[#9cdbf7] text-slate-900 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Events Column (matches Screenshots 202150 & 202242) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="text-center border-b border-[#B7ECC6] pb-3">
                <h2 className="font-display text-xl font-bold text-slate-900">Eventos</h2>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium tabular-nums">
                  • {userEvents.length} eventos totais
                </span>
                {userEvents.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllEvents(true)}
                    className="text-sky-600 font-semibold hover:underline cursor-pointer"
                  >
                    Ver todos
                  </button>
                ) : (
                  <span className="text-sky-600 font-semibold">IFCE Campus Cedro</span>
                )}
              </div>

              {userEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                  {profileUser.showCreatedEventsOnProfile
                    ? 'Nenhum evento publicado ainda.'
                    : 'Este usuário optou por ocultar eventos criados no perfil.'}
                </div>
              ) : (
                <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
                  {userEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => onOpenEventDetail(evt.id)}
                      className="bg-white border border-slate-200 rounded-2xl p-3 flex gap-3.5 cursor-pointer hover:border-[#7BE495] transition-colors shadow-xs"
                    >
                      <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={evt.bannerUrl}
                          alt={evt.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 bg-[#B7F2C7] text-emerald-950 text-[9px] font-semibold px-1.5 py-0.5 rounded">
                          {evt.eventType}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-display font-bold text-sm text-slate-900 truncate">
                            {evt.title}
                          </h3>
                          <div className="mt-1 space-y-0.5 text-xs text-slate-600 tabular-nums">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{formatShortDate(evt.startDate)}</span>
                              <span className="text-sky-500">—</span>
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{evt.startTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{evt.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-slate-500 tabular-nums inline-flex items-center justify-end gap-1">
                          <Users className="w-3 h-3" />
                          vagas: {evt.registeredCount}/{evt.maxSlots}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
