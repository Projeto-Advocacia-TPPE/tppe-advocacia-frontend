import { apiRequest } from './api';
import type { SuccessResponse } from './api';
import type { LandingPageData } from '../pages/sistema/LandingPage/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export interface OfficeConfigAPI {
  id: number;
  office_name: string | null;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  whatsapp_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  about_title: string | null;
  about_description: string | null;
  about_image_url: string | null;
  lawyer_name: string | null;
  lawyer_oab: string | null;
  lawyer_description: string | null;
  lawyer_image_url: string | null;
  differentials: { title: string; description: string }[];
  areas_of_practice: { title: string; description: string }[];
}

function apiToUI(api: OfficeConfigAPI): LandingPageData {
  return {
    email: api.email ?? '',
    endereco: api.address ?? '',
    telefone: api.phone ?? '',
    linkedin: api.linkedin_url ?? '',
    instagram: api.instagram_url ?? '',
    heroTitulo: api.hero_title ?? '',
    heroSubtexto: api.hero_subtitle ?? '',
    heroImagem: api.hero_image_url ?? '',
    escritorioTitulo: api.about_title ?? '',
    escritorioConteudo: api.about_description ?? '',
    escritorioImagem: api.about_image_url ?? '',
    advogadoTitulo: api.lawyer_name ?? '',
    advogadoOab: api.lawyer_oab ?? '',
    advogadoConteudo: api.lawyer_description ?? '',
    advogadoImagem: api.lawyer_image_url ?? '',
    diferenciais: (api.differentials ?? []).map((d, i) => ({
      id: i + 1,
      titulo: d.title,
      descricao: d.description,
    })),
    areas: (api.areas_of_practice ?? []).map((a, i) => ({
      id: i + 1,
      titulo: a.title,
      descricao: a.description,
    })),
  };
}

function uiToApi(ui: LandingPageData): Omit<OfficeConfigAPI, 'id' | 'cnpj' | 'whatsapp_url' | 'office_name'> {
  return {
    email: ui.email || null,
    address: ui.endereco || null,
    phone: ui.telefone || null,
    linkedin_url: ui.linkedin || null,
    instagram_url: ui.instagram || null,
    hero_title: ui.heroTitulo || null,
    hero_subtitle: ui.heroSubtexto || null,
    hero_image_url: ui.heroImagem || null,
    about_title: ui.escritorioTitulo || null,
    about_description: ui.escritorioConteudo || null,
    about_image_url: ui.escritorioImagem || null,
    lawyer_name: ui.advogadoTitulo || null,
    lawyer_oab: ui.advogadoOab || null,
    lawyer_description: ui.advogadoConteudo || null,
    lawyer_image_url: ui.advogadoImagem || null,
    differentials: ui.diferenciais.map(d => ({ title: d.titulo, description: d.descricao })),
    areas_of_practice: ui.areas.map(a => ({ title: a.titulo, description: a.descricao })),
  };
}

export async function getOfficeConfig(): Promise<OfficeConfigAPI> {
  const res = await apiRequest<SuccessResponse<OfficeConfigAPI>>('/office-config', {
    authenticated: false,
  });
  return res.data;
}

export async function getOfficeConfigUI(): Promise<LandingPageData> {
  return apiToUI(await getOfficeConfig());
}

export async function updateOfficeConfig(ui: LandingPageData): Promise<LandingPageData> {
  const payload = uiToApi(ui);
  const res = await apiRequest<SuccessResponse<OfficeConfigAPI>>('/office-config', {
    method: 'PATCH',
    body: JSON.stringify(payload),
    authenticated: true,
  });
  return apiToUI(res.data);
}

export async function uploadMedia(file: File): Promise<string> {
  const { getAccessToken } = await import('./api');
  const token = getAccessToken();
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_URL}/media/upload`, {
    method: 'POST',
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) throw new Error('Upload falhou');
  const body = (await res.json()) as SuccessResponse<{ url: string }>;
  return body.data.url;
}
