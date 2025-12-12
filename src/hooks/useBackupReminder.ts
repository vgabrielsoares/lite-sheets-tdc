import { useState, useEffect, useCallback } from 'react';
import {
  getBackupStatus,
  dismissReminder,
  performFullBackup,
  exportAllCharacters,
  exportAllCharactersOnly,
  getBackupFrequency,
  setBackupFrequency,
  type BackupFrequency,
  type BackupStatus,
} from '@/services/backupService';

/**
 * Interface de retorno do hook useBackupReminder
 */
export interface UseBackupReminderReturn {
  /** Status atual do backup */
  status: BackupStatus;
  /** Se está processando backup */
  isLoading: boolean;
  /** Erro, se houver */
  error: string | null;
  /** Realiza backup completo (exportação + localStorage) */
  performBackup: () => Promise<void>;
  /** Exporta apenas para arquivo */
  exportOnly: () => Promise<void>;
  /** Dispensa lembrete por 24h */
  dismiss: () => void;
  /** Atualiza frequência de backup */
  updateFrequency: (frequency: BackupFrequency) => void;
  /** Força atualização do status */
  refreshStatus: () => void;
}

/**
 * Hook para gerenciar lembretes de backup automático
 *
 * Este hook monitora a necessidade de backup baseado na frequência
 * configurada e na data do último backup realizado.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     status,
 *     isLoading,
 *     performBackup,
 *     dismiss,
 *   } = useBackupReminder();
 *
 *   if (!status.shouldShowReminder) return null;
 *
 *   return (
 *     <Alert severity="warning">
 *       Você não faz backup há {status.daysSinceLastBackup} dias
 *       <Button onClick={performBackup} disabled={isLoading}>
 *         Fazer Backup
 *       </Button>
 *       <Button onClick={dismiss}>Lembrar Depois</Button>
 *     </Alert>
 *   );
 * }
 * ```
 */
export function useBackupReminder(): UseBackupReminderReturn {
  const [status, setStatus] = useState<BackupStatus>(() => getBackupStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Atualiza o status do backup
   */
  const refreshStatus = useCallback(() => {
    const newStatus = getBackupStatus();
    setStatus(newStatus);
  }, []);

  /**
   * Verifica status periodicamente (a cada 5 minutos)
   */
  useEffect(() => {
    const interval = setInterval(
      () => {
        refreshStatus();
      },
      5 * 60 * 1000
    ); // 5 minutos

    return () => clearInterval(interval);
  }, [refreshStatus]);

  /**
   * Realiza backup completo (exportação + localStorage)
   */
  const performBackup = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await performFullBackup();
      console.log(
        `✅ Backup completo realizado: ${result.exported} fichas exportadas`
      );

      // Atualiza status após backup
      refreshStatus();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao realizar backup';
      console.error('❌ Erro ao realizar backup:', err);
      setError(errorMessage);
      throw err; // Re-lança para que o componente possa tratar
    } finally {
      setIsLoading(false);
    }
  }, [refreshStatus]);

  /**
   * Exporta apenas para arquivo (sem registrar backup)
   *
   * Esta função exporta as fichas mas NÃO:
   * - Atualiza timestamp do último backup
   * - Limpa dispensação do lembrete
   * - Afeta quando o próximo lembrete aparecerá
   *
   * Ideal para exportações rápidas sem afetar o sistema de lembretes.
   */
  const exportOnly = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const count = await exportAllCharactersOnly();
      console.log(
        `✅ Exportação realizada: ${count} fichas (sem registrar backup)`
      );

      // NÃO atualiza status - o lembrete continua programado
      // refreshStatus(); // Removido intencionalmente
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao exportar fichas';
      console.error('❌ Erro ao exportar fichas:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Dispensa lembrete por 24 horas
   */
  const dismiss = useCallback(() => {
    dismissReminder();
    refreshStatus();
  }, [refreshStatus]);

  /**
   * Atualiza frequência de backup
   */
  const updateFrequency = useCallback(
    (frequency: BackupFrequency) => {
      setBackupFrequency(frequency);
      refreshStatus();
    },
    [refreshStatus]
  );

  return {
    status,
    isLoading,
    error,
    performBackup,
    exportOnly,
    dismiss,
    updateFrequency,
    refreshStatus,
  };
}
