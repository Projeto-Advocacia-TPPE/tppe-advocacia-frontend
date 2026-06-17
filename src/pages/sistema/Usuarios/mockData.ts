import type { Usuario, LogRegistro } from './types';

export const mockUsuarios: Usuario[] = [
  { id: 1, nome: 'Vitor França',        email: 'vitor.f@gmail.com',    cargos: ['Administrador', 'Advogado'], especializacao: 'Direito Tributário',  data: '12 Mai, 2024', ultimaEdicao: 'Última ed. às 14:30' },
  { id: 2, nome: 'Beatriz Cavalcante',  email: 'beatriz.c@gmail.com',  cargos: ['Advogado'],                  especializacao: 'Direito Tributário',  data: '12 Mai, 2024', ultimaEdicao: 'Última ed. às 14:30' },
  { id: 3, nome: 'Eduardo Costa',       email: 'eduardo.c@gmail.com',  cargos: ['Advogado'],                  especializacao: 'Direito Civil',       data: '12 Mai, 2024', ultimaEdicao: 'Última ed. às 14:30' },
];

export const mockLogs: LogRegistro[] = [
  { id: 1, dia: 'Hoje',    hora: '14:20', descricao: 'Novo Usuário adicionado',        usuarioAfetado: 'Beatriz Cavalcante', tipo: 'CRIAÇÃO',  executor: 'Vitor França' },
  { id: 2, dia: 'Hoje',    hora: '14:20', descricao: 'Novo Usuário adicionado',        usuarioAfetado: 'Eduardo Costa',      tipo: 'CRIAÇÃO',  executor: 'Vitor França' },
  { id: 3, dia: '12 Maio', hora: '09:50', descricao: 'Acesso revogado permanentemente', usuarioAfetado: 'Ricardo Graça',     tipo: 'EXCLUSÃO', executor: 'Vitor França' },
];

export const CARGOS_OPCOES = ['Advogado', 'Administrador', 'Estagiário', 'Secretário'] as const;
