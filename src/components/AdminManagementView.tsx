import React, { useState, useMemo } from 'react';
import {
  Users,
  Calendar,
  Search,
  Filter,
  Edit3,
  Ban,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';
import { EventItem, EventStatus, EventType, UserAccount, UserRole } from '../types';

interface AdminManagementViewProps {
  currentUser: UserAccount;
  users: UserAccount[];
  events: EventItem[];
  onUpdateUser: (userId: string, updates: Partial<UserAccount>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onEditEvent: (event: EventItem) => void;
  onCancelEvent: (eventId: string) => Promise<void>;
  onDeleteEventPermanently: (eventId: string) => Promise<void>;
}

const PAGE_SIZE = 6;

function formatFullDate(isoDate: string): string {
  if (!isoDate) return '--/--/----';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function AdminManagementView({
  currentUser,
  users,
  events,
  onUpdateUser,
  onDeleteUser,
  onEditEvent,
  onCancelEvent,
  onDeleteEventPermanently,
}: AdminManagementViewProps) {
  const [tab, setTab] = useState<'users' | 'events'>('users');

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [roleOrTypeFilter, setRoleOrTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [appliedFilters, setAppliedFilters] = useState({
    query: '',
    roleOrType: 'all',
    status: 'all',
  });
  const [page, setPage] = useState(1);

  // Modals
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDoc, setEditDoc] = useState('');
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editRole, setEditRole] = useState<UserRole>(UserRole.Estudante);
  const [editBlocked, setEditBlocked] = useState(false);

  const [confirmUserAction, setConfirmUserAction] = useState<{
    kind: 'block' | 'delete';
    user: UserAccount;
  } | null>(null);

  const [confirmEventAction, setConfirmEventAction] = useState<{
    kind: 'cancel' | 'delete';
    event: EventItem;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);

  function switchTab(next: 'users' | 'events') {
    setTab(next);
    setSearchInput('');
    setRoleOrTypeFilter('all');
    setStatusFilter('all');
    setAppliedFilters({ query: '', roleOrType: 'all', status: 'all' });
    setPage(1);
  }

  function applyFilterValues(q = searchInput, rt = roleOrTypeFilter, st = statusFilter) {
    setAppliedFilters({ query: q, roleOrType: rt, status: st });
    setPage(1);
  }

  const filteredUsers = useMemo(() => {
    const q = appliedFilters.query.trim().toLowerCase();
    return users.filter((u) => {
      if (q) {
        const hit =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.matriculaOrCpf.toLowerCase().includes(q) ||
          u.roleTitle.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (appliedFilters.roleOrType !== 'all' && u.role !== appliedFilters.roleOrType) {
        return false;
      }
      if (appliedFilters.status === 'active' && u.blocked) return false;
      if (appliedFilters.status === 'blocked' && !u.blocked) return false;
      return true;
    });
  }, [users, appliedFilters]);

  const filteredEvents = useMemo(() => {
    const q = appliedFilters.query.trim().toLowerCase();
    return events.filter((e) => {
      if (q) {
        const hit =
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.organizerName.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (appliedFilters.roleOrType !== 'all' && e.eventType !== appliedFilters.roleOrType) {
        return false;
      }
      if (appliedFilters.status !== 'all' && e.status !== appliedFilters.status) {
        return false;
      }
      return true;
    });
  }, [events, appliedFilters]);

  const activeTotal = tab === 'users' ? filteredUsers.length : filteredEvents.length;
  const totalPages = Math.max(1, Math.ceil(activeTotal / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;

  const pagedUsers = filteredUsers.slice(startIdx, startIdx + PAGE_SIZE);
  const pagedEvents = filteredEvents.slice(startIdx, startIdx + PAGE_SIZE);

  function openEditUserModal(u: UserAccount) {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditDoc(u.matriculaOrCpf);
    setEditRoleTitle(u.roleTitle);
    setEditRole(u.role);
    setEditBlocked(Boolean(u.blocked));
  }

  async function handleSaveUserModal(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      await onUpdateUser(editingUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        matriculaOrCpf: editDoc.trim(),
        roleTitle: editRoleTitle.trim(),
        role: editRole,
        blocked: editBlocked,
      });
      setEditingUser(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmUserModal() {
    if (!confirmUserAction) return;
    setSubmitting(true);
    try {
      if (confirmUserAction.kind === 'block') {
        await onUpdateUser(confirmUserAction.user.id, {
          blocked: !confirmUserAction.user.blocked,
        });
      } else {
        await onDeleteUser(confirmUserAction.user.id);
      }
      setConfirmUserAction(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmEventModal() {
    if (!confirmEventAction) return;
    setSubmitting(true);
    try {
      if (confirmEventAction.kind === 'cancel') {
        await onCancelEvent(confirmEventAction.event.id);
      } else {
        await onDeleteEventPermanently(confirmEventAction.event.id);
      }
      setConfirmEventAction(null);
    } finally {
      setSubmitting(false);
    }
  }

  function renderRoleBadge(role: UserRole) {
    if (role === UserRole.Admin) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-700 text-white whitespace-nowrap">
          Admin
        </span>
      );
    }
    if (role === UserRole.Docente) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#DDF2FD] text-sky-900 whitespace-nowrap">
          Docente
        </span>
      );
    }
    if (role === UserRole.Estudante) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#C1F4CC] text-emerald-950 whitespace-nowrap">
          Estudante
        </span>
      );
    }
    return (
      <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#C1F4CC] text-emerald-950 whitespace-nowrap leading-tight text-center">
        Participante comum
      </span>
    );
  }

  function renderStatusBadge(status: EventStatus) {
    if (status === EventStatus.Finalizado) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#DDF2FD] text-sky-900 whitespace-nowrap">
          Finalizado
        </span>
      );
    }
    if (status === EventStatus.Cancelado) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 whitespace-nowrap">
          Cancelado
        </span>
      );
    }
    return (
      <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#C1F4CC] text-emerald-950 whitespace-nowrap">
        {status}
      </span>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Switcher: Usuários / Eventos (matches Screenshot 202447) */}
      <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70">
        <button
          type="button"
          onClick={() => switchTab('users')}
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            tab === 'users'
              ? 'bg-[#C1F4CC] text-emerald-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Usuários
        </button>
        <button
          type="button"
          onClick={() => switchTab('events')}
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            tab === 'events'
              ? 'bg-[#C1F4CC] text-emerald-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Eventos
        </button>
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilterValues();
        }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[230px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              const v = e.target.value;
              setSearchInput(v);
              applyFilterValues(v, roleOrTypeFilter, statusFilter);
            }}
            placeholder={
              tab === 'users'
                ? 'Buscar por nome, e-mail ou matrícula...'
                : 'Buscar por título, local ou criador...'
            }
            className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-emerald-400"
          />
        </div>

        <select
          value={roleOrTypeFilter}
          onChange={(e) => {
            const v = e.target.value;
            setRoleOrTypeFilter(v);
            applyFilterValues(searchInput, v, statusFilter);
          }}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-emerald-400"
        >
          <option value="all">{tab === 'users' ? 'Todos os perfis' : 'Todos os tipos'}</option>
          {tab === 'users' ? (
            <>
              <option value={UserRole.Estudante}>Estudante</option>
              <option value={UserRole.Docente}>Docente</option>
              <option value={UserRole.Externo}>Participante comum</option>
              <option value={UserRole.Admin}>Admin</option>
            </>
          ) : (
            Object.values(EventType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))
          )}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            const v = e.target.value;
            setStatusFilter(v);
            applyFilterValues(searchInput, roleOrTypeFilter, v);
          }}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-emerald-400"
        >
          <option value="all">Todos os status</option>
          {tab === 'users' ? (
            <>
              <option value="active">Ativo</option>
              <option value="blocked">Bloqueado</option>
            </>
          ) : (
            Object.values(EventStatus).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))
          )}
        </select>

        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300/80 text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" />
          Filtrar
        </button>
      </form>

      {/* Main Data Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {tab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#D9F8E2] text-slate-900 text-xs font-semibold">
                  <th className="py-3.5 px-4 w-16" />
                  <th className="py-3.5 px-4">Nome</th>
                  <th className="py-3.5 px-4">E-mail</th>
                  <th className="py-3.5 px-4 text-center">Perfil</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right pr-6">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {pagedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                      Nenhum usuário encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  pagedUsers.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="w-9 h-9 rounded-full bg-[#EBF9EF] border border-[#8CE8A4] overflow-hidden flex items-center justify-center text-emerald-700 font-bold text-xs">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon className="w-4 h-4" />
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div>{u.name}</div>
                          <div className="text-[11px] text-slate-400 tabular-nums">
                            {u.matriculaOrCpf}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                        <td className="py-3.5 px-4 text-center">{renderRoleBadge(u.role)}</td>
                        <td className="py-3.5 px-4 text-xs text-slate-700">
                          {u.blocked ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">
                              Bloqueado
                            </span>
                          ) : (
                            <span className="text-slate-600">{u.roleTitle}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right pr-5">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditUserModal(u)}
                              title="Editar usuário"
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() =>
                                setConfirmUserAction({ kind: 'block', user: u })
                              }
                              title={
                                isSelf
                                  ? 'Não é possível bloquear sua própria conta'
                                  : u.blocked
                                    ? 'Desbloquear usuário'
                                    : 'Bloquear usuário'
                              }
                              className={`p-1.5 rounded-lg transition-colors ${
                                isSelf
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : u.blocked
                                    ? 'text-emerald-600 hover:bg-emerald-50 cursor-pointer'
                                    : 'text-rose-500 hover:bg-rose-50 cursor-pointer'
                              }`}
                            >
                              {u.blocked ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() =>
                                setConfirmUserAction({ kind: 'delete', user: u })
                              }
                              title={
                                isSelf
                                  ? 'Não é possível excluir sua própria conta aqui'
                                  : 'Excluir usuário'
                              }
                              className={`p-1.5 rounded-lg transition-colors ${
                                isSelf
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-rose-500 hover:bg-rose-50 cursor-pointer'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#D9F8E2] text-slate-900 text-xs font-semibold">
                  <th className="py-3.5 px-4">Banner</th>
                  <th className="py-3.5 px-4">Título</th>
                  <th className="py-3.5 px-4">Data</th>
                  <th className="py-3.5 px-4">Local</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right pr-6">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {pagedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                      Nenhum evento encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  pagedEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img
                            src={evt.bannerUrl}
                            alt={evt.title}
                            referrerPolicy="no-referrer"
                            className={`w-full h-full object-cover ${
                              evt.status === EventStatus.Cancelado ? 'grayscale opacity-50' : ''
                            }`}
                          />
                          <span className="absolute top-1 left-1 bg-[#B7F2C7] text-emerald-950 text-[8px] font-bold px-1 rounded">
                            {evt.eventType}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 line-clamp-2 max-w-xs">
                          {evt.title}
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="w-4 h-4 rounded-full bg-[#EBF9EF] text-emerald-700 inline-flex items-center justify-center text-[9px] font-bold">
                            {evt.organizerName.charAt(0)}
                          </span>
                          <span>{evt.organizerName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 tabular-nums whitespace-nowrap">
                        {formatFullDate(evt.startDate)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{evt.location}</td>
                      <td className="py-3.5 px-4 text-center">{renderStatusBadge(evt.status)}</td>
                      <td className="py-3.5 px-4 text-right pr-5">
                        <div className="inline-flex items-center gap-1.5">
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
                            disabled={evt.status === EventStatus.Cancelado}
                            onClick={() =>
                              setConfirmEventAction({ kind: 'cancel', event: evt })
                            }
                            title="Cancelar evento"
                            className={`p-1.5 rounded-lg transition-colors ${
                              evt.status === EventStatus.Cancelado
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-rose-500 hover:bg-rose-50 cursor-pointer'
                            }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmEventAction({ kind: 'delete', event: evt })
                            }
                            title="Excluir evento permanentemente"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer (matches Screenshot 202447) */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
        <span className="tabular-nums">
          Mostrando{' '}
          {activeTotal === 0
            ? '0'
            : `${startIdx + 1}-${Math.min(startIdx + PAGE_SIZE, activeTotal)}`}{' '}
          de <strong>{activeTotal}</strong> {tab === 'users' ? 'usuários' : 'eventos'}
        </span>

        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPage(num)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold tabular-nums cursor-pointer ${
                num === safePage
                  ? 'bg-[#0D8A4E] text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            aria-label="Próxima página"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveUserModal}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900">Editar usuário</h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Matrícula / CPF
                  </label>
                  <input
                    type="text"
                    value={editDoc}
                    onChange={(e) => setEditDoc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Perfil</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value={UserRole.Estudante}>Estudante</option>
                    <option value={UserRole.Docente}>Docente</option>
                    <option value={UserRole.Externo}>Participante comum</option>
                    <option value={UserRole.Admin}>Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Curso / Cargo
                </label>
                <input
                  type="text"
                  value={editRoleTitle}
                  onChange={(e) => setEditRoleTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              {editingUser.id !== currentUser.id && (
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={editBlocked}
                    onChange={(e) => setEditBlocked(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600"
                  />
                  <span>Suspender / bloquear acesso desta conta</span>
                </label>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl bg-[#BCE7FA] hover:bg-[#9cdbf7] text-slate-900 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 text-xs font-semibold cursor-pointer"
              >
                {submitting ? 'Salvando...' : 'Salvar edições'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm User Action Modal */}
      {confirmUserAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-100">
            <h3 className="font-display text-lg font-bold text-slate-900">
              {confirmUserAction.kind === 'delete'
                ? 'Excluir usuário permanentemente?'
                : confirmUserAction.user.blocked
                  ? 'Desbloquear usuário?'
                  : 'Bloquear acesso do usuário?'}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              {confirmUserAction.kind === 'delete'
                ? `A conta de ${confirmUserAction.user.name} e suas inscrições serão removidas.`
                : confirmUserAction.user.blocked
                  ? `${confirmUserAction.user.name} poderá acessar o SEA novamente.`
                  : `${confirmUserAction.user.name} não poderá entrar no sistema até ser desbloqueado.`}
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmUserAction(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmUserModal}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  confirmUserAction.kind === 'block' && confirmUserAction.user.blocked
                    ? 'bg-[#67E38C] text-emerald-950'
                    : 'bg-[#FF7A7A] text-white'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Event Action Modal */}
      {confirmEventAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-100">
            <h3 className="font-display text-lg font-bold text-slate-900">
              {confirmEventAction.kind === 'delete'
                ? 'Excluir evento permanentemente?'
                : 'Cancelar este evento?'}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              {confirmEventAction.kind === 'delete'
                ? `"${confirmEventAction.event.title}" será removido do banco de dados.`
                : `"${confirmEventAction.event.title}" será marcado como Cancelado e notificará os participantes.`}
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmEventAction(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmEventModal}
                className="flex-1 py-2 rounded-xl bg-[#FF7A7A] text-white text-xs font-semibold cursor-pointer"
              >
                {confirmEventAction.kind === 'delete' ? 'Excluir evento' : 'Cancelar evento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
