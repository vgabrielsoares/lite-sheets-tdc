/**
 * Tipos do Wizard de Criação de Personagem
 *
 * Define as interfaces e tipos para o wizard de criação passo a passo
 * que guia o jogador através de 9 passos para criar um personagem completo.
 */

import type { SkillName } from './skills';
import type { AttributeName } from './attributes';
import type {
  CreatureSize,
  MovementType,
  VisionType,
  KeenSense,
} from './common';
import type { ArchetypeName, LanguageName } from './character';

/**
 * Passos do wizard de criação
 */
export type WizardStep =
  | 'concept'
  | 'origin'
  | 'lineage'
  | 'attributes'
  | 'archetype'
  | 'skills'
  | 'equipment'
  | 'proficiencies'
  | 'review';

/**
 * Lista ordenada dos passos do wizard
 */
export const WIZARD_STEPS: WizardStep[] = [
  'concept',
  'origin',
  'lineage',
  'attributes',
  'archetype',
  'skills',
  'equipment',
  'proficiencies',
  'review',
];

/**
 * Informações sobre cada passo do wizard
 */
export interface WizardStepInfo {
  /** Identificador do passo */
  step: WizardStep;
  /** Número do passo (1-9) */
  number: number;
  /** Título do passo em português */
  title: string;
  /** Descrição curta do passo */
  description: string;
  /** Ícone do passo (nome do ícone MUI) */
  iconName: string;
}

/**
 * Metadados de todos os passos do wizard
 */
export const WIZARD_STEP_INFO: Record<WizardStep, WizardStepInfo> = {
  concept: {
    step: 'concept',
    number: 1,
    title: 'Conceito',
    description: 'Nome e conceito do personagem',
    iconName: 'Person',
  },
  origin: {
    step: 'origin',
    number: 2,
    title: 'Origem',
    description: 'Background e história',
    iconName: 'Home',
  },
  lineage: {
    step: 'lineage',
    number: 3,
    title: 'Linhagem',
    description: 'Ancestralidade e raça',
    iconName: 'AutoAwesome',
  },
  attributes: {
    step: 'attributes',
    number: 4,
    title: 'Atributos',
    description: 'Distribuição de pontos',
    iconName: 'TrendingUp',
  },
  archetype: {
    step: 'archetype',
    number: 5,
    title: 'Arquétipo',
    description: 'Arquétipo inicial',
    iconName: 'Category',
  },
  skills: {
    step: 'skills',
    number: 6,
    title: 'Habilidades',
    description: 'Proficiências e assinatura',
    iconName: 'Build',
  },
  equipment: {
    step: 'equipment',
    number: 7,
    title: 'Equipamentos',
    description: 'Itens iniciais',
    iconName: 'Backpack',
  },
  proficiencies: {
    step: 'proficiencies',
    number: 8,
    title: 'Proficiências',
    description: 'Compra de proficiências',
    iconName: 'Shield',
  },
  review: {
    step: 'review',
    number: 9,
    title: 'Revisão',
    description: 'Revisar e criar',
    iconName: 'CheckCircle',
  },
};

/**
 * Modificador de atributo (usado em origem e linhagem)
 */
export interface AttributeModifier {
  attribute: AttributeName;
  value: number; // +1, -1, +2, etc.
}

/**
 * Item básico do wizard (antes de virar InventoryItem)
 */
export interface WizardItem {
  /** Nome do item */
  name: string;
  /** Quantidade */
  quantity: number;
  /** Custo em PO$ (opcional) */
  cost?: number;
}

/**
 * Habilidade especial do wizard (simplificada)
 */
export interface WizardSpecialAbility {
  /** Nome da habilidade */
  name: string;
  /** Descrição da habilidade */
  description: string;
  /** Fonte: origem, linhagem, arquétipo, etc. */
  source: string;
}

/**
 * Estado da origem no wizard
 */
export interface WizardOriginState {
  /** Nome da origem */
  name: string;
  /** Descrição da origem */
  description?: string;
  /** Habilidades proficientes ganhas (exatamente 2) */
  skillProficiencies: SkillName[];
  /** Modificadores de atributo */
  attributeModifiers: AttributeModifier[];
  /** Itens ganhos pela origem */
  items: WizardItem[];
  /** Habilidade especial da origem */
  specialAbility?: {
    name: string;
    description: string;
  };
}

/**
 * Estado da linhagem no wizard
 */
export interface WizardLineageState {
  /** Nome da linhagem */
  name: string;
  /** Descrição da linhagem */
  description?: string;
  /** Modificadores de atributo */
  attributeModifiers: AttributeModifier[];
  /** Tamanho */
  size: CreatureSize;
  /** Altura em cm */
  height?: number;
  /** Peso em kg */
  weightKg?: number;
  /** Peso na medida do RPG */
  weightRPG?: number;
  /** Idade */
  age?: number;
  /** Idiomas adicionais ganhos pela linhagem */
  languages: LanguageName[];
  /** Deslocamentos */
  movement: Partial<Record<MovementType, number>>;
  /** Tipo de visão */
  vision: VisionType;
  /** Sentidos aguçados */
  keenSenses: KeenSense[];
  /** Características de ancestralidade */
  ancestryTraits: WizardSpecialAbility[];
}

/**
 * Estado do arquétipo no wizard
 */
export interface WizardArchetypeState {
  /** Arquétipo escolhido */
  name: ArchetypeName | null;
  /** Habilidades iniciais do arquétipo (vão para Adepto) */
  initialSkills: SkillName[];
  /** Proficiências ganhas pelo arquétipo */
  proficiencies: string[];
  /** Características do arquétipo */
  features: WizardSpecialAbility[];
}

/**
 * Proficiência comprada no wizard
 * Os valores de `type` correspondem aos IDs de PURCHASABLE_PROFICIENCIES em proficiencyPurchases.ts
 */
export interface WizardProficiencyPurchase {
  /** ID único da compra */
  id: string;
  /** ID da proficiência comprada (referência a PurchasableProficiency.id) */
  type:
    | 'one-weapon-marcial'
    | 'all-weapons-marcial'
    | 'one-weapon-complexa'
    | 'all-weapons-complexa'
    | 'one-weapon-pesada'
    | 'all-weapons-pesada'
    | 'one-armor-leve'
    | 'all-armors-leve'
    | 'one-armor-media'
    | 'all-armors-media'
    | 'one-armor-pesada'
    | 'all-armors-pesada'
    | 'skill-proficiency'
    | 'language'
    | 'skill-tool'
    | 'craft-tool';
  /** Nome específico (ex: "Espada Longa", "História") */
  specificName?: string;
  /** Atributo usado para pagar */
  paidWithAttribute: AttributeName;
  /** Custo pago */
  cost: number;
}

/**
 * Estado completo do wizard de criação
 */
export interface WizardState {
  /** ID único da sessão do wizard (para localStorage) */
  sessionId: string;
  /** Passo atual */
  currentStep: WizardStep;
  /** Passos visitados */
  visitedSteps: WizardStep[];
  /** Timestamp da última atualização */
  lastUpdated: number;

  // Step 1: Conceito
  concept: {
    /** Nome do personagem */
    characterName: string;
    /** Nome do jogador */
    playerName?: string;
    /** "Você é/foi..." */
    youAre?: string;
    /** "por/a/de..." */
    byFrom?: string;
    /** "Também é..." */
    alsoIs?: string;
    /** "e quer..." */
    andWants?: string;
  };

  // Step 2: Origem
  origin: WizardOriginState;

  // Step 3: Linhagem
  lineage: WizardLineageState;

  // Step 4: Atributos
  attributes: {
    /** Pontos livres distribuídos */
    freePoints: Record<AttributeName, number>;
    /** Se está usando a opção de trocar um atributo para 0 */
    usingExtraPointOption: boolean;
    /** Atributo escolhido para reduzir a 0 (se usando opção) */
    reducedAttribute?: AttributeName;
  };

  // Step 5: Arquétipo
  archetype: WizardArchetypeState;

  // Step 6: Habilidades
  skills: {
    /** Habilidades proficientes escolhidas livremente */
    chosenProficiencies: SkillName[];
    /** Habilidade de assinatura */
    signatureSkill: SkillName | null;
    /** Nível de Sorte (0-7), cada nível acima de 0 consome 1 slot de proficiência */
    luckLevel: number;
  };

  // Step 7: Equipamentos
  equipment: {
    /** Itens adicionais comprados */
    purchasedItems: WizardItem[];
  };

  // Step 8: Proficiências
  proficiencies: {
    /** Proficiências compradas com atributos */
    purchases: WizardProficiencyPurchase[];
  };
}

/**
 * Erro de validação do wizard
 */
export interface WizardValidationError {
  /** Passo onde o erro ocorre */
  step: WizardStep;
  /** Campo com erro */
  field: string;
  /** Mensagem de erro */
  message: string;
  /** Se é bloqueante (impede criação) ou apenas aviso */
  severity: 'error' | 'warning';
}

/**
 * Cria o estado inicial do wizard
 */
export function createInitialWizardState(): WizardState {
  return {
    sessionId: '',
    currentStep: 'concept',
    visitedSteps: ['concept'],
    lastUpdated: Date.now(),

    concept: {
      characterName: '',
      playerName: '',
      youAre: '',
      byFrom: '',
      alsoIs: '',
      andWants: '',
    },

    origin: {
      name: '',
      description: '',
      skillProficiencies: [],
      attributeModifiers: [],
      items: [],
      specialAbility: undefined,
    },

    lineage: {
      name: '',
      description: '',
      attributeModifiers: [],
      size: 'medio',
      height: undefined,
      weightKg: undefined,
      weightRPG: undefined,
      age: undefined,
      languages: [],
      movement: { andando: 5 },
      vision: 'normal',
      keenSenses: [],
      ancestryTraits: [],
    },

    attributes: {
      freePoints: {
        agilidade: 0,
        corpo: 0,
        influencia: 0,
        mente: 0,
        essencia: 0,
        instinto: 0,
      },
      usingExtraPointOption: false,
      reducedAttribute: undefined,
    },

    archetype: {
      name: null,
      initialSkills: [],
      proficiencies: [],
      features: [],
    },

    skills: {
      chosenProficiencies: [],
      signatureSkill: null,
      luckLevel: 0,
    },

    equipment: {
      purchasedItems: [],
    },

    proficiencies: {
      purchases: [],
    },
  };
}

/**
 * Calcula os atributos finais considerando origem, linhagem e distribuição livre
 */
export function calculateFinalAttributes(
  state: WizardState
): Record<AttributeName, number> {
  const base: Record<AttributeName, number> = {
    agilidade: 1,
    corpo: 1,
    influencia: 1,
    mente: 1,
    essencia: 1,
    instinto: 1,
  };

  // Aplicar modificadores de origem
  for (const mod of state.origin.attributeModifiers) {
    base[mod.attribute] += mod.value;
  }

  // Aplicar modificadores de linhagem
  for (const mod of state.lineage.attributeModifiers) {
    base[mod.attribute] += mod.value;
  }

  // Aplicar pontos livres distribuídos
  for (const [attr, value] of Object.entries(state.attributes.freePoints)) {
    base[attr as AttributeName] += value;
  }

  // Aplicar redução se usando opção extra
  if (
    state.attributes.usingExtraPointOption &&
    state.attributes.reducedAttribute
  ) {
    base[state.attributes.reducedAttribute] = 0;
  }

  // Garantir mínimo de 0
  for (const attr of Object.keys(base) as AttributeName[]) {
    if (base[attr] < 0) base[attr] = 0;
  }

  return base;
}

/**
 * Calcula o total de pontos livres disponíveis
 */
export function calculateAvailableFreePoints(state: WizardState): number {
  const basePoints = 2;
  const extraPoint = state.attributes.usingExtraPointOption ? 1 : 0;
  const usedPoints = Object.values(state.attributes.freePoints).reduce(
    (sum, val) => sum + val,
    0
  );
  return basePoints + extraPoint - usedPoints;
}

/**
 * Verifica se a linhagem deu +2 em algum atributo
 */
export function hasLineagePlus2(state: WizardState): AttributeName | null {
  for (const mod of state.lineage.attributeModifiers) {
    if (mod.value >= 2) {
      return mod.attribute;
    }
  }
  return null;
}

/**
 * Retorna o limite máximo de um atributo no nível 1
 */
export function getAttributeMaxLimit(
  attribute: AttributeName,
  state: WizardState
): number {
  const plus2Attr = hasLineagePlus2(state);
  if (plus2Attr === attribute) {
    return 4; // Limite aumentado para 4 se linhagem deu +2
  }
  return 3; // Limite padrão de 3 no nível 1
}
