export type Cargo = 'Advogado' | 'Administrador' | 'Estagiário' | 'Secretário';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargos: Cargo[];
  especializacao: string;
  data: string;
  ultimaEdicao: string;
  foto?: string;
}

export interface LogRegistro {
  id: number;
  dia: string;
  hora: string;
  descricao: string;
  usuarioAfetado: string;
  tipo: 'CRIAÇÃO' | 'EDIÇÃO' | 'EXCLUSÃO';
  executor: string;
}
