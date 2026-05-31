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

// Sem dados de demonstração: agora o backend é real, então o app começa vazio
// e só mostra as safras que o próprio produtor cadastrar (com UUID gerado no
// celular). As safras mock antigas tinham ids como "safra-003" (não-UUID) e em
// status AGUARDANDO_SYNC, o que derrubava a sincronização real com erro 500.
export const INITIAL_SAFRAS: Safra[] = [];

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
