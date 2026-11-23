import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Edit3,
  Trash2,
  Share2,
  Copy,
  Check,
  X,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  Maximize2,
  MoreHorizontal,
  BellPlus,
} from 'lucide-react';
import { EventItem, EventStatus, Registration, UserAccount } from '../types';
import { formatShortDate } from './EventCard';

interface MyEventsViewProps {
  user: UserAccount;
  events: EventItem[];
  registrations: Registration[];
  allUsers: UserAccount[];
  onOpenDetail: (eventId: string) => void;
  onEditEvent: (event: EventItem) => void;
  onCancelEvent: (eventId: string) => Promise<void>;
  onSendAnnouncement: (event: EventItem) => void;
  onGenerateCode: (eventId: string) => Promise<void>;
  onFinishEvent: (eventId: string) => Promise<void>;
  onTogglePresence: (registrationId: string) => Promise<void>;
}

export function MyEventsView({
  user,
  events,
  registrations,
  allUsers,
  onOpenDetail,
  onEditEvent,
  onCancelEvent,
  onSendAnnouncement,
  onGenerateCode,
  onFinishEvent,
  onTogglePresence,
}: MyEventsViewProps) {
  const [tab, setTab] = useState<'ongoing' | 'finished'>('ongoing');
  const [query, setQuery] = useState('');
  const [rosterEventId, setRosterEventId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [maximizedCode, setMaximizedCode] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const createdEvents = events.filter((e) => e.organizerId === user.id);

  const filtered = createdEvents.filter((e) => {
    if (query.trim() && !e.title.toLowerCase().includes(query.toLowerCase())) return false;
    const isFinished =
      e.status === EventStatus.Finalizado || e.status === EventStatus.Cancelado;
    return tab === 'finished' ? isFinished : !isFinished;
  });

  const rosterEvent = rosterEventId
    ? createdEvents.find((e) => e.id === rosterEventId)
    : null;
  const rosterRegs = rosterEvent
    ? registrations.filter(
        (r) => r.eventId === rosterEvent.id && r.status !== 'cancelado' && !r.subeventId
      )
    : [];

  function handleCopyCode(eventId: string, code: string) {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedId(eventId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar meus eventos..."
          className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs focus:outline-none focus:border-sky-400"
        />
      </div>

      {/* Tabs (Screenshot 3 bottom row) */}
      <div className="flex items-center justify-center gap-8 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('ongoing')}
          className={`pb-3 text-sm font-semibold inline-flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            tab === 'ongoing'
              ? 'border-sky-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-sky-600" />
          Eventos em andamento
        </button>

        <button
          type="button"
          onClick={() => setTab('finished')}
          className={`pb-3 text-sm font-semibold inline-flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            tab === 'finished'
              ? 'border-sky-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Eventos finalizados
        </button>
      </div>

      {/* Filter & Counter */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          Filtrar
        </span>
        <span className="tabular-nums font-medium">
          Total de eventos criados: <strong>{filtered.length}</strong>
        </span>
      </div>

      {/* Event Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500">
          Nenhum evento criado nesta aba.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((evt) => {
            const isCancelled = evt.status === EventStatus.Cancelado;
            return (
              <div
                key={evt.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-stretch shadow-xs"
              >
                {/* Left Poster + Details */}
                <div className="flex-1 flex gap-4 min-w-0">
                  <div className="relative w-24 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={evt.bannerUrl}
                      alt={evt.title}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover ${
                        isCancelled ? 'grayscale opacity-50' : ''
                      }`}
                    />
                    <span className="absolute top-1.5 left-1.5 bg-[#B7F2C7] text-emerald-950 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      {evt.eventType}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            isCancelled
                              ? 'bg-rose-50 text-rose-700'
                              : evt.status === EventStatus.Finalizado
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-sky-50 text-sky-700'
                          }`}
                        >
                          {evt.status}
                        </span>

                        {!isCancelled && (
                          <div className="flex items-center gap-1.5 relative">
                            <button
                              type="button"
                              onClick={() => onEditEvent(evt)}
                              title="Editar evento"
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onCancelEvent(evt.id)}
                              title="Cancelar evento"
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(window.location.href).catch(() => {});
                              }}
                              title="Compartilhar"
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId((prev) => (prev === evt.id ? null : evt.id))
                              }
                              title="Mais opções"
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {openMenuId === evt.id && (
                              <div className="absolute right-0 top-8 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onEditEvent(evt);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-50 cursor-pointer"
                                >
                                  <span>Editar evento</span>
                                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onSendAnnouncement(evt);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-50 cursor-pointer"
                                >
                                  <span>Enviar aviso</span>
                                  <BellPlus className="w-3.5 h-3.5 text-slate-600" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onCancelEvent(evt.id);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  <span>Excluir evento</span>
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <h3 className="font-display font-bold text-base text-slate-900 truncate">
                        {evt.title}
                      </h3>

                      <div className="mt-1.5 space-y-1 text-xs text-slate-600 tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatShortDate(evt.startDate)}</span>
                          <span className="text-sky-500">—</span>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.startTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 tabular-nums">
                        <Users className="w-3.5 h-3.5" />
                        vagas: {evt.registeredCount}/{evt.maxSlots}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenDetail(evt.id)}
                        className="inline-flex items-center gap-0.5 text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
                      >
                        {evt.subevents.length > 0 ? 'Detalhes e subeventos' : 'Mais informações'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Organizer Management Panel */}
                <div className="lg:w-64 shrink-0 lg:border-l lg:border-slate-200 lg:pl-5 flex flex-col justify-center gap-2">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 text-center">
                    <span>Código de presença:</span>
                    <button
                      type="button"
                      onClick={() => setInfoModalOpen(true)}
                      title="Como funciona o código de presença"
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isCancelled ? (
                    <div className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium text-center">
                      Evento cancelado
                    </div>
                  ) : evt.eventCode ? (
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-emerald-200 bg-[#EEFBF2] font-mono text-sm font-bold text-emerald-950">
                      <button
                        type="button"
                        onClick={() => setMaximizedCode(evt.eventCode!)}
                        className="flex-1 text-center tracking-wider hover:text-emerald-700 cursor-pointer"
                        title="Ampliar código na tela"
                      >
                        {evt.eventCode}
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setMaximizedCode(evt.eventCode!)}
                          className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                          title="Maximizar código"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(evt.id, evt.eventCode!)}
                          className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                          title="Copiar código"
                        >
                          {copiedId === evt.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onGenerateCode(evt.id)}
                      className="w-full py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Gerar código
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setRosterEventId(evt.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-sky-600" />
                    Lista de participantes
                  </button>

                  {tab === 'ongoing' && !isCancelled && (
                    <button
                      type="button"
                      onClick={() => onFinishEvent(evt.id)}
                      className="text-[11px] font-medium text-slate-500 hover:text-emerald-700 underline text-center cursor-pointer"
                    >
                      Encerrar e finalizar evento
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Participant Roster Modal */}
      {rosterEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Lista de Participantes
                </h3>
                <p className="text-xs text-slate-500 truncate">{rosterEvent.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setRosterEventId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[65vh] overflow-y-auto">
              {rosterRegs.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">
                  Nenhum participante inscrito até o momento.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {rosterRegs.map((reg) => {
                    const person = allUsers.find((u) => u.id === reg.userId);
                    const isPresent = reg.status === 'presente';
                    return (
                      <div
                        key={reg.id}
                        className="py-3 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900">
                            {person?.name || 'Participante'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {person?.email} · {person?.matriculaOrCpf}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onTogglePresence(reg.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            isPresent
                              ? 'bg-[#C1F4CC] text-emerald-950'
                              : 'bg-slate-100 hover:bg-emerald-100 text-slate-700'
                          }`}
                        >
                          {isPresent ? 'Presença confirmada ✓' : 'Confirmar presença'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* "infor. codigo de presença" Modal (matches Screenshot 202053) */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative border border-slate-100">
            <button
              type="button"
              onClick={() => setInfoModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-bold text-lg text-slate-900">Código de presença</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              O código de presença é um código único gerado para este evento, que os participantes
              devem informar para confirmar sua presença.
            </p>

            <div className="mt-4 pt-4 border-t border-emerald-100">
              <div className="text-xs font-bold text-slate-900 mb-3">Como funciona?</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  {
                    step: '1',
                    text: 'Gere o código e visualize aos participantes.',
                  },
                  {
                    step: '2',
                    text: 'Os participantes devem entrar no próprio dispositivo e depois no evento.',
                  },
                  {
                    step: '3',
                    text: 'Os participantes devem adicionar o código mostrado e confirmar a presença.',
                  },
                ].map((item) => (
                  <div key={item.step} className="space-y-2">
                    <div className="w-6 h-6 rounded-full bg-[#C1F4CC] text-emerald-950 font-bold text-xs flex items-center justify-center mx-auto">
                      {item.step}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Maximizar código" Modal (matches Screenshot 202053) */}
      {maximizedCode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center relative border border-slate-200">
            <button
              type="button"
              onClick={() => setMaximizedCode(null)}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Fechar código ampliado"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="border border-slate-200 rounded-2xl py-8 px-6 mt-2 bg-slate-50/50">
              <div className="font-mono font-extrabold text-4xl sm:text-5xl tracking-[0.28em] text-slate-900 pl-2">
                {maximizedCode}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Apresente este código aos participantes para validação de presença.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
