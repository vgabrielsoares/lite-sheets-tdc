/**
 * Constantes com valores padrão para personagem de Nível 1
 *
 * Todos os personagens dos jogadores começam no nível 1 com estes valores base,
 * antes de aplicar modificadores de origem, linhagem e arquétipo.
 *
 * HP único → GA (Guarda) + PV (Vitalidade). Defesa fixa removida.
 */

import { DEFAULT_LANGUAGE } from './languages';
import { DEFAULT_WEAPON_PROFICIENCY } from './proficiencies';
import { ATTRIBUTE_DEFAULT } from './attributes';

// ─── Guarda (GA) ─────────────────────────────────────────────────────

/**
 * Guarda (GA) base no nível 1
 * Base: 15 (antes de bônus de arquétipo)
 */
export const DEFAULT_GA_MAX = 15;

/**
 * Guarda (GA) atual inicial (igual ao máximo)
 */
export const DEFAULT_GA_CURRENT = 15;

// ─── Vitalidade (PV) ────────────────────────────────────────────────

/**
 * Calcula PV máximo baseado na GA máxima
 * Fórmula: floor(GA_max / 3)
 *
 * @param gaMax - Guarda máxima do personagem
 * @returns PV máximo
 */
export const calculateVitalityMax = (gaMax: number): number => {
  return Math.floor(gaMax / 3);
};

/**
 * PV máximo padrão no nível 1
 * Fórmula: floor(15 / 3) = 5
 */
export const DEFAULT_PV_MAX = calculateVitalityMax(DEFAULT_GA_MAX);

/**
 * PV atual inicial (igual ao máximo)
 */
export const DEFAULT_PV_CURRENT = DEFAULT_PV_MAX;

// ─── HP (deprecado) ─────────────────────────────────────────────────

/**
 * @deprecated Substituído por DEFAULT_GA_MAX em v0.2
 */
export const DEFAULT_HP_MAX = 15;

/**
 * @deprecated Substituído por DEFAULT_GA_CURRENT em v0.2
 */
export const DEFAULT_HP_CURRENT = 15;

/**
 * @deprecated HP temporário não existe mais separadamente em v0.2
 */
export const DEFAULT_HP_TEMPORARY = 0;

// ─── Pontos de Poder (PP) ───────────────────────────────────────────
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
 * Nível inicial do personagem.
 * Personagens começam no nível 0 e sobem para o nível 1 escolhendo um arquétipo.
 * Isso garante que o primeiro nível já inclua uma escolha de arquétipo.
 */
export const DEFAULT_CHARACTER_LEVEL = 0;

/**
 * Experiência (XP) inicial.
 * Começa com 15 XP — exatamente o necessário para subir do nível 0 para o 1,
 * garantindo que o jogador possa imediatamente subir de nível e escolher seu
 * primeiro arquétipo ao criar a ficha.
 */
export const DEFAULT_XP = 15;

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
 * @deprecated Defesa fixa não existe mais em v0.2. Defesa agora é teste ativo.
 * Mantido para compatibilidade com dados salvos.
 */
export const DEFAULT_BASE_DEFENSE = 15;

/**
 * Deslocamento padrão andando (em metros)
 * MVP-1: 5 metros é o padrão oficial
 */
export const DEFAULT_MOVEMENT_WALKING = 5;

/**
 * Tamanho padrão de personagem
 */
export const DEFAULT_SIZE = 'medio' as const;

/**
 * Rodadas máximas no estado Morrendo no nível 1
 * Fórmula: 2 + Corpo + outros modificadores
 */
export const DEFAULT_DYING_ROUNDS_BASE = 2;

/**
 * Limite de PP por rodada no nível 1
 * Fórmula: Nível + Essência + outros modificadores
 * No nível 1: 1 + Essência
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
 * @deprecated Defesa fixa não existe mais em v0.2. Usar teste de defesa ativo.
 * Mantido para compatibilidade.
 */
export const calculateDefense = (
  agilidadeValue: number,
  otherBonuses: number = 0
): number => {
  return DEFAULT_BASE_DEFENSE + agilidadeValue + otherBonuses;
};

/**
 * Cálculo de rodadas máximas no estado Morrendo
 * Fórmula: 2 + Corpo + outros modificadores
 */
export const calculateDyingRounds = (
  corpoValue: number,
  otherModifiers: number = 0
): number => {
  return DEFAULT_DYING_ROUNDS_BASE + corpoValue + otherModifiers;
};

/**
 * Cálculo de limite de PP por rodada
 * Fórmula: Nível + Essência + outros modificadores
 */
export const calculatePPPerRound = (
  characterLevel: number,
  essenciaValue: number,
  otherModifiers: number = 0
): number => {
  return characterLevel + essenciaValue + otherModifiers;
};

/**
 * Recuperação de GA durante descanso (ação Dormir)
 * Fórmula: Nível × Corpo + outros modificadores
 */
export const calculateRestGARecovery = (
  characterLevel: number,
  corpoValue: number,
  otherModifiers: number = 0
): number => {
  return characterLevel * corpoValue + otherModifiers;
};

/**
 * @deprecated Substituído por calculateRestGARecovery em v0.2
 */
export const calculateRestHPRecovery = calculateRestGARecovery;
