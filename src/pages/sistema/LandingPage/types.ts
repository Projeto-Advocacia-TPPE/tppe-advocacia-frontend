export interface Diferencial {
  id: number;
  titulo: string;
  descricao: string;
}

export interface AreaAtuacao {
  id: number;
  titulo: string;
  descricao: string;
}

export interface LandingPageData {
  // Dados Institucionais
  email: string;
  endereco: string;
  telefone: string;

  // Links
  linkedin: string;
  instagram: string;

  // Hero
  heroTitulo: string;
  heroSubtexto: string;
  heroImagem: string;

  // Sobre Escritório
  escritorioTitulo: string;
  escritorioConteudo: string;
  escritorioImagem: string;

  // Sobre Advogado
  advogadoTitulo: string;
  advogadoOab: string;
  advogadoConteudo: string;
  advogadoImagem: string;

  // Diferenciais
  diferenciais: Diferencial[];

  // Áreas
  areas: AreaAtuacao[];
}
