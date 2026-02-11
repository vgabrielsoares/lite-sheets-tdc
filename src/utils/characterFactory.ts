/**
 * Character Factory - Funções para criar personagens com valores padrão
 *
 * Este arquivo contém funções utilitárias para criar personagens novos
 * seguindo as regras do Tabuleiro do Caos RPG, especialmente os valores
 * padrão de nível 1.
 */

import { uuidv4 } from './uuid';
import type {
  Character,
  Experience,
  LevelProgression,
} from '@/types/character';
import type { Attributes } from '@/types/attributes';
import type { Skills, SkillName, Skill } from '@/types/skills';
import type {
  CombatData,
  HealthPoints,
  PowerPoints,
  Attack,
  GuardPoints,
  VitalityPoints,
  VulnerabilityDie,
} from '@/types/combat';
import { DEFAULT_GA_LEVEL_1 } from '@/types/combat';
import { calculateVitality } from '@/utils/calculations';
import type {
  Inventory,
  InventoryItem,
  Currency,
  CarryingCapacity,
} from '@/types/inventory';
import type {
  Movement,
  Senses,
  Particularities,
  CharacterDefiners,
  PhysicalDescription,
} from '@/types/character';
import { ATTRIBUTE_DEFAULT } from '@/constants/attributes';
import { SKILL_LIST } from '@/constants/skills';
import { SKILL_KEY_ATTRIBUTES } from '@/types/skills';
import { DEFAULT_WEAPON_PROFICIENCY } from '@/constants/proficiencies';
import { createDefaultResources } from '@/constants/resources';

/**
 * Cria atributos padrão de nível 1
 * Todos os atributos começam em 1 (média de um humanoide normal)
 */
function createDefaultAttributes(): Attributes {
  return {
    agilidade: ATTRIBUTE_DEFAULT,
    corpo: ATTRIBUTE_DEFAULT,
    influencia: ATTRIBUTE_DEFAULT,
    mente: ATTRIBUTE_DEFAULT,
    essencia: ATTRIBUTE_DEFAULT,
    instinto: ATTRIBUTE_DEFAULT,
  };
}

/**
 * Cria habilidades padrão de nível 1
 * Todas começam como Leigo (sem proficiência)
 */
function createDefaultSkills(): Skills {
  const skills: Partial<Skills> = {};

  SKILL_LIST.forEach((skillName) => {
    const keyAttribute = SKILL_KEY_ATTRIBUTES[skillName];

    skills[skillName] = {
      name: skillName,
      keyAttribute: keyAttribute === 'especial' ? 'mente' : keyAttribute,
      proficiencyLevel: 'leigo',
      isSignature: false,
      modifiers: [],
    } as Skill;
  });

  return skills as Skills;
}

/**
 * Cria Guarda (GA) padrão de nível 1
 * Base: 15 GA máximo e atual
 */
function createDefaultGuard(): GuardPoints {
  return {
    current: DEFAULT_GA_LEVEL_1,
    max: DEFAULT_GA_LEVEL_1,
  };
}

/**
 * Cria Vitalidade (PV) padrão de nível 1
 * Base: floor(GA_max / 3) = 5
 */
function createDefaultVitality(): VitalityPoints {
  const pvMax = calculateVitality(DEFAULT_GA_LEVEL_1);
  return {
    current: pvMax,
    max: pvMax,
  };
}

/**
 * Cria dado de vulnerabilidade padrão (inativo, começa em d20)
 */
function createDefaultVulnerabilityDie(): VulnerabilityDie {
  return {
    currentDie: 'd20',
    isActive: false,
  };
}

/**
 * @deprecated Substituído por createDefaultGuard + createDefaultVitality em v0.0.2
 * Cria pontos de vida padrão de nível 1 (legado)
 * Base: 15 PV máximo e atual, 0 temporário
 */
function createDefaultHP(): HealthPoints {
  return {
    current: 15,
    max: 15,
    temporary: 0,
  };
}

/**
 * Cria pontos de poder padrão de nível 1
 * Base: 2 PP máximo e atual, 0 temporário
 */
function createDefaultPP(): PowerPoints {
  return {
    current: 2,
    max: 2,
    temporary: 0,
  };
}

/**
 * Nome fixo do ataque desarmado (constante para comparações)
 */
export const UNARMED_ATTACK_NAME = 'Ataque Desarmado';

/**
 * Cria o ataque desarmado padrão
 * Todos os personagens têm esse ataque por padrão
 * - Usa Corpo e o uso "Atacar"
 * - Dano: 1d2 + Corpo
 * - Custo: 1 ação (▶)
 * - Não pode ser deletado
 * - Nome não pode ser alterado
 */
function createUnarmedAttack(): Attack {
  return {
    name: UNARMED_ATTACK_NAME,
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
    actionCost: 1, // ▶ (1 ação)
    addAttributeToDamage: true,
    doubleAttributeDamage: false,
    isDefaultAttack: true,
  };
}

/**
 * Cria dados de combate padrão de nível 1
 *
 * Mudanças v0.0.2:
 * - HP → GA (Guarda) + PV (Vitalidade)
 * - Defesa fixa → removida (teste ativo)
 * - Ação Maior/Menor → Turno Rápido/Lento
 * - Dado de vulnerabilidade adicionado
 * - Iniciativa removida (turno é voluntário)
 */
function createDefaultCombat(): CombatData {
  return {
    guard: createDefaultGuard(),
    vitality: createDefaultVitality(),
    pp: createDefaultPP(),
    state: 'normal',
    dyingState: {
      isDying: false,
      currentRounds: 0,
      maxRounds: 3, // 2 + Corpo (1)
    },
    vulnerabilityDie: createDefaultVulnerabilityDie(),
    actionEconomy: {
      turnType: 'rapido',
      actions: [true, true], // ▶▶ (2 ações para turno rápido)
      reaction: true, // ↩ (1 reação por rodada)
      extraActions: [],
    },
    ppLimit: {
      base: 2, // Nível (1) + Essência (1)
      modifiers: [],
      total: 2,
    },
    attacks: [createUnarmedAttack()],
    savingThrows: [
      {
        type: 'determinacao',
        skill: 'determinacao',
        diceModifier: 0,
      },
      {
        type: 'reflexo',
        skill: 'reflexo',
        diceModifier: 0,
      },
      {
        type: 'sintonia',
        skill: 'sintonia',
        diceModifier: 0,
      },
      {
        type: 'tenacidade',
        skill: 'tenacidade',
        diceModifier: 0,
      },
      {
        type: 'vigor',
        skill: 'vigor',
        diceModifier: 0,
      },
    ],
    resistances: {
      damageReduction: [],
      damageResistances: [],
      damageImmunities: [],
      damageVulnerabilities: [],
      conditionImmunities: [],
    },
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
 * Cria capacidade de carga padrão
 */
function createDefaultCarryingCapacity(): CarryingCapacity {
  return {
    base: 10, // 5 + (Corpo (1) * 5)
    sizeModifier: 0,
    otherModifiers: 0,
    modifiers: 0,
    total: 10,
    currentWeight: 0,
    encumbranceState: 'normal',
    pushLimit: 20, // Dobro da capacidade
    liftLimit: 5, // Metade da capacidade
  };
}

/**
 * Cria inventário padrão de nível 1
 * Base: Mochila, Cartão do Banco, 10 PO$
 */
function createDefaultInventory(): Inventory {
  const defaultItems: InventoryItem[] = [
    {
      id: uuidv4(),
      name: 'Mochila',
      description: 'Mochila padrão de aventureiro',
      category: 'miscelanea',
      quantity: 1,
      weight: null, // Mochila não tem peso
      value: 0,
      equipped: true,
    },
    {
      id: uuidv4(),
      name: 'Cartão do Banco',
      description: 'Cartão para acesso à conta bancária',
      category: 'miscelanea',
      quantity: 1,
      weight: null, // Cartão não tem peso
      value: 0,
      equipped: false,
    },
  ];

  const defaultCurrency: Currency = {
    physical: {
      cobre: 0,
      ouro: 0,
      platina: 0,
    },
    bank: {
      cobre: 0,
      ouro: 10, // 10 PO$ inicial no banco (com Cartão do Banco)
      platina: 0,
    },
  };

  return {
    items: defaultItems,
    currency: defaultCurrency,
    carryingCapacity: createDefaultCarryingCapacity(),
  };
}

/**
 * Cria deslocamento padrão
 */
function createDefaultMovement(): Movement {
  return {
    speeds: {
      andando: { base: 5, bonus: 0 }, // Padrão 5m
      voando: { base: 0, bonus: 0 },
      escalando: { base: 0, bonus: 0 },
      escavando: { base: 0, bonus: 0 },
      nadando: { base: 0, bonus: 0 },
    },
    modifiers: 0,
  };
}

/**
 * Cria sentidos padrão
 */
function createDefaultSenses(): Senses {
  return {
    vision: 'normal',
    keenSenses: [],
    perceptionModifiers: {
      visao: 0,
      olfato: 0,
      audicao: 0,
    },
  };
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
 * Cria descrição física com peso padrão
 * MVP-1: Peso padrão de 10
 */
function createDefaultPhysicalDescription(): PhysicalDescription {
  return {
    skin: undefined,
    eyes: undefined,
    hair: undefined,
    weight: 10, // MVP-1: Peso padrão
    other: undefined,
  };
}

/**
 * Cria experiência de nível 1
 * MVP-1: 50 XP necessário para alcançar nível 2
 */
function createDefaultExperience(): Experience {
  return {
    current: 15, // Começa com 15 XP (suficiente para subir ao nível 1)
    toNextLevel: 15, // XP necessário para nível 0→1
  };
}

/**
 * Cria progressão de níveis inicial
 */
function createDefaultLevelProgression(): LevelProgression[] {
  const progression: LevelProgression[] = [];

  // Criar progressão do nível 1 ao 15 (padrão do MVP)
  for (let i = 1; i <= 15; i++) {
    progression.push({
      level: i,
      gains: [],
      achieved: false, // Nenhum nível alcançado (personagem começa nível 0)
    });
  }

  return progression;
}

/**
 * Interface para parâmetros opcionais de criação de personagem
 */
interface CreateCharacterParams {
  name: string;
  playerName?: string;
  concept?: string;
}

/**
 * Cria um personagem com valores padrão de nível 0
 *
 * Valores aplicados automaticamente conforme regras do RPG:
 * - 15 PV máximo e atual, 0 temporário
 * - 2 PP máximo e atual, 0 temporário
 * - Todos os atributos em 1
 * - Proficiência com Armas Simples
 * - Idioma Comum conhecido
 * - Habilidades proficientes: 3 + Mente (1) = 4 (mas começam como Leigo)
 * - Inventário: Mochila, Cartão do Banco, 10 PO$
 *
 * @param params - Parâmetros básicos (nome obrigatório)
 * @returns Personagem completo com valores padrão de nível 1
 */
export function createDefaultCharacter(
  params: CreateCharacterParams
): Character {
  const now = Date.now();
  const id = uuidv4();

  return {
    // BaseEntity
    id,
    createdAt: now.toString(),
    updatedAt: now.toString(),

    // Versão do schema
    schemaVersion: 2,

    // Informações Básicas
    name: params.name,
    playerName: params.playerName,
    concept: params.concept,
    conceptExpanded: undefined,

    // Nível e Experiência (começa em 0, sobe ao 1 escolhendo um arquétipo)
    level: 0,
    experience: createDefaultExperience(),

    // Origem e Linhagem (vazios, preenchidos manualmente no MVP 1)
    origin: undefined,
    lineage: undefined,

    // Atributos
    attributes: createDefaultAttributes(),

    // Arquétipos e Classes (vazios inicialmente)
    archetypes: [],
    classes: [],

    // Habilidades
    skills: createDefaultSkills(),
    signatureSkill: 'acerto' as SkillName, // Default, deve ser escolhido pelo jogador
    skillProficiencyBonusSlots: 0, // Bônus de slots de proficiência (poderes, arquétipos, classes)

    // Combate
    combat: createDefaultCombat(),

    // Deslocamento e Sentidos
    movement: createDefaultMovement(),
    senses: createDefaultSenses(),
    size: 'medio', // Padrão humanoide

    // Idiomas e Proficiências
    languages: ['comum'], // Idioma padrão
    extraLanguagesModifier: 0, // Modificador de idiomas extras
    proficiencies: {
      weapons: ['Armas Simples'], // Proficiência padrão
      armor: [],
      tools: [],
      other: [],
    },
    proficiencyPurchases: [], // Proficiências compradas com pontos de atributo

    // Sorte e Ofícios
    luck: {
      level: 0,
      value: 0,
      diceModifier: 0,
      numericModifier: 0,
    },
    crafts: [],

    // Recursos (Dados de Recurso)
    resources: createDefaultResources(uuidv4),

    // Habilidades Especiais
    specialAbilities: [],

    // Inventário
    inventory: createDefaultInventory(),

    // Feitiços (opcional, vazio inicialmente)
    spellcasting: undefined,

    // Particularidades
    particularities: createDefaultParticularities(),

    // Descrição e História
    physicalDescription: createDefaultPhysicalDescription(),
    gender: undefined,
    alignment: undefined,
    faith: undefined,
    definers: createDefaultDefiners(),
    backstory: undefined,

    // Progressão
    levelProgression: createDefaultLevelProgression(),
    levelHistory: [],

    // Anotações
    notes: [],
  };
}
