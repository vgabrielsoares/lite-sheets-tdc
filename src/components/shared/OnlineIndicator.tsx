'use client';

import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Slide, Box, Typography } from '@mui/material';
import { SlideProps } from '@mui/material/Slide';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * Transição de slide para o Snackbar
 */
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

/**
 * Componente que exibe indicador de status online/offline
 *
 * Mostra notificações quando a conexão muda de estado:
 * - Alerta vermelho quando fica offline
 * - Notificação verde quando volta online
 *
 * Features:
 * - Auto-dismiss após 6 segundos (online) ou persiste (offline)
 * - Ícones visuais (Wifi/WifiOff)
 * - Cores semânticas (success/error)
 * - Animação suave de entrada/saída
 * - Posicionamento top-center
 *
 * @example
 * // Em _app.tsx ou layout:
 * <OnlineIndicator />
 */
export function OnlineIndicator() {
  const isOnline = useOnlineStatus();
  const [showNotification, setShowNotification] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Na primeira renderização, não mostrar nada
    if (wasOffline === false && !isOnline) {
      setWasOffline(true);
      setShowNotification(true);
      return;
    }

    // Se estava offline e voltou online
    if (wasOffline && isOnline) {
      setShowNotification(true);
      setWasOffline(false);
    }

    // Se ficou offline
    if (!wasOffline && !isOnline) {
      setShowNotification(true);
      setWasOffline(true);
    }
  }, [isOnline, wasOffline]);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    // Não fechar se clicar fora quando estiver offline
    if (reason === 'clickaway' && !isOnline) {
      return;
    }
    setShowNotification(false);
  };

  return (
    <Snackbar
      open={showNotification}
      autoHideDuration={isOnline ? 6000 : null}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={SlideTransition}
      sx={{ mt: 8 }}
    >
      <Alert
        onClose={handleClose}
        severity={isOnline ? 'success' : 'error'}
        variant="filled"
        icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
        sx={{
          width: '100%',
          minWidth: { xs: '90vw', sm: '400px' },
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="body1" fontWeight="bold">
            {isOnline ? 'Conexão Restabelecida' : 'Você está Offline'}
          </Typography>
          <Typography variant="body2">
            {isOnline
              ? 'Sua conexão com a internet foi restaurada.'
              : 'Não se preocupe, você pode continuar usando o app offline.'}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
}

export default OnlineIndicator;
