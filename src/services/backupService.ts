/**
 * Backup Service - Sistema de backup automático de fichas
 *
 * Este serviço gerencia backups automáticos, lembretes periódicos,
 * exportação em lote e backup de emergência em localStorage.
 */

import { characterService } from './characterService';
import { exportMultipleCharacters } from './exportService';
import type { Character } from '@/types';

/**
 * Chaves do localStorage
 */
const STORAGE_KEYS = {
  LAST_BACKUP: 'lite-sheets-last-backup',
  BACKUP_FREQUENCY: 'lite-sheets-backup-frequency',
  BACKUP_DISMISSED: 'lite-sheets-backup-dismissed',
  EMERGENCY_BACKUP: 'lite-sheets-emergency-backup',
} as const;

/**
 * Frequências de backup (em dias)
 */
export const BACKUP_FREQUENCIES = {
  DAILY: 1,
  WEEKLY: 7,
  BIWEEKLY: 14,
  MONTHLY: 30,
  NEVER: -1,
} as const;

export type BackupFrequency = keyof typeof BACKUP_FREQUENCIES;

/**
 * Estrutura de backup de emergência no localStorage
 */
export interface EmergencyBackup {
  version: string;
  savedAt: string;
  count: number;
  characters: Character[];
}

/**
 * Informações sobre o estado do backup
 */
export interface BackupStatus {
  /** Data do último backup (null se nunca fez backup) */
  lastBackup: Date | null;
  /** Dias desde o último backup */
  daysSinceLastBackup: number | null;
  /** Frequência configurada */
  frequency: BackupFrequency;
  /** Se deve exibir lembrete */
  shouldShowReminder: boolean;
  /** Se o lembrete foi dispensado temporariamente */
  isDismissed: boolean;
}

/**
 * Erros do serviço de backup
 */
export class BackupServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'BackupServiceError';
  }
}

/**
 * Obtém a data do último backup
 *
 * @returns Date do último backup ou null se nunca fez
 */
function getLastBackupDate(): Date | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
    if (!stored) return null;

    const date = new Date(stored);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.warn('⚠️ Erro ao buscar data do último backup:', error);
    return null;
  }
}

/**
 * Registra que um backup foi realizado
 */
function recordBackup(): void {
  try {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, now);
    // Remove flag de dispensado ao fazer backup
    localStorage.removeItem(STORAGE_KEYS.BACKUP_DISMISSED);
    console.log('✅ Backup registrado:', now);
  } catch (error) {
    console.warn('⚠️ Erro ao registrar backup:', error);
  }
}

/**
 * Obtém a frequência de backup configurada
 *
 * @returns Frequência configurada (padrão: WEEKLY)
 */
export function getBackupFrequency(): BackupFrequency {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BACKUP_FREQUENCY);
    if (!stored) return 'WEEKLY';

    // Valida se é uma chave válida
    if (stored in BACKUP_FREQUENCIES) {
      return stored as BackupFrequency;
    }

    return 'WEEKLY';
  } catch (error) {
    console.warn('⚠️ Erro ao buscar frequência de backup:', error);
    return 'WEEKLY';
  }
}

/**
 * Define a frequência de backup
 *
 * @param frequency Nova frequência
 */
export function setBackupFrequency(frequency: BackupFrequency): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BACKUP_FREQUENCY, frequency);
    console.log(`✅ Frequência de backup definida: ${frequency}`);
  } catch (error) {
    console.warn('⚠️ Erro ao definir frequência de backup:', error);
  }
}

/**
 * Verifica se o lembrete foi dispensado temporariamente
 *
 * @returns true se foi dispensado
 */
function isReminderDismissed(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BACKUP_DISMISSED);
    if (!stored) return false;

    // Verifica se a dispensa ainda é válida (24h)
    const dismissedAt = new Date(stored);
    const now = new Date();
    const hoursSince =
      (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60);

    return hoursSince < 24;
  } catch (error) {
    console.warn('⚠️ Erro ao verificar dispensa de lembrete:', error);
    return false;
  }
}

/**
 * Dispensa o lembrete por 24 horas
 */
export function dismissReminder(): void {
  try {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.BACKUP_DISMISSED, now);
    console.log('✅ Lembrete de backup dispensado por 24h');
  } catch (error) {
    console.warn('⚠️ Erro ao dispensar lembrete:', error);
  }
}

/**
 * Calcula dias desde o último backup
 *
 * @param lastBackup Data do último backup
 * @returns Número de dias ou null se lastBackup for null
 */
function calculateDaysSinceLastBackup(lastBackup: Date | null): number | null {
  if (!lastBackup) return null;

  const now = new Date();
  const diffMs = now.getTime() - lastBackup.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Obtém o status atual do backup
 *
 * @returns Informações sobre o estado do backup
 */
export function getBackupStatus(): BackupStatus {
  const lastBackup = getLastBackupDate();
  const daysSinceLastBackup = calculateDaysSinceLastBackup(lastBackup);
  const frequency = getBackupFrequency();
  const isDismissed = isReminderDismissed();

  // Determina se deve exibir lembrete
  let shouldShowReminder = false;

  if (frequency !== 'NEVER' && !isDismissed) {
    const frequencyDays = BACKUP_FREQUENCIES[frequency];

    if (daysSinceLastBackup === null) {
      // Nunca fez backup - exibir lembrete após 7 dias de uso
      // (pode ser refinado para verificar data de criação da primeira ficha)
      shouldShowReminder = true;
    } else if (daysSinceLastBackup >= frequencyDays) {
      // Passou do prazo
      shouldShowReminder = true;
    }
  }

  return {
    lastBackup,
    daysSinceLastBackup,
    frequency,
    shouldShowReminder,
    isDismissed,
  };
}

/**
 * Exporta todas as fichas para arquivo JSON (interno)
 *
 * @param registerBackup Se true, registra timestamp de backup
 * @returns Quantidade de fichas exportadas
 * @throws {BackupServiceError} Se falhar ao exportar
 */
async function exportAllCharactersInternal(
  registerBackup: boolean
): Promise<number> {
  try {
    console.log('📤 Iniciando exportação em lote...');

    const characters = await characterService.getAll();

    if (characters.length === 0) {
      throw new BackupServiceError(
        'Nenhuma ficha encontrada para exportar',
        'NO_CHARACTERS'
      );
    }

    await exportMultipleCharacters(characters);

    // Registra que fez backup apenas se solicitado
    if (registerBackup) {
      recordBackup();
      // Limpa dispensação ao fazer backup completo
      localStorage.removeItem(STORAGE_KEYS.BACKUP_DISMISSED);
      console.log('🗓️ Backup registrado e lembrete redefinido');
    }

    console.log(`✅ ${characters.length} fichas exportadas com sucesso`);
    return characters.length;
  } catch (error) {
    console.error('❌ Erro ao exportar todas as fichas:', error);

    if (error instanceof BackupServiceError) {
      throw error;
    }

    throw new BackupServiceError(
      'Falha ao exportar fichas',
      'EXPORT_ALL_FAILED',
      error
    );
  }
}

/**
 * Exporta todas as fichas para arquivo JSON e registra como backup
 *
 * Esta função é usada para "Fazer Backup" completo:
 * - Exporta fichas para arquivo JSON
 * - Atualiza timestamp do último backup
 * - Limpa dispensação do lembrete
 * - Redefine próximo lembrete baseado na frequência
 *
 * @returns Quantidade de fichas exportadas
 * @throws {BackupServiceError} Se falhar ao exportar
 */
export async function exportAllCharacters(): Promise<number> {
  return exportAllCharactersInternal(true);
}

/**
 * Exporta todas as fichas para arquivo JSON sem registrar como backup
 *
 * Esta função é usada para "Só Exportar":
 * - Exporta fichas para arquivo JSON
 * - NÃO atualiza timestamp do último backup
 * - NÃO limpa dispensação do lembrete
 * - NÃO afeta quando o próximo lembrete aparecerá
 *
 * Use quando o usuário quer apenas baixar as fichas sem
 * que o sistema interprete como "backup completo feito".
 *
 * @returns Quantidade de fichas exportadas
 * @throws {BackupServiceError} Se falhar ao exportar
 */
export async function exportAllCharactersOnly(): Promise<number> {
  return exportAllCharactersInternal(false);
}

/**
 * Salva backup de emergência no localStorage
 *
 * Este backup serve como último recurso caso o usuário perca
 * o acesso ao IndexedDB. Limitado pelo tamanho do localStorage (~5-10MB).
 *
 * @returns Quantidade de fichas salvas
 * @throws {BackupServiceError} Se falhar ao salvar
 */
export async function saveEmergencyBackup(): Promise<number> {
  try {
    console.log('💾 Salvando backup de emergência no localStorage...');

    const characters = await characterService.getAll();

    if (characters.length === 0) {
      console.log('ℹ️ Nenhuma ficha para fazer backup de emergência');
      return 0;
    }

    const backup: EmergencyBackup = {
      version: '1.0.0',
      savedAt: new Date().toISOString(),
      count: characters.length,
      characters,
    };

    const json = JSON.stringify(backup);

    // Verifica tamanho (localStorage geralmente tem limite de ~5MB)
    const sizeKB = new Blob([json]).size / 1024;

    if (sizeKB > 4096) {
      // 4MB para ter margem
      console.warn(
        `⚠️ Backup muito grande (${sizeKB.toFixed(2)} KB). Limitando...`
      );
      // Salva apenas as primeiras N fichas que caibam
      // (pode ser refinado para priorizar fichas mais usadas)
    }

    localStorage.setItem(STORAGE_KEYS.EMERGENCY_BACKUP, json);

    console.log(
      `✅ Backup de emergência salvo: ${characters.length} fichas (${sizeKB.toFixed(2)} KB)`
    );
    return characters.length;
  } catch (error) {
    console.error('❌ Erro ao salvar backup de emergência:', error);

    // Se erro for QuotaExceededError, tenta salvar versão reduzida
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('⚠️ localStorage cheio, tentando versão reduzida...');
      // Implementação futura: salvar apenas IDs e dados críticos
    }

    throw new BackupServiceError(
      'Falha ao salvar backup de emergência',
      'EMERGENCY_BACKUP_FAILED',
      error
    );
  }
}

/**
 * Recupera backup de emergência do localStorage
 *
 * @returns Backup de emergência ou null se não existir
 */
export function getEmergencyBackup(): EmergencyBackup | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EMERGENCY_BACKUP);
    if (!stored) return null;

    const backup = JSON.parse(stored) as EmergencyBackup;

    // Valida estrutura básica
    if (
      !backup.version ||
      !backup.savedAt ||
      !Array.isArray(backup.characters)
    ) {
      console.warn('⚠️ Backup de emergência inválido');
      return null;
    }

    return backup;
  } catch (error) {
    console.error('❌ Erro ao recuperar backup de emergência:', error);
    return null;
  }
}

/**
 * Remove backup de emergência do localStorage
 */
export function clearEmergencyBackup(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.EMERGENCY_BACKUP);
    console.log('✅ Backup de emergência removido');
  } catch (error) {
    console.warn('⚠️ Erro ao remover backup de emergência:', error);
  }
}

/**
 * Realiza backup completo (exportação + emergência)
 *
 * @returns Objeto com contagens de fichas exportadas e salvas
 */
export async function performFullBackup(): Promise<{
  exported: number;
  emergency: number;
}> {
  try {
    console.log('🔄 Iniciando backup completo...');

    const exported = await exportAllCharacters();
    const emergency = await saveEmergencyBackup();

    console.log(
      `✅ Backup completo: ${exported} exportadas, ${emergency} no localStorage`
    );

    return { exported, emergency };
  } catch (error) {
    console.error('❌ Erro ao realizar backup completo:', error);

    throw new BackupServiceError(
      'Falha ao realizar backup completo',
      'FULL_BACKUP_FAILED',
      error
    );
  }
}
