/**
 * Import Service - Importação de fichas de personagem
 *
 * Este serviço gerencia a importação de fichas de personagem a partir de arquivos JSON,
 * incluindo validação de estrutura, versão e integridade dos dados.
 */

import { uuidv4 } from '@/utils/uuid';
import type { Character } from '@/types';
import { db } from './db';
import { EXPORT_VERSION, type ExportedCharacter } from './exportService';
import {
  isValidAttributeValue,
  isValidCharacterLevel,
  isValidSkillName,
  isValidProficiencyLevel,
} from '@/utils/validators';

/**
 * Estrutura de dados exportados em lote
 */
export interface ExportedCharacters {
  /** Versão do formato de exportação */
  version: string;
  /** Timestamp de quando foi exportado */
  exportedAt: string;
  /** Quantidade de personagens */
  count: number;
  /** Dados completos dos personagens */
  characters: Character[];
}

/**
 * Erros de importação
 */
export class ImportServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ImportServiceError';
  }
}

/**
 * Resultado da importação de um único personagem
 */
export interface ImportResult {
  /** Personagem importado */
  character: Character;
  /** Indica se houve migração de versão */
  wasMigrated: boolean;
  /** Versão original do arquivo */
  originalVersion: string;
  /** Avisos durante a importação */
  warnings: string[];
}

/**
 * Resultado da importação de múltiplos personagens
 */
export interface ImportMultipleResult {
  /** Personagens importados com sucesso */
  characters: Character[];
  /** Indica se houve migração de versão */
  wasMigrated: boolean;
  /** Versão original do arquivo */
  originalVersion: string;
  /** Avisos durante a importação */
  warnings: string[];
  /** Quantidade de personagens importados */
  count: number;
  /** Erros individuais que ocorreram (se algum personagem falhou) */
  errors: Array<{ index: number; name: string; error: string }>;
}

/**
 * Verifica se uma versão é compatível com a versão atual
 *
 * @param version Versão a ser verificada
 * @returns true se compatível, false caso contrário
 */
function isVersionCompatible(version: string): boolean {
  // Por enquanto, apenas versão 1.0.0 é suportada
  // No futuro, adicionar lógica de compatibilidade e migração
  const supportedVersions = ['1.0.0'];
  return supportedVersions.includes(version);
}

/**
 * Valida a estrutura básica de um personagem
 *
 * @param data Dados a serem validados
 * @throws {ImportServiceError} Se estrutura inválida
 */
function validateCharacterStructure(data: any): void {
  const requiredFields = [
    'id',
    'name',
    'level',
    'attributes',
    'combat',
    'skills',
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new ImportServiceError(
        `Campo obrigatório ausente: ${field}`,
        'MISSING_REQUIRED_FIELD'
      );
    }
  }
}

/**
 * Valida os atributos de um personagem
 *
 * @param attributes Atributos a serem validados
 * @param warnings Array para acumular avisos
 */
function validateAttributes(attributes: any, warnings: string[]): void {
  if (!attributes || typeof attributes !== 'object') {
    throw new ImportServiceError(
      'Atributos inválidos: deve ser um objeto',
      'INVALID_ATTRIBUTES'
    );
  }

  const requiredAttributes = [
    'agilidade',
    'constituicao',
    'forca',
    'influencia',
    'mente',
    'presenca',
  ];

  for (const attr of requiredAttributes) {
    if (!(attr in attributes)) {
      throw new ImportServiceError(
        `Atributo obrigatório ausente: ${attr}`,
        'MISSING_ATTRIBUTE'
      );
    }

    const value = attributes[attr];
    if (!isValidAttributeValue(value)) {
      throw new ImportServiceError(
        `Valor de atributo inválido para ${attr}: ${value}`,
        'INVALID_ATTRIBUTE_VALUE'
      );
    }

    // Aviso se atributo excede o máximo padrão
    if (value > 5) {
      warnings.push(
        `Atributo ${attr} excede valor padrão máximo (5): ${value}`
      );
    }
  }
}

/**
 * Valida os pontos de vida (HP) dentro de combat
 *
 * @param combat Dados de combate a serem validados
 */
function validateHealthPoints(combat: any): void {
  if (!combat || typeof combat !== 'object') {
    throw new ImportServiceError(
      'Dados de combate inválidos: deve ser um objeto',
      'INVALID_COMBAT'
    );
  }

  const hp = combat.hp;
  if (!hp || typeof hp !== 'object') {
    throw new ImportServiceError(
      'Pontos de Vida (HP) inválidos: deve ser um objeto',
      'INVALID_HP'
    );
  }

  const requiredFields = ['current', 'max', 'temporary'];
  for (const field of requiredFields) {
    if (!(field in hp)) {
      throw new ImportServiceError(
        `Campo obrigatório ausente em HP: ${field}`,
        'MISSING_HP_FIELD'
      );
    }

    if (typeof hp[field] !== 'number' || hp[field] < 0) {
      throw new ImportServiceError(
        `Valor inválido em HP.${field}: ${hp[field]}`,
        'INVALID_HP_VALUE'
      );
    }
  }
}

/**
 * Valida os pontos de poder (PP) dentro de combat
 *
 * @param combat Dados de combate a serem validados
 */
function validatePowerPoints(combat: any): void {
  if (!combat || typeof combat !== 'object') {
    throw new ImportServiceError(
      'Dados de combate inválidos: deve ser um objeto',
      'INVALID_COMBAT'
    );
  }

  const pp = combat.pp;
  if (!pp || typeof pp !== 'object') {
    throw new ImportServiceError(
      'Pontos de Poder (PP) inválidos: deve ser um objeto',
      'INVALID_PP'
    );
  }

  const requiredFields = ['current', 'max', 'temporary'];
  for (const field of requiredFields) {
    if (!(field in pp)) {
      throw new ImportServiceError(
        `Campo obrigatório ausente em PP: ${field}`,
        'MISSING_PP_FIELD'
      );
    }

    if (typeof pp[field] !== 'number' || pp[field] < 0) {
      throw new ImportServiceError(
        `Valor inválido em PP.${field}: ${pp[field]}`,
        'INVALID_PP_VALUE'
      );
    }
  }
}

/**
 * Valida as habilidades (skills)
 *
 * @param skills Habilidades a serem validadas
 * @param warnings Array para acumular avisos
 */
function validateSkills(skills: any, warnings: string[]): void {
  if (!skills || typeof skills !== 'object') {
    throw new ImportServiceError(
      'Habilidades inválidas: deve ser um objeto',
      'INVALID_SKILLS'
    );
  }

  for (const [skillName, skillData] of Object.entries(skills)) {
    if (!isValidSkillName(skillName)) {
      warnings.push(`Nome de habilidade desconhecido: ${skillName}`);
      continue;
    }

    if (typeof skillData !== 'object' || skillData === null) {
      throw new ImportServiceError(
        `Dados inválidos para habilidade ${skillName}`,
        'INVALID_SKILL_DATA'
      );
    }

    const data = skillData as any;

    // Valida proficiência (aceita tanto proficiency quanto proficiencyLevel para compatibilidade)
    const proficiencyField =
      'proficiencyLevel' in data ? 'proficiencyLevel' : 'proficiency';

    if (!(proficiencyField in data)) {
      throw new ImportServiceError(
        `Proficiência ausente para habilidade ${skillName}`,
        'MISSING_SKILL_PROFICIENCY'
      );
    }

    if (!isValidProficiencyLevel(data[proficiencyField])) {
      throw new ImportServiceError(
        `Nível de proficiência inválido para ${skillName}: ${data[proficiencyField]}`,
        'INVALID_PROFICIENCY_LEVEL'
      );
    }
  }
}

/**
 * Valida o nível do personagem
 *
 * @param level Nível a ser validado
 */
function validateLevel(level: any): void {
  if (!isValidCharacterLevel(level)) {
    throw new ImportServiceError(
      `Nível de personagem inválido: ${level}`,
      'INVALID_CHARACTER_LEVEL'
    );
  }
}

/**
 * Valida dados completos do personagem
 *
 * @param character Personagem a ser validado
 * @returns Array de avisos (não críticos)
 */
function validateCharacterData(character: any): string[] {
  const warnings: string[] = [];

  // Valida estrutura básica
  validateCharacterStructure(character);

  // Valida campos específicos
  validateLevel(character.level);
  validateAttributes(character.attributes, warnings);
  validateHealthPoints(character.combat);
  validatePowerPoints(character.combat);
  validateSkills(character.skills, warnings);

  // Valida nome
  if (typeof character.name !== 'string' || character.name.trim() === '') {
    throw new ImportServiceError(
      'Nome do personagem inválido',
      'INVALID_CHARACTER_NAME'
    );
  }

  return warnings;
}

/**
 * Migra dados de versões antigas para versão atual
 *
 * @param data Dados a serem migrados
 * @param fromVersion Versão de origem
 * @returns Dados migrados
 */
function migrateCharacterData(data: Character, fromVersion: string): Character {
  // Por enquanto, sem migrações necessárias
  // No futuro, adicionar lógica de migração por versão

  console.log(`ℹ️ Migração de versão ${fromVersion} → ${EXPORT_VERSION}`);

  return data;
}

/**
 * Lê e valida arquivo JSON
 *
 * @param file Arquivo a ser lido
 * @returns Dados do arquivo parseados (único ou múltiplo)
 */
async function readJsonFile(
  file: File
): Promise<ExportedCharacter | ExportedCharacters> {
  try {
    const text = await file.text();

    // Tenta parsear JSON
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new ImportServiceError(
        'Arquivo JSON inválido: não foi possível fazer parse',
        'INVALID_JSON',
        error
      );
    }

    // Valida estrutura de exportação
    if (!data || typeof data !== 'object') {
      throw new ImportServiceError(
        'Estrutura de arquivo inválida: esperado um objeto',
        'INVALID_FILE_STRUCTURE'
      );
    }

    if (!('version' in data)) {
      throw new ImportServiceError(
        'Arquivo sem versão: não é um arquivo de exportação válido',
        'MISSING_VERSION'
      );
    }

    // Detecta formato (único ou múltiplo)
    const isBatchExport =
      'characters' in data && Array.isArray(data.characters);
    const isSingleExport = 'character' in data;

    if (!isBatchExport && !isSingleExport) {
      throw new ImportServiceError(
        'Arquivo sem dados de personagem (esperado "character" ou "characters")',
        'MISSING_CHARACTER_DATA'
      );
    }

    return data as ExportedCharacter | ExportedCharacters;
  } catch (error) {
    if (error instanceof ImportServiceError) {
      throw error;
    }

    throw new ImportServiceError(
      'Erro ao ler arquivo',
      'FILE_READ_ERROR',
      error
    );
  }
}

/**
 * Verifica se já existe um personagem com o mesmo ID
 *
 * @param id ID a ser verificado
 * @returns true se existe, false caso contrário
 */
async function characterExists(id: string): Promise<boolean> {
  try {
    const existing = await db.characters.get(id);
    return !!existing;
  } catch (error) {
    console.warn('⚠️ Erro ao verificar existência de personagem:', error);
    return false;
  }
}

/**
 * Importa múltiplos personagens a partir de arquivo JSON
 *
 * @param data Dados do arquivo de exportação em lote
 * @returns Resultado da importação em lote
 */
async function importMultipleCharactersFromData(
  data: ExportedCharacters
): Promise<ImportMultipleResult> {
  console.log(`📥 Importando ${data.count} personagens em lote...`);

  const importedCharacters: Character[] = [];
  const allWarnings: string[] = [];
  const errors: Array<{ index: number; name: string; error: string }> = [];
  let wasMigrated = false;

  // Valida versão
  if (!isVersionCompatible(data.version)) {
    throw new ImportServiceError(
      `Versão incompatível: ${data.version}. Versão atual: ${EXPORT_VERSION}`,
      'INCOMPATIBLE_VERSION'
    );
  }

  // Processa cada personagem
  for (let i = 0; i < data.characters.length; i++) {
    const character = data.characters[i];
    const characterName = character.name || `Personagem #${i + 1}`;

    try {
      console.log(`  📋 Processando ${i + 1}/${data.count}: ${characterName}`);

      // Valida dados do personagem
      const warnings = validateCharacterData(character);
      allWarnings.push(...warnings);

      // Migra dados se necessário
      let processedCharacter = character;
      if (data.version !== EXPORT_VERSION) {
        processedCharacter = migrateCharacterData(character, data.version);
        wasMigrated = true;
      }

      // Gera novo ID para evitar conflitos
      const oldId = processedCharacter.id;
      const newId = uuidv4();

      console.log(`  🔄 ID: ${oldId} → ${newId}`);

      // Cria personagem com novo ID e timestamps atualizados
      const importedCharacter: Character = {
        ...processedCharacter,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Salva no IndexedDB
      await db.characters.add(importedCharacter);
      importedCharacters.push(importedCharacter);

      console.log(`  ✅ ${characterName} importado com sucesso`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`  ❌ Erro ao importar ${characterName}:`, error);
      errors.push({
        index: i,
        name: characterName,
        error: errorMessage,
      });
    }
  }

  if (importedCharacters.length === 0) {
    throw new ImportServiceError(
      'Nenhum personagem foi importado com sucesso',
      'ALL_IMPORTS_FAILED'
    );
  }

  console.log(
    `✅ Importação em lote concluída: ${importedCharacters.length}/${data.count} personagens`
  );

  if (errors.length > 0) {
    console.warn(`⚠️ ${errors.length} personagens falharam na importação`);
  }

  if (allWarnings.length > 0) {
    console.warn('⚠️ Avisos durante importação:', allWarnings);
  }

  return {
    characters: importedCharacters,
    wasMigrated,
    originalVersion: data.version,
    warnings: allWarnings,
    count: importedCharacters.length,
    errors,
  };
}

/**
 * Importa personagem(s) a partir de arquivo JSON
 *
 * Esta função detecta automaticamente o formato (único ou múltiplo) e:
 * 1. Lê o arquivo JSON
 * 2. Valida a estrutura e versão
 * 3. Valida os dados do(s) personagem(ns)
 * 4. Migra dados se necessário
 * 5. Gera novo ID para evitar conflitos
 * 6. Salva no IndexedDB
 *
 * @param file Arquivo JSON a ser importado
 * @returns Resultado da importação (único ou múltiplo)
 * @throws {ImportServiceError} Se falhar em qualquer etapa
 *
 * @example
 * try {
 *   const result = await importCharacter(file);
 *   if ('character' in result) {
 *     // Importação única
 *     toast.success(`Personagem ${result.character.name} importado!`);
 *   } else {
 *     // Importação múltipla
 *     toast.success(`${result.count} personagens importados!`);
 *   }
 * } catch (error) {
 *   toast.error('Erro ao importar personagem');
 *   console.error(error);
 * }
 */
export async function importCharacter(
  file: File
): Promise<ImportResult | ImportMultipleResult> {
  try {
    console.log(`📥 Iniciando importação: ${file.name}`);

    // Valida tipo de arquivo
    if (!file.name.endsWith('.json')) {
      throw new ImportServiceError(
        'Tipo de arquivo inválido: apenas arquivos .json são aceitos',
        'INVALID_FILE_TYPE'
      );
    }

    // Lê e parseia arquivo
    const data = await readJsonFile(file);

    console.log(`📋 Versão do arquivo: ${data.version}`);

    // Detecta formato e delega para função apropriada
    const isBatchExport =
      'characters' in data && Array.isArray(data.characters);

    if (isBatchExport) {
      // Importação em lote
      console.log(`📦 Detectado formato em lote (${data.count} personagens)`);
      return await importMultipleCharactersFromData(data as ExportedCharacters);
    }

    // Importação única (código original)
    const singleData = data as ExportedCharacter;

    // Valida versão
    if (!isVersionCompatible(singleData.version)) {
      throw new ImportServiceError(
        `Versão incompatível: ${singleData.version}. Versão atual: ${EXPORT_VERSION}`,
        'INCOMPATIBLE_VERSION'
      );
    }

    // Valida dados do personagem
    const warnings = validateCharacterData(singleData.character);

    // Migra dados se necessário
    let character = singleData.character;
    let wasMigrated = false;

    if (singleData.version !== EXPORT_VERSION) {
      character = migrateCharacterData(character, singleData.version);
      wasMigrated = true;
    }

    // Gera novo ID para evitar conflitos
    const oldId = character.id;
    const newId = uuidv4();

    console.log(`🔄 ID original: ${oldId} → Novo ID: ${newId}`);

    // Cria personagem com novo ID e timestamps atualizados
    const importedCharacter: Character = {
      ...character,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Salva no IndexedDB
    await db.characters.add(importedCharacter);

    console.log(
      `✅ Personagem importado com sucesso: ${importedCharacter.name}`
    );

    if (warnings.length > 0) {
      console.warn('⚠️ Avisos durante importação:', warnings);
    }

    return {
      character: importedCharacter,
      wasMigrated,
      originalVersion: singleData.version,
      warnings,
    };
  } catch (error) {
    console.error('❌ Erro ao importar personagem(s):', error);

    if (error instanceof ImportServiceError) {
      throw error;
    }

    throw new ImportServiceError(
      'Falha ao importar personagem(s)',
      'IMPORT_FAILED',
      error
    );
  }
}
