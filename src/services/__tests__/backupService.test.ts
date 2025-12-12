/**
 * Testes para backupService
 */

import {
  getBackupStatus,
  getBackupFrequency,
  setBackupFrequency,
  dismissReminder,
  exportAllCharacters,
  saveEmergencyBackup,
  getEmergencyBackup,
  clearEmergencyBackup,
  performFullBackup,
  BACKUP_FREQUENCIES,
  type BackupFrequency,
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

describe('backupService', () => {
  beforeEach(() => {
    // Limpa localStorage antes de cada teste
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('getBackupFrequency', () => {
    it('deve retornar WEEKLY como padrão', () => {
      expect(getBackupFrequency()).toBe('WEEKLY');
    });

    it('deve retornar frequência salva', () => {
      localStorage.setItem('lite-sheets-backup-frequency', 'DAILY');
      expect(getBackupFrequency()).toBe('DAILY');
    });

    it('deve retornar WEEKLY se valor inválido', () => {
      localStorage.setItem('lite-sheets-backup-frequency', 'INVALID');
      expect(getBackupFrequency()).toBe('WEEKLY');
    });
  });

  describe('setBackupFrequency', () => {
    it('deve salvar frequência no localStorage', () => {
      setBackupFrequency('MONTHLY');
      expect(localStorage.getItem('lite-sheets-backup-frequency')).toBe(
        'MONTHLY'
      );
    });

    it('deve aceitar todas as frequências válidas', () => {
      const frequencies: BackupFrequency[] = [
        'DAILY',
        'WEEKLY',
        'BIWEEKLY',
        'MONTHLY',
        'NEVER',
      ];

      frequencies.forEach((freq) => {
        setBackupFrequency(freq);
        expect(getBackupFrequency()).toBe(freq);
      });
    });
  });

  describe('dismissReminder', () => {
    it('deve salvar timestamp de dispensa', () => {
      const beforeDismiss = Date.now();
      dismissReminder();
      const afterDismiss = Date.now();

      const stored = localStorage.getItem('lite-sheets-backup-dismissed');
      expect(stored).toBeTruthy();

      const timestamp = new Date(stored!).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeDismiss);
      expect(timestamp).toBeLessThanOrEqual(afterDismiss);
    });
  });

  describe('getBackupStatus', () => {
    it('deve retornar status inicial correto', () => {
      const status = getBackupStatus();

      expect(status).toMatchObject({
        lastBackup: null,
        daysSinceLastBackup: null,
        frequency: 'WEEKLY',
        shouldShowReminder: true, // Nunca fez backup
        isDismissed: false,
      });
    });

    it('deve calcular dias desde último backup', () => {
      // Simula backup há 10 dias
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      localStorage.setItem('lite-sheets-last-backup', tenDaysAgo.toISOString());

      const status = getBackupStatus();

      expect(status.daysSinceLastBackup).toBe(10);
      expect(status.shouldShowReminder).toBe(true); // Passou de 7 dias
    });

    it('não deve exibir lembrete se dentro do prazo', () => {
      // Simula backup há 3 dias
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      localStorage.setItem(
        'lite-sheets-last-backup',
        threeDaysAgo.toISOString()
      );

      const status = getBackupStatus();

      expect(status.daysSinceLastBackup).toBe(3);
      expect(status.shouldShowReminder).toBe(false); // Dentro de 7 dias
    });

    it('não deve exibir lembrete se dispensado', () => {
      // Simula backup há 10 dias
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      localStorage.setItem('lite-sheets-last-backup', tenDaysAgo.toISOString());

      // Dispensa lembrete
      dismissReminder();

      const status = getBackupStatus();

      expect(status.isDismissed).toBe(true);
      expect(status.shouldShowReminder).toBe(false);
    });

    it('não deve exibir lembrete se frequência NEVER', () => {
      setBackupFrequency('NEVER');

      const status = getBackupStatus();

      expect(status.frequency).toBe('NEVER');
      expect(status.shouldShowReminder).toBe(false);
    });

    it('deve exibir lembrete conforme frequência configurada', () => {
      // DAILY - 2 dias atrás
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      localStorage.setItem('lite-sheets-last-backup', twoDaysAgo.toISOString());
      setBackupFrequency('DAILY');

      let status = getBackupStatus();
      expect(status.shouldShowReminder).toBe(true);

      // BIWEEKLY - 10 dias atrás
      localStorage.setItem('lite-sheets-last-backup', twoDaysAgo.toISOString());
      setBackupFrequency('BIWEEKLY');

      status = getBackupStatus();
      expect(status.shouldShowReminder).toBe(false); // Dentro de 14 dias
    });
  });

  describe('exportAllCharacters', () => {
    const mockCharacters: Character[] = [
      {
        id: '1',
        name: 'Aragorn',
        level: 5,
      } as Character,
      {
        id: '2',
        name: 'Gandalf',
        level: 10,
      } as Character,
    ];

    beforeEach(() => {
      mockedCharacterService.getAll.mockResolvedValue(mockCharacters);
      mockedExportMultipleCharacters.mockResolvedValue();
    });

    it('deve exportar todas as fichas', async () => {
      const count = await exportAllCharacters();

      expect(count).toBe(2);
      expect(mockedCharacterService.getAll).toHaveBeenCalledTimes(1);
      expect(mockedExportMultipleCharacters).toHaveBeenCalledWith(
        mockCharacters
      );
    });

    it('deve registrar backup após exportação', async () => {
      const beforeExport = Date.now();
      await exportAllCharacters();
      const afterExport = Date.now();

      const stored = localStorage.getItem('lite-sheets-last-backup');
      expect(stored).toBeTruthy();

      const timestamp = new Date(stored!).getTime();
      expect(timestamp).toBeGreaterThanOrEqual(beforeExport);
      expect(timestamp).toBeLessThanOrEqual(afterExport);
    });

    it('deve remover flag de dispensado após backup', async () => {
      dismissReminder();
      expect(localStorage.getItem('lite-sheets-backup-dismissed')).toBeTruthy();

      await exportAllCharacters();

      expect(localStorage.getItem('lite-sheets-backup-dismissed')).toBeNull();
    });

    it('deve lançar erro se não houver fichas', async () => {
      mockedCharacterService.getAll.mockResolvedValue([]);

      await expect(exportAllCharacters()).rejects.toThrow(
        'Nenhuma ficha encontrada para exportar'
      );
    });
  });

  describe('saveEmergencyBackup', () => {
    const mockCharacters: Character[] = [
      {
        id: '1',
        name: 'Legolas',
        level: 3,
      } as Character,
    ];

    beforeEach(() => {
      mockedCharacterService.getAll.mockResolvedValue(mockCharacters);
    });

    it('deve salvar backup de emergência no localStorage', async () => {
      const count = await saveEmergencyBackup();

      expect(count).toBe(1);

      const stored = localStorage.getItem('lite-sheets-emergency-backup');
      expect(stored).toBeTruthy();

      const backup = JSON.parse(stored!);
      expect(backup).toMatchObject({
        version: '1.0.0',
        count: 1,
        characters: mockCharacters,
      });
      expect(backup.savedAt).toBeTruthy();
    });

    it('deve retornar 0 se não houver fichas', async () => {
      mockedCharacterService.getAll.mockResolvedValue([]);

      const count = await saveEmergencyBackup();

      expect(count).toBe(0);
      expect(localStorage.getItem('lite-sheets-emergency-backup')).toBeNull();
    });
  });

  describe('getEmergencyBackup', () => {
    it('deve retornar null se não houver backup', () => {
      expect(getEmergencyBackup()).toBeNull();
    });

    it('deve retornar backup salvo', async () => {
      const mockCharacters: Character[] = [
        { id: '1', name: 'Test', level: 1 } as Character,
      ];
      mockedCharacterService.getAll.mockResolvedValue(mockCharacters);

      await saveEmergencyBackup();

      const backup = getEmergencyBackup();

      expect(backup).toBeTruthy();
      expect(backup?.count).toBe(1);
      expect(backup?.characters).toEqual(mockCharacters);
    });

    it('deve retornar null se backup for inválido', () => {
      localStorage.setItem('lite-sheets-emergency-backup', '{ invalid json');
      expect(getEmergencyBackup()).toBeNull();
    });
  });

  describe('clearEmergencyBackup', () => {
    it('deve remover backup de emergência', async () => {
      mockedCharacterService.getAll.mockResolvedValue([
        { id: '1', name: 'Test', level: 1 } as Character,
      ]);

      await saveEmergencyBackup();
      expect(localStorage.getItem('lite-sheets-emergency-backup')).toBeTruthy();

      clearEmergencyBackup();
      expect(localStorage.getItem('lite-sheets-emergency-backup')).toBeNull();
    });
  });

  describe('performFullBackup', () => {
    const mockCharacters: Character[] = [
      { id: '1', name: 'Frodo', level: 2 } as Character,
      { id: '2', name: 'Sam', level: 2 } as Character,
    ];

    beforeEach(() => {
      mockedCharacterService.getAll.mockResolvedValue(mockCharacters);
      mockedExportMultipleCharacters.mockResolvedValue();
    });

    it('deve realizar backup completo', async () => {
      const result = await performFullBackup();

      expect(result).toEqual({
        exported: 2,
        emergency: 2,
      });

      expect(mockedExportMultipleCharacters).toHaveBeenCalledWith(
        mockCharacters
      );
      expect(localStorage.getItem('lite-sheets-emergency-backup')).toBeTruthy();
      expect(localStorage.getItem('lite-sheets-last-backup')).toBeTruthy();
    });
  });
});
