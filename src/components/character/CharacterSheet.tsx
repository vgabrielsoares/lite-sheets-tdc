'use client';

import React, { useState, useMemo, Suspense, lazy, useTransition } from 'react';
import {
  Box,
  Container,
  Breadcrumbs,
  Link,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Fade,
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShieldIcon from '@mui/icons-material/Shield';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BuildIcon from '@mui/icons-material/Build';
import TranslateIcon from '@mui/icons-material/Translate';
// Ícones para TOC - Combate
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import GavelIcon from '@mui/icons-material/Gavel';
import SecurityIcon from '@mui/icons-material/Security';
// Ícones para TOC - Arquétipos
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
// Ícones para TOC - Resources
import HotelIcon from '@mui/icons-material/Hotel';
// Ícones para TOC - Inventory
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
// Ícones para TOC - Spells
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useRouter } from 'next/navigation';
import type {
  Character,
  AttributeName,
  SkillName,
  SkillUse,
  ProficiencyLevel,
  Modifier,
  Lineage,
  Note,
} from '@/types';
import type { InventoryItem } from '@/types/inventory';
import type { HealthPoints, PowerPoints } from '@/types/combat';
import { TabNavigation, CHARACTER_TABS } from './TabNavigation';
import type { CharacterTabId } from './TabNavigation';

// Lazy load tabs for better performance
const MainTab = lazy(() =>
  import('./tabs/MainTab').then((m) => ({ default: m.MainTab }))
);
const CombatTab = lazy(() =>
  import('./tabs/CombatTab').then((m) => ({ default: m.CombatTab }))
);
const ArchetypesTab = lazy(() =>
  import('./tabs/ArchetypesTab').then((m) => ({ default: m.ArchetypesTab }))
);
const ResourcesTab = lazy(() =>
  import('./tabs/ResourcesTab').then((m) => ({ default: m.ResourcesTab }))
);
const InventoryTab = lazy(() =>
  import('./tabs/InventoryTab').then((m) => ({ default: m.InventoryTab }))
);
const SpellsTab = lazy(() =>
  import('./tabs/SpellsTab').then((m) => ({ default: m.SpellsTab }))
);
const DescriptionTab = lazy(() =>
  import('./tabs/DescriptionTab').then((m) => ({ default: m.DescriptionTab }))
);
const NotesTab = lazy(() =>
  import('./tabs/NotesTab').then((m) => ({ default: m.NotesTab }))
);
import {
  LinhagemSidebar,
  OrigemSidebar,
  SizeSidebar,
  AttributeSidebar,
} from './sidebars';
import { HPDetailSidebar } from './sidebars/HPDetailSidebar';
import { PPDetailSidebar } from './sidebars/PPDetailSidebar';
import DefenseSidebar from './sidebars/DefenseSidebar';
import MovementSidebar from './sidebars/MovementSidebar';
import { SkillUsageSidebar } from './sidebars/SkillUsageSidebar';
import { ItemDetailsSidebar } from './inventory/ItemDetailsSidebar';
import { ConceptSidebar } from './sidebars/ConceptSidebar';
import { NoteViewSidebar } from './sidebars/NoteViewSidebar';
import { TableOfContents, TOCSection } from '@/components/shared';
import {
  calculateArchetypeHPBreakdown,
  calculateArchetypePPBreakdown,
} from './archetypes';

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

  // Estado da aba atual com transição para mostrar loading
  const [currentTab, setCurrentTab] = useState<CharacterTabId>('main');
  const [isPending, startTransition] = useTransition();

  // Handler para mudança de aba com transição
  const handleTabChange = (tab: CharacterTabId) => {
    startTransition(() => {
      setCurrentTab(tab);
    });
  };

  // Estado do Table of Contents
  const [tocOpen, setTocOpen] = useState<boolean>(false);

  // Estado da sidebar (qual sidebar está aberta)
  const [activeSidebar, setActiveSidebar] = useState<
    | 'lineage'
    | 'origin'
    | 'size'
    | 'hp'
    | 'pp'
    | 'defense'
    | 'movement'
    | 'attribute'
    | 'skill'
    | 'item'
    | 'concept'
    | 'note'
    | null
  >(null);

  // Atributo selecionado para a sidebar
  const [selectedAttribute, setSelectedAttribute] =
    useState<AttributeName | null>(null);

  // Habilidade selecionada para a sidebar
  const [selectedSkill, setSelectedSkill] = useState<SkillName | null>(null);

  // Item selecionado para a sidebar de detalhes
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Nota selecionada para a sidebar de visualização
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  /**
   * Seções do TOC por aba
   */
  const tocSections = useMemo<Record<CharacterTabId, TOCSection[]>>(
    () => ({
      main: [
        {
          id: 'section-basic-stats',
          label: 'Informações Básicas',
          icon: <PersonIcon fontSize="small" />,
        },
        {
          id: 'section-hp-pp',
          label: 'PV e PP',
          icon: <FavoriteIcon fontSize="small" />,
        },
        {
          id: 'section-defense-movement',
          label: 'Defesa e Deslocamento',
          icon: <ShieldIcon fontSize="small" />,
        },
        {
          id: 'section-attributes',
          label: 'Atributos',
          icon: <FitnessCenterIcon fontSize="small" />,
        },
        {
          id: 'section-skills',
          label: 'Habilidades',
          icon: <PsychologyIcon fontSize="small" />,
        },
        {
          id: 'section-crafts',
          label: 'Ofícios',
          icon: <BuildIcon fontSize="small" />,
        },
        {
          id: 'section-languages',
          label: 'Idiomas',
          icon: <TranslateIcon fontSize="small" />,
        },
      ],
      combat: [
        {
          id: 'section-combat-stats',
          label: 'Recursos Vitais',
          icon: <FavoriteIcon fontSize="small" />,
        },
        {
          id: 'section-action-economy',
          label: 'Economia de Ações',
          icon: <FlashOnIcon fontSize="small" />,
        },
        {
          id: 'section-defense',
          label: 'Defesa',
          icon: <ShieldIcon fontSize="small" />,
        },
        {
          id: 'section-saving-throws',
          label: 'Testes de Resistência',
          icon: <GavelIcon fontSize="small" />,
        },
        {
          id: 'section-attacks',
          label: 'Ataques',
          icon: <SportsKabaddiIcon fontSize="small" />,
        },
        {
          id: 'section-dying-and-pplimit',
          label: 'Condições de Combate',
          icon: <SecurityIcon fontSize="small" />,
        },
        {
          id: 'section-resistances',
          label: 'Resistências',
          icon: <SecurityIcon fontSize="small" />,
        },
      ],
      archetypes: [
        {
          id: 'section-archetypes',
          label: 'Arquétipos',
          icon: <AutoAwesomeIcon fontSize="small" />,
        },
        {
          id: 'section-archetype-features',
          label: 'Características',
          icon: <StarIcon fontSize="small" />,
        },
        {
          id: 'section-classes',
          label: 'Classes',
          icon: <SchoolIcon fontSize="small" />,
        },
        {
          id: 'section-progression',
          label: 'Progressão',
          icon: <TrendingUpIcon fontSize="small" />,
        },
      ],
      resources: [
        {
          id: 'section-proficiencies',
          label: 'Proficiências',
          icon: <BuildIcon fontSize="small" />,
        },
        {
          id: 'section-languages',
          label: 'Idiomas',
          icon: <TranslateIcon fontSize="small" />,
        },
        {
          id: 'section-particularities',
          label: 'Particularidades',
          icon: <StarIcon fontSize="small" />,
        },
        {
          id: 'section-rest',
          label: 'Descanso',
          icon: <HotelIcon fontSize="small" />,
        },
      ],
      inventory: [
        {
          id: 'section-currency',
          label: 'Moedas e Riquezas',
          icon: <MonetizationOnIcon fontSize="small" />,
        },
        {
          id: 'section-carry-capacity',
          label: 'Capacidade de Carga',
          icon: <FitnessCenterIcon fontSize="small" />,
        },
        {
          id: 'section-inventory-items',
          label: 'Itens do Inventário',
          icon: <InventoryIcon fontSize="small" />,
        },
      ],
      spells: [
        {
          id: 'section-spell-dashboard',
          label: 'Dashboard de Feitiços',
          icon: <DashboardIcon fontSize="small" />,
        },
        {
          id: 'section-spell-list',
          label: 'Lista de Feitiços',
          icon: <MenuBookIcon fontSize="small" />,
        },
        {
          id: 'section-spell-learning',
          label: 'Calculadora de Aprendizado',
          icon: <SchoolIcon fontSize="small" />,
        },
      ],
      description: [
        { id: 'section-physical', label: 'Descrição Física' },
        { id: 'section-definers', label: 'Definidores' },
        { id: 'section-backstory', label: 'História' },
      ],
      notes: [{ id: 'section-notes-list', label: 'Minhas Anotações' }],
    }),
    []
  );

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
   * Abre a sidebar de detalhes de um atributo
   */
  const handleOpenAttributeSidebar = (attribute: AttributeName) => {
    setSelectedAttribute(attribute);
    setActiveSidebar('attribute');
  };

  /**
   * Abre a sidebar de detalhes de uma habilidade
   */
  const handleOpenSkillSidebar = (skillName: SkillName) => {
    setSelectedSkill(skillName);
    setActiveSidebar('skill');
  };

  /**
   * Abre a sidebar de detalhes de um item do inventário
   */
  const handleOpenItemSidebar = (item: InventoryItem) => {
    setSelectedItem(item);
    setActiveSidebar('item');
  };

  /**
   * Abre a sidebar de conceito expandido
   */
  const handleOpenConceptSidebar = () => {
    setActiveSidebar('concept');
  };

  /**
   * Abre a sidebar de visualização de nota
   */
  const handleOpenNoteSidebar = (note: Note) => {
    setSelectedNote(note);
    setActiveSidebar('note');
  };

  /**
   * Handler para atualizar item do inventário via sidebar
   */
  const handleUpdateItemFromSidebar = (updatedItem: InventoryItem) => {
    const currentItems = character.inventory?.items ?? [];
    const updatedItems = currentItems.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    onUpdate({
      inventory: {
        ...character.inventory,
        items: updatedItems,
      },
    });
    // Atualiza o item selecionado para manter a sidebar sincronizada
    setSelectedItem(updatedItem);
  };

  /**
   * Fecha qualquer sidebar aberta
   */
  const handleCloseSidebar = () => {
    setActiveSidebar(null);
    setSelectedAttribute(null);
    setSelectedSkill(null);
    setSelectedItem(null);
  };

  /**
   * Handler para atualizar a linhagem do personagem
   * Também aplica automaticamente:
   * - Modificadores de atributos
   * - Tamanho
   * - Deslocamento (base)
   * - Visão e sentidos aguçados
   */
  const handleUpdateLineage = (lineage: Character['lineage']) => {
    if (!lineage) {
      onUpdate({ lineage });
      return;
    }

    // Calcula a diferença de modificadores entre linhagem antiga e nova
    const oldModifiers = character.lineage?.attributeModifiers || [];
    const newModifiers = lineage.attributeModifiers || [];

    // Cria um mapa de atributos atualizado
    const updatedAttributes = { ...character.attributes };

    // Remove os modificadores antigos da linhagem
    oldModifiers.forEach((mod) => {
      if (mod.attribute in updatedAttributes) {
        updatedAttributes[mod.attribute] = Math.max(
          0,
          updatedAttributes[mod.attribute] - mod.value
        );
      }
    });

    // Aplica os novos modificadores da linhagem
    newModifiers.forEach((mod) => {
      if (mod.attribute in updatedAttributes) {
        updatedAttributes[mod.attribute] = Math.max(
          0,
          updatedAttributes[mod.attribute] + mod.value
        );
      }
    });

    // Sincroniza o tamanho da linhagem com o personagem
    const updatedSize = lineage.size;

    // Sincroniza o deslocamento da linhagem com o personagem (valores base)
    // O bônus é mantido do personagem, apenas o base vem da linhagem
    const lineageMovement = lineage.movement;
    const currentMovement = character.movement;
    const updatedMovement = {
      ...currentMovement,
      speeds: {
        andando: {
          base: lineageMovement.andando ?? 0,
          bonus: currentMovement.speeds?.andando?.bonus ?? 0,
        },
        voando: {
          base: lineageMovement.voando ?? 0,
          bonus: currentMovement.speeds?.voando?.bonus ?? 0,
        },
        escalando: {
          base: lineageMovement.escalando ?? 0,
          bonus: currentMovement.speeds?.escalando?.bonus ?? 0,
        },
        escavando: {
          base: lineageMovement.escavando ?? 0,
          bonus: currentMovement.speeds?.escavando?.bonus ?? 0,
        },
        nadando: {
          base: lineageMovement.nadando ?? 0,
          bonus: currentMovement.speeds?.nadando?.bonus ?? 0,
        },
      },
    };

    // Sincroniza a visão e sentidos aguçados da linhagem com o personagem
    const updatedSenses = {
      ...character.senses,
      vision: lineage.vision,
      keenSenses: lineage.keenSenses || [],
      perceptionModifiers: {
        visao: 0,
        olfato: 0,
        audicao: 0,
      },
    };

    // Calcula os modificadores de percepção baseado nos sentidos aguçados
    (lineage.keenSenses || []).forEach((sense) => {
      updatedSenses.perceptionModifiers[sense.type] = sense.bonus;
    });

    // Atualiza linhagem, atributos, tamanho, deslocamento e sentidos juntos
    onUpdate({
      lineage,
      attributes: updatedAttributes,
      size: updatedSize,
      movement: updatedMovement,
      senses: updatedSenses,
    });
  };

  /**
   * Handler para atualizar a origem do personagem
   * Também aplica os modificadores de atributos e proficiências de habilidades da origem automaticamente
   */
  const handleUpdateOrigin = (origin: Character['origin']) => {
    if (!origin) {
      onUpdate({ origin });
      return;
    }

    // Calcula a diferença de modificadores entre origem antiga e nova
    const oldModifiers = character.origin?.attributeModifiers || [];
    const newModifiers = origin.attributeModifiers || [];

    // Cria um mapa de atributos atualizado
    const updatedAttributes = { ...character.attributes };

    // Remove os modificadores antigos da origem
    oldModifiers.forEach((mod) => {
      if (mod.attribute in updatedAttributes) {
        updatedAttributes[mod.attribute] = Math.max(
          0,
          updatedAttributes[mod.attribute] - mod.value
        );
      }
    });

    // Aplica os novos modificadores da origem
    newModifiers.forEach((mod) => {
      if (mod.attribute in updatedAttributes) {
        updatedAttributes[mod.attribute] = Math.max(
          0,
          updatedAttributes[mod.attribute] + mod.value
        );
      }
    });

    // Atualiza proficiências de habilidades
    const oldSkillProficiencies = character.origin?.skillProficiencies || [];
    const newSkillProficiencies = origin.skillProficiencies || [];
    const updatedSkills = { ...character.skills };

    // Remove proficiências antigas da origem (volta para 'leigo' se a origem era a única fonte)
    oldSkillProficiencies.forEach((skillName) => {
      if (
        skillName in updatedSkills &&
        !newSkillProficiencies.includes(skillName)
      ) {
        // Só volta para 'leigo' se ainda está como 'adepto' (não foi melhorado manualmente)
        if (updatedSkills[skillName].proficiencyLevel === 'adepto') {
          updatedSkills[skillName] = {
            ...updatedSkills[skillName],
            proficiencyLevel: 'leigo',
          };
        }
      }
    });

    // Aplica novas proficiências da origem (sobe para 'adepto' se estava 'leigo')
    newSkillProficiencies.forEach((skillName) => {
      if (skillName in updatedSkills) {
        // Só sobe para 'adepto' se está como 'leigo'
        if (updatedSkills[skillName].proficiencyLevel === 'leigo') {
          updatedSkills[skillName] = {
            ...updatedSkills[skillName],
            proficiencyLevel: 'adepto',
          };
        }
      }
    });

    // Atualiza origem, atributos e habilidades juntos
    onUpdate({ origin, attributes: updatedAttributes, skills: updatedSkills });
  };

  /**
   * Handler para atualizar um atributo do personagem
   */
  const handleUpdateAttribute = (attribute: AttributeName, value: number) => {
    onUpdate({
      attributes: {
        ...character.attributes,
        [attribute]: value,
      },
    });
  };

  /**
   * Handler para atualizar atributo-chave de uma habilidade
   */
  const handleSkillKeyAttributeChange = (
    skillName: SkillName,
    newAttribute: AttributeName
  ) => {
    onUpdate({
      skills: {
        ...character.skills,
        [skillName]: {
          ...character.skills[skillName],
          keyAttribute: newAttribute,
        },
      },
    });
  };

  /**
   * Handler para atualizar proficiência de uma habilidade
   */
  const handleSkillProficiencyChange = (
    skillName: SkillName,
    newProficiency: ProficiencyLevel
  ) => {
    onUpdate({
      skills: {
        ...character.skills,
        [skillName]: {
          ...character.skills[skillName],
          proficiencyLevel: newProficiency,
        },
      },
    });
  };

  /**
   * Handler para atualizar modificadores de uma habilidade
   */
  const handleSkillModifiersChange = (
    skillName: SkillName,
    modifiers: Modifier[]
  ) => {
    onUpdate({
      skills: {
        ...character.skills,
        [skillName]: {
          ...character.skills[skillName],
          modifiers,
        },
      },
    });
  };

  /**
   * Handler para atualizar usos customizados de uma habilidade
   */
  const handleUpdateCustomUses = (
    skillName: SkillName,
    customUses: SkillUse[]
  ) => {
    onUpdate({
      skills: {
        ...character.skills,
        [skillName]: {
          ...character.skills[skillName],
          customUses,
        },
      },
    });
  };

  /**
   * Handler para atualizar atributos personalizados de usos padrões
   */
  const handleUpdateDefaultUseAttributes = (
    skillName: SkillName,
    overrides: Record<string, AttributeName>
  ) => {
    onUpdate({
      skills: {
        ...character.skills,
        [skillName]: {
          ...character.skills[skillName],
          defaultUseAttributeOverrides: overrides,
        },
      },
    });
  };

  /**
   * Handler para atualizar modificadores de usos padrões de uma habilidade
   */
  const handleUpdateDefaultUseModifiers = (
    skillName: SkillName,
    overrides: Record<string, Modifier[]>
  ) => {
    onUpdate({
      skills: {
        ...character.skills,
        [skillName]: {
          ...character.skills[skillName],
          defaultUseModifierOverrides: overrides,
        },
      },
    });
  };

  /**
   * Handler para atualizar habilidade de assinatura
   */
  const handleSignatureAbilityChange = (skillName: SkillName | null) => {
    // Remove assinatura de todas as habilidades
    const updatedSkills = Object.entries(character.skills).reduce(
      (acc, [key, skill]) => {
        acc[key as SkillName] = {
          ...skill,
          isSignature: skillName === key,
        };
        return acc;
      },
      {} as typeof character.skills
    );

    onUpdate({
      skills: updatedSkills,
    });
  };

  /**
   * Encontra qual habilidade é atualmente a assinatura
   */
  const getCurrentSignatureSkill = (): SkillName | null => {
    const signatureEntry = Object.entries(character.skills).find(
      ([, skill]) => skill.isSignature
    );
    return signatureEntry ? (signatureEntry[0] as SkillName) : null;
  };

  /**
   * Handler para adicionar um novo ofício
   */
  const handleAddCraft = (craft: Omit<import('@/types').Craft, 'id'>) => {
    const { v4: uuidv4 } = require('uuid');
    const newCraft: import('@/types').Craft = {
      ...craft,
      id: uuidv4(),
    };

    onUpdate({
      crafts: [...character.crafts, newCraft],
    });
  };

  /**
   * Handler para atualizar um ofício existente
   */
  const handleUpdateCraft = (
    craftId: string,
    updates: Partial<import('@/types').Craft>
  ) => {
    const updatedCrafts = character.crafts.map((craft) =>
      craft.id === craftId ? { ...craft, ...updates } : craft
    );

    onUpdate({
      crafts: updatedCrafts,
    });
  };

  /**
   * Handler para remover um ofício
   */
  const handleRemoveCraft = (craftId: string) => {
    const updatedCrafts = character.crafts.filter(
      (craft) => craft.id !== craftId
    );

    onUpdate({
      crafts: updatedCrafts,
    });
  };

  /**
   * Handler para alterar o ofício selecionado na habilidade "oficio"
   */
  const handleSelectedCraftChange = (
    skillName: import('@/types').SkillName,
    craftId: string
  ) => {
    const updatedSkills = {
      ...character.skills,
      [skillName]: {
        ...character.skills[skillName],
        selectedCraftId: craftId,
      },
    };

    onUpdate({
      skills: updatedSkills,
    });
  };

  /**
   * Handler para atualizar campos específicos da linhagem
   * Usa handleUpdateLineage para garantir sincronização correta
   */
  const handleUpdateLineageField = (field: keyof Lineage, value: any) => {
    if (!character.lineage) return;

    const updatedLineage = {
      ...character.lineage,
      [field]: value,
    };

    handleUpdateLineage(updatedLineage);
  };

  /**
   * Renderiza o conteúdo da aba atual
   */
  const renderTabContent = () => {
    const tabProps = {
      character,
      onUpdate,
      onUpdateLineageField: handleUpdateLineageField,
      onOpenLineage: handleOpenLineageSidebar,
      onOpenOrigin: handleOpenOriginSidebar,
      onOpenSize: handleOpenSizeSidebar,
      onOpenHP: handleOpenHPSidebar,
      onOpenPP: handleOpenPPSidebar,
      onOpenDefense: handleOpenDefenseSidebar,
      onOpenMovement: handleOpenMovementSidebar,
      onOpenAttribute: handleOpenAttributeSidebar,
      onOpenSkill: handleOpenSkillSidebar,
      onOpenItem: handleOpenItemSidebar,
      onOpenConceptSidebar: handleOpenConceptSidebar,
      onOpenNote: handleOpenNoteSidebar,
      onSkillKeyAttributeChange: handleSkillKeyAttributeChange,
      onSkillProficiencyChange: handleSkillProficiencyChange,
      onSkillModifiersChange: handleSkillModifiersChange,
      onAddCraft: handleAddCraft,
      onUpdateCraft: handleUpdateCraft,
      onRemoveCraft: handleRemoveCraft,
      onSelectedCraftChange: handleSelectedCraftChange,
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
      case 'notes':
        return <NotesTab {...tabProps} />;
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

      {/* Layout principal - Ficha sempre centralizada */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // Centraliza a ficha horizontalmente
        }}
      >
        {/* Container da ficha */}
        <Box
          sx={{
            width: isMobile ? '100%' : '900px',
            maxWidth: '900px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Navegação por abas */}
          <TabNavigation
            currentTab={currentTab}
            onTabChange={handleTabChange}
          />

          {/* Conteúdo da aba atual com loading */}
          <Box
            role="tabpanel"
            id={`tabpanel-${currentTab}`}
            aria-labelledby={`tab-${currentTab}`}
            sx={{
              flex: 1,
              position: 'relative',
              minHeight: 400,
            }}
          >
            {/* Overlay de loading durante transição */}
            <Fade in={isPending} timeout={150}>
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  zIndex: 1300, // Acima de modais e outros overlays
                  backdropFilter: 'blur(2px)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    p: 3,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 3,
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              </Box>
            </Fade>

            {/* Conteúdo da aba */}
            <Suspense
              fallback={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 400,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              }
            >
              {renderTabContent()}
            </Suspense>
          </Box>
        </Box>
      </Box>

      {/* Table of Contents - lado esquerdo (somente desktop) */}
      {!isMobile && (
        <TableOfContents
          open={tocOpen}
          onOpen={() => setTocOpen(true)}
          onClose={() => setTocOpen(false)}
          sections={tocSections[currentTab] || []}
          title="Índice"
        />
      )}

      {/* Sidebars - renderizadas com position fixed à direita da ficha */}
      {!isMobile && (
        <>
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
              archetypeBreakdown={calculateArchetypeHPBreakdown(
                character.archetypes ?? [],
                character.attributes.constituicao
              )}
              baseHP={15}
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
              archetypeBreakdown={calculateArchetypePPBreakdown(
                character.archetypes ?? [],
                character.attributes.presenca
              )}
              basePP={2}
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

          {/* Sidebar de Atributo */}
          {activeSidebar === 'attribute' && selectedAttribute && (
            <AttributeSidebar
              open={activeSidebar === 'attribute'}
              onClose={handleCloseSidebar}
              attribute={selectedAttribute}
              character={character}
              onUpdateAttribute={handleUpdateAttribute}
            />
          )}

          {/* Sidebar de Usos de Habilidade */}
          {activeSidebar === 'skill' && selectedSkill && (
            <SkillUsageSidebar
              open={activeSidebar === 'skill'}
              onClose={handleCloseSidebar}
              skill={character.skills[selectedSkill]}
              attributes={character.attributes}
              characterLevel={character.level}
              isOverloaded={false} // TODO: Calculate from inventory
              onUpdateCustomUses={handleUpdateCustomUses}
              onUpdateDefaultUseAttributes={handleUpdateDefaultUseAttributes}
              onUpdateDefaultUseModifiers={handleUpdateDefaultUseModifiers}
              onUpdateSkillModifiers={handleSkillModifiersChange}
              onSignatureAbilityChange={handleSignatureAbilityChange}
              currentSignatureSkill={getCurrentSignatureSkill()}
              crafts={character.crafts}
              onUpdateCraft={handleUpdateCraft}
              keenSenses={character.senses?.keenSenses}
            />
          )}

          {/* Sidebar de Detalhes de Item */}
          {activeSidebar === 'item' && selectedItem && (
            <ItemDetailsSidebar
              open={activeSidebar === 'item'}
              onClose={handleCloseSidebar}
              item={selectedItem}
              onUpdate={handleUpdateItemFromSidebar}
            />
          )}

          {/* Sidebar de Conceito Expandido */}
          {activeSidebar === 'concept' && (
            <ConceptSidebar
              open={activeSidebar === 'concept'}
              onClose={handleCloseSidebar}
              conceptExpanded={character.conceptExpanded || ''}
              onUpdate={(conceptExpanded) => onUpdate({ conceptExpanded })}
            />
          )}

          {/* Sidebar de Visualização de Nota */}
          {activeSidebar === 'note' && selectedNote && (
            <NoteViewSidebar
              open={activeSidebar === 'note'}
              onClose={handleCloseSidebar}
              note={selectedNote}
              onUpdate={(noteData) => {
                const updatedNotes = (character.notes || []).map((n) =>
                  n.id === selectedNote.id
                    ? {
                        ...n,
                        ...noteData,
                        updatedAt: new Date().toISOString(),
                      }
                    : n
                );
                onUpdate({ notes: updatedNotes });
              }}
              onTogglePin={(noteId) => {
                const updatedNotes = (character.notes || []).map((n) =>
                  n.id === noteId
                    ? {
                        ...n,
                        pinned: !n.pinned,
                        updatedAt: new Date().toISOString(),
                      }
                    : n
                );
                onUpdate({ notes: updatedNotes });
              }}
              onDelete={(noteId) => {
                const updatedNotes = (character.notes || []).filter(
                  (n) => n.id !== noteId
                );
                onUpdate({ notes: updatedNotes });
                handleCloseSidebar();
              }}
              availableCategories={Array.from(
                new Set(
                  (character.notes || [])
                    .map((n) => n.category)
                    .filter((c): c is string => !!c)
                )
              ).sort()}
            />
          )}
        </>
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
          archetypeBreakdown={calculateArchetypeHPBreakdown(
            character.archetypes ?? [],
            character.attributes.constituicao
          )}
          baseHP={15}
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
          archetypeBreakdown={calculateArchetypePPBreakdown(
            character.archetypes ?? [],
            character.attributes.presenca
          )}
          basePP={2}
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

      {/* Sidebar de Atributo em modo mobile (overlay) */}
      {isMobile && activeSidebar === 'attribute' && selectedAttribute && (
        <AttributeSidebar
          open={activeSidebar === 'attribute'}
          onClose={handleCloseSidebar}
          attribute={selectedAttribute}
          character={character}
          onUpdateAttribute={handleUpdateAttribute}
        />
      )}

      {/* Sidebar de Usos de Habilidade em modo mobile (overlay) */}
      {isMobile && activeSidebar === 'skill' && selectedSkill && (
        <SkillUsageSidebar
          open={activeSidebar === 'skill'}
          onClose={handleCloseSidebar}
          skill={character.skills[selectedSkill]}
          attributes={character.attributes}
          characterLevel={character.level}
          isOverloaded={false} // TODO: Calculate from inventory
          onUpdateCustomUses={handleUpdateCustomUses}
          onUpdateDefaultUseAttributes={handleUpdateDefaultUseAttributes}
          onUpdateDefaultUseModifiers={handleUpdateDefaultUseModifiers}
          onUpdateSkillModifiers={handleSkillModifiersChange}
          onSignatureAbilityChange={handleSignatureAbilityChange}
          currentSignatureSkill={getCurrentSignatureSkill()}
          crafts={character.crafts}
          onUpdateCraft={handleUpdateCraft}
          keenSenses={character.senses?.keenSenses}
        />
      )}

      {/* Sidebar de Detalhes de Item em modo mobile (overlay) */}
      {isMobile && activeSidebar === 'item' && selectedItem && (
        <ItemDetailsSidebar
          open={activeSidebar === 'item'}
          onClose={handleCloseSidebar}
          item={selectedItem}
          onUpdate={handleUpdateItemFromSidebar}
        />
      )}

      {/* Sidebar de Conceito Expandido em modo mobile (overlay) */}
      {isMobile && activeSidebar === 'concept' && (
        <ConceptSidebar
          open={activeSidebar === 'concept'}
          onClose={handleCloseSidebar}
          conceptExpanded={character.conceptExpanded || ''}
          onUpdate={(conceptExpanded) => onUpdate({ conceptExpanded })}
        />
      )}

      {/* Sidebar de Visualização de Nota em modo mobile (overlay) */}
      {isMobile && activeSidebar === 'note' && selectedNote && (
        <NoteViewSidebar
          open={activeSidebar === 'note'}
          onClose={handleCloseSidebar}
          note={selectedNote}
          onUpdate={(noteData) => {
            const updatedNotes = (character.notes || []).map((n) =>
              n.id === selectedNote.id
                ? {
                    ...n,
                    ...noteData,
                    updatedAt: new Date().toISOString(),
                  }
                : n
            );
            onUpdate({ notes: updatedNotes });
          }}
          onTogglePin={(noteId) => {
            const updatedNotes = (character.notes || []).map((n) =>
              n.id === noteId
                ? {
                    ...n,
                    pinned: !n.pinned,
                    updatedAt: new Date().toISOString(),
                  }
                : n
            );
            onUpdate({ notes: updatedNotes });
          }}
          onDelete={(noteId) => {
            const updatedNotes = (character.notes || []).filter(
              (n) => n.id !== noteId
            );
            onUpdate({ notes: updatedNotes });
            handleCloseSidebar();
          }}
          availableCategories={Array.from(
            new Set(
              (character.notes || [])
                .map((n) => n.category)
                .filter((c): c is string => !!c)
            )
          ).sort()}
        />
      )}
    </Container>
  );
}
