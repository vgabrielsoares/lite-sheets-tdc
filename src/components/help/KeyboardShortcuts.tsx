'use client';

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
} from '@mui/material';
import KeyboardIcon from '@mui/icons-material/Keyboard';

/**
 * Atalho de teclado
 */
interface Shortcut {
  keys: string[];
  description: string;
  context: string;
}

/**
 * Atalhos de teclado do sistema
 */
const SHORTCUTS: Shortcut[] = [
  // Navegação Geral
  {
    keys: ['Tab'],
    description: 'Navegar entre elementos interativos',
    context: 'Geral',
  },
  {
    keys: ['Shift', 'Tab'],
    description: 'Navegar para trás entre elementos',
    context: 'Geral',
  },
  {
    keys: ['Enter'],
    description: 'Ativar elemento focado / Confirmar edição',
    context: 'Geral',
  },
  {
    keys: ['Esc'],
    description: 'Cancelar edição / Fechar modal ou sidebar',
    context: 'Geral',
  },

  // Edição de Campos
  {
    keys: ['Enter'],
    description: 'Confirmar alteração em campo editável',
    context: 'Edição',
  },
  {
    keys: ['Esc'],
    description: 'Cancelar edição e restaurar valor original',
    context: 'Edição',
  },
  {
    keys: ['Duplo Clique'],
    description: 'Ativar edição direta em valores de PV/PP',
    context: 'Edição',
  },

  // Sistema de Rolagem
  {
    keys: ['Duplo Clique'],
    description: 'Rolar dados rapidamente (resultado em modal temporário)',
    context: 'Rolagem',
  },
  {
    keys: ['Clique'],
    description: 'Abrir configuração de rolagem',
    context: 'Rolagem',
  },

  // Navegação por Abas
  {
    keys: ['←', '→'],
    description: 'Navegar entre abas da ficha (quando aba focada)',
    context: 'Ficha',
  },

  // Ações Rápidas
  {
    keys: ['Ctrl', 'S'],
    description: 'Salvar alterações (auto-save já ativo)',
    context: 'Ações',
  },
];

/**
 * Componente de Atalhos de Teclado
 *
 * Exibe todos os atalhos de teclado disponíveis no sistema,
 * organizados por contexto de uso.
 *
 * Funcionalidades:
 * - Tabela responsiva com atalhos
 * - Agrupamento por contexto
 * - Chips visuais para teclas
 * - Acessível para leitores de tela
 *
 * @example
 * ```tsx
 * <KeyboardShortcuts />
 * ```
 */
export default function KeyboardShortcuts() {
  const theme = useTheme();

  // Agrupa atalhos por contexto
  const groupedShortcuts = SHORTCUTS.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.context]) {
        acc[shortcut.context] = [];
      }
      acc[shortcut.context].push(shortcut);
      return acc;
    },
    {} as Record<string, Shortcut[]>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <KeyboardIcon color="primary" fontSize="large" />
        <Typography variant="h5" component="h2" fontWeight={600}>
          Atalhos de Teclado
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        O Lite Sheets TDC é totalmente navegável por teclado. Confira os atalhos
        disponíveis:
      </Typography>

      {Object.entries(groupedShortcuts).map(([context, shortcuts]) => (
        <Box key={context} sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            component="h3"
            fontWeight={600}
            sx={{ mb: 2 }}
          >
            {context}
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Table size="small" aria-label={`Atalhos de ${context}`}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      bgcolor: 'action.hover',
                      width: '35%',
                    }}
                  >
                    Teclas
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>
                    Ação
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shortcuts.map((shortcut, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {shortcut.keys.map((key, keyIndex) => (
                          <Box
                            key={keyIndex}
                            sx={{ display: 'flex', alignItems: 'center' }}
                          >
                            <Chip
                              label={key}
                              size="small"
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                bgcolor:
                                  theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'rgba(0, 0, 0, 0.08)',
                                border: '1px solid',
                                borderColor:
                                  theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.2)'
                                    : 'rgba(0, 0, 0, 0.12)',
                              }}
                            />
                            {keyIndex < shortcut.keys.length - 1 && (
                              <Typography
                                variant="body2"
                                sx={{ mx: 0.5, color: 'text.secondary' }}
                              >
                                +
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {shortcut.description}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mt: 3,
          borderRadius: 2,
          bgcolor: 'info.50',
          borderColor: 'info.main',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          <strong>Dica:</strong> Todos os campos editáveis podem ser navegados
          com Tab. Pressione Enter para editar e Esc para cancelar. O sistema
          salva automaticamente todas as alterações.
        </Typography>
      </Paper>
    </Box>
  );
}
