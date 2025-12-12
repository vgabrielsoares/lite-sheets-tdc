/**
 * Testes para validar comportamento diferencial entre
 * "Fazer Backup" e "Só Exportar"
 *
 * Regras de negócio:
 * - "Fazer Backup": Exporta + localStorage + atualiza timestamp
 * - "Só Exportar": Exporta APENAS, sem afetar sistema de lembretes
 */

import {
  exportAllCharacters,
  exportAllCharactersOnly,
  getBackupStatus,
  performFullBackup,
} from '../backupService';
import { characterService } from '../characterService';
import { exportMultipleCharacters } from '../exportService';
import type { Character } from '@/types';

// Mock dos serviços
jest.mock('../characterService');
jest.mock('../exportService');

const mockedCharacterService = characterService as jest.Mocked<
  typeof characterService
>;
const mockedExportMultipleCharacters =
  exportMultipleCharacters as jest.MockedFunction<
    typeof exportMultipleCharacters
  >;

// Chaves do localStorage (copiadas do backupService já que não são exportadas)
const STORAGE_KEYS = {
  LAST_BACKUP: 'lite-sheets-last-backup',
  BACKUP_FREQUENCY: 'lite-sheets-backup-frequency',
  BACKUP_DISMISSED: 'lite-sheets-backup-dismissed',
  EMERGENCY_BACKUP: 'lite-sheets-emergency-backup',
} as const;

describe('Backup Behavior - Fazer Backup vs Só Exportar', () => {
  const mockCharacter: Partial<Character> = {
    id: 'char-1',
    name: 'Test Character',
    level: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    // Limpa localStorage
    localStorage.clear();

    // Limpa mocks
    jest.clearAllMocks();

    // Mock básico de characterService.getAll
    mockedCharacterService.getAll.mockResolvedValue([
      mockCharacter as Character,
    ]);

    // Mock básico de exportService.exportMultipleCharacters
    mockedExportMultipleCharacters.mockResolvedValue();
  });

  describe('exportAllCharacters (Fazer Backup)', () => {
    it('deve exportar fichas E registrar timestamp de backup', async () => {
      const timestampBefore = Date.now();

      const count = await exportAllCharacters();

      expect(count).toBe(1);
      expect(mockedExportMultipleCharacters).toHaveBeenCalledWith([
        mockCharacter,
      ]);

      // Verifica que registrou o backup
      const lastBackup = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
      expect(lastBackup).toBeTruthy();

      const lastBackupDate = new Date(lastBackup!).getTime();
      expect(lastBackupDate).toBeGreaterThanOrEqual(timestampBefore);
      expect(lastBackupDate).toBeLessThanOrEqual(Date.now());
    });

    it('deve limpar dispensação do lembrete ao fazer backup', async () => {
      // Simula que usuário havia dispensado o lembrete
      localStorage.setItem(STORAGE_KEYS.BACKUP_DISMISSED, 'true');

      await exportAllCharacters();

      // Verifica que a dispensação foi removida
      const dismissed = localStorage.getItem(STORAGE_KEYS.BACKUP_DISMISSED);
      expect(dismissed).toBeNull();
    });

    it('deve resetar o lembrete de backup', async () => {
      // Define frequência diária (1 dia)
      localStorage.setItem(STORAGE_KEYS.BACKUP_FREQUENCY, 'DAILY');

      // Simula backup antigo (5 dias atrás)
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, fiveDaysAgo.toISOString());

      // Verifica que lembrete deveria aparecer
      const statusBefore = getBackupStatus();
      expect(statusBefore.shouldShowReminder).toBe(true);
      expect(statusBefore.daysSinceLastBackup).toBe(5);

      // Faz backup
      await exportAllCharacters();

      // Verifica que lembrete foi resetado
      const statusAfter = getBackupStatus();
      expect(statusAfter.shouldShowReminder).toBe(false);
      expect(statusAfter.daysSinceLastBackup).toBe(0);
    });
  });

  describe('exportAllCharactersOnly (Só Exportar)', () => {
    it('deve exportar fichas mas NÃO registrar timestamp de backup', async () => {
      // Define backup antigo
      const oldBackupDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      localStorage.setItem(
        STORAGE_KEYS.LAST_BACKUP,
        oldBackupDate.toISOString()
      );

      const count = await exportAllCharactersOnly();

      expect(count).toBe(1);
      expect(mockedExportMultipleCharacters).toHaveBeenCalledWith([
        mockCharacter,
      ]);

      // Verifica que timestamp do backup NÃO foi atualizado
      const lastBackup = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
      expect(lastBackup).toBe(oldBackupDate.toISOString());
    });

    it('NÃO deve limpar dispensação do lembrete', async () => {
      // Simula que usuário dispensou o lembrete
      localStorage.setItem(STORAGE_KEYS.BACKUP_DISMISSED, 'true');

      await exportAllCharactersOnly();

      // Verifica que dispensação permanece
      const dismissed = localStorage.getItem(STORAGE_KEYS.BACKUP_DISMISSED);
      expect(dismissed).toBe('true');
    });

    it('NÃO deve afetar o sistema de lembretes', async () => {
      // Define frequência diária (1 dia)
      localStorage.setItem(STORAGE_KEYS.BACKUP_FREQUENCY, 'DAILY');

      // Simula backup antigo (5 dias atrás)
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, fiveDaysAgo.toISOString());

      // Verifica estado inicial
      const statusBefore = getBackupStatus();
      expect(statusBefore.shouldShowReminder).toBe(true);
      expect(statusBefore.daysSinceLastBackup).toBe(5);

      // Exporta sem registrar backup
      await exportAllCharactersOnly();

      // Verifica que status do lembrete NÃO mudou
      const statusAfter = getBackupStatus();
      expect(statusAfter.shouldShowReminder).toBe(true);
      expect(statusAfter.daysSinceLastBackup).toBe(5);
      expect(statusAfter.lastBackup?.getTime()).toBe(
        statusBefore.lastBackup?.getTime()
      );
    });
  });

  describe('performFullBackup (Fazer Backup completo)', () => {
    it('deve fazer backup E salvar cópia de emergência', async () => {
      const result = await performFullBackup();

      expect(result.exported).toBe(1);
      expect(result.emergency).toBe(1);

      // Verifica que registrou o backup
      const lastBackup = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
      expect(lastBackup).toBeTruthy();

      // Verifica que salvou emergência
      const emergency = localStorage.getItem(STORAGE_KEYS.EMERGENCY_BACKUP);
      expect(emergency).toBeTruthy();
    });

    it('deve resetar sistema de lembretes', async () => {
      // Define frequência diária
      localStorage.setItem(STORAGE_KEYS.BACKUP_FREQUENCY, '1');

      // Simula backup antigo
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, oldDate.toISOString());

      // Lembrete deveria aparecer
      expect(getBackupStatus().shouldShowReminder).toBe(true);

      // Faz backup completo
      await performFullBackup();

      // Lembrete foi resetado
      expect(getBackupStatus().shouldShowReminder).toBe(false);
      expect(getBackupStatus().daysSinceLastBackup).toBe(0);
    });
  });

  describe('Cenários de uso real', () => {
    it('Cenário 1: Usuário faz backup completo após 5 dias', async () => {
      // Setup: Backup de 5 dias atrás, frequência semanal
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, fiveDaysAgo.toISOString());
      localStorage.setItem(STORAGE_KEYS.BACKUP_FREQUENCY, 'WEEKLY');

      // Lembrete não deveria aparecer ainda (faltam 2 dias)
      expect(getBackupStatus().shouldShowReminder).toBe(false);

      // Usuário decide fazer backup completo mesmo assim
      await performFullBackup();

      // Sistema reseta contador
      const status = getBackupStatus();
      expect(status.daysSinceLastBackup).toBe(0);
      expect(status.shouldShowReminder).toBe(false);
    });

    it('Cenário 2: Usuário exporta várias vezes mas não faz backup', async () => {
      // Setup: Backup de 8 dias atrás, frequência semanal (7 dias)
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
      localStorage.setItem(
        STORAGE_KEYS.LAST_BACKUP,
        eightDaysAgo.toISOString()
      );
      localStorage.setItem(STORAGE_KEYS.BACKUP_FREQUENCY, 'WEEKLY');

      // Lembrete deveria aparecer (passou de 7 dias)
      expect(getBackupStatus().shouldShowReminder).toBe(true);

      // Usuário exporta 3 vezes (sem fazer backup)
      await exportAllCharactersOnly();
      await exportAllCharactersOnly();
      await exportAllCharactersOnly();

      // Lembrete ainda deveria aparecer
      const status = getBackupStatus();
      expect(status.shouldShowReminder).toBe(true);
      expect(status.daysSinceLastBackup).toBe(8);
    });

    it('Cenário 3: Usuário dispensa lembrete, faz exportação, backup ainda dispensado', async () => {
      // Setup: Dispensa com timestamp válido (agora)
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.BACKUP_DISMISSED, now);
      localStorage.setItem(STORAGE_KEYS.BACKUP_FREQUENCY, 'DAILY');

      // Define backup antigo para trigger reminder, mas dispensação bloqueia
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, oldDate.toISOString());

      // Lembrete dispensado
      expect(getBackupStatus().shouldShowReminder).toBe(false);

      // Exporta sem fazer backup
      await exportAllCharactersOnly();

      // Lembrete ainda dispensado
      expect(getBackupStatus().shouldShowReminder).toBe(false);
      expect(localStorage.getItem(STORAGE_KEYS.BACKUP_DISMISSED)).toBe(now);
    });

    it('Cenário 4: Usuário dispensa lembrete, depois faz backup completo, dispensação é limpa', async () => {
      // Setup: Dispensa com timestamp válido
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.BACKUP_DISMISSED, now);

      expect(getBackupStatus().shouldShowReminder).toBe(false);

      // Faz backup completo
      await exportAllCharacters();

      // Dispensação foi removida
      expect(localStorage.getItem(STORAGE_KEYS.BACKUP_DISMISSED)).toBeNull();
    });
  });
});
