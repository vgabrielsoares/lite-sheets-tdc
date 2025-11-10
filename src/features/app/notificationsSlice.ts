import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Tipos de notificação (severidade)
 */
export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

/**
 * Interface de uma notificação
 */
export interface Notification {
  /** ID único da notificação */
  id: string;
  /** Mensagem a ser exibida */
  message: string;
  /** Tipo de notificação */
  severity: NotificationSeverity;
  /** Duração em ms (padrão: 6000) */
  duration?: number;
}

/**
 * Estado da slice de notificações
 */
interface NotificationsState {
  /** Lista de notificações ativas */
  notifications: Notification[];
}

/**
 * Estado inicial
 */
const initialState: NotificationsState = {
  notifications: [],
};

/**
 * Slice de notificações/toasts
 *
 * Gerencia exibição de mensagens de feedback para o usuário
 * via Snackbar (toasts).
 */
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Adiciona uma nova notificação
     */
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },

    /**
     * Remove uma notificação pelo ID
     */
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    /**
     * Remove todas as notificações
     */
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
