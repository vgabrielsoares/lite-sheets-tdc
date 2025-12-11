/**
 * Export Service - Exportação de fichas de personagem
 *
 * Este serviço gerencia a exportação de fichas de personagem para formato JSON,
 * incluindo metadados de versão e timestamp para garantir compatibilidade.
 */

import type { Character } from '@/types';

/**
 * Versão atual do formato de exportação
 * Usado para validação e migração de dados
 */
export const EXPORT_VERSION = '1.0.0';

/**
 * Estrutura de dados exportados
 */
export interface ExportedCharacter {
  /** Versão do formato de exportação */
  version: string;
  /** Timestamp de quando foi exportado */
  exportedAt: string;
  /** Dados completos do personagem */
  character: Character;
}

/**
 * Erros de exportação
 */
export class ExportServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ExportServiceError';
  }
}

/**
 * Valida se o personagem tem dados válidos para exportação
 *
 * @param character Personagem a ser validado
 * @throws {ExportServiceError} Se dados inválidos
 */
function validateCharacterForExport(character: Character): void {
  if (!character) {
    throw new ExportServiceError(
      'Personagem inválido: dados nulos ou indefinidos',
      'INVALID_CHARACTER'
    );
  }

  if (!character.id || typeof character.id !== 'string') {
    throw new ExportServiceError(
      'Personagem inválido: ID ausente ou inválido',
      'INVALID_CHARACTER_ID'
    );
  }

  if (!character.name || typeof character.name !== 'string') {
    throw new ExportServiceError(
      'Personagem inválido: nome ausente ou inválido',
      'INVALID_CHARACTER_NAME'
    );
  }

  if (typeof character.level !== 'number' || character.level < 1) {
    throw new ExportServiceError(
      'Personagem inválido: nível inválido',
      'INVALID_CHARACTER_LEVEL'
    );
  }
}

/**
 * Gera nome de arquivo para exportação
 *
 * @param character Personagem a ser exportado
 * @returns Nome de arquivo formatado (ex: "aragorn-2025-12-10.json")
 */
function generateFileName(character: Character): string {
  // Normaliza o nome do personagem
  const normalizedName = character.name
    .toLowerCase()
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres não alfanuméricos por hífen
    .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim

  // Data atual no formato YYYY-MM-DD
  const date = new Date().toISOString().split('T')[0];

  return `${normalizedName}-${date}.json`;
}

/**
 * Serializa personagem para objeto exportável
 *
 * @param character Personagem a ser serializado
 * @returns Objeto de exportação com metadados
 */
export function serializeCharacterToObject(
  character: Character
): ExportedCharacter {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    character,
  };
}

/**
 * Serializa personagem para JSON com formatação legível
 *
 * @param character Personagem a ser serializado
 * @returns String JSON formatada
 */
function serializeCharacter(character: Character): string {
  const exported = serializeCharacterToObject(character);

  // Serializa com indentação de 2 espaços para legibilidade
  return JSON.stringify(exported, null, 2);
}

/**
 * Cria e dispara download de arquivo
 *
 * @param content Conteúdo do arquivo
 * @param fileName Nome do arquivo
 */
function downloadFile(content: string, fileName: string): void {
  try {
    // Cria blob com o conteúdo JSON
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Cria elemento <a> temporário para download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';

    // Adiciona ao DOM, clica e remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Libera URL objeto
    URL.revokeObjectURL(url);

    console.log(`✅ Exportação concluída: ${fileName}`);
  } catch (error) {
    console.error('❌ Erro ao criar download:', error);
    throw new ExportServiceError(
      'Falha ao criar arquivo de download',
      'DOWNLOAD_FAILED',
      error
    );
  }
}

/**
 * Exporta personagem para arquivo JSON
 *
 * Esta função:
 * 1. Valida os dados do personagem
 * 2. Serializa para JSON com metadados
 * 3. Gera nome de arquivo automático
 * 4. Dispara download do arquivo
 *
 * @param character Personagem a ser exportado
 * @throws {ExportServiceError} Se falhar em qualquer etapa
 *
 * @example
 * try {
 *   await exportCharacter(character);
 *   toast.success('Personagem exportado com sucesso!');
 * } catch (error) {
 *   toast.error('Erro ao exportar personagem');
 *   console.error(error);
 * }
 */
export async function exportCharacter(character: Character): Promise<void> {
  try {
    console.log(`📤 Iniciando exportação: ${character.name}`);

    // Valida dados do personagem
    validateCharacterForExport(character);

    // Serializa para JSON
    const json = serializeCharacter(character);

    // Gera nome de arquivo
    const fileName = generateFileName(character);

    // Dispara download
    downloadFile(json, fileName);

    console.log(`✅ Personagem exportado com sucesso: ${character.name}`);
  } catch (error) {
    console.error('❌ Erro ao exportar personagem:', error);

    // Re-lança erro se já for ExportServiceError
    if (error instanceof ExportServiceError) {
      throw error;
    }

    // Encapsula outros erros
    throw new ExportServiceError(
      'Falha ao exportar personagem',
      'EXPORT_FAILED',
      error
    );
  }
}

/**
 * Exporta múltiplos personagens em um único arquivo
 *
 * @param characters Array de personagens a serem exportados
 * @throws {ExportServiceError} Se falhar em qualquer etapa
 *
 * @example
 * await exportMultipleCharacters([char1, char2, char3]);
 */
export async function exportMultipleCharacters(
  characters: Character[]
): Promise<void> {
  try {
    if (!characters || characters.length === 0) {
      throw new ExportServiceError(
        'Nenhum personagem fornecido para exportação',
        'NO_CHARACTERS'
      );
    }

    console.log(`📤 Exportando ${characters.length} personagens`);

    // Valida todos os personagens
    characters.forEach((char) => validateCharacterForExport(char));

    // Cria estrutura de exportação múltipla
    const exported = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      count: characters.length,
      characters,
    };

    const json = JSON.stringify(exported, null, 2);

    // Nome de arquivo com quantidade
    const date = new Date().toISOString().split('T')[0];
    const fileName = `fichas-${characters.length}-personagens-${date}.json`;

    downloadFile(json, fileName);

    console.log(`✅ ${characters.length} personagens exportados com sucesso`);
  } catch (error) {
    console.error('❌ Erro ao exportar múltiplos personagens:', error);

    if (error instanceof ExportServiceError) {
      throw error;
    }

    throw new ExportServiceError(
      'Falha ao exportar múltiplos personagens',
      'EXPORT_MULTIPLE_FAILED',
      error
    );
  }
}
