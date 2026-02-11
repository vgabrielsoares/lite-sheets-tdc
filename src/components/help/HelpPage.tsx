'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import SaveIcon from '@mui/icons-material/Save';
import CasinoIcon from '@mui/icons-material/Casino';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import FAQ from './FAQ';
import KeyboardShortcuts from './KeyboardShortcuts';
import ExportImportGuide from './ExportImportGuide';
import DiceRollingGuide from './DiceRollingGuide';
import RulesReference from './RulesReference';

/**
 * Tabs disponíveis na página de ajuda
 */
type HelpTab = 'faq' | 'keyboard' | 'export' | 'dice' | 'reference';

/**
 * Configuração das tabs
 */
const HELP_TABS = [
  { id: 'faq' as const, label: 'FAQ', icon: HelpOutlineIcon },
  { id: 'dice' as const, label: 'Sistema de Rolagem', icon: CasinoIcon },
  {
    id: 'reference' as const,
    label: 'Referências',
    icon: MenuBookIcon,
  },
  {
    id: 'export' as const,
    label: 'Exportar/Importar',
    icon: SaveIcon,
  },
  {
    id: 'keyboard' as const,
    label: 'Atalhos de Teclado',
    icon: KeyboardIcon,
  },
];

/**
 * Componente principal da Página de Ajuda
 *
 * Página central de documentação e ajuda do usuário, com navegação
 * por abas (desktop) ou dropdown (mobile).
 *
 * Funcionalidades:
 * - FAQ com perguntas frequentes
 * - Atalhos de teclado documentados
 * - Guia de exportação/importação
 * - Documentação do sistema de rolagem
 * - Navegação responsiva (tabs/dropdown)
 * - Acessível com ARIA labels
 *
 * @example
 * ```tsx
 * // Em uma rota Next.js app/help/page.tsx
 * <HelpPage />
 * ```
 */
export default function HelpPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentTab, setCurrentTab] = useState<HelpTab>('faq');

  const handleTabChange = (_: React.SyntheticEvent, newValue: HelpTab) => {
    setCurrentTab(newValue);
  };

  const handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCurrentTab(event.target.value as HelpTab);
  };

  /**
   * Renderiza conteúdo da tab ativa
   */
  const renderTabContent = () => {
    switch (currentTab) {
      case 'faq':
        return <FAQ />;
      case 'keyboard':
        return <KeyboardShortcuts />;
      case 'export':
        return <ExportImportGuide />;
      case 'dice':
        return <DiceRollingGuide />;
      case 'reference':
        return <RulesReference />;
      default:
        return <FAQ />;
    }
  };

  /**
   * Renderiza navegação (tabs para desktop, select para mobile)
   */
  const renderNavigation = () => {
    if (isMobile) {
      return (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="help-section-select-label">Seção de Ajuda</InputLabel>
          <Select
            labelId="help-section-select-label"
            id="help-section-select"
            value={currentTab}
            label="Seção de Ajuda"
            onChange={handleSelectChange as any}
          >
            {HELP_TABS.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <MenuItem key={tab.id} value={tab.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconComponent fontSize="small" />
                    {tab.label}
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      );
    }

    return (
      <Paper
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="Seções de ajuda"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {HELP_TABS.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                label={tab.label}
                icon={<IconComponent />}
                iconPosition="start"
                sx={{
                  minHeight: 64,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
                aria-label={`Ver ${tab.label}`}
              />
            );
          })}
        </Tabs>
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        component="header"
        sx={{
          mb: 4,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
          }}
        >
          <HelpOutlineIcon
            color="primary"
            sx={{ fontSize: { xs: 32, md: 40 } }}
          />
        </Box>
        <Box
          component="h1"
          sx={{
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
          }}
        >
          Central de Ajuda
        </Box>
        <Box
          component="p"
          sx={{
            fontSize: '1rem',
            color: 'text.secondary',
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Documentação completa do Lite Sheets TDC. Aprenda a criar fichas, usar
          o sistema de rolagem e aproveitar todos os recursos.
        </Box>
      </Box>

      {renderNavigation()}

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 2,
          minHeight: 400,
        }}
      >
        {renderTabContent()}
      </Paper>
    </Container>
  );
}
