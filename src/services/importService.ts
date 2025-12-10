/**
 * Import Service - Importação de fichas de personagem
 *
 * Este serviço gerencia a importação de fichas de personagem a partir de arquivos JSON,
 * incluindo validação de estrutura, versão e integridade dos dados.
 */

import { v4 as uuidv4 } from 'uuid';
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
 * Resultado da importação
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
 * @returns Dados do arquivo parseados
 */
async function readJsonFile(file: File): Promise<ExportedCharacter> {
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

    if (!('character' in data)) {
      throw new ImportServiceError(
        'Arquivo sem dados de personagem',
        'MISSING_CHARACTER_DATA'
      );
    }

    return data as ExportedCharacter;
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
 * Importa personagem a partir de arquivo JSON
 *
 * Esta função:
 * 1. Lê o arquivo JSON
 * 2. Valida a estrutura e versão
 * 3. Valida os dados do personagem
 * 4. Migra dados se necessário
 * 5. Gera novo ID para evitar conflitos
 * 6. Salva no IndexedDB
 *
 * @param file Arquivo JSON a ser importado
 * @returns Resultado da importação
 * @throws {ImportServiceError} Se falhar em qualquer etapa
 *
 * @example
 * try {
 *   const result = await importCharacter(file);
 *   toast.success(`Personagem ${result.character.name} importado!`);
 *   if (result.warnings.length > 0) {
 *     console.warn('Avisos:', result.warnings);
 *   }
 * } catch (error) {
 *   toast.error('Erro ao importar personagem');
 *   console.error(error);
 * }
 */
export async function importCharacter(file: File): Promise<ImportResult> {
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

    // Valida versão
    if (!isVersionCompatible(data.version)) {
      throw new ImportServiceError(
        `Versão incompatível: ${data.version}. Versão atual: ${EXPORT_VERSION}`,
        'INCOMPATIBLE_VERSION'
      );
    }

    // Valida dados do personagem
    const warnings = validateCharacterData(data.character);

    // Migra dados se necessário
    let character = data.character;
    let wasMigrated = false;

    if (data.version !== EXPORT_VERSION) {
      character = migrateCharacterData(character, data.version);
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
      originalVersion: data.version,
      warnings,
    };
  } catch (error) {
    console.error('❌ Erro ao importar personagem:', error);

    if (error instanceof ImportServiceError) {
      throw error;
    }

    throw new ImportServiceError(
      'Falha ao importar personagem',
      'IMPORT_FAILED',
      error
    );
  }
}

/**
 * Importa múltiplos personagens de um único arquivo
 *
 * @param file Arquivo JSON com múltiplos personagens
 * @returns Array de resultados de importação
 * @throws {ImportServiceError} Se estrutura do arquivo for inválida
 *
 * @example
 * const results = await importMultipleCharacters(file);
 * console.log(`${results.length} personagens importados`);
 */
export async function importMultipleCharacters(
  file: File
): Promise<ImportResult[]> {
  try {
    console.log(`📥 Importando múltiplos personagens de: ${file.name}`);

    const text = await file.text();
    const data = JSON.parse(text);

    // Valida estrutura de múltiplos personagens
    if (!data || typeof data !== 'object') {
      throw new ImportServiceError(
        'Estrutura de arquivo inválida',
        'INVALID_FILE_STRUCTURE'
      );
    }

    if (!('characters' in data) || !Array.isArray(data.characters)) {
      throw new ImportServiceError(
        'Arquivo não contém array de personagens',
        'MISSING_CHARACTERS_ARRAY'
      );
    }

    const results: ImportResult[] = [];
    const errors: Array<{ name: string; error: string }> = [];

    // Importa cada personagem
    for (let i = 0; i < data.characters.length; i++) {
      const charData = data.characters[i];

      try {
        const warnings = validateCharacterData(charData);

        const newId = uuidv4();
        const importedCharacter: Character = {
          ...charData,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.characters.add(importedCharacter);

        results.push({
          character: importedCharacter,
          wasMigrated: data.version !== EXPORT_VERSION,
          originalVersion: data.version || EXPORT_VERSION,
          warnings,
        });

        console.log(
          `✅ Importado ${i + 1}/${data.characters.length}: ${importedCharacter.name}`
        );
      } catch (error) {
        const name = charData?.name || `Personagem ${i + 1}`;
        const message =
          error instanceof Error ? error.message : 'Erro desconhecido';

        console.error(`❌ Erro ao importar ${name}:`, error);
        errors.push({ name, error: message });
      }
    }

    if (errors.length > 0) {
      console.warn(
        `⚠️ ${errors.length} personagens falharam na importação:`,
        errors
      );
    }

    console.log(`✅ ${results.length} personagens importados com sucesso`);

    return results;
  } catch (error) {
    console.error('❌ Erro ao importar múltiplos personagens:', error);

    if (error instanceof ImportServiceError) {
      throw error;
    }

    throw new ImportServiceError(
      'Falha ao importar múltiplos personagens',
      'IMPORT_MULTIPLE_FAILED',
      error
    );
  }
}
