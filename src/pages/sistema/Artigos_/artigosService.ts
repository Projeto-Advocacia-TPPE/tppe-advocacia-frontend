import {
  apiRequest,
  PaginatedResponse,
  SuccessResponse,
} from './api';

import type { Artigo, Status } from './types';

/* ── Tipos da API ── */

export type ArticleStatus = 'draft' | 'published';

export type ArticleListItem = {
  id: number;
  title: string;
  summary: string;
  status: ArticleStatus;
  created_at: string;
  url: string;
  author_name?: string;
  category?: string;
};

export type ArticleDetail = {
  id: number;
  title: string;
  content: string;
  category: string;
  summary: string;
  cover_image_url: string;
  status: ArticleStatus;
  author_id: number;
  author_name: string;
  created_at: string;
  updated_at: string;
};

export type ArticleCreate = {
  title: string;
  content: string;
  category: string;
  summary: string;
  cover_image_url: string;
  status: ArticleStatus;
};

export type ArticleUpdate = Partial<ArticleCreate>;

/* ── Helpers de conversão ── */

function toStatus(s: ArticleStatus): Status {
  return s === 'published' ? 'PUBLICADO' : 'RASCUNHO';
}

function fromStatus(s: Status): ArticleStatus {
  return s === 'PUBLICADO' ? 'published' : 'draft';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(min / 60);
  const d    = Math.floor(h / 24);
  const w    = Math.floor(d / 7);
  if (min < 1)  return 'Agora mesmo';
  if (min < 60) return `Última ed. há ${min} min`;
  if (h   < 24) return `Última ed. às ${new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  if (d   < 7)  return `Última ed. há ${d} dia${d > 1 ? 's' : ''}`;
  return `Última ed. há ${w} sem.`;
}

export function detailToArtigo(a: ArticleDetail): Artigo & { conteudo?: string } {
  return {
    id:           a.id,
    titulo:       a.title,
    autor:        a.author_name,
    categoria:    a.category,
    status:       toStatus(a.status),
    resumo:       a.summary,
    imagem:       a.cover_image_url || undefined,
    data:         formatDate(a.created_at),
    ultimaEdicao: formatRelative(a.updated_at),
    conteudo:     a.content,
  };
}

export function listItemToArtigo(a: ArticleListItem): Artigo {
  return {
    id:           a.id,
    titulo:       a.title,
    autor:        a.author_name ?? '',
    categoria:    a.category    ?? '',
    status:       toStatus(a.status),
    resumo:       a.summary,
    data:         formatDate(a.created_at),
    ultimaEdicao: formatRelative(a.created_at),
    imagem:       undefined,
  };
}

/* ── Funções de serviço ── */

/** Lista todos os artigos incluindo rascunhos (autenticado) */
export async function listarArtigos(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<ArticleListItem>> {
  const query = new URLSearchParams({
    page:  String(page),
    limit: String(limit),
  });
  return apiRequest(`/articles/admin?${query}`);
}

/** Busca artigo completo por ID — funciona para qualquer status */
export async function buscarArtigo(
  id: number,
): Promise<ArticleDetail> {
  const response = await apiRequest<SuccessResponse<ArticleDetail>>(
    `/articles/${id}/preview`,
  );
  return response.data;
}

/** Cria novo artigo */
export async function criarArtigo(
  payload: ArticleCreate,
): Promise<ArticleDetail> {
  const response = await apiRequest<SuccessResponse<ArticleDetail>>(
    '/articles',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

/** Atualiza artigo existente */
export async function atualizarArtigo(
  id: number,
  payload: ArticleUpdate,
): Promise<ArticleDetail> {
  const response = await apiRequest<SuccessResponse<ArticleDetail>>(
    `/articles/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

/** Exclui artigo */
export async function excluirArtigo(id: number): Promise<void> {
  await apiRequest(`/articles/${id}`, { method: 'DELETE' });
}

/* ── Helpers para montar payload a partir dos dados do formulário ── */

export function buildCreatePayload(dados: {
  titulo: string;
  conteudo: string;
  categoria: string;
  resumo: string;
  imagem?: string;
  status: Status;
}): ArticleCreate {
  return {
    title:           dados.titulo,
    content:         dados.conteudo,
    category:        dados.categoria,
    summary:         dados.resumo,
    cover_image_url: dados.imagem ?? '',
    status:          fromStatus(dados.status),
  };
}

export function buildUpdatePayload(dados: {
  titulo?: string;
  conteudo?: string;
  categoria?: string;
  resumo?: string;
  imagem?: string;
  status?: Status;
}): ArticleUpdate {
  const payload: ArticleUpdate = {};
  if (dados.titulo    !== undefined) payload.title           = dados.titulo;
  if (dados.conteudo  !== undefined) payload.content         = dados.conteudo;
  if (dados.categoria !== undefined) payload.category        = dados.categoria;
  if (dados.resumo    !== undefined) payload.summary         = dados.resumo;
  if (dados.imagem    !== undefined) payload.cover_image_url = dados.imagem;
  if (dados.status    !== undefined) payload.status          = fromStatus(dados.status);
  return payload;
}