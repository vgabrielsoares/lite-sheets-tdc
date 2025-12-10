'use client';

import React from 'react';
import {
  Tabs,
  Tab,
  Box,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  IconButton,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

/**
 * Abas disponíveis na ficha de personagem
 */
export const CHARACTER_TABS = [
  { id: 'main', label: 'Principal' },
  { id: 'combat', label: 'Combate' },
  { id: 'archetypes', label: 'Arquétipos' },
  { id: 'resources', label: 'Recursos' },
  { id: 'inventory', label: 'Inventário' },
  { id: 'spells', label: 'Feitiços' },
  { id: 'description', label: 'Descrição' },
  { id: 'notes', label: 'Anotações' },
] as const;

export type CharacterTabId = (typeof CHARACTER_TABS)[number]['id'];

export interface TabNavigationProps {
  /**
   * Aba atualmente selecionada
   */
  currentTab: CharacterTabId;

  /**
   * Callback quando a aba é alterada
   */
  onTabChange: (tab: CharacterTabId) => void;
}

/**
 * Componente de Navegação por Abas da Ficha de Personagem
 *
 * Responsivo:
 * - Desktop: Tabs horizontais (Material UI Tabs)
 * - Mobile: Menu dropdown
 *
 * Funcionalidades:
 * - Navegação entre as 8 abas da ficha
 * - Adaptação automática mobile/desktop
 * - Indicador visual da aba ativa
 * - Acessível via teclado
 *
 * @example
 * ```tsx
 * function MyCharacterSheet() {
 *   const [currentTab, setCurrentTab] = useState<CharacterTabId>('main');
 *
 *   return (
 *     <TabNavigation currentTab={currentTab} onTabChange={setCurrentTab} />
 *   );
 * }
 * ```
 */
export function TabNavigation({ currentTab, onTabChange }: TabNavigationProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estado do menu mobile
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabClick = (tabId: CharacterTabId) => {
    onTabChange(tabId);
    handleMenuClose();
  };

  // Encontra o label da aba atual
  const currentTabLabel =
    CHARACTER_TABS.find((tab) => tab.id === currentTab)?.label || 'Principal';

  /**
   * Renderização Mobile: Menu Dropdown
   */
  if (isMobile) {
    return (
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <IconButton
            onClick={handleMenuOpen}
            aria-label="Abrir menu de navegação"
            aria-controls={menuOpen ? 'tab-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            {currentTabLabel}
          </Typography>
        </Box>

        <Menu
          id="tab-menu"
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'tab-menu-button',
          }}
        >
          {CHARACTER_TABS.map((tab) => (
            <MenuItem
              key={tab.id}
              selected={tab.id === currentTab}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }

  /**
   * Renderização Desktop: Tabs Horizontais
   */
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={currentTab}
        onChange={(_, newValue) => onTabChange(newValue)}
        aria-label="Navegação da ficha de personagem"
        variant="scrollable"
        scrollButtons="auto"
      >
        {CHARACTER_TABS.map((tab) => (
          <Tab
            key={tab.id}
            label={tab.label}
            value={tab.id}
            id={`tab-${tab.id}`}
            aria-controls={`tabpanel-${tab.id}`}
          />
        ))}
      </Tabs>
    </Box>
  );
}
