import React from 'react';
import { ShieldCheck, CalendarCheck, Award } from 'lucide-react';

export function HelpView() {
  const topics = [
    {
      icon: ShieldCheck,
      title: 'Autenticação Institucional',
      desc: 'Docentes acessam com e-mail @ifce.edu.br e estudantes com @aluno.ifce.edu.br. Membros da comunidade externa podem se cadastrar como Participante externo para eventos abertos.',
    },
    {
      icon: CalendarCheck,
      title: 'Código de Presença em Eventos',
      desc: 'Durante a realização do evento, o docente organizador gera um código único de 5 dígitos (ex: Q87OP) na aba "Seus eventos". Basta inserir esse código em "Suas inscrições" para confirmar frequência.',
    },
    {
      icon: Award,
      title: 'Certificados Automáticos',
      desc: 'Assim que a presença é confirmada pelo código do evento ou validada pelo organizador, o botão "Gerar certificado" é liberado automaticamente com código de autenticidade verificável.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Central de Ajuda</h1>
        <p className="text-sm text-slate-500 mt-1">
          Orientações rápidas para uso do Sistema de Eventos Acadêmicos (SEA) do IFCE Campus Cedro.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {topics.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.title}
              className="bg-white border border-[#B7ECC6] rounded-2xl p-5 space-y-2.5 shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EBF9EF] text-emerald-700 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-base text-slate-900">{t.title}</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
