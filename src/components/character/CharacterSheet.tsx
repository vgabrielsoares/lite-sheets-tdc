'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Breadcrumbs,
  Link,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import type { Character } from '@/types';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectSheetPosition,
  toggleSheetPosition,
} from '@/features/app/appSlice';
import { TabNavigation, CHARACTER_TABS } from './TabNavigation';
import type { CharacterTabId } from './TabNavigation';
import {
  MainTab,
  CombatTab,
  ArchetypesTab,
  ResourcesTab,
  InventoryTab,
  SpellsTab,
  DescriptionTab,
} from './tabs';
import { LinhagemSidebar } from './sidebars';

export interface CharacterSheetProps {
  /**
   * Dados do personagem
   */
  character: Character;

  /**
   * Callback para atualizar o personagem
   */
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Componente CharacterSheet - Layout Base da Ficha de Personagem
 *
 * Funcionalidades principais:
 * - Sistema de navegação por abas (7 abas: Principal, Combate, Arquétipos, Recursos, Inventário, Feitiços, Descrição)
 * - Layout responsivo (tabs no desktop, menu dropdown no mobile)
 * - Posicionamento customizável da ficha (esquerda/direita)
 * - Breadcrumb para navegação
 * - Integração com Redux para persistência de preferências
 * - Preparado para sidebar retrátil de detalhes (implementado nas próximas issues)
 *
 * Estrutura do layout:
 * - Desktop: Ficha alinhada à esquerda/direita, sidebar no lado oposto
 * - Mobile: Ficha fullwidth, sidebar overlay
 *
 * @example
 * ```tsx
 * <CharacterSheet
 *   character={myCharacter}
 *   onUpdate={(updates) => dispatch(updateCharacter({ id, updates }))}
 * />
 * ```
 */
export function CharacterSheet({ character, onUpdate }: CharacterSheetProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estado da aba atual
  const [currentTab, setCurrentTab] = useState<CharacterTabId>('main');

  // Estado da sidebar (qual sidebar está aberta)
  const [activeSidebar, setActiveSidebar] = useState<
    'lineage' | 'origin' | null
  >(null);

  // Preferência de posicionamento da ficha (Redux)
  const sheetPosition = useAppSelector(selectSheetPosition);

  /**
   * Alterna o posicionamento da ficha (esquerda/direita)
   */
  const handleTogglePosition = () => {
    dispatch(toggleSheetPosition());
  };

  /**
   * Navega de volta para a lista de fichas
   */
  const handleBackToList = () => {
    router.push('/');
  };

  /**
   * Abre a sidebar de linhagem
   */
  const handleOpenLineageSidebar = () => {
    setActiveSidebar('lineage');
  };

  /**
   * Abre a sidebar de origem
   */
  const handleOpenOriginSidebar = () => {
    setActiveSidebar('origin');
  };

  /**
   * Fecha qualquer sidebar aberta
   */
  const handleCloseSidebar = () => {
    setActiveSidebar(null);
  };

  /**
   * Handler para atualizar a linhagem do personagem
   */
  const handleUpdateLineage = (lineage: Character['lineage']) => {
    onUpdate({ lineage });
  };

  /**
   * Renderiza o conteúdo da aba atual
   */
  const renderTabContent = () => {
    const tabProps = {
      character,
      onUpdate,
      onOpenLineage: handleOpenLineageSidebar,
      onOpenOrigin: handleOpenOriginSidebar,
    };

    switch (currentTab) {
      case 'main':
        return <MainTab {...tabProps} />;
      case 'combat':
        return <CombatTab {...tabProps} />;
      case 'archetypes':
        return <ArchetypesTab {...tabProps} />;
      case 'resources':
        return <ResourcesTab {...tabProps} />;
      case 'inventory':
        return <InventoryTab {...tabProps} />;
      case 'spells':
        return <SpellsTab {...tabProps} />;
      case 'description':
        return <DescriptionTab {...tabProps} />;
      default:
        return <MainTab {...tabProps} />;
    }
  };

  /**
   * Encontra o label da aba atual para o breadcrumb
   */
  const currentTabLabel =
    CHARACTER_TABS.find((tab) => tab.id === currentTab)?.label || 'Principal';

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumb e controles */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        {/* Breadcrumb de navegação */}
        <Breadcrumbs aria-label="navegação">
          <Link
            underline="hover"
            color="inherit"
            onClick={handleBackToList}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <BackIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Fichas
          </Link>
          <Typography color="text.primary">{character.name}</Typography>
          {!isMobile && (
            <Typography color="text.secondary">{currentTabLabel}</Typography>
          )}
        </Breadcrumbs>

        {/* Botão de alternar posicionamento (apenas desktop) */}
        {!isMobile && (
          <Tooltip
            title={`Alternar posicionamento da ficha (${
              sheetPosition === 'left' ? 'esquerda' : 'direita'
            })`}
          >
            <IconButton
              onClick={handleTogglePosition}
              aria-label="Alternar posicionamento da ficha"
            >
              <SwapIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Layout principal */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 3,
        }}
      >
        {/* Container da ficha */}
        <Box
          sx={{
            flex: isMobile ? '1 1 auto' : '0 1 800px',
            order: isMobile ? 1 : sheetPosition === 'left' ? 1 : 2,
          }}
        >
          {/* Navegação por abas */}
          <TabNavigation currentTab={currentTab} onTabChange={setCurrentTab} />

          {/* Conteúdo da aba atual */}
          <Box
            role="tabpanel"
            id={`tabpanel-${currentTab}`}
            aria-labelledby={`tab-${currentTab}`}
          >
            {renderTabContent()}
          </Box>
        </Box>

        {/* Área reservada para sidebar (implementada nas próximas issues) */}
        {!isMobile && (
          <Box
            sx={{
              flex: '1 1 auto',
              order: sheetPosition === 'left' ? 2 : 1,
              minHeight: '200px',
            }}
          >
            {/* Sidebar de Linhagem */}
            {activeSidebar === 'lineage' && (
              <LinhagemSidebar
                open={activeSidebar === 'lineage'}
                lineage={character.lineage}
                onUpdate={handleUpdateLineage}
                onClose={handleCloseSidebar}
              />
            )}

            {/* Sidebar de Origem será implementada na próxima issue */}
            {activeSidebar === 'origin' && (
              <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography>
                  Sidebar de Origem será implementada em breve
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Sidebar em modo mobile (overlay) */}
        {isMobile && activeSidebar === 'lineage' && (
          <LinhagemSidebar
            open={activeSidebar === 'lineage'}
            lineage={character.lineage}
            onUpdate={handleUpdateLineage}
            onClose={handleCloseSidebar}
          />
        )}
      </Box>
    </Container>
  );
}
