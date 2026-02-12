/**
 * wizardToCharacter - Converte o estado do wizard para um Character completo
 *
 * Aplica todos os ganhos de nível 1 e monta a estrutura final do personagem
 * conforme as regras do RPG Tabuleiro do Caos (livro v0.1.7).
 */

import { uuidv4 } from './uuid';
import type {
  Character,
  Archetype,
  Origin,
  Lineage,
  LevelProgression,
  LevelHistoryEntry,
  Particularities,
  CharacterDefiners,
  PhysicalDescription,
  Movement,
  Senses,
  LuckLevel,
  LanguageName,
} from '@/types/character';
import type { Attributes } from '@/types/attributes';
import type { Skills, Skill, SkillName } from '@/types/skills';
import { SKILL_LIST, SKILL_KEY_ATTRIBUTES } from '@/types/skills';
import type {
  SpecialAbility,
  SpecialAbilitySource,
} from '@/types/specialAbilities';
import type {
  InventoryItem,
  Inventory,
  CarryingCapacity,
  Currency,
} from '@/types/inventory';
import type {
  CombatData,
  GuardPoints,
  VitalityPoints,
  PowerPoints,
  VulnerabilityDie,
  Attack,
  DyingState,
  ActionEconomy,
  PPLimit,
  SavingThrow,
  Resistances,
  CombatState,
} from '@/types/combat';
import type { WizardState } from '@/types/wizard';
import { calculateFinalAttributes } from '@/types/wizard';
import { DEFAULT_WEAPON_PROFICIENCY } from '@/constants/proficiencies';
import {
  ARCHETYPE_GA_ATTRIBUTE,
  ARCHETYPE_PP_BASE_PER_LEVEL,
} from '@/constants/archetypes';
import { calculateVitality } from './calculations';
import { createDefaultResources } from '@/constants/resources';
import type { ProficiencyPurchaseRecord } from '@/constants/proficiencyPurchases';

/**
 * GA base no nível 1
 */
const GA_BASE_LEVEL_1 = 15;

/**
 * PP base no nível 1
 */
const PP_BASE_LEVEL_1 = 2;

/**
 * Monta o conceito completo a partir dos campos do wizard
 */
function buildConceptText(concept: WizardState['concept']): string {
  const parts: string[] = [];

  if (concept.youAre) {
    parts.push(`Você é/foi ${concept.youAre}`);
  }
  if (concept.byFrom) {
    parts.push(concept.byFrom);
  }
  if (concept.alsoIs) {
    parts.push(`Também é ${concept.alsoIs}`);
  }
  if (concept.andWants) {
    parts.push(`e quer ${concept.andWants}`);
  }

  return parts.join('. ').trim();
}

/**
 * Cria os atributos finais do personagem
 */
function createCharacterAttributes(state: WizardState): Attributes {
  const calculated = calculateFinalAttributes(state);
  return {
    agilidade: calculated.agilidade,
    corpo: calculated.corpo,
    influencia: calculated.influencia,
    mente: calculated.mente,
    essencia: calculated.essencia,
    instinto: calculated.instinto,
  };
}

/**
 * Cria as habilidades do personagem com proficiências aplicadas
 */
function createCharacterSkills(state: WizardState): Skills {
  const skills: Partial<Skills> = {};

  // Coletar todas as habilidades proficientes
  const proficientSkills = new Set<SkillName>();

  // Habilidades de origem
  for (const skill of state.origin.skillProficiencies) {
    proficientSkills.add(skill);
  }

  // Habilidades iniciais do arquétipo (vão para Adepto)
  for (const skill of state.archetype.initialSkills) {
    proficientSkills.add(skill);
  }

  // Habilidades escolhidas livremente
  for (const skill of state.skills.chosenProficiencies) {
    proficientSkills.add(skill);
  }

  // Criar todas as habilidades
  for (const skillName of SKILL_LIST) {
    const keyAttribute = SKILL_KEY_ATTRIBUTES[skillName];
    const isProficient = proficientSkills.has(skillName);
    const isSignature = state.skills.signatureSkill === skillName;

    skills[skillName] = {
      name: skillName,
      keyAttribute: keyAttribute === 'especial' ? 'mente' : keyAttribute,
      proficiencyLevel: isProficient ? 'adepto' : 'leigo',
      isSignature,
      modifiers: [],
    } as Skill;
  }

  return skills as Skills;
}

/**
 * Cria a origem do personagem
 */
function createCharacterOrigin(state: WizardState): Origin | undefined {
  if (!state.origin.name) return undefined;

  return {
    name: state.origin.name,
    description: state.origin.description,
    skillProficiencies: state.origin.skillProficiencies,
    attributeModifiers: state.origin.attributeModifiers,
    specialAbility: state.origin.specialAbility,
  };
}

/**
 * Cria a linhagem do personagem
 */
function createCharacterLineage(state: WizardState): Lineage | undefined {
  if (!state.lineage.name) return undefined;

  return {
    name: state.lineage.name,
    description: state.lineage.description,
    attributeModifiers: state.lineage.attributeModifiers,
    size: state.lineage.size,
    height: state.lineage.height || 170,
    weightKg: state.lineage.weightKg || 70,
    weightRPG: state.lineage.weightRPG || 14,
    age: state.lineage.age || 25,
    languages: state.lineage.languages,
    movement: {
      andando: state.lineage.movement.andando || 5,
      voando: state.lineage.movement.voando || 0,
      nadando: state.lineage.movement.nadando || 0,
      escalando: state.lineage.movement.escalando || 0,
      escavando: state.lineage.movement.escavando || 0,
    },
    vision: state.lineage.vision,
    keenSenses: state.lineage.keenSenses || [],
    ancestryTraits: state.lineage.ancestryTraits.map((trait) => ({
      name: trait.name,
      description: trait.description,
    })),
  };
}

/**
 * Cria o arquétipo inicial do personagem
 */
function createCharacterArchetype(state: WizardState): Archetype | null {
  if (!state.archetype.name) return null;

  return {
    name: state.archetype.name,
    level: 1,
    features: state.archetype.features.map((f) => ({
      name: f.name,
      acquiredAtLevel: 1,
      description: f.description,
    })),
  };
}

/**
 * Cria as habilidades especiais agregando de todas as fontes
 */
function createCharacterSpecialAbilities(state: WizardState): SpecialAbility[] {
  const abilities: SpecialAbility[] = [];

  // Habilidade especial da origem
  if (state.origin.specialAbility) {
    abilities.push({
      id: uuidv4(),
      name: state.origin.specialAbility.name,
      description: state.origin.specialAbility.description,
      source: 'origem' as SpecialAbilitySource,
      sourceName: state.origin.name,
    });
  }

  // Características de ancestralidade da linhagem
  for (const trait of state.lineage.ancestryTraits) {
    abilities.push({
      id: uuidv4(),
      name: trait.name,
      description: trait.description,
      source: 'linhagem' as SpecialAbilitySource,
      sourceName: state.lineage.name,
    });
  }

  // Características do arquétipo
  for (const feature of state.archetype.features) {
    abilities.push({
      id: uuidv4(),
      name: feature.name,
      description: feature.description,
      source: 'arquetipo' as SpecialAbilitySource,
      sourceName: state.archetype.name || '',
    });
  }

  return abilities;
}

/**
 * Calcula o GA total considerando arquétipo e atributos
 */
function calculateGA(state: WizardState): number {
  const attributes = calculateFinalAttributes(state);

  if (!state.archetype.name) {
    return GA_BASE_LEVEL_1;
  }

  // GA = 15 + (atributo_do_arquétipo × níveis_no_arquétipo)
  const gaAttribute = ARCHETYPE_GA_ATTRIBUTE[state.archetype.name];
  const attributeValue = attributes[gaAttribute] || 0;

  return GA_BASE_LEVEL_1 + attributeValue;
}

/**
 * Calcula o PP total considerando arquétipo e Essência
 */
function calculatePP(state: WizardState): number {
  const attributes = calculateFinalAttributes(state);

  if (!state.archetype.name) {
    return PP_BASE_LEVEL_1;
  }

  // PP = 2 + (base_pp + Essência) × níveis_no_arquétipo
  const basePP = ARCHETYPE_PP_BASE_PER_LEVEL[state.archetype.name] || 0;
  const essencia = attributes.essencia || 0;

  return PP_BASE_LEVEL_1 + basePP + essencia;
}

/**
 * Cria o ataque desarmado padrão
 */
function createUnarmedAttack(): Attack {
  return {
    name: 'Ataque Desarmado',
    type: 'corpo-a-corpo',
    attackSkill: 'luta',
    attackSkillUseId: 'atacar',
    attackAttribute: 'corpo',
    attackDiceModifier: 0,
    damageRoll: {
      quantity: 1,
      type: 'd2',
      modifier: 0,
    },
    damageType: 'impacto',
    range: 'Adjacente/Toque (1m)',
    description:
      'Um ataque corpo a corpo desarmado usando punhos, chutes ou outras partes do corpo.',
    ppCost: 0,
    actionCost: 1,
    addAttributeToDamage: true,
    doubleAttributeDamage: false,
    isDefaultAttack: true,
  };
}

/**
 * Cria os dados de combate
 */
function createCharacterCombat(state: WizardState): CombatData {
  const ga = calculateGA(state);
  const pv = calculateVitality(ga);
  const pp = calculatePP(state);
  const attributes = calculateFinalAttributes(state);

  const guard: GuardPoints = {
    current: ga,
    max: ga,
  };

  const vitality: VitalityPoints = {
    current: pv,
    max: pv,
  };

  const ppData: PowerPoints = {
    current: pp,
    max: pp,
    temporary: 0,
  };

  const vulnerabilityDie: VulnerabilityDie = {
    currentDie: 'd20',
    isActive: false,
  };

  const dyingState: DyingState = {
    isDying: false,
    currentRounds: 0,
    maxRounds: 2 + (attributes.corpo || 1),
  };

  const actionEconomy: ActionEconomy = {
    turnType: 'rapido',
    actions: [true, true],
    reaction: true,
    extraActions: [],
  };

  const ppLimit: PPLimit = {
    base: 1 + (attributes.essencia || 1), // level + essencia
    modifiers: [],
    total: 1 + (attributes.essencia || 1),
  };

  const savingThrows: SavingThrow[] = [
    { type: 'determinacao', skill: 'determinacao', diceModifier: 0 },
    { type: 'reflexo', skill: 'reflexo', diceModifier: 0 },
    { type: 'sintonia', skill: 'sintonia', diceModifier: 0 },
    { type: 'tenacidade', skill: 'tenacidade', diceModifier: 0 },
    { type: 'vigor', skill: 'vigor', diceModifier: 0 },
  ];

  const resistances: Resistances = {
    damageReduction: [],
    damageResistances: [],
    damageImmunities: [],
    damageVulnerabilities: [],
    conditionImmunities: [],
  };

  return {
    guard,
    vitality,
    pp: ppData,
    state: 'normal' as CombatState,
    dyingState,
    vulnerabilityDie,
    actionEconomy,
    ppLimit,
    attacks: [createUnarmedAttack()],
    savingThrows,
    resistances,
    conditions: [],
    penalties: {
      defensePenalty: 0,
      savingThrowPenalties: {
        determinacao: 0,
        reflexo: 0,
        sintonia: 0,
        tenacidade: 0,
        vigor: 0,
      },
    },
  };
}

/**
 * Cria capacidade de carga
 */
function createCarryingCapacity(corpoValue: number): CarryingCapacity {
  const baseCapacity = 5 + corpoValue * 5;
  return {
    base: baseCapacity,
    sizeModifier: 0,
    otherModifiers: 0,
    modifiers: 0,
    total: baseCapacity,
    currentWeight: 0,
    encumbranceState: 'normal',
    pushLimit: baseCapacity * 2,
    liftLimit: Math.floor(baseCapacity / 2),
  };
}

/**
 * Cria o inventário inicial com itens padrão + origem + comprados
 */
function createCharacterInventory(
  state: WizardState,
  corpoValue: number
): Inventory {
  const items: InventoryItem[] = [];

  // Itens padrão
  items.push({
    id: uuidv4(),
    name: 'Mochila',
    description: 'Mochila padrão de aventureiro',
    category: 'miscelanea',
    quantity: 1,
    weight: null,
    value: 0,
    equipped: true,
  });

  items.push({
    id: uuidv4(),
    name: 'Cartão do Banco',
    description: 'Cartão para acesso à conta bancária',
    category: 'miscelanea',
    quantity: 1,
    weight: null,
    value: 0,
    equipped: false,
  });

  // Itens da origem
  for (const item of state.origin.items) {
    items.push({
      id: uuidv4(),
      name: item.name,
      category: 'miscelanea',
      quantity: item.quantity,
      weight: 0,
      value: item.cost || 0,
      equipped: false,
    });
  }

  // Itens comprados
  for (const item of state.equipment.purchasedItems) {
    items.push({
      id: uuidv4(),
      name: item.name,
      category: 'miscelanea',
      quantity: item.quantity,
      weight: 0,
      value: item.cost || 0,
      equipped: false,
    });
  }

  // Calcular gasto total
  const totalSpent = state.equipment.purchasedItems.reduce(
    (sum, item) => sum + (item.cost || 0) * item.quantity,
    0
  );
  const remainingGold = Math.max(0, 10 - totalSpent);

  const currency: Currency = {
    physical: {
      cobre: 0,
      ouro: 0,
      platina: 0,
    },
    bank: {
      cobre: 0,
      ouro: remainingGold,
      platina: 0,
    },
  };

  return {
    items,
    currency,
    carryingCapacity: createCarryingCapacity(corpoValue),
  };
}

/**
 * Cria movimento do personagem
 */
function createCharacterMovement(state: WizardState): Movement {
  return {
    speeds: {
      andando: {
        base: state.lineage.movement.andando || 5,
        bonus: 0,
      },
      voando: {
        base: state.lineage.movement.voando || 0,
        bonus: 0,
      },
      nadando: {
        base: state.lineage.movement.nadando || 0,
        bonus: 0,
      },
      escalando: {
        base: state.lineage.movement.escalando || 0,
        bonus: 0,
      },
      escavando: {
        base: state.lineage.movement.escavando || 0,
        bonus: 0,
      },
    },
    modifiers: 0,
  };
}

/**
 * Cria sentidos do personagem
 */
function createCharacterSenses(state: WizardState): Senses {
  return {
    vision: state.lineage.vision,
    keenSenses: state.lineage.keenSenses || [],
    perceptionModifiers: {
      audicao: 0,
      olfato: 0,
      visao: 0,
    },
  };
}

/**
 * Cria lista de idiomas conhecidos
 */
function createCharacterLanguages(state: WizardState): LanguageName[] {
  const languages = new Set<LanguageName>();

  // Comum sempre presente
  languages.add('comum');

  // Idiomas comprados via proficiency purchases
  for (const purchase of state.proficiencies.purchases) {
    if (purchase.type === 'language' && purchase.specificName) {
      // Normalize language name to LanguageName type
      const langName = purchase.specificName.toLowerCase() as LanguageName;
      languages.add(langName);
    }
  }

  return Array.from(languages);
}

/**
 * Cria proficiências do personagem
 */
function createCharacterProficiencies(state: WizardState): {
  weapons: string[];
  armor: string[];
  tools: string[];
  other: string[];
} {
  const proficiencies: {
    weapons: string[];
    armor: string[];
    tools: string[];
    other: string[];
  } = {
    weapons: [DEFAULT_WEAPON_PROFICIENCY as string],
    armor: [],
    tools: [],
    other: [],
  };

  // Proficiências do arquétipo
  for (const prof of state.archetype.proficiencies) {
    const lowerProf = prof.toLowerCase();

    // Classificar por categoria
    if (
      lowerProf.includes('armadura') ||
      lowerProf.includes('armor') ||
      lowerProf.includes('escudo')
    ) {
      // Armaduras e escudos — DEVE vir antes de 'arma' para evitar falso positivo
      proficiencies.armor.push(prof);
    } else if (
      lowerProf.includes('arma') ||
      lowerProf.includes('weapon') ||
      lowerProf.includes('maestria')
    ) {
      // Armas
      if (!proficiencies.weapons.includes(prof)) {
        proficiencies.weapons.push(prof);
      }
    } else if (
      lowerProf.includes('ferramenta') ||
      lowerProf.includes('instrumento') ||
      lowerProf.includes('tool')
    ) {
      // Ferramentas e instrumentos
      proficiencies.tools.push(prof);
    } else {
      proficiencies.other.push(prof);
    }
  }

  // Proficiências compradas
  for (const purchase of state.proficiencies.purchases) {
    const name = purchase.specificName || purchase.type;

    switch (purchase.type) {
      case 'one-weapon-marcial':
      case 'all-weapons-marcial':
      case 'one-weapon-complexa':
      case 'all-weapons-complexa':
      case 'one-weapon-pesada':
      case 'all-weapons-pesada':
        if (!proficiencies.weapons.includes(name)) {
          proficiencies.weapons.push(name);
        }
        break;

      case 'one-armor-leve':
      case 'all-armors-leve':
      case 'one-armor-media':
      case 'all-armors-media':
      case 'one-armor-pesada':
      case 'all-armors-pesada':
        proficiencies.armor.push(name);
        break;

      case 'skill-tool':
      case 'craft-tool':
        proficiencies.tools.push(name);
        break;

      case 'skill-proficiency':
        // Proficiência em perícia adicional - já tratada em createCharacterSkills
        break;

      case 'language':
        // Idiomas comprados - já tratados em createCharacterLanguages
        break;
    }
  }

  return proficiencies;
}

/**
 * Cria particularidades vazias
 */
function createDefaultParticularities(): Particularities {
  return {
    negativeTraits: [],
    positiveTraits: [],
    completeTraits: [],
    balance: 0,
  };
}

/**
 * Cria definidores vazios
 */
function createDefaultDefiners(): CharacterDefiners {
  return {
    flaws: [],
    fears: [],
    ideals: [],
    traits: [],
    goals: [],
    allies: [],
    organizations: [],
  };
}

/**
 * Cria descrição física
 */
function createPhysicalDescription(state: WizardState): PhysicalDescription {
  return {
    skin: undefined,
    eyes: undefined,
    hair: undefined,
    weight: state.lineage.weightKg || 70,
    other: undefined,
  };
}

/**
 * Cria progressão de níveis inicial
 */
function createLevelProgression(): LevelProgression[] {
  const progression: LevelProgression[] = [];

  for (let i = 1; i <= 15; i++) {
    progression.push({
      level: i,
      gains: [],
      achieved: i === 1, // Nível 1 alcançado
    });
  }

  return progression;
}

/**
 * Cria registro de histórico de level up para nível 1
 */
function createLevelHistory(
  state: WizardState,
  timestamp: string
): LevelHistoryEntry[] {
  if (!state.archetype.name) return [];

  return [
    {
      level: 1,
      archetype: state.archetype.name,
      gainType: 'caracteristica',
      gainName: state.archetype.features[0]?.name,
      gainDescription: state.archetype.features[0]?.description,
      timestamp,
    },
  ];
}

/**
 * Cria a sorte inicial com base no nível definido no wizard
 */
function createLuckFromWizard(state: WizardState): LuckLevel {
  const luckLevel = state.skills.luckLevel ?? 0;
  return {
    level: luckLevel,
    value: luckLevel,
    diceModifier: 0,
    numericModifier: 0,
  };
}

/**
 * Mapeia WizardProficiencyPurchase para ProficiencyPurchaseRecord
 */
function mapProficiencyPurchases(
  state: WizardState
): ProficiencyPurchaseRecord[] {
  return state.proficiencies.purchases.map((p) => ({
    id: p.id,
    proficiencyId: p.type, // Using type as proficiencyId
    name: p.specificName || p.type,
    specificName: p.specificName,
    paidWithAttribute: p.paidWithAttribute,
    cost: p.cost,
    refunded: false,
  }));
}

/**
 * Converte o estado completo do wizard para um Character
 */
export function convertWizardToCharacter(state: WizardState): Character {
  const attributes = createCharacterAttributes(state);
  const now = Date.now().toString();
  const archetype = createCharacterArchetype(state);

  const character: Character = {
    // Metadados (BaseEntity)
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,

    // Versão do schema
    schemaVersion: 2,

    // Informações Básicas
    name: state.concept.characterName.trim(),
    playerName: state.concept.playerName?.trim() || undefined,
    concept: buildConceptText(state.concept) || undefined,
    conceptExpanded: undefined,

    // Nível e Experiência
    // Wizard cria personagem nível 1 com 0 XP (já no nível 1, sem bônus)
    // A ficha do zero começa com 15 XP (para representar a subida do nível 0 ao 1)
    level: 1,
    experience: {
      current: 0,
      toNextLevel: 30, // XP para nível 2
    },

    // Origem e Linhagem
    origin: createCharacterOrigin(state),
    lineage: createCharacterLineage(state),

    // Atributos
    attributes,

    // Arquétipos e Classes
    archetypes: archetype ? [archetype] : [],
    classes: [],

    // Habilidades
    skills: createCharacterSkills(state),
    signatureSkill: state.skills.signatureSkill || 'acerto',
    // Proficiências de origem + arquétipo são bônus adicionais ao 3+Mente
    skillProficiencyBonusSlots: new Set([
      ...state.origin.skillProficiencies,
      ...(state.archetype.initialSkills as SkillName[]),
    ]).size,

    // Combate
    combat: createCharacterCombat(state),

    // Deslocamento e Sentidos
    movement: createCharacterMovement(state),
    senses: createCharacterSenses(state),
    size: state.lineage.size,

    // Idiomas e Proficiências
    languages: createCharacterLanguages(state),
    extraLanguagesModifier: 0,
    proficiencies: createCharacterProficiencies(state),
    proficiencyPurchases: mapProficiencyPurchases(state),

    // Sorte e Ofícios
    luck: createLuckFromWizard(state),
    crafts: [],

    // Recursos
    resources: createDefaultResources(uuidv4),

    // Habilidades Especiais
    specialAbilities: createCharacterSpecialAbilities(state),

    // Inventário
    inventory: createCharacterInventory(state, attributes.corpo),

    // Feitiços (opcional)
    spellcasting: undefined,

    // Particularidades
    particularities: createDefaultParticularities(),

    // Descrição e História
    physicalDescription: createPhysicalDescription(state),
    gender: undefined,
    alignment: undefined,
    faith: undefined,
    definers: createDefaultDefiners(),
    backstory: undefined,

    // Progressão
    levelProgression: createLevelProgression(),
    levelHistory: createLevelHistory(state, now),

    // Anotações
    notes: [],
  };

  return character;
}
