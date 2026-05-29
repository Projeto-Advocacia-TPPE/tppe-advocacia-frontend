import type { Artigo, AreaAtuacao, Diferencial } from '../types';

export const artigos: Artigo[] = [
  { id: 1,  date: '15 de Março, 2026',     title: 'Nova Lei das S/A: impactos na governança corporativa',               excerpt: 'Análise das principais mudanças trazidas pela reforma da Lei das Sociedades Anônimas e seus reflexos na gestão empresarial.' },
  { id: 2,  date: '08 de Março, 2026',     title: 'Compliance trabalhista: prevenção e gestão de riscos',               excerpt: 'Como estruturar um programa eficaz de compliance trabalhista para mitigar passivos e garantir conformidade legal.' },
  { id: 3,  date: '01 de Março, 2026',     title: 'Due diligence em M&A: aspectos essenciais para uma transação segura', excerpt: 'Os principais pontos de atenção no processo de auditoria jurídica em operações de fusão e aquisição.' },
  { id: 4,  date: '22 de Fevereiro, 2026', title: 'Contratos empresariais: cláusulas indispensáveis em 2026',           excerpt: 'Um panorama das cláusulas que todo empresário deve exigir em seus contratos comerciais para minimizar riscos.' },
  { id: 5,  date: '15 de Fevereiro, 2026', title: 'Governança corporativa para médias empresas',                        excerpt: 'Como estruturas de governança bem definidas podem impulsionar o crescimento e facilitar captação de investimentos.' },
  { id: 6,  date: '08 de Fevereiro, 2026', title: 'Resolução de conflitos societários: caminhos alternativos',          excerpt: 'Mediação e arbitragem como ferramentas eficientes para resolver disputas entre sócios sem recorrer ao judiciário.' },
  { id: 7,  date: '01 de Fevereiro, 2026', title: 'LGPD e impactos no contrato de trabalho',                            excerpt: 'Adequações necessárias nos contratos e políticas internas das empresas diante da Lei Geral de Proteção de Dados.' },
  { id: 8,  date: '25 de Janeiro, 2026',   title: 'Sucessão empresarial: planejamento jurídico preventivo',             excerpt: 'A importância do planejamento sucessório para garantir a continuidade dos negócios e evitar conflitos familiares.' },
  { id: 9,  date: '18 de Janeiro, 2026',   title: 'Responsabilidade dos administradores societários',                   excerpt: 'Limites e extensão da responsabilidade civil e penal de diretores e administradores de sociedades empresárias.' },
  { id: 10, date: '11 de Janeiro, 2026',   title: 'Startup e proteção de propriedade intelectual',                      excerpt: 'Estratégias jurídicas para proteger ativos intangíveis, marcas e tecnologias no ecossistema de inovação.' },
  { id: 11, date: '04 de Janeiro, 2026',   title: 'Contratos internacionais: cláusulas de resolução de conflitos',      excerpt: 'Como redigir contratos internacionais eficazes e escolher o foro adequado para disputas transfronteiriças.' },
  { id: 12, date: '28 de Dezembro, 2025',  title: 'Revisão contratual: quando e como questionar cláusulas abusivas',    excerpt: 'Situações que autorizam a revisão judicial de contratos e como agir estrategicamente para proteger seu negócio.' },
];

export const areas: AreaAtuacao[] = [
  { id: 1, title: 'Contratos Empresariais', description: 'Elaboração, revisão e negociação de contratos comerciais e empresariais complexos.' },
  { id: 2, title: 'Direito Societário',      description: 'Constituição, reorganização e governança corporativa de sociedades empresárias.' },
  { id: 3, title: 'Compliance',              description: 'Implementação de programas de integridade e adequação às normas regulatórias.' },
  { id: 4, title: 'Trabalhista Empresarial', description: 'Consultoria preventiva e contenciosa em relações de trabalho e gestão de pessoas.' },
  { id: 5, title: 'Fusões e Aquisições',     description: 'Assessoria em processos de M&A, due diligence e reestruturações societárias.' },
  { id: 6, title: 'Consultoria Jurídica',    description: 'Acompanhamento jurídico estratégico para decisões empresariais críticas.' },
];

export const diferenciais: Diferencial[] = [
  { id: 1, title: 'Atendimento Personalizado', description: 'Cada cliente recebe atenção dedicada e soluções adaptadas à sua realidade empresarial, sem modelos prontos ou genéricos.' },
  { id: 2, title: 'Visão Estratégica',          description: 'Aliamos conhecimento jurídico à compreensão dos desafios empresariais, oferecendo consultoria que impulsiona resultados.' },
  { id: 3, title: 'Resposta Ágil',              description: 'Processos enxutos e comunicação direta garantem agilidade nas respostas e eficiência na execução das demandas.' },
];
