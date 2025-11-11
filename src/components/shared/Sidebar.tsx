'use client';

import React from 'react';
import { Box, Typography, IconButton, Paper, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SIDEBAR_WIDTHS = {
  sm: 320,
  md: 480,
  lg: 640,
} as const;

export type SidebarWidth = keyof typeof SIDEBAR_WIDTHS;

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: SidebarWidth;
  anchor?: 'left' | 'right';
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Sidebar({
  open,
  onClose,
  title,
  width = 'md',
  children,
}: SidebarProps) {
  if (!open) {
    return null;
  }

  const sidebarWidth = SIDEBAR_WIDTHS[width];

  return (
    <Paper
      elevation={2}
      sx={{
        width: sidebarWidth,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 64,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          {title || 'Detalhes'}
        </Typography>

        <IconButton
          onClick={onClose}
          aria-label="Fechar sidebar"
          size="small"
          sx={{
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'action.hover',
            borderRadius: '4px',
            '&:hover': {
              bgcolor: 'action.selected',
            },
          },
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}
