'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Collapse,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/**
 * Representa uma seção no índice
 */
export interface TOCSection {
  /** ID único da seção (usado para scroll) */
  id: string;
  /** Título exibido no índice */
  label: string;
  /** Ícone opcional para a seção */
  icon?: React.ReactNode;
  /** Subseções (nível 2) */
  children?: TOCSection[];
}

export interface TableOfContentsProps {
  /**
   * Controla se o TOC está aberto
   */
  open: boolean;

  /**
   * Callback chamado ao fechar o TOC
   */
  onClose: () => void;

  /**
   * Callback chamado ao abrir o TOC
   */
  onOpen: () => void;

  /**
   * Título do TOC
   * @default "Índice"
   */
  title?: string;

  /**
   * Seções a serem exibidas no índice
   */
  sections: TOCSection[];

  /**
   * Se true, fecha TOC ao pressionar ESC
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Callback quando uma seção é clicada
   */
  onSectionClick?: (sectionId: string) => void;
}

const TOC_WIDTH = 280; // Largura fixa do TOC
const HEADER_OFFSET = 130; // Offset para compensar header fixo (breadcrumb + tabs + padding)

/**
 * Componente Table of Contents (Índice)
 *
 * Este componente fornece um índice de navegação fixo no lado esquerdo da ficha.
 * Permite navegação rápida entre as seções da ficha do personagem.
 *
 * Características:
 * - Posição fixa no lado esquerdo da ficha
 * - Colapsa para um botão quando fechado
 * - Suporta seções e subseções
 * - Scroll suave até a seção clicada
 * - Fecha com tecla ESC
 *
 * @example
 * ```tsx
 * const sections = [
 *   { id: 'basic-stats', label: 'Informações Básicas', icon: <PersonIcon /> },
 *   { id: 'attributes', label: 'Atributos', icon: <FitnessCenterIcon /> },
 * ];
 *
 * <TableOfContents
 *   open={tocOpen}
 *   onOpen={() => setTocOpen(true)}
 *   onClose={() => setTocOpen(false)}
 *   sections={sections}
 *   onSectionClick={(id) => scrollToSection(id)}
 * />
 * ```
 */
export function TableOfContents({
  open,
  onClose,
  onOpen,
  title = 'Índice',
  sections,
  closeOnEscape = true,
  onSectionClick,
}: TableOfContentsProps) {
  // Estado para controlar expansão de subseções
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  /**
   * Fecha TOC ao pressionar ESC
   */
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  /**
   * Alterna expansão de uma seção com subseções
   */
  const toggleExpanded = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  /**
   * Scroll suave até a seção clicada com offset para header fixo
   */
  const handleSectionClick = (sectionId: string) => {
    // Scroll to element with offset for fixed header
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - HEADER_OFFSET;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    // Callback
    onSectionClick?.(sectionId);
  };

  // Botão flutuante quando fechado
  if (!open) {
    return (
      <Tooltip title="Abrir Índice" placement="right" arrow>
        <Paper
          elevation={2}
          sx={{
            position: 'fixed',
            top: 150,
            left: {
              xs: 16,
              lg: `calc((100vw - 900px) / 2 - 60px)`,
            },
            zIndex: 1000,
            borderRadius: '50%',
          }}
        >
          <IconButton
            onClick={onOpen}
            aria-label="Abrir índice"
            color="primary"
            sx={{
              width: 48,
              height: 48,
            }}
          >
            <MenuOpenIcon />
          </IconButton>
        </Paper>
      </Tooltip>
    );
  }

  return (
    <Paper
      elevation={2}
      role="navigation"
      aria-label={title}
      sx={{
        width: TOC_WIDTH,
        maxWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 150,
        // Posicionado à esquerda da ficha
        left: {
          xs: 16,
          lg: `calc((100vw - 900px) / 2 - ${TOC_WIDTH}px - 24px)`,
        },
        maxHeight: 'calc(100vh - 220px)',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 56,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="subtitle1"
          component="h2"
          id="toc-title"
          sx={{ fontWeight: 600 }}
        >
          {title}
        </Typography>

        <IconButton
          onClick={onClose}
          aria-label={`Fechar ${title}`}
          size="small"
          sx={{
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider />

      {/* Lista de Seções */}
      <Box
        role="region"
        aria-labelledby="toc-title"
        sx={{
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'action.hover',
            borderRadius: '3px',
            '&:hover': {
              bgcolor: 'action.selected',
            },
          },
        }}
      >
        <List dense disablePadding>
          {sections.map((section) => (
            <React.Fragment key={section.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (section.children && section.children.length > 0) {
                      toggleExpanded(section.id);
                    } else {
                      handleSectionClick(section.id);
                    }
                  }}
                  sx={{
                    py: 1,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  {section.icon && (
                    <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                      {section.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={section.label}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 500,
                    }}
                  />
                  {section.children &&
                    section.children.length > 0 &&
                    (expandedSections.has(section.id) ? (
                      <ExpandLessIcon fontSize="small" color="action" />
                    ) : (
                      <ExpandMoreIcon fontSize="small" color="action" />
                    ))}
                </ListItemButton>
              </ListItem>

              {/* Subseções */}
              {section.children && section.children.length > 0 && (
                <Collapse in={expandedSections.has(section.id)}>
                  <List dense disablePadding>
                    {section.children.map((child) => (
                      <ListItem key={child.id} disablePadding>
                        <ListItemButton
                          onClick={() => handleSectionClick(child.id)}
                          sx={{
                            py: 0.75,
                            pl: 5,
                            pr: 2,
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          {child.icon && (
                            <ListItemIcon
                              sx={{ minWidth: 28, color: 'text.secondary' }}
                            >
                              {child.icon}
                            </ListItemIcon>
                          )}
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{
                              variant: 'caption',
                              color: 'text.secondary',
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Paper>
  );
}
