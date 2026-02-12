/**
 * Character Service - Operações de CRUD para personagens
 *
 * Este arquivo contém todas as operações de banco de dados relacionadas
 * a personagens (fichas), incluindo criação, leitura, atualização e deleção.
 *
 * Todas as funções incluem tratamento de erros robusto e logging apropriado.
 */

import { db } from './db';
import type { Character } from '@/types';

/**
 * Tipo de erro do serviço de personagens
 */
export class CharacterServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'CharacterServiceError';
  }
}

/**
 * Resultado de operações que podem falhar parcialmente
 */
export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

/**
 * Opções de busca de personagens
 */
export interface SearchOptions {
  /** Termo de busca (busca em nome, conceito, origem, linhagem) */
  searchTerm?: string;
  /** Filtrar por nível mínimo */
  minLevel?: number;
  /** Filtrar por nível máximo */
  maxLevel?: number;
  /** Ordenar por campo */
  sortBy?: 'name' | 'level' | 'createdAt' | 'updatedAt';
  /** Ordem de ordenação */
  sortOrder?: 'asc' | 'desc';
  /** Limite de resultados */
  limit?: number;
  /** Offset para paginação */
  offset?: number;
}

/**
 * Character Service
 *
 * Serviço singleton com todas as operações de CRUD para personagens.
 * Todas as operações são assíncronas e retornam Promises.
 */
export const characterService = {
  /**
   * Busca todos os personagens
   *
   * @returns Promise<Character[]> Array com todos os personagens
   * @throws {CharacterServiceError} Se falhar ao buscar personagens
   *
   * @example
   * const characters = await characterService.getAll();
   * console.log(`Total: ${characters.length}`);
   */
  async getAll(): Promise<Character[]> {
    try {
      const characters = await db.characters.toArray();
      console.log(`📚 ${characters.length} personagens encontrados`);
      return characters;
    } catch (error) {
      console.error('❌ Erro ao buscar personagens:', error);
      throw new CharacterServiceError(
        'Falha ao buscar lista de personagens',
        'GET_ALL_FAILED',
        error
      );
    }
  },

  /**
   * Busca um personagem por ID
   *
   * @param id UUID do personagem
   * @returns Promise<Character | undefined> Personagem encontrado ou undefined
   * @throws {CharacterServiceError} Se falhar ao buscar personagem
   *
   * @example
   * const character = await characterService.getById('123-456-789');
   * if (character) {
   *   console.log(`Encontrado: ${character.name}`);
   * }
   */
  async getById(id: string): Promise<Character | undefined> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('ID inválido fornecido');
      }

      const character = await db.characters.get(id);

      if (character) {
        console.log(`✅ Personagem encontrado: ${character.name}`);
      } else {
        console.warn(`⚠️ Personagem não encontrado: ${id}`);
      }

      return character;
    } catch (error) {
      console.error(`❌ Erro ao buscar personagem ${id}:`, error);
      throw new CharacterServiceError(
        `Falha ao buscar personagem com ID: ${id}`,
        'GET_BY_ID_FAILED',
        error
      );
    }
  },

  /**
   * Busca personagens com filtros e ordenação
   *
   * @param options Opções de busca e filtragem
   * @returns Promise<Character[]> Array de personagens filtrados
   * @throws {CharacterServiceError} Se falhar ao buscar personagens
   *
   * @example
   * const highLevelChars = await characterService.search({
   *   minLevel: 5,
   *   sortBy: 'level',
   *   sortOrder: 'desc'
   * });
   */
  async search(options: SearchOptions = {}): Promise<Character[]> {
    try {
      let collection = db.characters.toCollection();

      // Aplicar filtro de nível se fornecido
      if (options.minLevel !== undefined || options.maxLevel !== undefined) {
        collection = collection.filter((char) => {
          if (options.minLevel !== undefined && char.level < options.minLevel) {
            return false;
          }
          if (options.maxLevel !== undefined && char.level > options.maxLevel) {
            return false;
          }
          return true;
        });
      }

      // Buscar resultados
      let results = await collection.toArray();

      // Aplicar busca de texto se fornecido
      if (options.searchTerm) {
        const term = options.searchTerm.toLowerCase();
        results = results.filter(
          (char) =>
            char.name.toLowerCase().includes(term) ||
            char.concept?.toLowerCase().includes(term) ||
            char.origin?.name.toLowerCase().includes(term) ||
            char.lineage?.name.toLowerCase().includes(term)
        );
      }

      // Aplicar ordenação
      if (options.sortBy) {
        const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
        results.sort((a, b) => {
          const aValue = a[options.sortBy!];
          const bValue = b[options.sortBy!];

          if (aValue < bValue) return -1 * sortOrder;
          if (aValue > bValue) return 1 * sortOrder;
          return 0;
        });
      }

      // Aplicar paginação
      if (options.offset !== undefined || options.limit !== undefined) {
        const offset = options.offset || 0;
        const limit = options.limit || results.length;
        results = results.slice(offset, offset + limit);
      }

      console.log(`🔍 Busca retornou ${results.length} personagens`);
      return results;
    } catch (error) {
      console.error('❌ Erro ao buscar personagens com filtros:', error);
      throw new CharacterServiceError(
        'Falha ao buscar personagens com filtros',
        'SEARCH_FAILED',
        error
      );
    }
  },

  /**
   * Cria um novo personagem
   *
   * @param character Dados do personagem (sem ID, será gerado automaticamente)
   * @returns Promise<Character> Personagem criado com ID gerado
   * @throws {CharacterServiceError} Se falhar ao criar personagem
   *
   * @example
   * const newChar = await characterService.create({
   *   name: 'Aragorn',
   *   level: 1,
   *   // ... outros campos
   * });
   * console.log(`Criado com ID: ${newChar.id}`);
   */
  async create(
    character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Character> {
    try {
      // Gerar UUID para o novo personagem
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const newCharacter: Character = {
        ...character,
        id,
        createdAt: now,
        updatedAt: now,
      };

      // Validar dados básicos
      if (!newCharacter.name || newCharacter.name.trim() === '') {
        throw new Error('Nome do personagem é obrigatório');
      }

      if (newCharacter.level < 0) {
        throw new Error('Nível do personagem não pode ser negativo');
      }

      // Adicionar ao banco
      await db.characters.add(newCharacter);

      console.log(`✅ Personagem criado: ${newCharacter.name} (${id})`);
      return newCharacter;
    } catch (error) {
      console.error('❌ Erro ao criar personagem:', error);
      throw new CharacterServiceError(
        'Falha ao criar personagem',
        'CREATE_FAILED',
        error
      );
    }
  },

  /**
   * Atualiza um personagem existente
   *
   * @param id UUID do personagem
   * @param updates Campos a serem atualizados (partial)
   * @returns Promise<Character> Personagem atualizado
   * @throws {CharacterServiceError} Se personagem não existir ou falhar ao atualizar
   *
   * @example
   * const updated = await characterService.update('123-456', {
   *   level: 2,
   *   name: 'Aragorn, Rei de Gondor'
   * });
   */
  async update(
    id: string,
    updates: Partial<Omit<Character, 'id' | 'createdAt'>>
  ): Promise<Character> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('ID inválido fornecido');
      }

      // Verificar se personagem existe
      const existing = await db.characters.get(id);
      if (!existing) {
        throw new Error(`Personagem com ID ${id} não encontrado`);
      }

      // Log dos updates para debug
      console.log('📝 Atualizando personagem:', id);
      console.log('📝 Updates recebidos:', JSON.stringify(updates, null, 2));

      // Criar objeto atualizado
      const updatedCharacter: Character = {
        ...existing,
        ...updates,
        id, // Garantir que ID não mude
        createdAt: existing.createdAt, // Preservar data de criação
        updatedAt: new Date().toISOString(), // Atualizar timestamp
      };

      // Log do personagem final
      console.log(
        '📝 Personagem final:',
        JSON.stringify(updatedCharacter, null, 2)
      );

      // Validar dados básicos
      if (updatedCharacter.name.trim() === '') {
        throw new Error('Nome do personagem não pode ser vazio');
      }

      if (updatedCharacter.level < 0) {
        throw new Error('Nível do personagem não pode ser negativo');
      }

      // Atualizar no banco
      await db.characters.put(updatedCharacter);

      console.log(`✅ Personagem atualizado: ${updatedCharacter.name} (${id})`);
      return updatedCharacter;
    } catch (error) {
      console.error(`❌ Erro ao atualizar personagem ${id}:`, error);

      // Log mais detalhado do erro
      if (error instanceof Error) {
        console.error(`❌ Mensagem: ${error.message}`);
        console.error(`❌ Stack: ${error.stack}`);
      }

      throw new CharacterServiceError(
        `Falha ao atualizar personagem com ID: ${id}`,
        'UPDATE_FAILED',
        error
      );
    }
  },

  /**
   * Restaura um personagem no IndexedDB preservando todos os campos
   *
   * Este método é útil quando o personagem existe no Redux mas não no IndexedDB
   * (por exemplo, após uma race condition ou falha de sincronização).
   *
   * Diferente de create(), este método preserva o ID, createdAt e updatedAt originais.
   *
   * @param character Personagem completo a ser restaurado
   * @returns Promise<Character> Personagem restaurado
   * @throws {CharacterServiceError} Se falhar ao restaurar personagem
   *
   * @example
   * await characterService.restore(reduxCharacter);
   * console.log('Personagem restaurado no IndexedDB');
   */
  async restore(character: Character): Promise<Character> {
    try {
      // Validar dados básicos
      if (!character.id || typeof character.id !== 'string') {
        throw new Error('ID do personagem é obrigatório');
      }

      if (!character.name || character.name.trim() === '') {
        throw new Error('Nome do personagem é obrigatório');
      }

      if (character.level < 0) {
        throw new Error('Nível do personagem não pode ser negativo');
      }

      // Adicionar ao banco preservando todos os campos
      await db.characters.put(character);

      console.log(
        `✅ Personagem restaurado: ${character.name} (${character.id})`
      );
      return character;
    } catch (error) {
      console.error('❌ Erro ao restaurar personagem:', error);
      throw new CharacterServiceError(
        'Falha ao restaurar personagem',
        'RESTORE_FAILED',
        error
      );
    }
  },

  /**
   * Deleta um personagem
   *
   * @param id UUID do personagem
   * @returns Promise<void>
   * @throws {CharacterServiceError} Se falhar ao deletar personagem
   *
   * @example
   * await characterService.delete('123-456');
   * console.log('Personagem deletado');
   */
  async delete(id: string): Promise<void> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('ID inválido fornecido');
      }

      // Verificar se personagem existe antes de deletar
      const existing = await db.characters.get(id);
      if (!existing) {
        console.warn(`⚠️ Tentativa de deletar personagem inexistente: ${id}`);
        return; // Não lançar erro, operação é idempotente
      }

      await db.characters.delete(id);
      console.log(`🗑️ Personagem deletado: ${existing.name} (${id})`);
    } catch (error) {
      console.error(`❌ Erro ao deletar personagem ${id}:`, error);
      throw new CharacterServiceError(
        `Falha ao deletar personagem com ID: ${id}`,
        'DELETE_FAILED',
        error
      );
    }
  },

  /**
   * Deleta múltiplos personagens
   *
   * @param ids Array de UUIDs dos personagens
   * @returns Promise<BulkOperationResult> Resultado da operação em lote
   *
   * @example
   * const result = await characterService.bulkDelete(['123', '456']);
   * console.log(`Deletados: ${result.success}, Falhas: ${result.failed}`);
   */
  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const id of ids) {
      try {
        await this.delete(id);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          id,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    console.log(
      `📦 Deleção em lote: ${result.success} sucesso, ${result.failed} falhas`
    );
    return result;
  },

  /**
   * Conta o total de personagens
   *
   * @returns Promise<number> Número total de personagens
   * @throws {CharacterServiceError} Se falhar ao contar personagens
   *
   * @example
   * const total = await characterService.count();
   * console.log(`Total de personagens: ${total}`);
   */
  async count(): Promise<number> {
    try {
      const count = await db.characters.count();
      console.log(`🔢 Total de personagens: ${count}`);
      return count;
    } catch (error) {
      console.error('❌ Erro ao contar personagens:', error);
      throw new CharacterServiceError(
        'Falha ao contar personagens',
        'COUNT_FAILED',
        error
      );
    }
  },

  /**
   * Verifica se existe um personagem com determinado ID
   *
   * @param id UUID do personagem
   * @returns Promise<boolean> true se existe, false caso contrário
   *
   * @example
   * const exists = await characterService.exists('123-456');
   * if (exists) {
   *   console.log('Personagem existe!');
   * }
   */
  async exists(id: string): Promise<boolean> {
    try {
      if (!id || typeof id !== 'string') {
        return false;
      }

      const count = await db.characters.where('id').equals(id).count();
      return count > 0;
    } catch (error) {
      console.error(`❌ Erro ao verificar existência de ${id}:`, error);
      return false;
    }
  },

  /**
   * Duplica um personagem (cria cópia)
   *
   * @param id UUID do personagem a duplicar
   * @param newName Nome do novo personagem (opcional, padrão: "Cópia de X")
   * @returns Promise<Character> Novo personagem criado
   * @throws {CharacterServiceError} Se personagem original não existir
   *
   * @example
   * const copy = await characterService.duplicate('123-456', 'Aragorn II');
   */
  async duplicate(id: string, newName?: string): Promise<Character> {
    try {
      const original = await this.getById(id);
      if (!original) {
        throw new Error(`Personagem com ID ${id} não encontrado`);
      }

      // Criar cópia sem ID, createdAt e updatedAt
      const { id: _, createdAt, updatedAt, ...characterData } = original;

      const copy = await this.create({
        ...characterData,
        name: newName || `Cópia de ${original.name}`,
      });

      console.log(`📋 Personagem duplicado: ${copy.name}`);
      return copy;
    } catch (error) {
      console.error(`❌ Erro ao duplicar personagem ${id}:`, error);
      throw new CharacterServiceError(
        `Falha ao duplicar personagem com ID: ${id}`,
        'DUPLICATE_FAILED',
        error
      );
    }
  },

  /**
   * Exporta um personagem para JSON
   *
   * @param id UUID do personagem
   * @returns Promise<string> JSON string do personagem
   * @throws {CharacterServiceError} Se personagem não existir
   *
   * @example
   * const json = await characterService.exportToJSON('123-456');
   * // Salvar em arquivo, copiar para clipboard, etc.
   */
  async exportToJSON(id: string): Promise<string> {
    try {
      const character = await this.getById(id);
      if (!character) {
        throw new Error(`Personagem com ID ${id} não encontrado`);
      }

      const exportData = {
        character,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
          appName: 'Lite Sheets TDC',
        },
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error(`❌ Erro ao exportar personagem ${id}:`, error);
      throw new CharacterServiceError(
        `Falha ao exportar personagem com ID: ${id}`,
        'EXPORT_FAILED',
        error
      );
    }
  },

  /**
   * Importa um personagem de JSON
   *
   * @param jsonString JSON string do personagem
   * @param overwrite Se true, sobrescreve personagem existente com mesmo ID
   * @returns Promise<Character> Personagem importado
   * @throws {CharacterServiceError} Se JSON inválido ou importação falhar
   *
   * @example
   * const imported = await characterService.importFromJSON(jsonData);
   * console.log(`Importado: ${imported.name}`);
   */
  async importFromJSON(
    jsonString: string,
    overwrite: boolean = false
  ): Promise<Character> {
    try {
      const data = JSON.parse(jsonString);

      if (!data.character) {
        throw new Error('JSON inválido: falta campo "character"');
      }

      const character = data.character as Character;

      // Validar estrutura básica
      if (!character.name || typeof character.level !== 'number') {
        throw new Error('JSON inválido: dados do personagem incompletos');
      }

      // Verificar se já existe
      if (character.id) {
        const exists = await this.exists(character.id);
        if (exists && !overwrite) {
          throw new Error(
            `Personagem com ID ${character.id} já existe. Use overwrite=true para sobrescrever.`
          );
        }

        if (exists && overwrite) {
          // Atualizar personagem existente
          const { id, createdAt, updatedAt, ...updates } = character;
          return await this.update(id, updates);
        }
      }

      // Criar novo personagem (sem ID, será gerado novo)
      const { id: _, createdAt, updatedAt, ...characterData } = character;
      const imported = await this.create(characterData);

      console.log(`📥 Personagem importado: ${imported.name}`);
      return imported;
    } catch (error) {
      console.error('❌ Erro ao importar personagem:', error);
      throw new CharacterServiceError(
        'Falha ao importar personagem de JSON',
        'IMPORT_FAILED',
        error
      );
    }
  },

  /**
   * Garante que um personagem tenha o ataque desarmado padrão
   * Se não tiver, adiciona-o aos ataques
   *
   * @param character Personagem a verificar
   * @returns Personagem com ataque desarmado garantido
   */
  ensureUnarmedAttack(character: Character): Character {
    const UNARMED_ATTACK_NAME = 'Ataque Desarmado';

    // Verificar se já tem o ataque desarmado
    const hasUnarmed = character.combat?.attacks?.some(
      (a) => a.name === UNARMED_ATTACK_NAME || a.isDefaultAttack
    );

    if (hasUnarmed) {
      return character;
    }

    // Criar ataque desarmado
    const unarmedAttack = {
      name: UNARMED_ATTACK_NAME,
      type: 'corpo-a-corpo' as const,
      attackSkill: 'luta' as const,
      attackSkillUseId: 'atacar',
      attackAttribute: 'corpo' as const,
      attackBonus: 0,
      damageRoll: {
        quantity: 1,
        type: 'd2' as const,
        modifier: 0,
      },
      damageType: 'impacto' as const,
      criticalRange: 20,
      criticalDice: 1,
      range: 'Adjacente/Toque (1m)',
      description:
        'Um ataque corpo a corpo desarmado usando punhos, chutes ou outras partes do corpo.',
      ppCost: 0,
      actionCost: 2,
      actionType: 'maior' as const,
      numberOfAttacks: 1,
      addAttributeToDamage: true,
      doubleAttributeDamage: false,
      isDefaultAttack: true,
    };

    // Garantir que combat.attacks existe
    const attacks = character.combat?.attacks || [];

    return {
      ...character,
      combat: {
        ...character.combat,
        attacks: [unarmedAttack, ...attacks],
      },
    };
  },
};
