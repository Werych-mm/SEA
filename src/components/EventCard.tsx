import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  MoreHorizontal,
  Edit3,
  BellPlus,
  Trash2,
} from 'lucide-react';
import { EventItem } from '../types';

interface EventCardProps {
  event: EventItem;
  isRegistered: boolean;
  onOpenDetail: (eventId: string) => void;
  onRegisterClick: (event: EventItem) => void;
  compact?: boolean;
  canManage?: boolean;
  onEditEvent?: (event: EventItem) => void;
  onSendAnnouncement?: (event: EventItem) => void;
  onDeleteEvent?: (event: EventItem) => void;
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
  canManage = false,
  onEditEvent,
  onSendAnnouncement,
  onDeleteEvent,
}: EventCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  const isFull = event.registeredCount >= event.maxSlots;
  const isCancelled = event.status === 'Cancelado';
  const isFinished = event.status === 'Finalizado';

  return (
    <article
      onClick={() => onOpenDetail(event.id)}
      className={`group bg-white border border-slate-200/90 rounded-2xl p-3 flex gap-3.5 cursor-pointer transition-all duration-150 hover:border-[#7BE495] hover:shadow-md relative ${
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

            {canManage && (
              <div
                ref={menuRef}
                className="relative shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                  aria-label="Opções do evento"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-7 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30">
                    {onEditEvent && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onEditEvent(event);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-50 cursor-pointer"
                      >
                        <span>Editar evento</span>
                        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    )}
                    {onSendAnnouncement && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onSendAnnouncement(event);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-50 cursor-pointer"
                      >
                        <span>Enviar aviso</span>
                        <BellPlus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    )}
                    {onDeleteEvent && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onDeleteEvent(event);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <span>Excluir evento</span>
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
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
