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
  Tooltip,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BackpackIcon from '@mui/icons-material/Backpack';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DescriptionIcon from '@mui/icons-material/Description';
import EditNoteIcon from '@mui/icons-material/EditNote';

/**
 * Abas disponíveis na ficha de personagem
 */
export const CHARACTER_TABS = [
  { id: 'main', label: 'Principal', Icon: PersonIcon },
  { id: 'combat', label: 'Combate', Icon: ShieldIcon },
  { id: 'archetypes', label: 'Arquétipos', Icon: AutoAwesomeIcon },
  { id: 'resources', label: 'Recursos', Icon: BackpackIcon },
  { id: 'specials', label: 'Especiais', Icon: FlashOnIcon },
  { id: 'inventory', label: 'Inventário', Icon: Inventory2Icon },
  { id: 'spells', label: 'Feitiços', Icon: AutoFixHighIcon },
  { id: 'description', label: 'Descrição', Icon: DescriptionIcon },
  { id: 'notes', label: 'Anotações', Icon: EditNoteIcon },
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
  const isCompact = useMediaQuery(theme.breakpoints.down('lg'));

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

  // Encontra a aba atual
  const currentTabData = CHARACTER_TABS.find((tab) => tab.id === currentTab);
  const currentTabLabel = currentTabData?.label || 'Principal';
  const CurrentTabIcon = currentTabData?.Icon || PersonIcon;

  /**
   * Renderização Mobile: Menu Dropdown com ícones
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

          <CurrentTabIcon fontSize="small" sx={{ color: 'primary.main' }} />
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
          {CHARACTER_TABS.map((tab) => {
            const TabIcon = tab.Icon;
            return (
              <MenuItem
                key={tab.id}
                selected={tab.id === currentTab}
                onClick={() => handleTabClick(tab.id)}
              >
                <ListItemIcon>
                  <TabIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{tab.label}</ListItemText>
              </MenuItem>
            );
          })}
        </Menu>
      </Box>
    );
  }

  /**
   * Renderização Desktop: Tabs Horizontais com ícones
   *
   * - ≥ lg: ícone + nome
   * - md a lg: apenas ícone com tooltip
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
        {CHARACTER_TABS.map((tab) => {
          const TabIcon = tab.Icon;
          const tabContent = (
            <Tab
              key={tab.id}
              icon={<TabIcon fontSize="small" />}
              iconPosition="start"
              label={isCompact ? undefined : tab.label}
              value={tab.id}
              id={`tab-${tab.id}`}
              aria-controls={`tabpanel-${tab.id}`}
              aria-label={isCompact ? tab.label : undefined}
              sx={{
                minWidth: isCompact ? 48 : undefined,
                minHeight: 48,
              }}
            />
          );

          return isCompact ? (
            <Tooltip key={tab.id} title={tab.label} arrow>
              {tabContent}
            </Tooltip>
          ) : (
            tabContent
          );
        })}
      </Tabs>
    </Box>
  );
}
