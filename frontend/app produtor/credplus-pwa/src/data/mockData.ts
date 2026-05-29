export const mockUser = {
  id: 'user-001',
  nome: 'João da Silva',
  email: 'joao@jutaiteua.org',
  role: 'PRODUTOR' as const,
  associacaoId: 1,
  associacao: {
    nome: 'Associação dos Agricultores Familiares de Jutaiteua',
    cnpj: '12.345.678/0001-90',
    municipio: 'Moju',
    estado: 'PA',
  },
};

export type StatusSafra =
  | 'AGUARDANDO_SYNC'
  | 'AGUARDANDO_VALIDACAO_SATELITE'
  | 'AGUARDANDO_VALIDACAO_CAMPO'
  | 'ATIVA'
  | 'REPROVADA'
  | 'ENCERRADA';

export type TipoCultura = 'CACAU' | 'ACAI' | 'PIMENTA_REINO' | 'MANDIOCA' | 'OUTROS';
export type Unidade = 'KG' | 'TON' | 'SACAS';

export interface Plantacao {
  id: string;
  tipo: TipoCultura;
  quantidade: number;
  unidade: Unidade;
}

export interface SafraImagem {
  id: string;
  uri: string;
  ordem: number;
  // true depois que a imagem foi enviada ao backend. Evita reenviar a mesma foto.
  enviada?: boolean;
}

export interface Safra {
  id: string;
  nome: string;
  areaHectares: number;
  produtorId: string;
  status: StatusSafra;
  plantacoes: Plantacao[];
  imagens: SafraImagem[];
  createdAt: string;
  syncedAt: string | null;
  // id numérico da safra no backend, preenchido após a sincronização.
  // É o id usado para enviar as fotos (POST /produtor/safras/{servidorId}/imagens).
  servidorId?: number | null;
}

export const INITIAL_SAFRAS: Safra[] = [
  {
    id: 'safra-001',
    nome: 'Safra Cacau Tradicional',
    areaHectares: 15.2,
    produtorId: 'user-001',
    status: 'ATIVA',
    plantacoes: [{ id: 'p1', tipo: 'CACAU', quantidade: 720, unidade: 'KG' }],
    imagens: [
      {
        id: 'img1',
        uri: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&auto=format&fit=crop',
        ordem: 1,
      },
      {
        id: 'img2',
        uri: 'https://images.unsplash.com/photo-1590179068383-b9c69aacebd3?w=600&auto=format&fit=crop',
        ordem: 2,
      },
    ],
    createdAt: '2026-03-20T14:22:00Z',
    syncedAt: '2026-03-22T09:15:00Z',
  },
  {
    id: 'safra-002',
    nome: 'Safra Açaí Janeiro',
    areaHectares: 8.5,
    produtorId: 'user-001',
    status: 'AGUARDANDO_VALIDACAO_CAMPO',
    plantacoes: [{ id: 'p2', tipo: 'ACAI', quantidade: 500, unidade: 'KG' }],
    imagens: [
      {
        id: 'img3',
        uri: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&auto=format&fit=crop',
        ordem: 1,
      },
    ],
    createdAt: '2026-04-05T16:45:00Z',
    syncedAt: '2026-04-08T10:15:00Z',
  },
  {
    id: 'safra-003',
    nome: 'Safra Mista Fevereiro',
    areaHectares: 12.0,
    produtorId: 'user-001',
    status: 'AGUARDANDO_SYNC',
    plantacoes: [
      { id: 'p3', tipo: 'CACAU', quantidade: 400, unidade: 'KG' },
      { id: 'p4', tipo: 'PIMENTA_REINO', quantidade: 150, unidade: 'KG' },
    ],
    imagens: [
      {
        id: 'img4',
        uri: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&auto=format&fit=crop',
        ordem: 1,
      },
    ],
    createdAt: '2026-05-10T08:30:00Z',
    syncedAt: null,
  },
];

export const tiposCultura: { value: TipoCultura; label: string }[] = [
  { value: 'CACAU', label: 'Cacau 🍫' },
  { value: 'ACAI', label: 'Açaí 🫐' },
  { value: 'PIMENTA_REINO', label: 'Pimenta-do-Reino 🌶️' },
  { value: 'MANDIOCA', label: 'Mandioca 🥔' },
  { value: 'OUTROS', label: 'Outros' },
];

export const unidades: { value: Unidade; label: string }[] = [
  { value: 'KG', label: 'Quilogramas (KG)' },
  { value: 'TON', label: 'Toneladas (TON)' },
  { value: 'SACAS', label: 'Sacas (60kg)' },
];
