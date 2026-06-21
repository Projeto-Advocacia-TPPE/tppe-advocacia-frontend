import type { LandingPageData } from './types';

export const mockLandingPage: LandingPageData = {
  email:    'contato@vitorfranca.adv.br',
  endereco: 'Av. Paulista, 1.500 - 10º andar\nBela Vista, São Paulo - SP\nCEP 01310-100',
  telefone: '(11) 3456-7890',

  linkedin:  'www.linkedin.com/in/nome',
  instagram: 'www.instagram.com/nome',
  whatsapp:  'https://wa.me/5511000000000',
  website:   'https://vitorfranca.adv.br',

  heroTitulo:   'Soluções jurídicas para empresas que querem crescer com segurança',
  heroSubtexto: 'Assessoria jurídica especializada com foco em resultados práticos e estratégias personalizadas para o seu negócio.',
  heroImagem:   '',

  escritorioTitulo:   'Vitor França',
  escritorioConteudo: 'O escritório Vitor França — Advocacia e Consultoria Jurídica nasceu com o propósito de oferecer soluções jurídicas personalizadas e estratégicas para empresas que buscam crescimento sustentável.',
  escritorioImagem:   '',

  advogadoTitulo:   'Excelência jurídica com foco em resultados',
  advogadoOab:      'OAB/SP 123.456',
  advogadoConteudo: 'Advogado especializado em Direito Empresarial, com mais de 15 anos de experiência em assessoria jurídica estratégica para empresas de médio e grande porte.',
  advogadoImagem:   '',

  diferenciais: [
    { id: 1, titulo: 'Atendimento Personalizado', descricao: 'Cada cliente recebe atenção dedicada e soluções adaptadas à sua realidade empresarial, sem modelos prontos ou genéricos.' },
    { id: 2, titulo: 'Visão Estratégica',          descricao: 'Aliamos conhecimento jurídico à compreensão dos desafios empresariais, oferecendo consultoria que impulsiona resultados.' },
    { id: 3, titulo: 'Resposta Ágil',              descricao: 'Processos enxutos e comunicação direta garantem agilidade nas respostas e eficiência na execução das demandas.' },
  ],

  areas: [
    { id: 1, titulo: 'Contratos Empresariais',  descricao: 'Elaboração, revisão e negociação de contratos comerciais e empresariais complexos.' },
    { id: 2, titulo: 'Direito Societário',       descricao: 'Constituição, reorganização e governança corporativa de sociedades empresárias.' },
    { id: 3, titulo: 'Trabalhista Empresarial',  descricao: 'Consultoria preventiva e contenciosa em relações de trabalho e gestão de pessoas.' },
    { id: 4, titulo: 'Compliance',               descricao: 'Implementação de programas de integridade e adequação às normas regulatórias.' },
    { id: 5, titulo: 'Consultoria Jurídica',     descricao: 'Acompanhamento jurídico estratégico para decisões empresariais críticas.' },
    { id: 6, titulo: 'Fusões e Aquisições',      descricao: 'Assessoria em processos de M&A, due diligence e reestruturações societárias.' },
  ],
};
