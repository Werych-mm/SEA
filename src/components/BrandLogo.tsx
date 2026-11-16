import React from 'react';

export function SeaLogo({
  size = 'md',
  showSubtitle = false,
  variant = 'default',
}: {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  variant?: 'default' | 'footer';
}) {
  if (variant === 'footer') {
    return (
      <div className="inline-flex items-center select-none overflow-hidden py-0.5">
        <img
          src="/assets/aistudio/SEA__4_-removebg-preview_1_6d590982.png"
          alt="SEA IFCE — Sistema de eventos acadêmicos"
          className="h-24 sm:h-28 w-auto object-contain -my-5"
        />
      </div>
    );
  }

  const imgHeight =
    size === 'sm'
      ? 'h-9 sm:h-10'
      : size === 'lg'
        ? 'h-24 sm:h-28'
        : 'h-12';
  const subSize =
    size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';

  return (
    <div className="inline-flex flex-col items-center lg:items-start select-none">
      <img
        src="/assets/aistudio/1_1_7d50df76.png"
        alt="SEA IFCE"
        className={`${imgHeight} w-auto object-contain`}
      />
      {showSubtitle && (
        <span className={`${subSize} text-slate-500 mt-1.5 tracking-tight`}>
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
