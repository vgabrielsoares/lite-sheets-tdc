/**
 * WizardNavigation - Botões de navegação do wizard
 *
 * Componente que exibe os botões de navegação (Voltar, Próximo, Criar)
 * e gerencia as ações de navegação do wizard de criação.
 */

'use client';

import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  RestartAlt as RestartIcon,
} from '@mui/icons-material';

interface WizardNavigationProps {
  /** Se é o primeiro passo */
  isFirstStep: boolean;
  /** Se é o último passo */
  isLastStep: boolean;
  /** Se está processando (loading) */
  isLoading?: boolean;
  /** Se pode avançar (validação) */
  canProceed?: boolean;
  /** Callback ao clicar em Voltar */
  onBack: () => void;
  /** Callback ao clicar em Próximo */
  onNext: () => void;
  /** Callback ao clicar em Criar Personagem (último passo) */
  onCommit: () => void;
  /** Callback ao clicar em Cancelar */
  onCancel: () => void;
  /** Callback ao clicar em Reiniciar */
  onReset?: () => void;
  /** Texto customizado para o botão de avançar */
  nextLabel?: string;
  /** Mostrar botão de reiniciar */
  showResetButton?: boolean;
}

/**
 * Componente de navegação do wizard
 */
export function WizardNavigation({
  isFirstStep,
  isLastStep,
  isLoading = false,
  canProceed = true,
  onBack,
  onNext,
  onCommit,
  onCancel,
  onReset,
  nextLabel,
  showResetButton = false,
}: WizardNavigationProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    setCancelDialogOpen(false);
    onCancel();
  };

  const handleResetClick = () => {
    setResetDialogOpen(true);
  };

  const handleConfirmReset = () => {
    setResetDialogOpen(false);
    onReset?.();
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          pt: 3,
          borderTop: 1,
          borderColor: 'divider',
          flexWrap: 'wrap',
        }}
      >
        {/* Botões da esquerda */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CloseIcon />}
            onClick={handleCancelClick}
            disabled={isLoading}
            size="medium"
          >
            Cancelar
          </Button>

          {showResetButton && onReset && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RestartIcon />}
              onClick={handleResetClick}
              disabled={isLoading}
              size="medium"
            >
              Reiniciar
            </Button>
          )}
        </Box>

        {/* Botões da direita */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Botão Voltar */}
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            disabled={isFirstStep || isLoading}
            size="large"
          >
            Voltar
          </Button>

          {/* Botão Próximo ou Criar */}
          {isLastStep ? (
            <Button
              variant="contained"
              color="success"
              startIcon={
                isLoading ? <CircularProgress size={20} /> : <CheckIcon />
              }
              onClick={onCommit}
              disabled={isLoading || !canProceed}
              size="large"
              sx={{ minWidth: 180 }}
            >
              {isLoading ? 'Criando...' : 'Criar Personagem'}
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={onNext}
              disabled={isLoading}
              size="large"
            >
              {nextLabel || 'Próximo'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Dialog de confirmação de cancelamento */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="cancel-dialog-title"
      >
        <DialogTitle id="cancel-dialog-title">Cancelar Criação?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja cancelar a criação do personagem? Seu
            progresso será salvo e você poderá continuar depois.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Continuar Criando
          </Button>
          <Button onClick={handleConfirmCancel} color="error" autoFocus>
            Cancelar e Sair
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação de reset */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        aria-labelledby="reset-dialog-title"
      >
        <DialogTitle id="reset-dialog-title" color="warning.main">
          Reiniciar do Zero?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja reiniciar a criação? Todo o progresso será
            perdido e você começará do passo 1.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>
            Manter Progresso
          </Button>
          <Button onClick={handleConfirmReset} color="warning" autoFocus>
            Reiniciar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default WizardNavigation;
