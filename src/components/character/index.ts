/**
 * Character Components
 *
 * Componentes relacionados à criação e exibição de fichas de personagem
 */

export { default as CharacterCreationForm } from './CharacterCreationForm';
export type { CharacterCreationFormProps } from './CharacterCreationForm';

export { CharacterSheet } from './CharacterSheet';
export type { CharacterSheetProps } from './CharacterSheet';

export { TabNavigation, CHARACTER_TABS } from './TabNavigation';
export type { TabNavigationProps, CharacterTabId } from './TabNavigation';

// Exportações de abas
export * from './tabs';
