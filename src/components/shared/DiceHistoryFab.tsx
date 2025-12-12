/**
 * DiceHistoryFab - Botão Flutuante de Histórico de Rolagens
 *
 * Botão FAB (Floating Action Button) fixo no canto inferior direito
 * que abre um drawer com o histórico completo de rolagens da sessão.
 *
 * Funcionalidades:
 * - Badge com contador de rolagens
 * - Drawer responsivo (bottom em mobile, right em desktop)
 * - Integração com DiceRollHistory
 * - Animação de entrada/saída
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Fab,
  Badge,
  Drawer,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Zoom,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import { globalDiceHistory } from '@/utils/diceRoller';
import { DiceRollHistory } from './DiceRollHistory';

export interface DiceHistoryFabProps {
  /**
   * Se deve exibir o FAB
   * @default true
   */
  show?: boolean;
}

/**
 * Botão flutuante para acessar histórico de rolagens
 */
export function DiceHistoryFab({ show = true }: DiceHistoryFabProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  /**
   * Atualiza contador de rolagens
   */
  useEffect(() => {
    const updateCount = () => {
      setHistoryCount(globalDiceHistory.size);
    };

    // Atualiza imediatamente
    updateCount();

    // Polling para manter atualizado
    const interval = setInterval(updateCount, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Abre o drawer
   */
  const handleOpen = () => {
    setOpen(true);
  };

  /**
   * Fecha o drawer
   */
  const handleClose = () => {
    setOpen(false);
  };

  if (!show) {
    return null;
  }

  return (
    <>
      {/* FAB com badge de contador */}
      <Zoom in={show} timeout={300}>
        <Fab
          color="primary"
          aria-label="Abrir histórico de rolagens"
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 24 },
            right: { xs: 16, md: 24 },
            zIndex: (theme) => theme.zIndex.speedDial,
            boxShadow: 6,
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: 12,
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <Badge
            badgeContent={historyCount}
            color="secondary"
            max={99}
            overlap="circular"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                fontWeight: 600,
                minWidth: 20,
                height: 20,
              },
            }}
          >
            <HistoryIcon />
          </Badge>
        </Fab>
      </Zoom>

      {/* Drawer com histórico */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : { sm: 400, md: 500 },
            maxWidth: '100vw',
            height: isMobile ? '80vh' : '100%',
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
          },
        }}
        role="complementary"
        aria-labelledby="dice-history-title"
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon color="primary" />
              <Typography
                id="dice-history-title"
                variant="h6"
                component="h2"
                fontWeight={600}
              >
                Histórico de Rolagens
              </Typography>
              <Badge
                badgeContent={historyCount}
                color="secondary"
                sx={{
                  ml: 1,
                  '& .MuiBadge-badge': {
                    position: 'static',
                    transform: 'none',
                  },
                }}
              />
            </Box>
            <IconButton
              onClick={handleClose}
              aria-label="Fechar histórico"
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Conteúdo do histórico */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
            }}
          >
            <DiceRollHistory
              maxEntries={50}
              expandable={true}
              onClear={handleClose}
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default DiceHistoryFab;
