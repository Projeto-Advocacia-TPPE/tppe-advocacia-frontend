import type { Compromisso } from './types';

export const mockCompromissos: Compromisso[] = [
  { id: 1, tipo: 'Audiência',           titulo: 'Audiência - S...',                    data: '2026-10-01', inicio: '09:00', duracao: '60 min', cliente: 'João Diniz',              processo: '0012345-67.2023.8.26.0100', observacoes: 'Levar documentos originais.' },
  { id: 2, tipo: 'Reunião',             titulo: 'Reunião - Tra...',                    data: '2026-10-03', inicio: '14:30', duracao: '90 min', cliente: 'Ana Souza',               processo: '0056789-12.2023.8.26.0100', observacoes: 'Alinhamento com perito.' },
  { id: 3, tipo: 'Prazo',               titulo: 'PRAZO - Recu...',                     data: '2026-10-03', inicio: '18:00', duracao: '—',       cliente: '',                        processo: '0098765-43.2022.8.26.0100', observacoes: 'Prazo final para recurso.' },
  { id: 4, tipo: 'Depoimento',          titulo: 'Depoimento Testemunhal - Caso Alvarenga', data: '2026-10-06', inicio: '10:00', duracao: '60 min', cliente: 'Alvarenga Transportes LTDA', processo: '0012345-67.2023.8.26.0100', observacoes: 'Levar cópia física dos autos suplementares e o rol de testemunhas atualizado.\nConfirmar se o perito assistente estará presente remotamente.' },
  { id: 5, tipo: 'Reunião',             titulo: 'Reunião Sócios',                      data: '2026-10-06', inicio: '16:00', duracao: '60 min', cliente: 'Marcos Cunha',            processo: '',                          observacoes: '' },
  { id: 6, tipo: 'Prazo',               titulo: 'Prazo: Manifestação',                 data: '2026-10-09', inicio: '00:00', duracao: '—',       cliente: 'Lúcia Ferreira',          processo: '0102030-45.2021.8.26.0100', observacoes: 'Manifestação sobre laudo pericial.' },
];

export const TIPOS_COMPROMISSO = [
  'Audiência', 'Audiência de Instrução', 'Reunião', 'Prazo', 'Depoimento', 'Perícia', 'Outro',
] as const;

export const TIPOS_PRAZO = [
  'Apelação Cível (15 dias úteis)',
  'Contestação (15 dias úteis)',
  'Recurso Especial (15 dias úteis)',
  'Embargo de Declaração (5 dias úteis)',
  'Agravo Interno (15 dias úteis)',
  'Mandado de Segurança (120 dias)',
];

export const DIAS_UTEIS: Record<string, number> = {
  'Apelação Cível (15 dias úteis)':        15,
  'Contestação (15 dias úteis)':           15,
  'Recurso Especial (15 dias úteis)':      15,
  'Embargo de Declaração (5 dias úteis)':   5,
  'Agravo Interno (15 dias úteis)':        15,
  'Mandado de Segurança (120 dias)':      120,
};
