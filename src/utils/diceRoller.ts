/**
 * Sistema de Rolagem de Dados para Tabuleiro do Caos RPG
 *
 * Mecânicas implementadas:
 * - Rolagem básica: xd20+y (rolar x dados de 20 lados, escolher o maior, adicionar y)
 * - Atributo 0: 2d20, escolher o MENOR resultado
 * - Dados negativos: -1d20 = 3d20 escolher menor, -2d20 = 4d20 escolher menor
 * - Rolagem de dano: xdy+z (rolar x dados de y lados, somar todos, adicionar z)
 * - Críticos: 20 natural adiciona dados extras conforme configurado
 * - Triunfos: 20 natural com sucesso (diferença ≤5 do ND)
 * - Desastres: 1 natural (1d20) ou maioria dos dados iguais (múltiplos)
 */

export interface DiceRollResult {
  /** Fórmula da rolagem (ex: "2d20+5") */
  formula: string;
  /** Valores individuais rolados */
  rolls: number[];
  /** Tipo de dado usado (d20, d6, etc.) */
  diceType: number;
  /** Número de dados rolados */
  diceCount: number;
  /** Modificador aplicado */
  modifier: number;
  /** Resultado antes do modificador */
  baseResult: number;
  /** Resultado final após modificador */
  finalResult: number;
  /** Timestamp da rolagem */
  timestamp: Date;
  /** Tipo de rolagem (mantido para compatibilidade, sempre 'normal') */
  rollType: 'normal' | 'advantage' | 'disadvantage';
  /** Se houve crítico (20 natural) */
  isCritical?: boolean;
  /** Se houve falha crítica (1 natural) */
  isCriticalFailure?: boolean;
  /** Descrição do contexto da rolagem */
  context?: string;
}

export type RollType = 'normal' | 'advantage' | 'disadvantage';

/**
 * Rola dados d20 para testes de habilidade/atributo
 *
 * Regras:
 * - numberOfDice > 0: Rola numberOfDice dados, escolhe o MAIOR
 * - numberOfDice = 0: Rola 2d20, escolhe o MENOR (atributo 0)
 * - numberOfDice < 0: Rola (abs(numberOfDice) + 2) dados, escolhe o MENOR (penalidade)
 *
 * @param numberOfDice - Número de dados (pode ser negativo)
 * @param modifier - Modificador a adicionar ao resultado
 * @param rollType - Tipo de rolagem (mantido para compatibilidade, não usado)
 * @param context - Descrição do contexto da rolagem
 * @returns Resultado detalhado da rolagem
 */
export function rollD20(
  numberOfDice: number,
  modifier: number = 0,
  rollType: RollType = 'normal', // Mantido para compatibilidade
  context?: string
): DiceRollResult {
  // Caso especial: atributo 0 (rolar 2d20, escolher menor)
  if (numberOfDice === 0) {
    return rollWithZeroAttribute(modifier, context);
  }

  // Caso: dados negativos (desvantagem forçada)
  if (numberOfDice < 0) {
    return rollWithNegativeDice(numberOfDice, modifier, context);
  }

  // Caso normal: dados positivos
  return rollWithPositiveDice(numberOfDice, modifier, context);
}

/**
 * Rolagem com atributo 0: 2d20, escolher o MENOR
 */
function rollWithZeroAttribute(
  modifier: number,
  context?: string
): DiceRollResult {
  const rolls = [rollSingleD20(), rollSingleD20()];
  const baseResult = Math.min(...rolls);
  const finalResult = baseResult + modifier;

  return {
    formula: `0d20+${modifier} (2d20, menor)`,
    rolls,
    diceType: 20,
    diceCount: 0,
    modifier,
    baseResult,
    finalResult,
    timestamp: new Date(),
    rollType: 'disadvantage', // Atributo 0 é sempre desvantagem
    isCritical: baseResult === 20,
    isCriticalFailure: baseResult === 1,
    context,
  };
}

/**
 * Rolagem com dados negativos: penalidade extra
 * -1d20 = 3d20 (escolher menor)
 * -2d20 = 4d20 (escolher menor)
 * etc.
 */
function rollWithNegativeDice(
  numberOfDice: number,
  modifier: number,
  context?: string
): DiceRollResult {
  const actualDiceCount = Math.abs(numberOfDice) + 2;
  const rolls = Array.from({ length: actualDiceCount }, () => rollSingleD20());
  const baseResult = Math.min(...rolls);
  const finalResult = baseResult + modifier;

  return {
    formula: `${numberOfDice}d20+${modifier} (${actualDiceCount}d20, menor)`,
    rolls,
    diceType: 20,
    diceCount: numberOfDice,
    modifier,
    baseResult,
    finalResult,
    timestamp: new Date(),
    rollType: 'disadvantage',
    isCritical: baseResult === 20,
    isCriticalFailure: baseResult === 1,
    context,
  };
}

/**
 * Rolagem com dados positivos: escolher o maior
 */
function rollWithPositiveDice(
  numberOfDice: number,
  modifier: number,
  context?: string
): DiceRollResult {
  const rolls = Array.from({ length: numberOfDice }, () => rollSingleD20());
  const baseResult = Math.max(...rolls);
  const finalResult = baseResult + modifier;

  const formula = `${numberOfDice}d20${modifier >= 0 ? `+${modifier}` : `${modifier}`}`;

  return {
    formula,
    rolls,
    diceType: 20,
    diceCount: numberOfDice,
    modifier,
    baseResult,
    finalResult,
    timestamp: new Date(),
    rollType: 'normal',
    isCritical: baseResult === 20,
    isCriticalFailure: baseResult === 1,
    context,
  };
}

/**
 * Rola um único d20 (1 a 20)
 */
function rollSingleD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * Rola um único dado de n lados (1 a n)
 */
function rollSingleDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Rola dados de dano (soma todos os dados)
 *
 * @param diceCount - Número de dados
 * @param diceSides - Lados do dado (d4, d6, d8, d10, d12, etc.)
 * @param modifier - Modificador a adicionar ao total
 * @param context - Descrição do contexto
 * @returns Resultado detalhado da rolagem
 */
export function rollDamage(
  diceCount: number,
  diceSides: number,
  modifier: number = 0,
  context?: string
): DiceRollResult {
  if (diceCount <= 0) {
    // Sem dados de dano, apenas modificador
    return {
      formula: `0d${diceSides}+${modifier}`,
      rolls: [],
      diceType: diceSides,
      diceCount: 0,
      modifier,
      baseResult: 0,
      finalResult: Math.max(0, modifier), // Dano não pode ser negativo
      timestamp: new Date(),
      rollType: 'normal',
      context,
    };
  }

  const rolls = Array.from({ length: diceCount }, () =>
    rollSingleDie(diceSides)
  );
  const baseResult = rolls.reduce((sum, roll) => sum + roll, 0);
  const finalResult = Math.max(0, baseResult + modifier); // Dano não pode ser negativo

  const formula = `${diceCount}d${diceSides}${modifier >= 0 ? '+' : ''}${modifier}`;

  return {
    formula,
    rolls,
    diceType: diceSides,
    diceCount,
    modifier,
    baseResult,
    finalResult,
    timestamp: new Date(),
    rollType: 'normal',
    context,
  };
}

/**
 * Rola dano com possibilidade de crítico
 * Crítico dobra os dados (não o modificador)
 *
 * @param diceCount - Número de dados base
 * @param diceSides - Lados do dado
 * @param modifier - Modificador
 * @param isCritical - Se é um acerto crítico
 * @param context - Descrição do contexto
 * @returns Resultado detalhado da rolagem
 */
export function rollDamageWithCritical(
  diceCount: number,
  diceSides: number,
  modifier: number = 0,
  isCritical: boolean = false,
  context?: string
): DiceRollResult {
  const actualDiceCount = isCritical ? diceCount * 2 : diceCount;
  const result = rollDamage(actualDiceCount, diceSides, modifier, context);

  if (isCritical) {
    result.formula = `${diceCount}d${diceSides} × 2 (crítico)${modifier >= 0 ? '+' : ''}${modifier}`;
    result.isCritical = true;
  }

  return result;
}

/**
 * Rola teste de habilidade completo
 *
 * @param attributeValue - Valor do atributo (determina número de dados)
 * @param proficiencyMultiplier - Multiplicador de proficiência (0, 1, 2, 3)
 * @param additionalModifier - Modificador adicional
 * @param rollType - Tipo de rolagem (vantagem/desvantagem)
 * @param context - Descrição do contexto
 * @returns Resultado detalhado da rolagem
 */
export function rollSkillTest(
  attributeValue: number,
  proficiencyMultiplier: number,
  additionalModifier: number = 0,
  rollType: RollType = 'normal',
  context?: string
): DiceRollResult {
  const proficiencyBonus = attributeValue * proficiencyMultiplier;
  const totalModifier = proficiencyBonus + additionalModifier;

  return rollD20(attributeValue, totalModifier, rollType, context);
}

/**
 * Histórico de rolagens
 */
export class DiceRollHistory {
  private history: DiceRollResult[] = [];
  private maxHistory: number = 50;

  /**
   * Adiciona uma rolagem ao histórico
   */
  add(roll: DiceRollResult): void {
    this.history.unshift(roll); // Adiciona no início
    if (this.history.length > this.maxHistory) {
      this.history.pop(); // Remove o mais antigo
    }
  }

  /**
   * Retorna todo o histórico
   */
  getAll(): DiceRollResult[] {
    return [...this.history];
  }

  /**
   * Retorna as últimas N rolagens
   */
  getLast(count: number): DiceRollResult[] {
    return this.history.slice(0, count);
  }

  /**
   * Limpa o histórico
   */
  clear(): void {
    this.history = [];
  }

  /**
   * Retorna o tamanho do histórico
   */
  get size(): number {
    return this.history.length;
  }
}

/**
 * Instância global do histórico de rolagens
 */
export const globalDiceHistory = new DiceRollHistory();
