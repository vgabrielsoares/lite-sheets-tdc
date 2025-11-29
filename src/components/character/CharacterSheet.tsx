'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Breadcrumbs,
  Link,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import type { Character } from '@/types';
import type { HealthPoints, PowerPoints } from '@/types/combat';
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
import { LinhagemSidebar, OrigemSidebar, SizeSidebar } from './sidebars';
import { HPDetailSidebar } from './sidebars/HPDetailSidebar';
import { PPDetailSidebar } from './sidebars/PPDetailSidebar';
import DefenseSidebar from './sidebars/DefenseSidebar';
import MovementSidebar from './sidebars/MovementSidebar';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estado da aba atual
  const [currentTab, setCurrentTab] = useState<CharacterTabId>('main');

  // Estado da sidebar (qual sidebar está aberta)
  const [activeSidebar, setActiveSidebar] = useState<
    'lineage' | 'origin' | 'size' | 'hp' | 'pp' | 'defense' | 'movement' | null
  >(null);

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
   * Abre a sidebar de tamanho
   */
  const handleOpenSizeSidebar = () => {
    setActiveSidebar('size');
  };

  /**
   * Abre a sidebar de defesa
   */
  const handleOpenDefenseSidebar = () => {
    setActiveSidebar('defense');
  };

  /**
   * Abre a sidebar de deslocamento
   */
  const handleOpenMovementSidebar = () => {
    setActiveSidebar('movement');
  };

  /**
   * Abre a sidebar de detalhes de PV
   */
  const handleOpenHPSidebar = () => {
    setActiveSidebar('hp');
  };

  /**
   * Abre a sidebar de detalhes de PP
   */
  const handleOpenPPSidebar = () => {
    setActiveSidebar('pp');
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
   * Handler para atualizar a origem do personagem
   */
  const handleUpdateOrigin = (origin: Character['origin']) => {
    onUpdate({ origin });
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
      onOpenSize: handleOpenSizeSidebar,
      onOpenHP: handleOpenHPSidebar,
      onOpenPP: handleOpenPPSidebar,
      onOpenDefense: handleOpenDefenseSidebar,
      onOpenMovement: handleOpenMovementSidebar,
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
      </Box>

      {/* Layout principal - Centralizado */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 3,
          justifyContent: 'center', // Centraliza horizontalmente
          // Altura fixa baseada na viewport para evitar alongamento
          height: isMobile ? 'auto' : 'calc(100vh - 200px)',
          maxHeight: isMobile ? 'none' : 'calc(100vh - 200px)',
        }}
      >
        {/* Container da ficha */}
        <Box
          sx={{
            flex: isMobile ? '1 1 auto' : '0 0 800px',
            maxWidth: '800px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* Navegação por abas */}
          <TabNavigation currentTab={currentTab} onTabChange={setCurrentTab} />

          {/* Conteúdo da aba atual */}
          <Box
            role="tabpanel"
            id={`tabpanel-${currentTab}`}
            aria-labelledby={`tab-${currentTab}`}
            sx={{
              flex: 1,
              overflow: 'auto',
              // Scrollbar customizada para o conteúdo da ficha
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
            {renderTabContent()}
          </Box>
        </Box>

        {/* Área reservada para sidebar */}
        {!isMobile && (
          <Box
            sx={{
              flex: '0 0 640px', // Largura fixa da sidebar (lg)
              maxWidth: '640px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
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

            {/* Sidebar de Origem */}
            {activeSidebar === 'origin' && (
              <OrigemSidebar
                open={activeSidebar === 'origin'}
                origin={character.origin}
                onUpdate={handleUpdateOrigin}
                onClose={handleCloseSidebar}
              />
            )}

            {/* Sidebar de Tamanho */}
            {activeSidebar === 'size' && character.lineage?.size && (
              <SizeSidebar
                open={activeSidebar === 'size'}
                currentSize={character.lineage.size}
                onClose={handleCloseSidebar}
              />
            )}

            {/* Sidebar de PV */}
            {activeSidebar === 'hp' && (
              <HPDetailSidebar
                open={activeSidebar === 'hp'}
                hp={character.combat.hp}
                onChange={(hp: HealthPoints) =>
                  onUpdate({
                    combat: { ...character.combat, hp },
                  })
                }
                onClose={handleCloseSidebar}
              />
            )}

            {/* Sidebar de PP */}
            {activeSidebar === 'pp' && (
              <PPDetailSidebar
                open={activeSidebar === 'pp'}
                pp={character.combat.pp}
                onChange={(pp: PowerPoints) =>
                  onUpdate({
                    combat: { ...character.combat, pp },
                  })
                }
                onClose={handleCloseSidebar}
              />
            )}

            {/* Sidebar de Defesa */}
            {activeSidebar === 'defense' && (
              <DefenseSidebar
                open={activeSidebar === 'defense'}
                character={character}
                onUpdate={(updated) => onUpdate(updated)}
                onClose={handleCloseSidebar}
              />
            )}

            {/* Sidebar de Deslocamento */}
            {activeSidebar === 'movement' && (
              <MovementSidebar
                open={activeSidebar === 'movement'}
                character={character}
                onUpdate={(updated) => onUpdate(updated)}
                onClose={handleCloseSidebar}
              />
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

        {/* Sidebar de Origem em modo mobile (overlay) */}
        {isMobile && activeSidebar === 'origin' && (
          <OrigemSidebar
            open={activeSidebar === 'origin'}
            origin={character.origin}
            onUpdate={handleUpdateOrigin}
            onClose={handleCloseSidebar}
          />
        )}

        {/* Sidebar de Tamanho em modo mobile (overlay) */}
        {isMobile && activeSidebar === 'size' && character.lineage?.size && (
          <SizeSidebar
            open={activeSidebar === 'size'}
            currentSize={character.lineage.size}
            onClose={handleCloseSidebar}
          />
        )}

        {/* Sidebar de PV em modo mobile (overlay) */}
        {isMobile && activeSidebar === 'hp' && (
          <HPDetailSidebar
            open={activeSidebar === 'hp'}
            hp={character.combat.hp}
            onChange={(hp: HealthPoints) =>
              onUpdate({
                combat: { ...character.combat, hp },
              })
            }
            onClose={handleCloseSidebar}
          />
        )}

        {/* Sidebar de PP em modo mobile (overlay) */}
        {isMobile && activeSidebar === 'pp' && (
          <PPDetailSidebar
            open={activeSidebar === 'pp'}
            pp={character.combat.pp}
            onChange={(pp: PowerPoints) =>
              onUpdate({
                combat: { ...character.combat, pp },
              })
            }
            onClose={handleCloseSidebar}
          />
        )}

        {/* Sidebar de Defesa em modo mobile (overlay) */}
        {isMobile && activeSidebar === 'defense' && (
          <DefenseSidebar
            open={activeSidebar === 'defense'}
            character={character}
            onUpdate={(updated) => onUpdate(updated)}
            onClose={handleCloseSidebar}
          />
        )}

        {/* Sidebar de Deslocamento em modo mobile (overlay) */}
        {isMobile && activeSidebar === 'movement' && (
          <MovementSidebar
            open={activeSidebar === 'movement'}
            character={character}
            onUpdate={(updated) => onUpdate(updated)}
            onClose={handleCloseSidebar}
          />
        )}
      </Box>
    </Container>
  );
}
