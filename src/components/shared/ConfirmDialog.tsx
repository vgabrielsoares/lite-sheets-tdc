'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

/**
 * Props do ConfirmDialog
 */
export interface ConfirmDialogProps {
  /** Se o diálogo está aberto */
  open: boolean;
  /** Título do diálogo */
  title: string;
  /** Mensagem de confirmação */
  message: string;
  /** Texto do botão de confirmação (padrão: "Confirmar") */
  confirmText?: string;
  /** Texto do botão de cancelamento (padrão: "Cancelar") */
  cancelText?: string;
  /** Cor do botão de confirmação (padrão: "error") */
  confirmColor?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success';
  /** Callback ao confirmar */
  onConfirm: () => void;
  /** Callback ao cancelar */
  onCancel: () => void;
  /** Se deve fechar ao clicar fora (padrão: true) */
  closeOnBackdropClick?: boolean;
  /** Se está processando a ação (desabilita botões) */
  loading?: boolean;
}

/**
 * Componente de diálogo de confirmação reutilizável
 *
 * Usado para confirmar ações destrutivas ou importantes.
 * Segue o padrão Material UI e boas práticas de acessibilidade.
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={isOpen}
 *   title="Deletar Personagem"
 *   message="Tem certeza que deseja deletar este personagem? Esta ação não pode ser desfeita."
 *   confirmText="Deletar"
 *   confirmColor="error"
 *   onConfirm={handleDelete}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'error',
  onConfirm,
  onCancel,
  closeOnBackdropClick = true,
  loading = false,
}: ConfirmDialogProps) {
  const handleBackdropClick = () => {
    if (closeOnBackdropClick && !loading) {
      onCancel();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleBackdropClick}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          disabled={loading}
          color="inherit"
          aria-label={cancelText}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          color={confirmColor}
          variant="contained"
          autoFocus
          aria-label={confirmText}
        >
          {loading ? 'Aguarde...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
