import { Snackbar, Alert } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { useNotifications } from '@/hooks/useNotifications';

/**
 * Componente NotificationProvider
 *
 * Exibe notificações toast (Snackbar) com base no estado global.
 * Deve ser incluído no layout raiz da aplicação para funcionar
 * em todas as páginas.
 *
 * **Funcionalidades:**
 * - Exibe múltiplas notificações em sequência
 * - Auto-fechamento baseado em duração configurável
 * - Fechamento manual via botão X
 * - Diferentes severidades (success, error, warning, info)
 * - Posicionamento bottom-center responsivo
 *
 * @example
 * ```tsx
 * // No layout raiz
 * <ThemeProvider>
 *   <NotificationProvider />
 *   {children}
 * </ThemeProvider>
 * ```
 */
export default function NotificationProvider() {
  const notifications = useAppSelector(
    (state) => state.notifications.notifications
  );
  const { closeNotification } = useNotifications();

  // Exibe apenas a primeira notificação da fila
  const currentNotification = notifications[0];

  /**
   * Handler de fechamento do Snackbar
   */
  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    // Não fechar ao clicar fora
    if (reason === 'clickaway') {
      return;
    }

    if (currentNotification) {
      closeNotification(currentNotification.id);
    }
  };

  return (
    <Snackbar
      open={!!currentNotification}
      autoHideDuration={currentNotification?.duration || 6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        // Ajuste para mobile
        bottom: { xs: 16, sm: 24 },
      }}
    >
      {currentNotification && (
        <Alert
          onClose={handleClose}
          severity={currentNotification.severity}
          variant="filled"
          sx={{
            width: '100%',
            minWidth: { xs: '90vw', sm: 400 },
            maxWidth: { xs: '90vw', sm: 600 },
          }}
        >
          {currentNotification.message}
        </Alert>
      )}
    </Snackbar>
  );
}
