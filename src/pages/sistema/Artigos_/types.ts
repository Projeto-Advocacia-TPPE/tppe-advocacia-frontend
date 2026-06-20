export type Status = 'RASCUNHO' | 'PUBLICADO';

export interface Artigo {
  id: number;
  titulo: string;
  autor: string;
  categoria?: string;
  status: Status;
  resumo?: string;
  data: string; // ex: '12 Mai, 2024'
  ultimaEdicao?: string;
  imagem?: string;
  imagemPos?: { x: number; y: number };
}

export interface LogRegistro {
  id: number;
  dia: string;
  hora: string;
  descricao: string;
  artigoAfetado: string;
  tipo: 'CRIAÇÃO' | 'EDIÇÃO' | 'EXCLUSÃO';
  executor: string;
}
