/**
 * Constantes com valores padrão para personagem de Nível 1
 *
 * Todos os personagens dos jogadores começam no nível 1 com estes valores base,
 * antes de aplicar modificadores de origem, linhagem e arquétipo.
 */

import { DEFAULT_LANGUAGE } from './languages';
import { DEFAULT_WEAPON_PROFICIENCY } from './proficiencies';
import { ATTRIBUTE_DEFAULT } from './attributes';

/**
 * Pontos de Vida (PV) base no nível 1
 */
export const DEFAULT_HP_MAX = 15;

/**
 * Pontos de Vida (PV) atual inicial (igual ao máximo)
 */
export const DEFAULT_HP_CURRENT = 15;

/**
 * Pontos de Vida (PV) temporários inicial
 */
export const DEFAULT_HP_TEMPORARY = 0;

/**
 * Pontos de Poder (PP) base no nível 1
 */
export const DEFAULT_PP_MAX = 2;

/**
 * Pontos de Poder (PP) atual inicial (igual ao máximo)
 */
export const DEFAULT_PP_CURRENT = 2;

/**
 * Pontos de Poder (PP) temporários inicial
 */
export const DEFAULT_PP_TEMPORARY = 0;

/**
 * Nível inicial do personagem
 */
export const DEFAULT_CHARACTER_LEVEL = 1;

/**
 * Experiência (XP) inicial
 */
export const DEFAULT_XP = 0;

/**
 * Valor padrão de todos os atributos no nível 1
 * (Re-exportado de attributes.ts)
 */
export const DEFAULT_ATTRIBUTE_VALUE = ATTRIBUTE_DEFAULT;

/**
 * Número de proficiências com habilidades no nível 1
 * Fórmula: 3 + Mente (retroativo)
 */
export const DEFAULT_SKILL_PROFICIENCIES_BASE = 3;

/**
 * Pontos de atributo para distribuir na criação (além dos ganhos de origem/linhagem)
 */
export const DEFAULT_ATTRIBUTE_POINTS = 2;

/**
 * Idiomas padrão conhecidos por todos os personagens
 */
export const DEFAULT_LANGUAGES = [DEFAULT_LANGUAGE];

/**
 * Proficiências com armas padrão no nível 1
 */
export const DEFAULT_WEAPON_PROFICIENCIES = [DEFAULT_WEAPON_PROFICIENCY];

/**
 * Itens iniciais no inventário de todo personagem
 */
export const DEFAULT_INVENTORY_ITEMS = [
  {
    name: 'Mochila',
    quantity: 1,
    weight: 0, // Mochila em si não tem peso
  },
  {
    name: 'Cartão do Banco',
    quantity: 1,
    weight: 0,
  },
] as const;

/**
 * Dinheiro inicial (em PO$ - Peças de Ouro)
 */
export const DEFAULT_STARTING_MONEY = 10;

/**
 * Moeda padrão do dinheiro inicial
 */
export const DEFAULT_STARTING_CURRENCY = 'po' as const;

/**
 * Defesa base (antes de adicionar Agilidade e outros modificadores)
 * Fórmula: 15 + Agilidade + outros bônus
 */
export const DEFAULT_BASE_DEFENSE = 15;

/**
 * Deslocamento padrão andando (em metros)
 */
export const DEFAULT_MOVEMENT_WALKING = 9;

/**
 * Tamanho padrão de personagem
 */
export const DEFAULT_SIZE = 'medio' as const;

/**
 * Rodadas máximas no estado Morrendo no nível 1
 * Fórmula: 2 + Constituição + outros modificadores
 */
export const DEFAULT_DYING_ROUNDS_BASE = 2;

/**
 * Limite de PP por rodada no nível 1
 * Fórmula: Nível + Presença + outros modificadores
 * No nível 1: 1 + Presença
 */
export const DEFAULT_PP_PER_ROUND_BASE = 1;

/**
 * Níveis de personagem (do 1 ao 30)
 */
export const CHARACTER_LEVEL_MIN = 1;
export const CHARACTER_LEVEL_MAX = 30;
export const CHARACTER_LEVEL_DEFAULT_MAX = 15; // Padrão do sistema (16-30 é extensão)

/**
 * Número de idiomas adicionais além do Comum
 * Fórmula: Mente - 1 (mínimo 0, retroativo)
 */
export const calculateAdditionalLanguages = (menteValue: number): number => {
  return Math.max(0, menteValue - 1);
};

/**
 * Número total de proficiências com habilidades
 * Fórmula: 3 + Mente (retroativo)
 */
export const calculateSkillProficiencies = (menteValue: number): number => {
  return DEFAULT_SKILL_PROFICIENCIES_BASE + menteValue;
};

/**
 * Cálculo de Defesa
 * Fórmula: 15 + Agilidade + outros bônus
 */
export const calculateDefense = (
  agilidadeValue: number,
  otherBonuses: number = 0
): number => {
  return DEFAULT_BASE_DEFENSE + agilidadeValue + otherBonuses;
};

/**
 * Cálculo de rodadas máximas no estado Morrendo
 * Fórmula: 2 + Constituição + outros modificadores
 */
export const calculateDyingRounds = (
  constituicaoValue: number,
  otherModifiers: number = 0
): number => {
  return DEFAULT_DYING_ROUNDS_BASE + constituicaoValue + otherModifiers;
};

/**
 * Cálculo de limite de PP por rodada
 * Fórmula: Nível + Presença + outros modificadores
 */
export const calculatePPPerRound = (
  characterLevel: number,
  presencaValue: number,
  otherModifiers: number = 0
): number => {
  return characterLevel + presencaValue + otherModifiers;
};

/**
 * Recuperação de PV durante descanso (ação Dormir)
 * Fórmula: Nível × Constituição + outros modificadores
 */
export const calculateRestHPRecovery = (
  characterLevel: number,
  constituicaoValue: number,
  otherModifiers: number = 0
): number => {
  return characterLevel * constituicaoValue + otherModifiers;
};
