/**
 * Level Up Calculations — Utility functions for the level-up workflow
 *
 * Determines what gains a character receives when leveling up
 * in a specific archetype, and applies them to the Character.
 */

import type {
  Character,
  Archetype,
  ArchetypeName,
  LevelHistoryEntry,
} from '@/types/character';
import type {
  SpecialAbility,
  SpecialAbilitySource,
} from '@/types/specialAbilities';
import {
  getXPForNextLevel,
  calculateRemainingXP,
  POWER_OR_TALENT_LEVELS,
  COMPETENCE_LEVELS,
  ARCHETYPE_FEATURE_LEVELS,
  CLASS_UNLOCK_LEVEL,
} from '@/constants/progression';
import {
  ARCHETYPE_GA_ATTRIBUTE,
  ARCHETYPE_PP_BASE_PER_LEVEL,
} from '@/constants/archetypes';
import { calculateVitality } from '@/utils/calculations';

// ─── Types ──────────────────────────────────────────────────

/**
 * Tipo de ganho especial no level up
 */
export type LevelUpGainType =
  | 'poder_ou_talento'
  | 'competencia'
  | 'caracteristica';

/**
 * Dados de ganho especial (poder, talento, competência, característica)
 * preenchidos pelo jogador no modal de level up.
 */
export interface LevelUpSpecialGain {
  type: LevelUpGainType;
  name: string;
  description: string;
  effects?: string;
}

/**
 * Resumo dos ganhos automáticos que o personagem receberá ao subir de nível.
 */
export interface LevelUpGainsSummary {
  /** Novo nível total do personagem */
  newCharacterLevel: number;
  /** Novo nível no arquétipo escolhido */
  newArchetypeLevel: number;
  /** GA ganho neste nível pelo arquétipo */
  gaGained: number;
  /** PP ganho neste nível pelo arquétipo */
  ppGained: number;
  /** Novo GA máximo */
  newGAMax: number;
  /** Novo PP máximo */
  newPPMax: number;
  /** Novo PV máximo */
  newPVMax: number;
  /** XP restante após subir de nível */
  remainingXP: number;
  /** Se ganha Poder de Arquétipo ou Talento neste nível de arquétipo */
  grantsPowerOrTalent: boolean;
  /** Se ganha Competência neste nível de arquétipo */
  grantsCompetence: boolean;
  /** Se ganha Característica de Arquétipo neste nível de arquétipo */
  grantsArchetypeFeature: boolean;
  /** Se Classes são desbloqueadas no novo nível do personagem */
  unlocksClasses: boolean;
}

// ─── Calculation Functions ──────────────────────────────────

/**
 * Calcula o nível atual de um arquétipo específico no personagem.
 */
export function getArchetypeLevel(
  character: Character,
  archetypeName: ArchetypeName
): number {
  const archetype = character.archetypes.find((a) => a.name === archetypeName);
  return archetype?.level ?? 0;
}

/**
 * Calcula o GA ganho por um nível específico em um arquétipo.
 * GA por nível = valor do atributo relevante do arquétipo.
 *
 * @param archetypeName - Nome do arquétipo
 * @param attributes - Atributos do personagem
 * @returns GA ganho neste nível
 */
export function calculateArchetypeGAGain(
  archetypeName: ArchetypeName,
  attributes: Character['attributes']
): number {
  const attrName = ARCHETYPE_GA_ATTRIBUTE[archetypeName];
  return attributes[attrName] ?? 0;
}

/**
 * Calcula o PP ganho por um nível específico em um arquétipo.
 * PP por nível = base do arquétipo + Essência.
 *
 * @param archetypeName - Nome do arquétipo
 * @param essencia - Valor de Essência do personagem
 * @returns PP ganho neste nível
 */
export function calculateArchetypePPGain(
  archetypeName: ArchetypeName,
  essencia: number
): number {
  const base = ARCHETYPE_PP_BASE_PER_LEVEL[archetypeName] ?? 0;
  return base + essencia;
}

/**
 * Calcula o GA máximo total do personagem (incluindo o ganho previsto).
 *
 * @param character - Personagem atual
 * @param archetypeName - Arquétipo escolhido para subir
 * @returns Novo GA máximo
 */
function calculateNewGAMax(
  character: Character,
  archetypeName: ArchetypeName
): number {
  const gaGain = calculateArchetypeGAGain(archetypeName, character.attributes);
  return character.combat.guard.max + gaGain;
}

/**
 * Calcula o PP máximo total do personagem (incluindo o ganho previsto).
 *
 * @param character - Personagem atual
 * @param archetypeName - Arquétipo escolhido para subir
 * @returns Novo PP máximo
 */
function calculateNewPPMax(
  character: Character,
  archetypeName: ArchetypeName
): number {
  const ppGain = calculateArchetypePPGain(
    archetypeName,
    character.attributes.essencia
  );
  return character.combat.pp.max + ppGain;
}

/**
 * Preview dos ganhos ao subir de nível em um arquétipo específico.
 * Usado pelo LevelUpModal para mostrar ao jogador o que vai ganhar.
 *
 * @param character - Personagem atual
 * @param archetypeName - Arquétipo escolhido para subir
 * @returns Resumo dos ganhos
 */
export function previewLevelUpGains(
  character: Character,
  archetypeName: ArchetypeName
): LevelUpGainsSummary {
  const currentArchetypeLevel = getArchetypeLevel(character, archetypeName);
  const newArchetypeLevel = currentArchetypeLevel + 1;
  const newCharacterLevel = character.level + 1;

  const gaGained = calculateArchetypeGAGain(
    archetypeName,
    character.attributes
  );
  const ppGained = calculateArchetypePPGain(
    archetypeName,
    character.attributes.essencia
  );
  const newGAMax = calculateNewGAMax(character, archetypeName);
  const newPPMax = calculateNewPPMax(character, archetypeName);
  const newPVMax = calculateVitality(newGAMax);

  const remainingXP = calculateRemainingXP(
    character.experience.current,
    character.level
  );

  // Determinar ganhos especiais baseados no novo nível do ARQUÉTIPO
  const grantsPowerOrTalent =
    POWER_OR_TALENT_LEVELS.includes(newArchetypeLevel);
  const grantsCompetence = COMPETENCE_LEVELS.includes(newArchetypeLevel);
  const grantsArchetypeFeature =
    ARCHETYPE_FEATURE_LEVELS.includes(newArchetypeLevel);

  // Classes são desbloqueadas no nível 3 do personagem
  const unlocksClasses =
    character.level < CLASS_UNLOCK_LEVEL &&
    newCharacterLevel >= CLASS_UNLOCK_LEVEL;

  return {
    newCharacterLevel,
    newArchetypeLevel,
    gaGained,
    ppGained,
    newGAMax,
    newPPMax,
    newPVMax,
    remainingXP,
    grantsPowerOrTalent,
    grantsCompetence,
    grantsArchetypeFeature,
    unlocksClasses,
  };
}

/**
 * Determina o tipo de ganho para um dado nível de arquétipo.
 *
 * @param archetypeLevel - O nível do arquétipo (não do personagem)
 * @returns O tipo de ganho correspondente
 */
function determineGainType(archetypeLevel: number): LevelUpGainType {
  if (ARCHETYPE_FEATURE_LEVELS.includes(archetypeLevel)) {
    return 'caracteristica';
  }
  if (COMPETENCE_LEVELS.includes(archetypeLevel)) {
    return 'competencia';
  }
  return 'poder_ou_talento';
}

/**
 * Aplica o level-up a um personagem (mutação direta para uso no Redux Toolkit).
 *
 * @param character - O personagem a ser modificado (pode ser draft do Immer)
 * @param archetypeName - O arquétipo escolhido
 * @param specialGains - Ganhos especiais (poder, talento, competência, característica)
 *                       preenchidos pelo jogador no modal
 */
export function applyLevelUp(
  character: Character,
  archetypeName: ArchetypeName,
  specialGains: LevelUpSpecialGain[] = []
): void {
  const currentArchetypeLevel = getArchetypeLevel(character, archetypeName);
  const newArchetypeLevel = currentArchetypeLevel + 1;

  // 1. Subir nível do personagem
  character.level += 1;

  // 2. Atualizar ou criar arquétipo
  const existingArchetype = character.archetypes.find(
    (a) => a.name === archetypeName
  );
  if (existingArchetype) {
    existingArchetype.level = newArchetypeLevel;
  } else {
    const newArchetype: Archetype = {
      name: archetypeName,
      level: 1,
      features: [],
    };
    character.archetypes.push(newArchetype);
  }

  // 3. Calcular ganhos de GA e PP
  const gaGain = calculateArchetypeGAGain(archetypeName, character.attributes);
  const ppGain = calculateArchetypePPGain(
    archetypeName,
    character.attributes.essencia
  );

  // 4. Aplicar ganhos de combate
  character.combat.guard.max += gaGain;
  character.combat.guard.current += gaGain; // GA atual também sobe
  character.combat.pp.max += ppGain;
  character.combat.pp.current += ppGain; // PP atual também sobe

  // 5. Recalcular PV
  const newPVMax = calculateVitality(character.combat.guard.max);
  const pvGain = newPVMax - character.combat.vitality.max;
  character.combat.vitality.max = newPVMax;
  character.combat.vitality.current = Math.min(
    character.combat.vitality.current + Math.max(pvGain, 0),
    newPVMax
  );

  // 6. Atualizar XP (manter excedente)
  character.experience.current = calculateRemainingXP(
    character.experience.current,
    character.level - 1 // level-1 pois já incrementamos
  );
  character.experience.toNextLevel = getXPForNextLevel(character.level);

  // 7. Adicionar ganhos especiais às Habilidades Especiais
  for (const gain of specialGains) {
    const sourceMap: Record<LevelUpGainType, SpecialAbilitySource> = {
      poder_ou_talento: 'poder',
      competencia: 'competencia',
      caracteristica: 'arquetipo',
    };

    const newAbility: SpecialAbility = {
      id: crypto.randomUUID(),
      name: gain.name,
      description: gain.description,
      effects: gain.effects,
      source: sourceMap[gain.type],
      sourceName: archetypeName,
      levelGained: character.level,
    };

    character.specialAbilities.push(newAbility);
  }

  // 8. Atualizar progressão por nível
  character.levelProgression.push({
    level: character.level,
    gains: buildGainsSummaryStrings(
      archetypeName,
      newArchetypeLevel,
      gaGain,
      ppGain,
      specialGains
    ),
    achieved: true,
  });

  // 9. Registrar no histórico de level up
  const gainType = determineGainType(newArchetypeLevel);
  const primaryGain = specialGains.length > 0 ? specialGains[0] : undefined;
  if (!character.levelHistory) {
    character.levelHistory = [];
  }
  character.levelHistory.push({
    level: character.level,
    archetype: archetypeName,
    gainType,
    gainName: primaryGain?.name,
    gainDescription: primaryGain?.description,
    timestamp: new Date().toISOString(),
  });

  // 10. Atualizar timestamp
  character.updatedAt = new Date().toISOString();
}

/**
 * Gera strings resumindo ganhos para a progressão por nível.
 */
function buildGainsSummaryStrings(
  archetypeName: ArchetypeName,
  archetypeLevel: number,
  gaGain: number,
  ppGain: number,
  specialGains: LevelUpSpecialGain[]
): string[] {
  const gains: string[] = [
    `Arquétipo: ${archetypeName} (nível ${archetypeLevel})`,
    `+${gaGain} GA`,
    `+${ppGain} PP`,
  ];

  for (const gain of specialGains) {
    const labelMap: Record<LevelUpGainType, string> = {
      poder_ou_talento: 'Poder/Talento',
      competencia: 'Competência',
      caracteristica: 'Característica',
    };
    gains.push(`${labelMap[gain.type]}: ${gain.name}`);
  }

  return gains;
}
