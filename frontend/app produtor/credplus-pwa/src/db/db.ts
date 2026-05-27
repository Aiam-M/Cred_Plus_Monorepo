import Dexie, { type Table } from 'dexie';
import { INITIAL_SAFRAS } from '@/data/mockData';
import type { Safra } from '@/data/mockData';

/**
 * Banco de dados local do celular do produtor (IndexedDB via Dexie).
 *
 * Antes usávamos localStorage, que tem limite de ~5MB e trava a tela.
 * O IndexedDB guarda centenas de MB, é assíncrono (não trava) e permite
 * buscar por índices. É o banco que faz o app funcionar 100% offline.
 */
class CredPlusDB extends Dexie {
  // Tabela de safras. A chave primária é o `id` (UUID gerado no celular),
  // que também serve de chave de idempotência na sincronização com o servidor.
  safras!: Table<Safra, string>;

  constructor() {
    super('CredPlusDB');
    this.version(1).stores({
      // &id  = chave primária única (o UUID do celular)
      // os demais campos viram índices para buscas rápidas
      safras: '&id, produtorId, status, createdAt',
    });
  }
}

export const db = new CredPlusDB();

/**
 * Repositório de safras. Concentra todo o acesso ao IndexedDB num só lugar,
 * para as páginas não precisarem conhecer os detalhes do Dexie.
 */
export const safraRepo = {
  /**
   * Lista as safras de um produtor, da mais recente para a mais antiga.
   * @param produtorId id do produtor logado
   */
  async getByProdutor(produtorId: string): Promise<Safra[]> {
    const safras = await db.safras.where('produtorId').equals(produtorId).toArray();
    // Datas em ISO ordenam corretamente como texto; invertendo, fica do mais novo ao mais antigo.
    return safras.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /**
   * Busca uma safra pelo id.
   * @param id UUID da safra
   */
  async getById(id: string): Promise<Safra | undefined> {
    return db.safras.get(id);
  },

  /**
   * Salva uma nova safra no banco local.
   * @param safra safra completa a ser persistida
   */
  async add(safra: Safra): Promise<void> {
    await db.safras.add(safra);
  },

  /**
   * Atualiza campos de uma safra existente.
   * @param id UUID da safra
   * @param updates campos a serem alterados
   */
  async update(id: string, updates: Partial<Safra>): Promise<void> {
    await db.safras.update(id, updates);
  },

  /**
   * Retorna as safras que ainda não foram enviadas ao servidor.
   * São as candidatas à sincronização quando a internet voltar.
   */
  async getPendentesSync(): Promise<Safra[]> {
    return db.safras.where('status').equals('AGUARDANDO_SYNC').toArray();
  },
};

/**
 * Popula o banco local com as safras de demonstração na primeira vez que o
 * app abre. É idempotente: se já houver safras salvas, não faz nada.
 */
export async function seedIfEmpty(): Promise<void> {
  const total = await db.safras.count();
  if (total === 0) {
    await db.safras.bulkAdd(INITIAL_SAFRAS);
  }
}
