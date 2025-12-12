import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  Typography,
  IconButton,
  Slide,
  type SlideProps,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BackupIcon from '@mui/icons-material/Backup';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useBackupReminder } from '@/hooks/useBackupReminder';
import { useNotifications } from '@/hooks/useNotifications';
import {
  BACKUP_FREQUENCIES,
  type BackupFrequency,
} from '@/services/backupService';

/**
 * Transição de slide para o Snackbar
 */
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

/**
 * Componente de lembrete de backup automático
 *
 * Exibe um banner (Snackbar) quando é necessário fazer backup das fichas,
 * baseado na frequência configurada e no tempo desde o último backup.
 *
 * **Funcionalidades**:
 * - Lembrete periódico baseado em configuração (diário, semanal, etc.)
 * - Opção de backup completo (exportação + localStorage)
 * - Opção de exportar apenas para arquivo
 * - Configuração de frequência de lembretes
 * - Dispensa temporária (24h)
 *
 * **Integração**:
 * Deve ser adicionado ao layout root da aplicação para funcionar globalmente.
 *
 * @example
 * ```tsx
 * // src/app/layout.tsx
 * <body>
 *   <ReduxProvider>
 *     <ThemeProviderWrapper>
 *       {children}
 *       <BackupReminder />
 *     </ThemeProviderWrapper>
 *   </ReduxProvider>
 * </body>
 * ```
 */
export function BackupReminder() {
  const {
    status,
    isLoading,
    performBackup,
    exportOnly,
    dismiss,
    updateFrequency,
  } = useBackupReminder();
  const { showSuccess, showError } = useNotifications();

  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<BackupFrequency>(
    status.frequency
  );

  /**
   * Exibe banner após 5 segundos de carregamento da página
   * (para não atrapalhar experiência inicial)
   */
  useEffect(() => {
    if (status.shouldShowReminder) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 5000); // 5 segundos

      return () => clearTimeout(timer);
    }
  }, [status.shouldShowReminder]);

  /**
   * Atualiza frequência selecionada quando status muda
   */
  useEffect(() => {
    setSelectedFrequency(status.frequency);
  }, [status.frequency]);

  /**
   * Fecha banner
   */
  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    // Não fecha se clicar fora (clickaway)
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  /**
   * Realiza backup completo
   */
  const handleBackup = async () => {
    try {
      await performBackup();
      showSuccess('Backup realizado com sucesso!');
      setOpen(false);
    } catch (error) {
      showError('Erro ao realizar backup. Tente novamente.');
    }
  };

  /**
   * Exporta apenas para arquivo
   */
  const handleExportOnly = async () => {
    try {
      await exportOnly();
      showSuccess('Fichas exportadas com sucesso!');
      setOpen(false);
    } catch (error) {
      showError('Erro ao exportar fichas. Tente novamente.');
    }
  };

  /**
   * Dispensa lembrete temporariamente
   */
  const handleDismiss = () => {
    dismiss();
    setOpen(false);
    showSuccess('Lembrete dispensado por 24 horas');
  };

  /**
   * Abre configurações de frequência
   */
  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  /**
   * Fecha configurações
   */
  const handleCloseSettings = () => {
    setSettingsOpen(false);
    setSelectedFrequency(status.frequency); // Reverte alteração se cancelar
  };

  /**
   * Salva nova frequência
   */
  const handleSaveFrequency = () => {
    updateFrequency(selectedFrequency);
    setSettingsOpen(false);
    showSuccess(
      `Frequência de backup atualizada: ${getFrequencyLabel(selectedFrequency)}`
    );
  };

  /**
   * Retorna label amigável para frequência
   */
  const getFrequencyLabel = (freq: BackupFrequency): string => {
    const labels: Record<BackupFrequency, string> = {
      DAILY: 'Diário',
      WEEKLY: 'Semanal',
      BIWEEKLY: 'Quinzenal',
      MONTHLY: 'Mensal',
      NEVER: 'Nunca',
    };
    return labels[freq];
  };

  /**
   * Formata mensagem do lembrete
   */
  const getReminderMessage = (): string => {
    if (status.daysSinceLastBackup === null) {
      return 'Você ainda não fez backup das suas fichas.';
    }

    if (status.daysSinceLastBackup === 0) {
      return 'Hoje é dia de fazer backup das suas fichas!';
    }

    if (status.daysSinceLastBackup === 1) {
      return 'Você não faz backup há 1 dia.';
    }

    return `Você não faz backup há ${status.daysSinceLastBackup} dias.`;
  };

  // Não renderiza se não deve exibir lembrete
  if (!status.shouldShowReminder) {
    return null;
  }

  return (
    <>
      {/* Banner de Lembrete */}
      <Snackbar
        open={open}
        onClose={handleClose}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          bottom: { xs: 16, sm: 24 },
          '& .MuiSnackbarContent-root': {
            padding: 0,
          },
        }}
      >
        <Alert
          severity="warning"
          variant="filled"
          icon={<BackupIcon />}
          sx={{
            width: '100%',
            maxWidth: { xs: '90vw', sm: 600 },
            boxShadow: 4,
          }}
          action={
            <IconButton
              size="small"
              aria-label="fechar"
              color="inherit"
              onClick={handleClose}
              disabled={isLoading}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          <Box sx={{ pr: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Hora de fazer backup!
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
              {getReminderMessage()} Proteja suas fichas fazendo backup
              regularmente.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mt: 1.5,
              }}
            >
              <Button
                variant="contained"
                size="small"
                color="inherit"
                startIcon={
                  isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <BackupIcon />
                  )
                }
                onClick={handleBackup}
                disabled={isLoading}
                sx={{
                  bgcolor: 'background.paper',
                  color: 'warning.main',
                  '&:hover': {
                    bgcolor: 'background.default',
                  },
                }}
              >
                {isLoading ? 'Salvando...' : 'Fazer Backup'}
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="inherit"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportOnly}
                disabled={isLoading}
                sx={{
                  borderColor: 'background.paper',
                  color: 'background.paper',
                  '&:hover': {
                    borderColor: 'background.default',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Só Exportar
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="inherit"
                startIcon={<SettingsIcon />}
                onClick={handleOpenSettings}
                disabled={isLoading}
                sx={{
                  borderColor: 'background.paper',
                  color: 'background.paper',
                  '&:hover': {
                    borderColor: 'background.default',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Configurar
              </Button>

              <Button
                variant="text"
                size="small"
                color="inherit"
                onClick={handleDismiss}
                disabled={isLoading}
                sx={{
                  color: 'background.paper',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Lembrar Depois
              </Button>
            </Box>
          </Box>
        </Alert>
      </Snackbar>

      {/* Dialog de Configurações */}
      <Dialog
        open={settingsOpen}
        onClose={handleCloseSettings}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon />
            Configurações de Backup
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure com qual frequência você deseja ser lembrado de fazer
            backup das suas fichas.
          </Typography>

          <FormControl component="fieldset">
            <FormLabel component="legend">Frequência de Lembretes</FormLabel>
            <RadioGroup
              value={selectedFrequency}
              onChange={(e) =>
                setSelectedFrequency(e.target.value as BackupFrequency)
              }
            >
              {(Object.keys(BACKUP_FREQUENCIES) as BackupFrequency[]).map(
                (freq) => (
                  <FormControlLabel
                    key={freq}
                    value={freq}
                    control={<Radio />}
                    label={getFrequencyLabel(freq)}
                  />
                )
              )}
            </RadioGroup>
          </FormControl>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 2,
            }}
          >
            <LightbulbIcon color="warning" sx={{ fontSize: 18 }} />
            <Typography variant="caption" color="text.secondary">
              <strong>Dica:</strong> Recomendamos backups semanais para garantir
              a segurança das suas fichas.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseSettings} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSaveFrequency} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
