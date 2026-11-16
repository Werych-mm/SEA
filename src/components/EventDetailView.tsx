import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Check,
  UserPlus,
  UserCheck,
  FileText,
  X,
} from 'lucide-react';
import { EventItem, EventStatus, Registration, UserAccount, UserRole } from '../types';
import { formatShortDate } from './EventCard';

interface EventDetailViewProps {
  event: EventItem;
  currentUser: UserAccount;
  organizer?: UserAccount;
  registrations: Registration[];
  onBack: () => void;
  onRegister: (eventId: string, subeventId?: string) => Promise<void>;
  onUnregister: (eventId: string, subeventId?: string) => Promise<void>;
  onToggleFollow: (organizerId: string) => Promise<void>;
  onOpenOrganizerProfile: (organizerId: string) => void;
  onGoToSubmission: (eventId: string) => void;
}

export function EventDetailView({
  event,
  currentUser,
  organizer,
  registrations,
  onBack,
  onRegister,
  onUnregister,
  onToggleFollow,
  onOpenOrganizerProfile,
  onGoToSubmission,
}: EventDetailViewProps) {
  const [modal, setModal] = useState<
    null | 'follow' | 'register' | 'unregister'
  >(null);
  const [subTargetId, setSubTargetId] = useState<string | undefined>(undefined);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const isRegisteredMain = registrations.some(
    (r) =>
      r.eventId === event.id &&
      r.userId === currentUser.id &&
      !r.subeventId &&
      r.status !== 'cancelado'
  );

  const isFollowingOrganizer = Boolean(
    organizer && currentUser.following.includes(organizer.id)
  );

  const isRestricted =
    event.institutionalOnly && currentUser.role === UserRole.Externo;

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2200);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border border-[#B7ECC6] rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Top Row: Back & Share */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <div className="flex items-center gap-2">
            {copiedMsg && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Link copiado!
              </span>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              aria-label="Compartilhar evento"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main 2-Column Split (Screenshot 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Poster + Organizer Box */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[3/4]">
              <img
                src={event.bannerUrl}
                alt={event.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onOpenOrganizerProfile(event.organizerId)}
                className="flex items-center gap-3 min-w-0 text-left cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-[#EBF9EF] border border-[#8CE8A4] flex items-center justify-center font-bold text-emerald-800 shrink-0 overflow-hidden">
                  {organizer?.avatarUrl ? (
                    <img
                      src={organizer.avatarUrl}
                      alt={event.organizerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    event.organizerName.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                    {event.organizerName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {event.organizerRoleTitle}
                  </div>
                </div>
              </button>

              {event.organizerId !== currentUser.id && (
                <button
                  type="button"
                  onClick={() =>
                    isFollowingOrganizer ? onToggleFollow(event.organizerId) : setModal('follow')
                  }
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                    isFollowingOrganizer
                      ? 'bg-[#BCEFD0] text-emerald-950'
                      : 'bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950'
                  }`}
                >
                  {isFollowingOrganizer ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      Seguindo
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Seguir
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right: Title, Details, Description, Subevents, Register CTA */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="font-semibold text-emerald-800 bg-[#C1F4CC] px-2.5 py-0.5 rounded-md">
                  {event.eventType}
                </span>
                <span>·</span>
                <span className="font-medium text-sky-700">{event.status}</span>
                {event.institutionalOnly && (
                  <>
                    <span>·</span>
                    <span className="text-amber-700 font-medium">
                      Exclusivo alunos e docentes IFCE
                    </span>
                  </>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {event.title}
              </h1>

              {/* Key Info Bar */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F6FCF8] border border-[#DDF3E4] text-xs text-slate-700">
                <div className="flex items-center gap-2 tabular-nums">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {formatShortDate(event.startDate)} · {event.startTime} - {event.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {event.generateCertificate
                      ? `Certificado (${event.workloadHours}h)`
                      : 'Sem certificado'}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <h2 className="font-display text-sm font-bold text-slate-900 mb-2">
                  Sobre o evento
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Paper Submission Callout if enabled */}
              {event.acceptSubmissions && (
                <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50/60 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        Submissão de artigos científicos aberta
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Envie seu trabalho em PDF para avaliação do comitê e garanta certificado de
                        apresentação.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onGoToSubmission(event.id)}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    Submeter artigo
                  </button>
                </div>
              )}

              {/* Subevents */}
              {event.subevents.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h2 className="font-display text-sm font-bold text-slate-900">
                    Programação de Subeventos
                  </h2>
                  {event.subevents.map((sub) => {
                    const isSubReg = registrations.some(
                      (r) =>
                        r.eventId === event.id &&
                        r.subeventId === sub.id &&
                        r.userId === currentUser.id &&
                        r.status !== 'cancelado'
                    );
                    return (
                      <div
                        key={sub.id}
                        className="border border-sky-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 bg-white"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-sky-700">{sub.eventType}</div>
                          <div className="text-sm font-bold text-slate-900">{sub.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-3 tabular-nums">
                            <span>
                              {formatShortDate(sub.startDate)} · {sub.startTime}
                            </span>
                            <span>{sub.location}</span>
                            <span>
                              vagas: {sub.registeredCount}/{sub.maxSlots}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSubTargetId(sub.id);
                            setModal(isSubReg ? 'unregister' : 'register');
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                            isSubReg
                              ? 'bg-[#BCEFD0] text-emerald-950'
                              : 'bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950'
                          }`}
                        >
                          {isSubReg ? 'Cadastrado' : 'Inscrever-se'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Registration Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 text-sm text-slate-600 tabular-nums">
                <Users className="w-4 h-4 text-slate-400" />
                <span>
                  Vagas preenchidas: <strong>{event.registeredCount}</strong>/{event.maxSlots}
                </span>
              </div>

              {event.status === EventStatus.Cancelado ? (
                <span className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                  Evento cancelado
                </span>
              ) : event.status === EventStatus.Finalizado ? (
                <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
                  Evento finalizado
                </span>
              ) : isRestricted && !isRegisteredMain ? (
                <span className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                  Exclusivo para login institucional (@ifce.edu.br / @aluno.ifce.edu.br)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSubTargetId(undefined);
                    setModal(isRegisteredMain ? 'unregister' : 'register');
                  }}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    isRegisteredMain
                      ? 'bg-[#BCEFD0] hover:bg-[#a6e7bf] text-emerald-950'
                      : 'bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950'
                  }`}
                >
                  {isRegisteredMain ? (
                    <>
                      <Check className="w-4 h-4" />
                      Cadastrado
                    </>
                  ) : (
                    'Cadastre-se'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals matching Screenshot 5 */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center relative border border-slate-100">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {modal === 'follow' && (
              <>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Deseja seguir o organizador deste evento?
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Você receberá atualizações sempre que {event.organizerName} publicar novos eventos.
                </p>
                <div className="mt-5 space-y-2.5">
                  <button
                    type="button"
                    onClick={async () => {
                      await onToggleFollow(event.organizerId);
                      setModal(null);
                    }}
                    className="w-full py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-sm cursor-pointer"
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="w-full py-2 rounded-xl bg-[#FF7A7A] hover:bg-[#f56565] text-white font-semibold text-sm cursor-pointer"
                  >
                    Não
                  </button>
                </div>
              </>
            )}

            {modal === 'register' && (
              <>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Deseja se cadastrar neste evento?
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Sua vaga ficará reservada e você poderá emitir o certificado após validar presença.
                </p>
                <div className="mt-5 space-y-2.5">
                  <button
                    type="button"
                    onClick={async () => {
                      await onRegister(event.id, subTargetId);
                      setModal(null);
                    }}
                    className="w-full py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-sm cursor-pointer"
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="w-full py-2 rounded-xl bg-[#FF7A7A] hover:bg-[#f56565] text-white font-semibold text-sm cursor-pointer"
                  >
                    Não
                  </button>
                </div>
              </>
            )}

            {modal === 'unregister' && (
              <>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Deseja remover seu cadastro neste evento?
                </h3>
                <p className="text-xs text-slate-500 mt-2">
                  Ao remover sua inscrição, sua vaga será liberada para outros participantes.
                </p>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={async () => {
                      await onUnregister(event.id, subTargetId);
                      setModal(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#FF7A7A] hover:bg-[#f56565] text-white font-semibold text-sm cursor-pointer"
                  >
                    Remover cadastro
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
