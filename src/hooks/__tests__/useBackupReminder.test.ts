/**
 * Testes para useBackupReminder hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useBackupReminder } from '../useBackupReminder';
import * as backupService from '@/services/backupService';

// Mock do backupService
jest.mock('@/services/backupService');

const mockedBackupService = backupService as jest.Mocked<typeof backupService>;

describe('useBackupReminder', () => {
  const mockStatus: backupService.BackupStatus = {
    lastBackup: null,
    daysSinceLastBackup: null,
    frequency: 'WEEKLY',
    shouldShowReminder: false,
    isDismissed: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock padrão do getBackupStatus
    mockedBackupService.getBackupStatus.mockReturnValue(mockStatus);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Estado inicial', () => {
    it('deve inicializar com status do backupService', () => {
      const { result } = renderHook(() => useBackupReminder());

      expect(result.current.status).toEqual(mockStatus);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockedBackupService.getBackupStatus).toHaveBeenCalledTimes(1);
    });

    it('deve fornecer todas as funções necessárias', () => {
      const { result } = renderHook(() => useBackupReminder());

      expect(typeof result.current.performBackup).toBe('function');
      expect(typeof result.current.exportOnly).toBe('function');
      expect(typeof result.current.dismiss).toBe('function');
      expect(typeof result.current.updateFrequency).toBe('function');
      expect(typeof result.current.refreshStatus).toBe('function');
    });
  });

  describe('refreshStatus', () => {
    it('deve atualizar status ao chamar refreshStatus', () => {
      const { result } = renderHook(() => useBackupReminder());

      const newStatus: backupService.BackupStatus = {
        ...mockStatus,
        shouldShowReminder: true,
        daysSinceLastBackup: 10,
      };

      mockedBackupService.getBackupStatus.mockReturnValue(newStatus);

      act(() => {
        result.current.refreshStatus();
      });

      expect(result.current.status).toEqual(newStatus);
      expect(mockedBackupService.getBackupStatus).toHaveBeenCalledTimes(2);
    });
  });

  describe('Atualização periódica', () => {
    it('deve atualizar status a cada 5 minutos', () => {
      renderHook(() => useBackupReminder());

      expect(mockedBackupService.getBackupStatus).toHaveBeenCalledTimes(1);

      // Avança 5 minutos
      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(mockedBackupService.getBackupStatus).toHaveBeenCalledTimes(2);

      // Avança mais 5 minutos
      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(mockedBackupService.getBackupStatus).toHaveBeenCalledTimes(3);
    });

    it('deve limpar interval ao desmontar', () => {
      const { unmount } = renderHook(() => useBackupReminder());

      unmount();

      // Avança tempo
      act(() => {
        jest.advanceTimersByTime(10 * 60 * 1000);
      });

      // Não deve ter chamado novamente após desmontagem
      expect(mockedBackupService.getBackupStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('performBackup', () => {
    it('deve realizar backup completo com sucesso', async () => {
      mockedBackupService.performFullBackup.mockResolvedValue({
        exported: 5,
        emergency: 5,
      });

      const { result } = renderHook(() => useBackupReminder());

      expect(result.current.isLoading).toBe(false);

      let promise: Promise<void>;
      act(() => {
        promise = result.current.performBackup();
      });

      // Deve estar carregando
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();

      await act(async () => {
        await promise;
      });

      // Deve ter completado
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockedBackupService.performFullBackup).toHaveBeenCalledTimes(1);
      // Deve ter atualizado status após backup
      expect(mockedBackupService.getBackupStatus).toHaveBeenCalledTimes(2);
    });

    it('deve tratar erros ao realizar backup', async () => {
      const errorMessage = 'Erro ao fazer backup';
      mockedBackupService.performFullBackup.mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useBackupReminder());

      let promise: Promise<void>;
      act(() => {
        promise = result.current.performBackup();
      });

      await act(async () => {
        try {
          await promise;
        } catch (error) {
          // Erro esperado
        }
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('deve permitir múltiplos backups se necessário', async () => {
      mockedBackupService.performFullBackup.mockResolvedValue({
        exported: 1,
        emergency: 1,
      });

      const { result } = renderHook(() => useBackupReminder());

      // Primeiro backup
      await act(async () => {
        await result.current.performBackup();
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockedBackupService.performFullBackup).toHaveBeenCalledTimes(1);

      // Segundo backup (deve ser permitido)
      await act(async () => {
        await result.current.performBackup();
      });

      expect(mockedBackupService.performFullBackup).toHaveBeenCalledTimes(2);
    });
  });

  describe('exportOnly', () => {
    it('deve exportar fichas com sucesso', async () => {
      mockedBackupService.exportAllCharactersOnly.mockResolvedValue(3);

      const { result } = renderHook(() => useBackupReminder());

      let promise: Promise<void>;
      act(() => {
        promise = result.current.exportOnly();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockedBackupService.exportAllCharactersOnly).toHaveBeenCalledTimes(
        1
      );
      // NÃO deve atualizar status (comentário do código: refreshStatus removido intencionalmente)
      expect(mockedBackupService.getBackupStatus).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao exportar', async () => {
      const errorMessage = 'Erro ao exportar';
      mockedBackupService.exportAllCharactersOnly.mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useBackupReminder());

      let promise: Promise<void>;
      act(() => {
        promise = result.current.exportOnly();
      });

      await act(async () => {
        try {
          await promise;
        } catch (error) {
          // Erro esperado
        }
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('dismiss', () => {
    it('deve dispensar lembrete e atualizar status', () => {
      const { result } = renderHook(() => useBackupReminder());

      act(() => {
        result.current.dismiss();
      });

      expect(mockedBackupService.dismissReminder).toHaveBeenCalledTimes(1);
      // Deve ter atualizado status após dispensar
      expect(mockedBackupService.getBackupStatus).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateFrequency', () => {
    it('deve atualizar frequência e status', () => {
      const { result } = renderHook(() => useBackupReminder());

      act(() => {
        result.current.updateFrequency('DAILY');
      });

      expect(mockedBackupService.setBackupFrequency).toHaveBeenCalledWith(
        'DAILY'
      );
      // Deve ter atualizado status após mudança de frequência
      expect(mockedBackupService.getBackupStatus).toHaveBeenCalledTimes(2);
    });

    it('deve aceitar todas as frequências válidas', () => {
      const { result } = renderHook(() => useBackupReminder());

      const frequencies: backupService.BackupFrequency[] = [
        'DAILY',
        'WEEKLY',
        'BIWEEKLY',
        'MONTHLY',
        'NEVER',
      ];

      frequencies.forEach((freq) => {
        act(() => {
          result.current.updateFrequency(freq);
        });

        expect(mockedBackupService.setBackupFrequency).toHaveBeenCalledWith(
          freq
        );
      });

      // 1 inicial + 5 atualizações
      expect(mockedBackupService.getBackupStatus).toHaveBeenCalledTimes(6);
    });
  });

  describe('Tratamento de erros desconhecidos', () => {
    it('deve tratar erros que não são Error ao fazer backup', async () => {
      mockedBackupService.performFullBackup.mockRejectedValue('String de erro');

      const { result } = renderHook(() => useBackupReminder());

      let promise: Promise<void>;
      act(() => {
        promise = result.current.performBackup();
      });

      await act(async () => {
        try {
          await promise;
        } catch (error) {
          // Erro esperado
        }
      });

      expect(result.current.error).toBe('Erro desconhecido ao realizar backup');
    });

    it('deve tratar erros que não são Error ao exportar', async () => {
      mockedBackupService.exportAllCharactersOnly.mockRejectedValue(
        'String de erro'
      );

      const { result } = renderHook(() => useBackupReminder());

      let promise: Promise<void>;
      act(() => {
        promise = result.current.exportOnly();
      });

      await act(async () => {
        try {
          await promise;
        } catch (error) {
          // Erro esperado
        }
      });

      expect(result.current.error).toBe('Erro desconhecido ao exportar fichas');
    });
  });

  describe('Estado de erro', () => {
    it('deve limpar erro ao fazer nova operação bem-sucedida', async () => {
      // Primeiro, causa um erro
      mockedBackupService.performFullBackup.mockRejectedValueOnce(
        new Error('Erro 1')
      );

      const { result } = renderHook(() => useBackupReminder());

      await act(async () => {
        try {
          await result.current.performBackup();
        } catch (error) {
          // Erro esperado
        }
      });

      expect(result.current.error).toBe('Erro 1');

      // Agora faz backup com sucesso
      mockedBackupService.performFullBackup.mockResolvedValue({
        exported: 1,
        emergency: 1,
      });

      await act(async () => {
        await result.current.performBackup();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
