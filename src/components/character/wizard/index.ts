/**
 * Wizard Components - Barrel export
 *
 * Exporta todos os componentes do wizard de criação de personagem.
 */

export {
  CharacterCreationWizard,
  default as CharacterCreationWizardDefault,
} from './CharacterCreationWizard';
export { WizardStepIndicator } from './WizardStepIndicator';
export { WizardNavigation } from './WizardNavigation';

// Re-exportar tipo de props para os steps
export type { WizardStepProps } from './CharacterCreationWizard';
