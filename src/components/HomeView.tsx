import React, { useState } from 'react';
import {
  Calendar,
  Mic,
  MessageSquare,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  Clock,
  MapPin,
  Users,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { EventItem, EventStatus, EventType, Registration, UserAccount } from '../types';
import { EventCard, formatShortDate } from './EventCard';

interface HomeViewProps {
  user: UserAccount;
  events: EventItem[];
  registrations: Registration[];
  searchQuery: string;
  categoryFilter: EventType | 'all';
  onResetCategory: () => void;
  onOpenCategory: (type: EventType | 'all') => void;
  onOpenDetail: (eventId: string) => void;
  onRegisterClick: (event: EventItem) => void;
}

export function HomeView({
  user,
  events,
  registrations,
  searchQuery,
  categoryFilter,
  onResetCategory,
  onOpenCategory,
  onOpenDetail,
  onRegisterClick,
}: HomeViewProps) {
  const [carouselIdx, setCarouselIdx] = useState(1);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyCert, setOnlyCert] = useState(false);
  const [filterOpenSection, setFilterOpenSection] = useState<string | null>(null);

  const firstName = user.name.split(' ')[0];

  const myActiveRegIds = new Set(
    registrations
      .filter((r) => r.userId === user.id && r.status !== 'cancelado' && !r.subeventId)
      .map((r) => r.eventId)
  );

  // Next registered upcoming/ongoing event
  const nextEvent =
    events.find(
      (e) =>
        myActiveRegIds.has(e.id) &&
        e.status !== EventStatus.Finalizado &&
        e.status !== EventStatus.Cancelado
    ) ||
    events.find((e) => e.status !== EventStatus.Cancelado && e.status !== EventStatus.Finalizado);

  const carouselEvents = events
    .filter((e) => e.status !== EventStatus.Cancelado)
    .slice(0, 3);

  const applyFilters = (list: EventItem[]) => {
    return list.filter((e) => {
      if (e.status === EventStatus.Cancelado) return false;
      if (onlyAvailable && e.registeredCount >= e.maxSlots) return false;
      if (onlyCert && !e.generateCertificate) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.eventType.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  };

  // Filtered Category Page View
  if (categoryFilter !== 'all') {
    const filtered = applyFilters(events.filter((e) => e.eventType === categoryFilter));
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={onResetCategory}
              className="inline-flex items-center gap-1 text-xs text-sky-600 font-semibold hover:underline cursor-pointer mb-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar ao início
            </button>
            <h1 className="font-display text-2xl font-bold text-slate-900">{categoryFilter}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyAvailable((v) => !v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                onlyAvailable
                  ? 'bg-[#DDF2FD] border-[#74C2F1] text-slate-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Com vagas
            </button>
            <button
              type="button"
              onClick={() => setOnlyCert((v) => !v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                onlyCert
                  ? 'bg-[#DDF2FD] border-[#74C2F1] text-slate-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Com certificado
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-500">
            Nenhum evento encontrado na categoria &ldquo;{categoryFilter}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                isRegistered={myActiveRegIds.has(evt.id)}
                onOpenDetail={onOpenDetail}
                onRegisterClick={onRegisterClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const sections: Array<{
    key: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    targetType: EventType | 'all';
    items: EventItem[];
  }> = [
    {
      key: 'eventos',
      title: 'Eventos',
      icon: Calendar,
      targetType: 'all',
      items: applyFilters(events).slice(0, 3),
    },
    {
      key: 'palestras',
      title: 'Palestras',
      icon: Mic,
      targetType: EventType.Palestra,
      items: applyFilters(events.filter((e) => e.eventType === EventType.Palestra)).slice(0, 3),
    },
    {
      key: 'rodas',
      title: 'Rodas de conversas',
      icon: MessageSquare,
      targetType: EventType.RodaConversa,
      items: applyFilters(events.filter((e) => e.eventType === EventType.RodaConversa)).slice(
        0,
        3
      ),
    },
    {
      key: 'outros',
      title: 'Outros',
      icon: Layers,
      targetType: EventType.Outros,
      items: applyFilters(
        events.filter(
          (e) =>
            e.eventType === EventType.Outros ||
            e.eventType === EventType.Oficina ||
            e.eventType === EventType.MiniCurso ||
            e.eventType === EventType.Simposio
        )
      ).slice(0, 3),
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Split Section matching Screenshot 1 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Greeting + Next Event Card */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Bom dia, {firstName}!
            </h1>
            <p className="text-sm text-slate-600 mt-1">Lembre-se do seu próximo evento:</p>
          </div>

          {nextEvent && (
            <div
              onClick={() => onOpenDetail(nextEvent.id)}
              className="mt-4 bg-white border border-slate-200 rounded-2xl p-3.5 flex gap-4 cursor-pointer hover:border-[#7BE495] hover:shadow-md transition-all"
            >
              <div className="w-24 sm:w-28 h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={nextEvent.bannerUrl}
                  alt={nextEvent.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h2 className="font-display font-bold text-sm text-slate-900 line-clamp-2">
                    {nextEvent.title}
                  </h2>
                  <span className="inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100">
                    {nextEvent.eventType}
                  </span>
                  <div className="mt-2 space-y-1 text-xs text-slate-600 tabular-nums">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatShortDate(nextEvent.startDate)}</span>
                      <span className="text-sky-500">—</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{nextEvent.startTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{nextEvent.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  {myActiveRegIds.has(nextEvent.id) ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#7BE495] text-emerald-950 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      Cadastrado
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRegisterClick(nextEvent);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 text-xs font-semibold cursor-pointer"
                    >
                      Cadastre-se
                    </button>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 tabular-nums">
                    <Users className="w-3.5 h-3.5" />
                    Vagas: {nextEvent.registeredCount}/{nextEvent.maxSlots}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 3-Poster Featured Carousel inside mint box */}
        <div className="lg:col-span-7 bg-[#EBF9EF] border border-[#D4F2DD] rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-center gap-3 sm:gap-5 h-56 sm:h-64">
            {carouselEvents.map((evt, idx) => {
              const isCenter = idx === carouselIdx;
              return (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => (isCenter ? onOpenDetail(evt.id) : setCarouselIdx(idx))}
                  className={`relative rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer border border-white/80 shadow-md ${
                    isCenter
                      ? 'w-40 sm:w-48 h-full scale-100 z-10 ring-2 ring-emerald-400/50'
                      : 'w-28 sm:w-36 h-[82%] opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={evt.bannerUrl}
                    alt={evt.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent p-2.5 text-left">
                    <div className="text-[11px] font-semibold text-white line-clamp-2 leading-tight">
                      {evt.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            {carouselEvents.map((evt, idx) => (
              <button
                key={evt.id}
                type="button"
                onClick={() => setCarouselIdx(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === carouselIdx ? 'w-6 bg-[#3AC466]' : 'w-2 bg-[#B5E8C3]'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Event Sections matching Screenshot 1 */}
      {sections.map((sec) => {
        const Icon = sec.icon;
        const isFilterOpen = filterOpenSection === sec.key;
        return (
          <section key={sec.key} className="space-y-3.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Icon className="w-5 h-5 text-slate-800" />
                <h2 className="font-display text-lg font-bold text-slate-900">{sec.title}</h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  sec.targetType === 'all'
                    ? setOnlyAvailable(false)
                    : onOpenCategory(sec.targetType)
                }
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
              >
                <span>Ver todos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Filtrar pill row */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setFilterOpenSection(isFilterOpen ? null : sec.key)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Filtrar</span>
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-20 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <span>Apenas com vagas disponíveis</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyCert}
                      onChange={(e) => setOnlyCert(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <span>Com certificado digital</span>
                  </label>
                </div>
              )}
            </div>

            {sec.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                Nenhum evento corresponde aos filtros selecionados nesta seção.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sec.items.map((evt) => (
                  <EventCard
                    key={evt.id}
                    event={evt}
                    isRegistered={myActiveRegIds.has(evt.id)}
                    onOpenDetail={onOpenDetail}
                    onRegisterClick={onRegisterClick}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
