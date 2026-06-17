import type { Artigo, LogRegistro } from './types';

export const mockArtigos: Artigo[] = [
  { id: 1, titulo: 'Reforma Tributária e os Impactos no Agronegócio Brasileiro', autor: 'Dr. Alberto Ferreira', categoria: 'Jurisprudência', status: 'PUBLICADO', resumo: 'Análise das principais mudanças trazidas pela reforma...', data: '12 Mai, 2024', ultimaEdicao: 'Última ed. às 14:30' },
  { id: 2, titulo: 'Limites da Responsabilidade Civil em Ambientes Digitais', autor: 'Dra. Luciana Mello', categoria: 'Direito Digital', status: 'RASCUNHO', resumo: 'Discussão sobre responsabilidade civil...', data: '08 Mai, 2024', ultimaEdicao: 'Criado há 4 dias' },
  { id: 3, titulo: 'Jurisprudência: A Evolução do Direito de Família em 2024', autor: 'Dr. Roberto Siqueira', categoria: 'Direito de Família', status: 'PUBLICADO', resumo: 'Panorama sobre decisões recentes...', data: '25 Abr, 2024', ultimaEdicao: 'Última ed. há 2 sem.' },
];

export const mockLogs: LogRegistro[] = [
  { id: 1, dia: 'Hoje',    hora: '14:20', descricao: 'Artigo publicado',        artigoAfetado: 'Reforma Tributária e os Impactos no Agronegócio Brasileiro', tipo: 'CRIAÇÃO',  executor: 'Vitor França' },
  { id: 2, dia: 'Hoje',    hora: '14:20', descricao: 'Artigo salvo como rascunho', artigoAfetado: 'Limites da Responsabilidade Civil em Ambientes Digitais', tipo: 'EDIÇÃO',  executor: 'Beatriz Cavalcante' },
  { id: 3, dia: '12 Maio', hora: '09:50', descricao: 'Artigo excluído', artigoAfetado: 'Artigo antigo', tipo: 'EXCLUSÃO', executor: 'Vitor França' },
];

export const STATUS_COLORS: Record<string, string> = {
  'PUBLICADO': '#9aa6d8',
  'RASCUNHO':  '#f4c6c6',
};
