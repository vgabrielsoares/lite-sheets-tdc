/**
 * IndexedDB Database Configuration with Dexie
 *
 * Este arquivo configura o banco de dados IndexedDB usando Dexie.js
 * para persistência local das fichas de personagem.
 *
 * O banco armazena:
 * - Characters (fichas de personagem)
 *
 * Versão do banco: 1
 */

import Dexie, { Table } from 'dexie';
import type { Character } from '@/types';
import {
  needsMigration,
  migrateCharacterV1toV2,
} from '@/utils/characterMigration';

/**
 * Classe principal do banco de dados IndexedDB
 *
 * Extends Dexie para criar um banco de dados tipado com TypeScript.
 * Armazena todas as fichas de personagem localmente no navegador.
 */
export class CharacterDatabase extends Dexie {
  /**
   * Tabela de personagens
   *
   * Primary Key: id (UUID)
   * Indexes: name, level, createdAt, updatedAt
   */
  characters!: Table<Character, string>;

  constructor() {
    super('LiteSheetsTDC');

    // Versão 1 do banco de dados (schema original)
    this.version(1).stores({
      characters: 'id, name, level, createdAt, updatedAt',
    });

    // Versão 2: migração de atributos v0.0.1 → v0.0.2
    // Schema de índices não muda, mas os dados dos personagens são migrados
    this.version(2)
      .stores({
        characters: 'id, name, level, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        const table = tx.table<Character, string>('characters');
        const allCharacters = await table.toArray();

        for (const char of allCharacters) {
          if (needsMigration(char)) {
            const migrated = migrateCharacterV1toV2(char);
            await table.put(migrated);
          }
        }
      });
  }
}

/**
 * Instância singleton do banco de dados
 *
 * Use esta instância em toda a aplicação para acessar o IndexedDB
 *
 * @example
 * import { db } from '@/services/db';
 *
 * // Adicionar personagem
 * await db.characters.add(newCharacter);
 *
 * // Buscar todos
 * const all = await db.characters.toArray();
 *
 * // Buscar por ID
 * const char = await db.characters.get(id);
 */
export const db = new CharacterDatabase();

/**
 * Inicializa o banco de dados
 *
 * Esta função deve ser chamada no início da aplicação para garantir
 * que o banco está pronto para uso. Trata erros de inicialização.
 *
 * @returns Promise<void>
 * @throws {Error} Se falhar ao abrir o banco de dados
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Abre a conexão com o banco
    await db.open();
    console.log('✅ IndexedDB inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar IndexedDB:', error);
    throw new Error(
      `Falha ao inicializar banco de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

/**
 * Fecha a conexão com o banco de dados
 *
 * Útil para testes ou situações específicas onde é necessário
 * fechar a conexão manualmente.
 *
 * @returns void
 */
export function closeDatabase(): void {
  db.close();
  console.log('🔌 Conexão com IndexedDB fechada');
}

/**
 * Deleta completamente o banco de dados
 *
 * ⚠️ ATENÇÃO: Esta operação é irreversível e apaga todos os dados!
 * Use apenas para testes ou reset completo da aplicação.
 *
 * @returns Promise<void>
 */
export async function deleteDatabase(): Promise<void> {
  try {
    await db.delete();
    console.log('🗑️ Banco de dados deletado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao deletar banco de dados:', error);
    throw new Error(
      `Falha ao deletar banco de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

/**
 * Verifica se o IndexedDB está disponível no navegador
 *
 * @returns boolean - true se IndexedDB está disponível
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Exporta o banco de dados completo para JSON
 *
 * Útil para backup e debug. Retorna todos os dados do banco.
 *
 * @returns Promise<object> Objeto com todas as tabelas e seus dados
 */
export async function exportDatabase(): Promise<{
  characters: Character[];
  metadata: {
    exportedAt: string;
    version: number;
    totalCharacters: number;
  };
}> {
  try {
    const characters = await db.characters.toArray();

    return {
      characters,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: 1,
        totalCharacters: characters.length,
      },
    };
  } catch (error) {
    console.error('❌ Erro ao exportar banco de dados:', error);
    throw new Error(
      `Falha ao exportar banco de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

/**
 * Importa dados para o banco de dados
 *
 * ⚠️ ATENÇÃO: Esta operação sobrescreve dados existentes com o mesmo ID!
 *
 * @param data Dados exportados anteriormente
 * @returns Promise<number> Número de registros importados
 */
export async function importDatabase(data: {
  characters: Character[];
}): Promise<number> {
  try {
    // Usa bulkPut para inserir/atualizar em lote (mais eficiente)
    await db.characters.bulkPut(data.characters);

    console.log(`✅ ${data.characters.length} personagens importados`);
    return data.characters.length;
  } catch (error) {
    console.error('❌ Erro ao importar banco de dados:', error);
    throw new Error(
      `Falha ao importar banco de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

/**
 * Limpa todos os dados de uma tabela
 *
 * @param tableName Nome da tabela a ser limpa
 * @returns Promise<void>
 */
export async function clearTable(tableName: 'characters'): Promise<void> {
  try {
    await db[tableName].clear();
    console.log(`🧹 Tabela "${tableName}" limpa com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao limpar tabela "${tableName}":`, error);
    throw new Error(
      `Falha ao limpar tabela: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

/**
 * Retorna estatísticas do banco de dados
 *
 * @returns Promise<object> Estatísticas de uso do banco
 */
export async function getDatabaseStats(): Promise<{
  totalCharacters: number;
  databaseSize: string;
}> {
  try {
    const totalCharacters = await db.characters.count();

    // Estimativa do tamanho (IndexedDB não fornece tamanho exato facilmente)
    const estimate = await navigator.storage?.estimate();
    const databaseSize = estimate?.usage
      ? `${(estimate.usage / 1024 / 1024).toFixed(2)} MB`
      : 'Desconhecido';

    return {
      totalCharacters,
      databaseSize,
    };
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do banco:', error);
    return {
      totalCharacters: 0,
      databaseSize: 'Erro ao calcular',
    };
  }
}
