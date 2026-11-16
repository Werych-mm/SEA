import React, { useRef } from 'react';
import { Download, Printer, X, ShieldCheck, Award } from 'lucide-react';
import { CertificateData } from '../types';
import { IfceCampusLogo, SeaLogo } from './BrandLogo';

interface CertificateModalProps {
  certificate: CertificateData;
  onClose: () => void;
}

export function CertificateModal({ certificate, onClose }: CertificateModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function handleDownloadPng() {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1130;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // White background & decorative institutional border
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#F2FDF5';
    ctx.fillRect(42, 42, canvas.width - 84, canvas.height - 84);

    ctx.strokeStyle = '#16A34A';
    ctx.lineWidth = 6;
    ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);

    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.strokeRect(58, 58, canvas.width - 116, canvas.height - 116);

    // Top Header
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DO CEARÁ',
      800,
      155
    );
    ctx.fillStyle = '#475569';
    ctx.font = '22px sans-serif';
    ctx.fillText('CAMPUS CEDRO · SISTEMA DE EVENTOS ACADÊMICOS (SEA IFCE)', 800, 195);

    // Title
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 58px sans-serif';
    ctx.fillText('CERTIFICADO', 800, 300);

    // Body text
    ctx.fillStyle = '#1E293B';
    ctx.font = '28px sans-serif';
    const actionText =
      certificate.kind === 'apresentacao'
        ? `Certificamos que ${certificate.participantName} (${certificate.participantDocument})`
        : `Certificamos que ${certificate.participantName} (${certificate.participantDocument})`;
    ctx.fillText(actionText, 800, 415);

    const detailLine1 =
      certificate.kind === 'apresentacao'
        ? `apresentou o artigo "${certificate.paperTitle || 'Trabalho Científico'}" no evento`
        : `participou na qualidade de ${certificate.participantRole} do(a) ${certificate.eventType.toLowerCase()}`;
    ctx.fillText(detailLine1, 800, 468);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(`"${certificate.eventTitle}"`, 800, 535);

    ctx.fillStyle = '#334155';
    ctx.font = '26px sans-serif';
    ctx.fillText(
      `realizado no ${certificate.eventLocation}, em ${certificate.eventDate}, com carga horária de ${certificate.workloadHours} horas.`,
      800,
      605
    );

    // Signature line
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(540, 815);
    ctx.lineTo(1060, 815);
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(certificate.organizerName, 800, 855);
    ctx.fillStyle = '#64748B';
    ctx.font = '20px sans-serif';
    ctx.fillText(certificate.organizerRole, 800, 888);

    // Validation Hash Footer
    ctx.fillStyle = '#0284C7';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(
      `Código de Autenticidade: ${certificate.certificateCode} · Emitido em ${certificate.issuedAt}`,
      800,
      1005
    );

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificado_${certificate.certificateCode}.png`;
    a.click();
    canvasRef.current = canvas;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="font-display font-bold text-slate-900">
              Certificado Digital Institucional
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#67E38C] hover:bg-[#4ED878] text-emerald-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Baixar PNG
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-200/70 cursor-pointer"
              aria-label="Fechar certificado"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Canvas */}
        <div className="p-6 sm:p-8 bg-slate-100/80">
          <div
            id="printable-certificate"
            className="bg-[#F9FEFA] border-4 border-[#22C55E] rounded-2xl p-2 shadow-md"
          >
            <div className="border border-sky-400 rounded-xl p-6 sm:p-10 text-center bg-white relative">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-emerald-100">
                <IfceCampusLogo />
                <SeaLogo size="sm" />
              </div>

              <div className="mt-6">
                <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
                  República Federativa do Brasil · Ministério da Educação
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight mt-2">
                  CERTIFICADO
                </h2>
              </div>

              <p className="mt-6 text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl mx-auto">
                Certificamos que{' '}
                <strong className="text-slate-900">{certificate.participantName}</strong>{' '}
                <span className="text-slate-500">({certificate.participantDocument})</span>{' '}
                {certificate.kind === 'apresentacao' ? (
                  <>
                    apresentou o artigo científico{' '}
                    <strong className="text-slate-900">
                      &ldquo;{certificate.paperTitle}&rdquo;
                    </strong>{' '}
                    durante o(a) {certificate.eventType.toLowerCase()}
                  </>
                ) : (
                  <>
                    participou na qualidade de{' '}
                    <strong className="text-slate-900">{certificate.participantRole}</strong> do(a){' '}
                    {certificate.eventType.toLowerCase()}
                  </>
                )}{' '}
                <strong className="text-emerald-900">&ldquo;{certificate.eventTitle}&rdquo;</strong>,
                realizado no(a) {certificate.eventLocation}, em {certificate.eventDate},
                integralizando carga horária total de{' '}
                <strong className="tabular-nums">{certificate.workloadHours} horas</strong>.
              </p>

              <div className="mt-10 flex flex-col items-center">
                <div className="w-64 border-t border-slate-400 pt-2">
                  <div className="text-sm font-bold text-slate-900">
                    {certificate.organizerName}
                  </div>
                  <div className="text-xs text-slate-500">{certificate.organizerRole}</div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  Autenticidade verificável no SEA IFCE
                </div>
                <div className="font-mono text-[11px] bg-sky-50 border border-sky-200 text-sky-900 px-2.5 py-1 rounded-lg tabular-nums">
                  {certificate.certificateCode} · {certificate.issuedAt}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
