import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  Calendar,
  Users,
  PlusCircle,
  Trash2,
  Edit3,
  Clock,
} from 'lucide-react';
import { EventItem, EventStatus, EventType, SubeventItem, UserAccount } from '../types';

const PRESET_BANNERS = [
  {
    label: 'Tecnologia & Inovação',
    url: '/src/assets/images/poster_tecnologia_ifce_1794858693692.jpg',
  },
  {
    label: 'Saúde & Bem-estar',
    url: '/src/assets/images/poster_saude_bemestar_1794858693824.jpg',
  },
  {
    label: 'Cultura & Vozes',
    url: '/src/assets/images/poster_vozes_cultura_1794858693933.jpg',
  },
  {
    label: 'Robótica & Oficina',
    url: '/src/assets/images/poster_oficina_robotica_1794858694324.jpg',
  },
  {
    label: 'Pesquisa & Extensão',
    url: '/src/assets/images/poster_extensao_pesquisa_1794858694286.jpg',
  },
];

interface CreateEventViewProps {
  user: UserAccount;
  editingEvent?: EventItem | null;
  onSaveEvent: (payload: Partial<EventItem>, isEdit: boolean) => Promise<void>;
  onCancel: () => void;
}

export function CreateEventView({
  user,
  editingEvent,
  onSaveEvent,
  onCancel,
}: CreateEventViewProps) {
  const [title, setTitle] = useState(editingEvent?.title || '');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [bannerUrl, setBannerUrl] = useState(editingEvent?.bannerUrl || PRESET_BANNERS[0].url);
  const [location, setLocation] = useState(editingEvent?.location || '');
  const [startDate, setStartDate] = useState(editingEvent?.startDate || '');
  const [endDate, setEndDate] = useState(editingEvent?.endDate || '');
  const [startTime, setStartTime] = useState(editingEvent?.startTime || '08:00');
  const [endTime, setEndTime] = useState(editingEvent?.endTime || '12:00');
  const [maxSlots, setMaxSlots] = useState(String(editingEvent?.maxSlots || 50));
  const [workloadHours, setWorkloadHours] = useState(
    String(editingEvent?.workloadHours || 4)
  );
  const [eventType, setEventType] = useState<EventType>(
    editingEvent?.eventType || EventType.Palestra
  );
  const [institutionalOnly, setInstitutionalOnly] = useState(
    editingEvent?.institutionalOnly || false
  );
  const [generateCertificate, setGenerateCertificate] = useState(
    editingEvent?.generateCertificate ?? true
  );

  // Subevents state matching Screenshot 2
  const [subevents, setSubevents] = useState<SubeventItem[]>(
    editingEvent?.subevents || []
  );
  const [subFormOpen, setSubFormOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subTitle, setSubTitle] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subBanner, setSubBanner] = useState(PRESET_BANNERS[3].url);
  const [subLocation, setSubLocation] = useState('');
  const [subStartDate, setSubStartDate] = useState('');
  const [subEndDate, setSubEndDate] = useState('');
  const [subStartTime, setSubStartTime] = useState('14:00');
  const [subEndTime, setSubEndTime] = useState('17:00');
  const [subSlots, setSubSlots] = useState('30');
  const [subType, setSubType] = useState<EventType>(EventType.Oficina);
  const [subInstOnly, setSubInstOnly] = useState(false);
  const [subCert, setSubCert] = useState(true);

  const [saving, setSaving] = useState(false);

  function handleBannerUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setter(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function resetSubForm() {
    setEditingSubId(null);
    setSubTitle('');
    setSubDesc('');
    setSubBanner(PRESET_BANNERS[3].url);
    setSubLocation('');
    setSubStartDate(startDate);
    setSubEndDate(endDate);
    setSubStartTime('14:00');
    setSubEndTime('17:00');
    setSubSlots('30');
    setSubType(EventType.Oficina);
    setSubInstOnly(false);
    setSubCert(true);
  }

  function handleSaveSubevent() {
    if (!subTitle.trim()) return;
    const item: SubeventItem = {
      id: editingSubId || `sub-${Date.now()}`,
      title: subTitle.trim(),
      description: subDesc.trim() || 'Atividade complementar integrada ao evento principal.',
      bannerUrl: subBanner,
      location: subLocation.trim() || location || 'Campus Cedro',
      startDate: subStartDate || startDate || '2026-12-01',
      endDate: subEndDate || subStartDate || startDate || '2026-12-01',
      startTime: subStartTime || '14:00',
      endTime: subEndTime || '17:00',
      maxSlots: Number(subSlots) || 30,
      registeredCount: 0,
      eventType: subType,
      institutionalOnly: subInstOnly,
      generateCertificate: subCert,
      workloadHours: 4,
    };

    if (editingSubId) {
      setSubevents((prev) => prev.map((s) => (s.id === editingSubId ? item : s)));
    } else {
      setSubevents((prev) => [...prev, item]);
    }
    setSubFormOpen(false);
    resetSubForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveEvent(
        {
          id: editingEvent?.id,
          organizerId: user.id,
          title,
          description,
          bannerUrl,
          location,
          startDate,
          endDate: endDate || startDate,
          startTime,
          endTime,
          maxSlots: Number(maxSlots) || 50,
          workloadHours: Number(workloadHours) || 4,
          eventType,
          status: editingEvent?.status || EventStatus.EmAndamento,
          institutionalOnly,
          generateCertificate,
          subevents,
        },
        Boolean(editingEvent)
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#B7ECC6] rounded-3xl p-6 sm:p-8 space-y-8 shadow-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h1 className="font-display text-xl font-bold text-slate-900">
            {editingEvent ? 'Editar evento acadêmico' : 'Criar novo evento'}
          </h1>
          {editingEvent && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancelar edição
            </button>
          )}
        </div>

        {/* Geral */}
        <section className="space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900">Geral</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Banner Upload Box */}
            <div className="md:col-span-4 space-y-2">
              <label className="block relative w-full h-56 rounded-2xl bg-[#EEFBF2] border-2 border-dashed border-[#A6DFB6] overflow-hidden cursor-pointer group">
                <img
                  src={bannerUrl}
                  alt="Banner do evento"
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-65 transition-opacity"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/20 text-white p-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 text-emerald-700 flex items-center justify-center shadow-sm mb-1.5">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold drop-shadow-xs">
                    Adicionar / trocar banner
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBannerUpload(e, setBannerUrl)}
                  className="hidden"
                />
              </label>

              {/* Quick institutional banner presets */}
              <div className="flex flex-wrap gap-1.5">
                {PRESET_BANNERS.map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => setBannerUrl(p.url)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border cursor-pointer ${
                      bannerUrl === p.url
                        ? 'bg-[#C1F4CC] border-emerald-500 text-emerald-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Título <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título do evento"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Descrição
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Conte mais sobre seu evento..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Hora, data e Local */}
        <section className="space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900">Hora, data e Local</h2>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Local <span className="text-emerald-600">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Digite o local onde ocorrerá o seu evento..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Data Inicial <span className="text-emerald-600">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Data final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hora Inicial <span className="text-emerald-600">*</span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hora final
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>
        </section>

        {/* Detalhes adicionais */}
        <section className="space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900">Detalhes adicionais</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Vagas <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1}
                      required
                      value={maxSlots}
                      onChange={(e) => setMaxSlots(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm tabular-nums focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Carga horária (h)
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1}
                      value={workloadHours}
                      onChange={(e) => setWorkloadHours(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm tabular-nums focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tipo de evento
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-sky-400"
                >
                  {Object.values(EventType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Checkboxes */}
            <div className="md:col-span-6 space-y-3 pt-1">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={institutionalOnly}
                  onChange={(e) => setInstitutionalOnly(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-sky-400 text-sky-600 focus:ring-sky-200"
                />
                <span>Permitir que apenas alunos e docentes se cadastrem no evento</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateCertificate}
                  onChange={(e) => setGenerateCertificate(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-sky-400 text-sky-600 focus:ring-sky-200"
                />
                <span>Gerar certificado automaticamente após validação de presença</span>
              </label>
            </div>
          </div>
        </section>

        {/* Ações adicionais: Subeventos (Screenshot 2 middle & right states) */}
        <section className="space-y-4">
          <h2 className="font-display text-base font-bold text-slate-900">Ações adicionais</h2>
          <button
            type="button"
            onClick={() => {
              resetSubForm();
              setSubFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#50B8EC] text-[#0D8ECF] hover:bg-sky-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Adicionar subeventos</span>
            <PlusCircle className="w-4 h-4" />
          </button>

          {/* Saved Subevents List (Screenshot 2 right state) */}
          {subevents.map((sub) => (
            <div
              key={sub.id}
              className="border border-[#50B8EC] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 relative bg-white"
            >
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSubId(sub.id);
                    setSubTitle(sub.title);
                    setSubDesc(sub.description);
                    setSubBanner(sub.bannerUrl);
                    setSubLocation(sub.location);
                    setSubStartDate(sub.startDate);
                    setSubEndDate(sub.endDate);
                    setSubStartTime(sub.startTime);
                    setSubEndTime(sub.endTime);
                    setSubSlots(String(sub.maxSlots));
                    setSubType(sub.eventType);
                    setSubInstOnly(sub.institutionalOnly);
                    setSubCert(sub.generateCertificate);
                    setSubFormOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                  aria-label="Editar subevento"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSubevents((prev) => prev.filter((s) => s.id !== sub.id))}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                  aria-label="Remover subevento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="relative w-24 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={sub.bannerUrl}
                  alt={sub.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1.5 left-1.5 bg-[#B7F2C7] text-emerald-950 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  {sub.eventType}
                </span>
              </div>

              <div className="flex-1 min-w-0 pr-14">
                <h4 className="font-display font-bold text-sm text-slate-900">{sub.title}</h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1 tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {sub.startDate}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {sub.startTime} - {sub.endTime}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {sub.location}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{sub.description}</p>
                <div className="text-right text-xs text-slate-500 mt-2 tabular-nums">
                  vagas: 0/{sub.maxSlots}
                </div>
              </div>
            </div>
          ))}

          {/* Expandable Subevent Form Card (Screenshot 2 middle state) */}
          {subFormOpen && (
            <div className="border border-[#50B8EC] rounded-2xl p-6 space-y-5 bg-sky-50/20 relative">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-slate-900">
                  {editingSubId ? 'Editar subevento' : `Subevento ${subevents.length + 1}`}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setSubFormOpen(false);
                    resetSubForm();
                  }}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                  aria-label="Descartar subevento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-8 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Título <span className="text-emerald-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={subTitle}
                      onChange={(e) => setSubTitle(e.target.value)}
                      placeholder="Título do subevento"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      rows={3}
                      value={subDesc}
                      onChange={(e) => setSubDesc(e.target.value)}
                      placeholder="Conte mais sobre seu subevento..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-4">
                  <label className="block relative w-full h-40 rounded-2xl bg-[#EEFBF2] border-2 border-dashed border-[#A6DFB6] overflow-hidden cursor-pointer">
                    <img
                      src={subBanner}
                      alt="Banner do subevento"
                      className="w-full h-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/20 text-white text-xs font-semibold">
                      <Camera className="w-5 h-5 mb-1" />
                      Adicionar banner
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBannerUpload(e, setSubBanner)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Local
                  </label>
                  <input
                    type="text"
                    value={subLocation}
                    onChange={(e) => setSubLocation(e.target.value)}
                    placeholder="Laboratório / Sala..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={subStartDate}
                    onChange={(e) => setSubStartDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Início
                  </label>
                  <input
                    type="time"
                    value={subStartTime}
                    onChange={(e) => setSubStartTime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fim</label>
                  <input
                    type="time"
                    value={subEndTime}
                    onChange={(e) => setSubEndTime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vagas
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={subSlots}
                      onChange={(e) => setSubSlots(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={subType}
                      onChange={(e) => setSubType(e.target.value as EventType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                    >
                      {Object.values(EventType).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subInstOnly}
                      onChange={(e) => setSubInstOnly(e.target.checked)}
                    />
                    <span>Apenas alunos e docentes</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subCert}
                      onChange={(e) => setSubCert(e.target.checked)}
                    />
                    <span>Gerar certificado</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={handleSaveSubevent}
                  className="px-6 py-2 rounded-xl bg-[#10A5E8] hover:bg-[#0D91CD] text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Salvar subevento
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-2.5 rounded-xl bg-[#6EE792] hover:bg-[#52D97B] text-emerald-950 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving
              ? 'Salvando...'
              : editingEvent
                ? 'Salvar alterações'
                : 'Publicar evento'}
          </button>
        </div>
      </form>
    </div>
  );
}
