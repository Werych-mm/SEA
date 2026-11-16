import React from 'react';
import { Calendar, Clock, MapPin, Users, Check } from 'lucide-react';
import { EventItem } from '../types';

interface EventCardProps {
  event: EventItem;
  isRegistered: boolean;
  onOpenDetail: (eventId: string) => void;
  onRegisterClick: (event: EventItem) => void;
  compact?: boolean;
}

export function formatShortDate(isoDate: string): string {
  if (!isoDate) return '--/--';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}`;
}

export function EventCard({
  event,
  isRegistered,
  onOpenDetail,
  onRegisterClick,
  compact = false,
}: EventCardProps) {
  const isFull = event.registeredCount >= event.maxSlots;
  const isCancelled = event.status === 'Cancelado';
  const isFinished = event.status === 'Finalizado';

  return (
    <article
      onClick={() => onOpenDetail(event.id)}
      className={`group bg-white border border-slate-200/90 rounded-2xl p-3 flex gap-3.5 cursor-pointer transition-all duration-150 hover:border-[#7BE495] hover:shadow-md ${
        compact ? 'items-center' : ''
      }`}
    >
      {/* Left Poster Thumbnail with Type tag */}
      <div
        className={`relative shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 ${
          compact ? 'w-20 h-24' : 'w-24 sm:w-28 h-32 sm:h-36'
        }`}
      >
        <img
          src={event.bannerUrl}
          alt={event.title}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03] ${
            isCancelled ? 'grayscale opacity-50' : ''
          }`}
        />
        <span className="absolute top-1.5 left-1.5 bg-[#B7F2C7]/95 backdrop-blur-xs text-emerald-950 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
          {event.eventType}
        </span>
      </div>

      {/* Right Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-sm text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
              {event.title}
            </h3>
          </div>

          <div className="mt-2 space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 tabular-nums whitespace-nowrap overflow-hidden text-ellipsis">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatShortDate(event.startDate)}</span>
              <span className="text-sky-500 font-semibold">—</span>
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{event.startTime}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA & Capacity */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {isCancelled ? (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700">
              Cancelado
            </span>
          ) : isFinished ? (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
              Finalizado
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRegisterClick(event);
              }}
              disabled={!isRegistered && isFull}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isRegistered
                  ? 'bg-[#BCEFD0] text-emerald-950 hover:bg-[#a6e7bf]'
                  : isFull
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-[#67E38C] text-emerald-950 hover:bg-[#4ED878]'
              }`}
            >
              {isRegistered ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Cadastrado
                </>
              ) : isFull ? (
                'Lotado'
              ) : (
                'Cadastre-se'
              )}
            </button>
          )}

          <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 tabular-nums whitespace-nowrap shrink-0">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>
              vagas: {event.registeredCount}/{event.maxSlots}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
