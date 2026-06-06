export type TipoCompromisso =
  | 'Audiência'
  | 'Audiência de Instrução'
  | 'Reunião'
  | 'Prazo'
  | 'Depoimento'
  | 'Perícia'
  | 'Outro';

export interface Compromisso {
  id: number;
  tipo: TipoCompromisso;
  titulo: string;
  data: string;       // YYYY-MM-DD
  inicio: string;     // HH:MM
  duracao: string;    // ex: "60 min"
  cliente: string;
  processo: string;
  observacoes: string;
}
