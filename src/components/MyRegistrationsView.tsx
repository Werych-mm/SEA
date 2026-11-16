import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Check,
  Download,
  CheckCircle2,
} from 'lucide-react';
import {
  CertificateData,
  EventItem,
  EventStatus,
  Registration,
  UserAccount,
  UserRole,
} from '../types';
import { formatShortDate } from './EventCard';

interface MyRegistrationsViewProps {
  user: UserAccount;
  events: EventItem[];
  registrations: Registration[];
  onOpenDetail: (eventId: string) => void;
  onCheckIn: (registrationId: string, code: string) => Promise<void>;
  onOpenCertificate: (cert: CertificateData) => void;
}

export function MyRegistrationsView({
  user,
  events,
  registrations,
  onOpenDetail,
  onCheckIn,
  onOpenCertificate,
}: MyRegistrationsViewProps) {
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [query, setQuery] = useState('');
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const myRegs = registrations.filter(
    (r) => r.userId === user.id && r.status !== 'cancelado'
  );

  const enriched = myRegs
    .map((reg) => {
      const event = events.find((e) => e.id === reg.eventId);
      if (!event) return null;
      const sub = reg.subeventId
        ? event.subevents.find((s) => s.id === reg.subeventId)
        : undefined;
      return { reg, event, sub };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const filtered = enriched.filter(({ reg, event, sub }) => {
    const title = (sub ? sub.title : event.title).toLowerCase();
    if (query.trim() && !title.includes(query.toLowerCase())) return false;

    const isPast =
      event.status === EventStatus.Finalizado ||
      event.status === EventStatus.Cancelado ||
      reg.status === 'presente';
    return tab === 'past' ? isPast : !isPast;
  });

  async function handleValidateCode(regId: string) {
    const code = (codeInputs[regId] || '').trim();
    if (!code) {
      setErrorMap((m) => ({ ...m, [regId]: 'Informe o código fornecido pelo organizador.' }));
      return;
    }
    setSubmittingId(regId);
    setErrorMap((m) => ({ ...m, [regId]: '' }));
    try {
      await onCheckIn(regId, code);
    } catch (err) {
      setErrorMap((m) => ({
        ...m,
        [regId]: err instanceof Error ? err.message : 'Código inválido.',
      }));
    } finally {
      setSubmittingId(null);
    }
  }

  function handleBuildCertificate(
    reg: Registration,
    event: EventItem,
    subTitle?: string,
    subHours?: number
  ) {
    const roleLabel =
      user.role === UserRole.Docente
        ? 'Docente'
        : user.role === UserRole.Estudante
          ? 'Estudante'
          : 'Participante';
    onOpenCertificate({
      participantName: user.name,
      participantDocument: user.matriculaOrCpf,
      participantRole: roleLabel,
      eventTitle: subTitle ? `${subTitle} (${event.title})` : event.title,
      eventType: event.eventType,
      eventDate: formatShortDate(event.startDate),
      eventLocation: event.location,
      workloadHours: subHours || event.workloadHours || 4,
      organizerName: event.organizerName,
      organizerRole: event.organizerRoleTitle,
      certificateCode:
        reg.certificateCode || `SEA-IFCE-2026-${event.eventCode || 'AUTO'}`,
      issuedAt: new Date().toLocaleDateString('pt-BR'),
      kind: 'participacao',
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Search Bar (Screenshot 3) */}
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

      {/* Tabs */}
      <div className="flex items-center justify-center gap-8 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('active')}
          className={`pb-3 text-sm font-semibold inline-flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            tab === 'active'
              ? 'border-emerald-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Suas inscrições
        </button>

        <button
          type="button"
          onClick={() => setTab('past')}
          className={`pb-3 text-sm font-semibold inline-flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            tab === 'past'
              ? 'border-emerald-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Inscrições passadas
        </button>
      </div>

      {/* Filter & Count row */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          Filtrar
        </span>
        <span className="tabular-nums font-medium">
          Total de inscrições: <strong>{filtered.length}</strong>
        </span>
      </div>

      {/* Registration Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500">
          {tab === 'active'
            ? 'Você ainda não possui inscrições ativas em eventos futuros ou em andamento.'
            : 'Nenhuma inscrição passada ou presença validada encontrada.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(({ reg, event, sub }) => {
            const displayTitle = sub ? sub.title : event.title;
            const displayLoc = sub ? sub.location : event.location;
            const displayDate = sub ? sub.startDate : event.startDate;
            const displayTime = sub ? sub.startTime : event.startTime;
            const displayBanner = sub ? sub.bannerUrl : event.bannerUrl;
            const displayType = sub ? sub.eventType : event.eventType;
            const displaySlots = sub
              ? `${sub.registeredCount}/${sub.maxSlots}`
              : `${event.registeredCount}/${event.maxSlots}`;

            return (
              <div
                key={reg.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-stretch shadow-xs"
              >
                {/* Left Poster + Details */}
                <div className="flex-1 flex gap-4 min-w-0">
                  <div className="relative w-24 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={displayBanner}
                      alt={displayTitle}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-[#B7F2C7] text-emerald-950 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      {displayType}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            event.status === EventStatus.EmAndamento
                              ? 'bg-[#C1F4CC] text-emerald-950'
                              : event.status === EventStatus.Finalizado || reg.status === 'presente'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-sky-50 text-sky-700'
                          }`}
                        >
                          {reg.status === 'presente' ? 'Presença confirmada' : event.status}
                        </span>
                        {sub && (
                          <span className="text-[11px] text-sky-600 font-medium truncate">
                            · {event.title}
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-bold text-base text-slate-900 truncate">
                        {displayTitle}
                      </h3>

                      <div className="mt-1.5 space-y-1 text-xs text-slate-600 tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatShortDate(displayDate)}</span>
                          <span className="text-sky-500">—</span>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{displayTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{displayLoc}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 tabular-nums">
                        <Users className="w-3.5 h-3.5" />
                        vagas: {displaySlots}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenDetail(event.id)}
                        className="inline-flex items-center gap-0.5 text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
                      >
                        Mais informações
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Check-in & Certificate Panel (Screenshot 3) */}
                <div className="lg:w-64 shrink-0 lg:border-l lg:border-slate-200 lg:pl-5 flex flex-col justify-center gap-2.5">
                  <div className="text-xs font-semibold text-slate-700 text-center">
                    Código do evento:
                  </div>

                  {reg.status === 'presente' ? (
                    <>
                      <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm font-bold text-slate-900">
                        <span>{reg.checkedInCode || event.eventCode || 'VALID'}</span>
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      {event.generateCertificate && (
                        <button
                          type="button"
                          onClick={() =>
                            handleBuildCertificate(reg, event, sub?.title, sub?.workloadHours)
                          }
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-emerald-50 hover:border-emerald-400 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-600" />
                          Gerar certificado
                        </button>
                      )}
                    </>
                  ) : event.eventCode ? (
                    <>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={codeInputs[reg.id] || ''}
                          onChange={(e) =>
                            setCodeInputs((prev) => ({
                              ...prev,
                              [reg.id]: e.target.value.toUpperCase(),
                            }))
                          }
                          placeholder={`Ex: ${event.eventCode}`}
                          className="flex-1 min-w-0 px-3 py-1.5 rounded-xl border border-slate-200 text-center font-mono text-xs uppercase focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          disabled={submittingId === reg.id}
                          onClick={() => handleValidateCode(reg.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 text-xs font-semibold cursor-pointer shrink-0"
                        >
                          Validar
                        </button>
                      </div>
                      {errorMap[reg.id] && (
                        <p className="text-[11px] text-rose-600 text-center">{errorMap[reg.id]}</p>
                      )}
                      <div className="text-center text-[11px] text-slate-500">
                        Digite o código informado no evento para liberar seu certificado.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                        Aguardando código...
                      </div>
                      <div className="inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#EBF9EF] text-emerald-800 text-xs font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        Cadastrado
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
