import type { Processo } from './types';

export const mockProcessos: Processo[] = [
  { id: 1,  cnj: '0012345-67.2023.8.26.0100', tipoAcao: 'Indenizatória', cliente: 'João Diniz',       clienteIniciais: 'JD', varaComarca: '2ª Vara Cível / São Paulo',  advogado: 'Dr. Ricardo Silva',   status: 'ATIVO',         descricao: 'Ação de indenização por danos morais decorrentes de cobranças indevidas.',                                         dataDistribuicao: '10/01/2023' },
  { id: 2,  cnj: '0056789-12.2023.8.26.0100', tipoAcao: 'Trabalhista',   cliente: 'Ana Souza',        clienteIniciais: 'AS', varaComarca: '15ª Vara Trab. / Campinas', advogado: 'Dra. Mariana Costa', status: 'PRAZO CRÍTICO',  descricao: 'Reclamação trabalhista por horas extras não pagas e verbas rescisórias.',                                          dataDistribuicao: '22/03/2023' },
  { id: 3,  cnj: '0098765-43.2022.8.26.0100', tipoAcao: 'Revisional',   cliente: 'Marcos Cunha',     clienteIniciais: 'MC', varaComarca: '5ª Vara Cível / Osasco',    advogado: 'Dr. Ricardo Silva',   status: 'SUSPENSO',      descricao: 'Revisão de contrato bancário com juros abusivos e capitalização irregular.',                                       dataDistribuicao: '05/06/2022' },
  { id: 4,  cnj: '0102030-45.2021.8.26.0100', tipoAcao: 'Despejo',      cliente: 'Lúcia Ferreira',   clienteIniciais: 'LF', varaComarca: '1ª Vara Cível / Jundiaí',   advogado: 'Dra. Mariana Costa', status: 'ARQUIVADO',     descricao: 'Ação de despejo por falta de pagamento de aluguéis.',                                                              dataDistribuicao: '14/03/2021' },
  { id: 5,  cnj: '5001234-88.2023.8.26.0001', tipoAcao: 'Indenizatória', cliente: 'Marina Oliveira',  clienteIniciais: 'MO', varaComarca: '1ª Vara Cível / Curitiba',  advogado: 'Dr. Augustus Sterling', status: 'ATIVO',       descricao: 'Ação de indenização por danos morais e materiais decorrentes de atraso em voo internacional e extravio temporário de bagagem.', dataDistribuicao: '14/03/2024' },
];

export const TIPOS_ACAO   = ['Indenizatória', 'Trabalhista', 'Revisional', 'Despejo', 'Direito Civil', 'Societário', 'Tributário'];
export const ADVOGADOS    = ['Dr. Ricardo Silva', 'Dra. Mariana Costa', 'Dr. Augustus Sterling'];
export const STATUS_OPTS  = ['ATIVO', 'PRAZO CRÍTICO', 'SUSPENSO', 'ARQUIVADO', 'ENCERRADO'];
