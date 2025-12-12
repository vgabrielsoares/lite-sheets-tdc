import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  Typography,
  IconButton,
  Slide,
} from '@mui/material';
import { SlideProps } from '@mui/material/Slide';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

/**
 * Transição de slide para o Snackbar
 */
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

/**
 * Componente de prompt customizado para instalação PWA
 *
 * Exibe um banner elegante convidando o usuário a instalar
 * a aplicação como PWA no dispositivo.
 *
 * Features:
 * - Detecção automática de disponibilidade de instalação
 * - Respeita preferência do usuário (não mostrar novamente)
 * - Design responsivo e acessível
 * - Animação suave de entrada/saída
 * - Integrado com tema claro/escuro
 * - Auto-dismiss após 15 segundos ou em ação do usuário
 *
 * O prompt é exibido automaticamente após 3 segundos quando:
 * - A instalação está disponível
 * - O app ainda não está instalado
 * - O usuário não dismissou anteriormente
 *
 * @example
 * // Em layout.tsx:
 * <InstallPrompt />
 */
export function InstallPrompt() {
  const { canInstall, isInstalled, promptInstall, dismissPrompt } =
    useInstallPrompt();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Aguardar 3 segundos antes de exibir o prompt
    // para não interferir com a primeira impressão do usuário
    if (canInstall && !isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled]);

  /**
   * Handler para botão de instalação
   */
  const handleInstall = async () => {
    setIsInstalling(true);

    try {
      const installed = await promptInstall();

      if (installed) {
        // Fechar o prompt após instalação bem-sucedida
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  /**
   * Handler para fechar o prompt
   */
  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    // Não fechar automaticamente se usuário está instalando
    if (reason === 'clickaway' && isInstalling) {
      return;
    }

    setShowPrompt(false);
  };

  /**
   * Handler para dispensar permanentemente
   */
  const handleDismiss = () => {
    dismissPrompt();
    setShowPrompt(false);
  };

  // Não renderizar se não pode instalar ou já está instalado
  if (!canInstall || isInstalled) {
    return null;
  }

  return (
    <Snackbar
      open={showPrompt}
      autoHideDuration={15000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={SlideTransition}
      sx={{ mb: 2 }}
    >
      <Alert
        severity="info"
        variant="filled"
        icon={<PhoneIphoneIcon />}
        sx={{
          width: '100%',
          minWidth: { xs: '90vw', sm: '500px' },
          maxWidth: '600px',
          alignItems: 'center',
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          '& .MuiAlert-icon': {
            color: 'primary.contrastText',
          },
        }}
        action={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Botão de Instalar */}
            <Button
              variant="contained"
              size="small"
              onClick={handleInstall}
              disabled={isInstalling}
              startIcon={<GetAppIcon />}
              sx={{
                backgroundColor: 'background.paper',
                color: 'primary.main',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'background.default',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'action.disabled',
                },
              }}
              aria-label="Instalar aplicativo"
            >
              {isInstalling ? 'Instalando...' : 'Instalar'}
            </Button>

            {/* Botão de Fechar */}
            <IconButton
              size="small"
              onClick={handleDismiss}
              disabled={isInstalling}
              sx={{
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              aria-label="Não mostrar novamente"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <Box>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            Instalar Lite Sheets TDC
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.95 }}>
            Instale o app para acesso rápido e experiência completa offline!
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
}
