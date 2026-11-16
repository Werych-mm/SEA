import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Award,
  MessageSquare,
} from 'lucide-react';
import {
  CertificateData,
  EventItem,
  EventStatus,
  PaperSubmission,
  SubmissionStatus,
  UserAccount,
  UserRole,
} from '../types';
import { formatShortDate } from './EventCard';

interface SubmissionsViewProps {
  user: UserAccount;
  events: EventItem[];
  submissions: PaperSubmission[];
  preselectedEventId?: string | null;
  onSubmitPaper: (payload: {
    eventId: string;
    coAuthors: string;
    title: string;
    abstract: string;
    track: string;
    keywords: string;
    fileName: string;
    fileSize: string;
  }) => Promise<void>;
  onReviewPaper: (
    submissionId: string,
    status: SubmissionStatus,
    feedback: string
  ) => Promise<void>;
  onOpenCertificate: (cert: CertificateData) => void;
}

export function SubmissionsView({
  user,
  events,
  submissions,
  preselectedEventId,
  onSubmitPaper,
  onReviewPaper,
  onOpenCertificate,
}: SubmissionsViewProps) {
  const isDocente = user.role === UserRole.Docente;
  const openEvents = events.filter(
    (e) => e.acceptSubmissions && e.status !== EventStatus.Cancelado
  );

  const [tab, setTab] = useState<'submit' | 'mine' | 'review'>(
    preselectedEventId ? 'submit' : 'mine'
  );
  const [eventId, setEventId] = useState(
    preselectedEventId || openEvents[0]?.id || events[0]?.id || ''
  );
  const [title, setTitle] = useState('');
  const [coAuthors, setCoAuthors] = useState('');
  const [track, setTrack] = useState('Sistemas de Informação e Computação');
  const [keywords, setKeywords] = useState('');
  const [abstract, setAbstract] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reviewer feedback map
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  const mySubmissions = submissions.filter((s) => s.authorId === user.id);
  const reviewableSubmissions = submissions.filter((s) => {
    const evt = events.find((e) => e.id === s.eventId);
    return evt?.organizerId === user.id || isDocente;
  });

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const kb = file.size / 1024;
    setFileSize(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eventId || !title.trim() || !abstract.trim()) return;
    setSubmitting(true);
    try {
      await onSubmitPaper({
        eventId,
        coAuthors,
        title,
        abstract,
        track,
        keywords,
        fileName: fileName || 'trabalho_academico_ifce.pdf',
        fileSize: fileSize || '1.1 MB',
      });
      setTitle('');
      setCoAuthors('');
      setKeywords('');
      setAbstract('');
      setFileName('');
      setFileSize('');
      setTab('mine');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCertificate(subm: PaperSubmission) {
    const evt = events.find((e) => e.id === subm.eventId);
    onOpenCertificate({
      participantName: subm.authorName,
      participantDocument: user.id === subm.authorId ? user.matriculaOrCpf : 'Autor Principal',
      participantRole: 'Autor(a)',
      eventTitle: subm.eventTitle,
      eventType: evt?.eventType || 'Evento Acadêmico',
      eventDate: evt ? formatShortDate(evt.startDate) : '2026',
      eventLocation: evt?.location || 'IFCE Campus Cedro',
      workloadHours: evt?.workloadHours || 8,
      organizerName: evt?.organizerName || 'Comitê Científico SEA IFCE',
      organizerRole: evt?.organizerRoleTitle || 'Coordenação de Evento Acadêmico',
      certificateCode: subm.certificateCode || `SEA-ART-2026-${subm.id.slice(-4)}`,
      issuedAt: new Date().toLocaleDateString('pt-BR'),
      kind: 'apresentacao',
      paperTitle: subm.title,
    });
  }

  function statusBadge(status: SubmissionStatus) {
    switch (status) {
      case SubmissionStatus.Aprovado:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-[#C1F4CC] px-2.5 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aprovado
          </span>
        );
      case SubmissionStatus.RevisaoSolicitada:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5" />
            Revisão solicitada
          </span>
        );
      case SubmissionStatus.Rejeitado:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-lg">
            <XCircle className="w-3.5 h-3.5" />
            Rejeitado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 bg-sky-100 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5" />
            Em avaliação
          </span>
        );
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Submissão de Artigos Científicos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Envie trabalhos acadêmicos em PDF para os eventos do IFCE Campus Cedro e acompanhe o
            parecer.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setTab('mine')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'mine' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Meus artigos ({mySubmissions.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('submit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'submit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Nova submissão
          </button>
          {isDocente && (
            <button
              type="button"
              onClick={() => setTab('review')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                tab === 'review' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Avaliar ({reviewableSubmissions.length})
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Nova Submissão */}
      {tab === 'submit' && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#B7ECC6] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Evento de destino *
              </label>
              <select
                required
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-sky-400"
              >
                {(openEvents.length > 0 ? openEvents : events).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Eixo temático / Trilha *
              </label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-sky-400"
              >
                <option>Sistemas de Informação e Computação</option>
                <option>Sistemas Embarcados e IoT</option>
                <option>Energias Renováveis e Sustentabilidade</option>
                <option>Educação, Cultura e Humanidades</option>
                <option>Engenharia Mecânica e Automação</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Título do artigo *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aplicação de Redes Neurais na Previsão de Demanda Energética..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Coautores e orientador(a)
              </label>
              <input
                type="text"
                value={coAuthors}
                onChange={(e) => setCoAuthors(e.target.value)}
                placeholder="Ex: Prof. Dr. Carlos Lima; Maria Clara Souza"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Palavras-chave
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Ex: IoT; Educação; Campus Cedro"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Resumo (Abstract) *
            </label>
            <textarea
              rows={4}
              required
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Apresente objetivo, metodologia e principais resultados do artigo..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Arquivo do artigo (PDF)
            </label>
            <label className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 rounded-2xl bg-[#EEFBF2] border-2 border-dashed border-[#A6DFB6] cursor-pointer hover:bg-[#e3f8e9] transition-colors">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {fileName || 'Clique para anexar arquivo PDF (modelo SBC / ABNT)'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {fileSize ? `Tamanho: ${fileSize}` : 'Formato aceito: .pdf até 10 MB'}
                  </div>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-xs font-semibold text-emerald-900">
                Selecionar PDF
              </span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFilePick}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setTab('mine')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Enviando artigo...' : 'Submeter artigo'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Meus Artigos */}
      {tab === 'mine' && (
        <div className="space-y-4">
          {mySubmissions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600">
                Você ainda não submeteu nenhum artigo científico.
              </p>
              <button
                type="button"
                onClick={() => setTab('submit')}
                className="mt-4 px-5 py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-xs cursor-pointer"
              >
                Enviar primeiro artigo
              </button>
            </div>
          ) : (
            mySubmissions.map((subm) => (
              <div
                key={subm.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="text-xs font-medium text-sky-700">{subm.eventTitle}</div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      {subm.title}
                    </h3>
                    <div className="text-xs text-slate-500">
                      {subm.track} · {subm.fileName} ({subm.fileSize})
                    </div>
                  </div>
                  {statusBadge(subm.status)}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{subm.abstract}</p>

                {subm.reviewerFeedback && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Parecer do comitê: </strong>
                      {subm.reviewerFeedback}
                    </div>
                  </div>
                )}

                {subm.status === SubmissionStatus.Aprovado && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleCertificate(subm)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-xs cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      Gerar certificado de apresentação
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Comitê Avaliador (Docentes) */}
      {tab === 'review' && isDocente && (
        <div className="space-y-4">
          {reviewableSubmissions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500">
              Não há artigos aguardando avaliação no momento.
            </div>
          ) : (
            reviewableSubmissions.map((subm) => (
              <div
                key={subm.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-sky-700">{subm.eventTitle}</div>
                    <h3 className="font-display font-bold text-base text-slate-900 mt-0.5">
                      {subm.title}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1">
                      Autor: <strong className="text-slate-700">{subm.authorName}</strong>
                      {subm.coAuthors && ` · Coautores: ${subm.coAuthors}`} · Arquivo:{' '}
                      <span className="font-mono">{subm.fileName}</span>
                    </div>
                  </div>
                  {statusBadge(subm.status)}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">
                  {subm.abstract}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={feedbackMap[subm.id] ?? subm.reviewerFeedback ?? ''}
                    onChange={(e) =>
                      setFeedbackMap((m) => ({ ...m, [subm.id]: e.target.value }))
                    }
                    placeholder="Escreva um parecer curto para os autores..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-400"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onReviewPaper(
                          subm.id,
                          SubmissionStatus.Aprovado,
                          feedbackMap[subm.id] || 'Trabalho aprovado para apresentação no evento.'
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-xs cursor-pointer"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onReviewPaper(
                          subm.id,
                          SubmissionStatus.RevisaoSolicitada,
                          feedbackMap[subm.id] || 'Solicitamos ajustes de formatação ABNT.'
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs cursor-pointer"
                    >
                      Revisar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onReviewPaper(
                          subm.id,
                          SubmissionStatus.Rejeitado,
                          feedbackMap[subm.id] || 'Fora do escopo temático do evento.'
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold text-xs cursor-pointer"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
