import React from 'react';

export function SeaLogo({
  size = 'md',
  showSubtitle = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}) {
  const iconDim =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-10 h-10';
  const textSize =
    size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-5xl' : 'text-2xl';
  const subSize =
    size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';

  return (
    <div className="inline-flex flex-col items-start select-none">
      <div className="inline-flex items-center gap-2">
        {/* Graduation cap + circuit/book emblem matching Figma */}
        <svg
          viewBox="0 0 64 64"
          className={`${iconDim} shrink-0`}
          aria-hidden="true"
        >
          <path
            d="M32 10L6 22l26 12 26-12L32 10z"
            fill="#1E293B"
          />
          <path
            d="M16 28v13c0 5 7.2 9 16 9s16-4 16-9V28L32 35.5 16 28z"
            fill="#0EA5E9"
            opacity="0.9"
          />
          <path
            d="M52 24v16"
            stroke="#1E293B"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="52" cy="42" r="3" fill="#22C55E" />
          <circle cx="24" cy="42" r="2.2" fill="#FFFFFF" />
          <circle cx="32" cy="44" r="2.2" fill="#FFFFFF" />
          <circle cx="40" cy="42" r="2.2" fill="#FFFFFF" />
        </svg>
        <div className="flex items-baseline gap-1 whitespace-nowrap">
          <span
            className={`${textSize} font-display font-extrabold tracking-tight bg-gradient-to-r from-[#34D399] via-[#10B981] to-[#0EA5E9] bg-clip-text text-transparent`}
          >
            SEA
          </span>
          <span className="text-[11px] font-bold tracking-wider text-[#0284C7]">
            IFCE
          </span>
        </div>
      </div>
      {showSubtitle && (
        <span className={`${subSize} text-slate-500 mt-1 tracking-tight`}>
          Sistema de eventos acadêmicos
        </span>
      )}
    </div>
  );
}

export function IfceCampusLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {/* Classic Federal Institute 3x3 grid + top-left red circle */}
      <svg
        viewBox="0 0 36 44"
        className={compact ? 'w-6 h-7 shrink-0' : 'w-7 h-8 shrink-0'}
        aria-hidden="true"
      >
        <circle cx="5.5" cy="5.5" r="4.5" fill="#DC2626" />
        <rect x="13" y="1.5" width="8.5" height="8.5" rx="1.5" fill="#16A34A" />
        <rect x="24" y="1.5" width="8.5" height="8.5" rx="1.5" fill="#16A34A" />
        <rect x="2" y="12.5" width="8.5" height="8.5" rx="1.5" fill="#16A34A" />
        <rect x="13" y="12.5" width="8.5" height="8.5" rx="1.5" fill="#16A34A" />
        <rect x="2" y="23.5" width="8.5" height="8.5" rx="1.5" fill="#16A34A" />
        <rect x="13" y="23.5" width="8.5" height="8.5" rx="1.5" fill="#16A34A" />
        <rect x="24" y="23.5" width="8.5" height="8.5" rx="1.5" fill="#16A34A" />
        <rect x="2" y="34.5" width="8.5" height="8.5" rx="1.5" fill="#16A34A" />
        <rect x="13" y="34.5" width="8.5" height="8.5" rx="1.5" fill="#16A34A" />
      </svg>
      <div className="leading-tight whitespace-nowrap">
        <div className="text-[11px] font-bold tracking-tight text-slate-900">
          INSTITUTO FEDERAL
        </div>
        <div className="text-[10px] text-slate-600">Ceará</div>
        <div className="text-[10px] text-slate-600">Campus Cedro</div>
      </div>
    </div>
  );
}
