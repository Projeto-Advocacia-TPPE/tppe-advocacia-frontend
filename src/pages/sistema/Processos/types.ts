export type StatusProcesso = 'ATIVO' | 'PRAZO CRÍTICO' | 'SUSPENSO' | 'ARQUIVADO' | 'ENCERRADO';

export interface Processo {
  id: number;
  cnj: string;
  tipoAcao: string;
  cliente: string;
  clienteIniciais: string;
  varaComarca: string;
  advogado: string;
  status: StatusProcesso;
  descricao: string;
  dataDistribuicao: string;
}
