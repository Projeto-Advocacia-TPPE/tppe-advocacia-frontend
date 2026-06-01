export type FiltroNotificacao = 'Todas' | 'Não lidas' | 'Prazos' | 'Movimentações' | 'Sistema';

export type TipoNotificacao = 'prazo' | 'movimentacao' | 'sistema' | 'lead';

export interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  evento: string;
  descricao: string;
  processo: string;
  dataHora: string;
  lida: boolean;
}
