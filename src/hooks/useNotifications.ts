import { useCallback } from 'react';
import { uuidv4 } from '@/utils/uuid';
import { useAppDispatch } from '@/store/hooks';
import {
  addNotification,
  removeNotification,
  type NotificationSeverity,
} from '@/features/app/notificationsSlice';

/**
 * Opções para exibir notificação
 */
export interface ShowNotificationOptions {
  /** Mensagem a ser exibida */
  message: string;
  /** Tipo de notificação (padrão: 'info') */
  severity?: NotificationSeverity;
  /** Duração em ms (padrão: 6000) */
  duration?: number;
}

/**
 * Interface de retorno do hook useNotifications
 */
export interface UseNotificationsReturn {
  /** Exibe uma notificação genérica */
  showNotification: (options: ShowNotificationOptions) => void;
  /** Exibe uma notificação de sucesso */
  showSuccess: (message: string, duration?: number) => void;
  /** Exibe uma notificação de erro */
  showError: (message: string, duration?: number) => void;
  /** Exibe uma notificação de aviso */
  showWarning: (message: string, duration?: number) => void;
  /** Exibe uma notificação informativa */
  showInfo: (message: string, duration?: number) => void;
  /** Fecha uma notificação específica */
  closeNotification: (id: string) => void;
}

/**
 * Hook para exibir notificações toast
 *
 * Fornece métodos convenientes para exibir diferentes tipos de notificações
 * (sucesso, erro, aviso, info) com feedback visual ao usuário.
 *
 * @example
 * ```tsx
 * const { showSuccess, showError } = useNotifications();
 *
 * // Sucesso
 * showSuccess('Personagem criado com sucesso!');
 *
 * // Erro
 * showError('Erro ao salvar personagem');
 *
 * // Customizado
 * showNotification({
 *   message: 'Atenção!',
 *   severity: 'warning',
 *   duration: 3000
 * });
 * ```
 */
export function useNotifications(): UseNotificationsReturn {
  const dispatch = useAppDispatch();

  /**
   * Exibe uma notificação genérica
   */
  const showNotification = useCallback(
    ({
      message,
      severity = 'info',
      duration = 6000,
    }: ShowNotificationOptions) => {
      const id = uuidv4();
      dispatch(
        addNotification({
          id,
          message,
          severity,
          duration,
        })
      );
    },
    [dispatch]
  );

  /**
   * Exibe uma notificação de sucesso
   */
  const showSuccess = useCallback(
    (message: string, duration = 6000) => {
      showNotification({ message, severity: 'success', duration });
    },
    [showNotification]
  );

  /**
   * Exibe uma notificação de erro
   */
  const showError = useCallback(
    (message: string, duration = 6000) => {
      showNotification({ message, severity: 'error', duration });
    },
    [showNotification]
  );

  /**
   * Exibe uma notificação de aviso
   */
  const showWarning = useCallback(
    (message: string, duration = 6000) => {
      showNotification({ message, severity: 'warning', duration });
    },
    [showNotification]
  );

  /**
   * Exibe uma notificação informativa
   */
  const showInfo = useCallback(
    (message: string, duration = 6000) => {
      showNotification({ message, severity: 'info', duration });
    },
    [showNotification]
  );

  /**
   * Fecha uma notificação específica
   */
  const closeNotification = useCallback(
    (id: string) => {
      dispatch(removeNotification(id));
    },
    [dispatch]
  );

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeNotification,
  };
}
