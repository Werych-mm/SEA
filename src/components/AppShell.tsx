import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Home,
  Plus,
  CalendarCheck,
  LayoutGrid,
  HelpCircle,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  User,
  X,
  Ban,
} from 'lucide-react';
import { AppSection, EventType, NotificationItem, UserAccount, UserRole } from '../types';
import { IfceCampusLogo, SeaLogo } from './BrandLogo';

interface AppShellProps {
  user: UserAccount;
  activeSection: AppSection;
  activeCategoryFilter: EventType | 'all';
  searchQuery: string;
  notifications: NotificationItem[];
  onNavigate: (section: AppSection, category?: EventType | 'all') => void;
  onSearchChange: (q: string) => void;
  onMarkNotificationsRead: () => void;
  onOpenOwnProfile: () => void;
  children: React.ReactNode;
}

export function AppShell({
  user,
  activeSection,
  activeCategoryFilter,
  searchQuery,
  notifications,
  onNavigate,
  onSearchChange,
  onMarkNotificationsRead,
  onOpenOwnProfile,
  children,
}: AppShellProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [maisOpen, setMaisOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<'Geral' | 'Eventos' | 'Docentes'>('Geral');
  const [searchOpen, setSearchOpen] = useState(false);

  const maisRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (maisRef.current && !maisRef.current.contains(e.target as Node)) {
        setMaisOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (notifTab === 'Geral') return true;
    return n.category === notifTab;
  });

  const canCreateEvents = user.role === UserRole.Docente;

  const primaryNav: Array<{
    id: AppSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    visible: boolean;
  }> = [
    { id: 'home', label: 'Início', icon: Home, visible: true },
    { id: 'create', label: 'Criar evento', icon: Plus, visible: canCreateEvents },
    { id: 'registrations', label: 'Suas inscrições', icon: CalendarCheck, visible: true },
    { id: 'my-events', label: 'Seus eventos', icon: LayoutGrid, visible: canCreateEvents },
  ];

  const secondaryNav: Array<{
    id: AppSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'help', label: 'Ajuda', icon: HelpCircle },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-white text-slate-900">
      {/* Left Sidebar (Mint green rail matching Screenshot 1 & 6) */}
      <aside
        className={`shrink-0 bg-[#F3FCF5] border-r border-[#DDF3E4] flex flex-col justify-between transition-all duration-200 sticky top-0 h-screen z-30 ${
          sidebarExpanded ? 'w-[244px]' : 'w-[72px]'
        }`}
      >
        <div>
          {/* Top Hamburger + IFCE Logo when expanded */}
          <div className="h-16 px-4 flex items-center gap-3 border-b border-[#E3F6E8]">
            <button
              type="button"
              onClick={() => setSidebarExpanded((prev) => !prev)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 hover:bg-[#DCF6E4] transition-colors cursor-pointer shrink-0"
              aria-label="Alternar barra lateral"
            >
              <Menu className="w-5 h-5" />
            </button>
            {sidebarExpanded && (
              <div className="overflow-hidden">
                <IfceCampusLogo compact />
              </div>
            )}
          </div>

          {/* Primary Nav */}
          <nav className="p-3 space-y-1.5">
            {primaryNav
              .filter((item) => item.visible)
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={!sidebarExpanded ? item.label : undefined}
                    onClick={() => onNavigate(item.id, 'all')}
                    className={`w-full flex items-center gap-3 rounded-full transition-colors cursor-pointer ${
                      sidebarExpanded ? 'px-4 py-2.5' : 'px-0 py-2.5 justify-center'
                    } ${
                      isActive
                        ? 'bg-[#C1F4CC] text-slate-950 font-semibold'
                        : 'text-slate-700 hover:bg-[#E3F8E9]'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {sidebarExpanded && (
                      <span className="text-sm whitespace-nowrap truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}

            <div className="my-3 border-t border-[#C8EFD3] mx-2" />

            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={!sidebarExpanded ? item.label : undefined}
                  onClick={() => onNavigate(item.id, 'all')}
                  className={`w-full flex items-center gap-3 rounded-full transition-colors cursor-pointer ${
                    sidebarExpanded ? 'px-4 py-2.5' : 'px-0 py-2.5 justify-center'
                  } ${
                    isActive
                      ? 'bg-[#C1F4CC] text-slate-950 font-semibold'
                      : 'text-slate-700 hover:bg-[#E3F8E9]'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {sidebarExpanded && (
                    <span className="text-sm whitespace-nowrap truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Role indicator at bottom when expanded */}
        {sidebarExpanded && (
          <div className="p-4 border-t border-[#DDF3E4]">
            <div className="text-[11px] font-medium text-emerald-900 truncate">{user.name}</div>
            <div className="text-[11px] text-slate-500 truncate">{user.roleTitle}</div>
          </div>
        )}
      </aside>

      {/* Main Column */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
          {/* Zone 1 & 2: Brand + Nav Links */}
          <div className="flex items-center gap-6 lg:gap-8 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate('home', 'all')}
              className="cursor-pointer shrink-0"
            >
              <SeaLogo size="sm" />
            </button>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
              <button
                type="button"
                onClick={() => onNavigate('category', EventType.Palestra)}
                className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSection === 'category' && activeCategoryFilter === EventType.Palestra
                    ? 'text-emerald-700 font-semibold underline underline-offset-4'
                    : ''
                }`}
              >
                Palestras
              </button>
              <button
                type="button"
                onClick={() => onNavigate('category', EventType.Oficina)}
                className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSection === 'category' && activeCategoryFilter === EventType.Oficina
                    ? 'text-emerald-700 font-semibold underline underline-offset-4'
                    : ''
                }`}
              >
                Oficinas
              </button>

              {/* "Mais ▾" Dropdown (exact Screenshot 1 top-right extension) */}
              <div className="relative" ref={maisRef}>
                <button
                  type="button"
                  onClick={() => setMaisOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Mais</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${maisOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {maisOpen && (
                  <div className="absolute left-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-40">
                    {[
                      {
                        label: 'Rodas de conversas',
                        action: () => onNavigate('category', EventType.RodaConversa),
                      },
                      {
                        label: 'Mini cursos',
                        action: () => onNavigate('category', EventType.MiniCurso),
                      },
                      {
                        label: 'Outros',
                        action: () => onNavigate('category', EventType.Outros),
                      },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          opt.action();
                          setMaisOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-800 hover:bg-[#DDF2FD] transition-colors cursor-pointer"
                      >
                        <span>{opt.label}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Zone 3: Search + Notifications + Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {searchOpen ? (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar eventos..."
                  className="bg-transparent text-xs text-slate-800 focus:outline-none w-36 sm:w-52"
                />
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    setSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Pesquisar eventos"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Notifications Bell & Popover (Screenshot 1) */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  const next = !notifOpen;
                  setNotifOpen(next);
                  if (next && unreadCount > 0) {
                    onMarkNotificationsRead();
                  }
                }}
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-[340px] sm:w-[370px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-40">
                  <div className="px-4 pt-3.5 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display font-bold text-sm text-slate-900">
                        Notificações
                      </span>
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      {(['Geral', 'Eventos', 'Docentes'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setNotifTab(tab)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                            notifTab === tab
                              ? 'bg-[#DDF2FD] border border-[#74C2F1] text-slate-900'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {filteredNotifs.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        Nenhuma notificação nesta categoria.
                      </div>
                    ) : (
                      filteredNotifs.map((n) => (
                        <div key={n.id} className="p-3.5 flex gap-3 hover:bg-slate-50/80">
                          <div
                            className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${
                              n.type === 'alert'
                                ? 'bg-rose-100 text-rose-600'
                                : n.type === 'reminder'
                                  ? 'bg-sky-100 text-sky-600'
                                  : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {n.type === 'alert' ? (
                              <Ban className="w-4 h-4" />
                            ) : n.type === 'reminder' ? (
                              <Bell className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-900">
                              {n.senderName}
                              {n.senderRole && (
                                <span className="font-normal text-slate-500">
                                  {' '}
                                  · {n.senderRole}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                              <strong className="text-slate-800">{n.title}:</strong> {n.message}
                            </p>
                            <div className="text-[11px] text-slate-400 mt-1 text-right">
                              {n.timestamp}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <button
              type="button"
              onClick={onOpenOwnProfile}
              title="Meu perfil"
              className="w-9 h-9 rounded-full bg-[#EBF9EF] border border-[#8CE8A4] overflow-hidden flex items-center justify-center text-emerald-800 font-bold text-xs hover:ring-2 hover:ring-emerald-300 transition-all cursor-pointer"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 px-4 sm:px-8 lg:px-10 py-6 max-w-[1360px] w-full mx-auto">
          {children}
        </main>

        {/* Institutional Footer (Screenshot 1) */}
        <footer className="bg-[#DCF6E4] border-t border-[#C4ECD0] px-6 sm:px-10 py-3 mt-12">
          <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <SeaLogo size="sm" variant="footer" />
            <p className="text-xs text-slate-700 text-center">
              © 2026 SEA - IFCE Campus Cedro. Todos os direitos reservados.
            </p>
            <IfceCampusLogo compact />
          </div>
        </footer>
      </div>
    </div>
  );
}
