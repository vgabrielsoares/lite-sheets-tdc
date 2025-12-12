/**
 * Cálculos e Utilitários para Sistema de Combate
 *
 * Implementa as regras de ataque do Tabuleiro do Caos RPG:
 * - Ataques de Raspão
 * - Críticos (margem variável)
 * - Críticos Verdadeiros
 * - Cálculo de dano com crítico
 * - Cálculo de dados de ataque baseado em habilidade/uso
 */

import type { DiceRoll } from '@/types/common';
import type { Character, SkillName, AttributeName, Modifier } from '@/types';
import { SKILL_PROFICIENCY_LEVELS } from '@/constants/skills';

/**
 * Tipo de resultado de ataque
 */
export type AttackOutcome =
  | 'miss'
  | 'graze'
  | 'hit'
  | 'critical'
  | 'true-critical';

/**
 * Resultado do cálculo de ataque (dados a rolar)
 */
export interface AttackRollCalculation {
  /** Quantidade de d20s a rolar */
  diceCount: number;
  /** Modificador numérico total */
  modifier: number;
  /** Atributo sendo usado */
  attribute: AttributeName;
  /** Nome da habilidade */
  skillName: SkillName;
  /** Nome do uso (se aplicável) */
  useName?: string;
  /** Se deve pegar o menor resultado (quando atributo = 0 ou modificadores negativos resultam em < 1 dado) */
  takeLowest: boolean;
  /** Fórmula formatada (ex: "3d20+5" ou "-2d20+3") */
  formula: string;
}

/**
 * Resultado detalhado de um teste de ataque
 */
export interface AttackCalculation {
  /** Resultado da rolagem de ataque */
  attackRoll: number;
  /** Defesa do alvo */
  targetDefense: number;
  /** Resultado natural do d20 (sem modificadores) */
  naturalRoll: number;
  /** Margem de crítico da arma */
  criticalRange: number;
  /** Tipo de resultado do ataque */
  outcome: AttackOutcome;
  /** Se foi crítico (natural >= margem) */
  isCritical: boolean;
  /** Se foi crítico verdadeiro (crítico E superou Defesa +5) */
  isTrueCritical: boolean;
  /** Se foi ataque de raspão (igual à Defesa) */
  isGraze: boolean;
  /** Margem de sucesso (attackRoll - targetDefense) */
  margin: number;
}

/**
 * Configuração de dano crítico
 */
export interface CriticalDamageConfig {
  /** Dados de dano base da arma */
  baseDamageRoll: DiceRoll;
  /** Dados extras de crítico verdadeiro */
  criticalDamageRoll: DiceRoll;
  /** Se foi crítico */
  isCritical: boolean;
  /** Se foi crítico verdadeiro */
  isTrueCritical: boolean;
  /** Se foi ataque de raspão */
  isGraze: boolean;
}

/**
 * Resultado do cálculo de dano
 */
export interface DamageCalculation {
  /** Dano total calculado */
  totalDamage: number;
  /** Dano base maximizado (se crítico) */
  baseDamageMaximized?: number;
  /** Dano dos dados extras de crítico verdadeiro */
  trueCriticalDamage?: number;
  /** Modificadores aplicados */
  modifiers: number;
  /** Descrição do cálculo */
  breakdown: string;
}

/**
 * Calcula a quantidade de dados e modificador para um ataque
 *
 * Regras:
 * - Base: usa o valor do atributo da habilidade/uso como quantidade de d20s
 * - Se attributeOverride fornecido, usa esse atributo ao invés do padrão
 * - Modificadores de dados da habilidade são somados
 * - Modificadores de dados do uso são somados
 * - attackDiceModifier é somado ao total de dados
 * - Modificador numérico = modificador base da habilidade + modificador do uso + attackBonus
 * - Se proficiência = 'leigo', rola 1d20 (sem dados extras)
 * - Se atributo = 0, rola 1d20 (regra especial)
 *
 * @param character - Dados do personagem
 * @param attackSkill - Nome da habilidade usada no ataque
 * @param attackSkillUseId - ID do uso específico (opcional)
 * @param attackBonus - Bônus adicional de ataque (modificador numérico)
 * @param attributeOverride - Atributo alternativo para usar no ataque (opcional)
 * @param attackDiceModifier - Modificador de dados adicional (ex: +1 = +1d20)
 * @returns Objeto com quantidade de dados e modificador total
 */
export function calculateAttackRoll(
  character: Character,
  attackSkill: SkillName,
  attackSkillUseId: string | undefined,
  attackBonus: number,
  attributeOverride?: AttributeName,
  attackDiceModifier: number = 0
): AttackRollCalculation {
  const skill = character.skills[attackSkill];

  if (!skill) {
    // Fallback se habilidade não existir
    const attr = attributeOverride || 'agilidade';
    const attrValue = character.attributes[attr];
    const baseDice = attrValue === 0 ? 1 : Math.max(1, attrValue);

    // Calcular dados reais antes do Math.max para detectar takeLowest
    const realDiceCount = baseDice + attackDiceModifier;
    let finalDiceCount: number;
    let takeLowest = false;

    if (realDiceCount < 1) {
      // Quando total < 1, rola 2 - realDiceCount e pega menor
      finalDiceCount = 2 - realDiceCount;
      takeLowest = true;
    } else {
      finalDiceCount = realDiceCount;
    }

    const modifierStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;
    const formula = `${takeLowest ? '-' : ''}${finalDiceCount}d20${modifierStr}`;

    return {
      diceCount: finalDiceCount,
      modifier: attackBonus,
      attribute: attr,
      skillName: attackSkill,
      takeLowest,
      formula,
    };
  }

  // Se proficiência é leigo, sempre rola 1d20
  if (skill.proficiencyLevel === 'leigo') {
    const attr = attributeOverride || skill.keyAttribute;

    // Calcular dados reais antes do Math.max para detectar takeLowest
    const realDiceCount = 1 + attackDiceModifier;
    let finalDiceCount: number;
    let takeLowest = false;

    if (realDiceCount < 1) {
      // Quando total < 1, rola 2 - realDiceCount e pega menor
      finalDiceCount = 2 - realDiceCount;
      takeLowest = true;
    } else {
      finalDiceCount = realDiceCount;
    }

    const modifierStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;
    const formula = `${takeLowest ? '-' : ''}${finalDiceCount}d20${modifierStr}`;

    return {
      diceCount: finalDiceCount,
      modifier: attackBonus,
      attribute: attr,
      skillName: attackSkill,
      takeLowest,
      formula,
    };
  }

  // Verificar se está usando um uso específico
  let useName: string | undefined;
  let keyAttribute: AttributeName = skill.keyAttribute;
  let skillModifiers: Modifier[] = skill.modifiers || [];
  let useModifiers: Modifier[] = [];

  if (attackSkillUseId) {
    // Verificar se é um uso customizado
    if (skill.customUses) {
      const skillUse = skill.customUses.find((u) => u.id === attackSkillUseId);
      if (skillUse) {
        useName = skillUse.name;
        keyAttribute = skillUse.keyAttribute;
        useModifiers = skillUse.modifiers || [];
      }
    }

    // Verificar se é um uso padrão com overrides
    if (!useName && attackSkillUseId.startsWith('default-')) {
      const defaultUseName = attackSkillUseId.replace('default-', '');
      useName = defaultUseName;

      // Verificar se há atributo customizado para este uso padrão
      if (
        skill.defaultUseAttributeOverrides &&
        skill.defaultUseAttributeOverrides[defaultUseName]
      ) {
        keyAttribute = skill.defaultUseAttributeOverrides[defaultUseName];
      }

      // Verificar se há modificadores customizados para este uso padrão
      if (
        skill.defaultUseModifierOverrides &&
        skill.defaultUseModifierOverrides[defaultUseName]
      ) {
        useModifiers = skill.defaultUseModifierOverrides[defaultUseName];
      }
    }
  }

  // Se attributeOverride fornecido, sobrescreve o atributo da habilidade/uso
  if (attributeOverride) {
    keyAttribute = attributeOverride;
  }

  // Obter valor do atributo
  const attributeValue = character.attributes[keyAttribute];

  // 1. Modificador de proficiência (Atributo × Proficiência)
  const proficiencyMultiplier =
    SKILL_PROFICIENCY_LEVELS[skill.proficiencyLevel];
  const proficiencyModifier = attributeValue * proficiencyMultiplier;

  // 2. Base: valor do atributo (mínimo 1 se não for 0)
  let baseDiceCount = attributeValue === 0 ? 1 : Math.max(1, attributeValue);

  // 3. Somar modificadores de dados da habilidade
  const skillDiceModifiers = skillModifiers
    .filter((m) => m.affectsDice)
    .reduce((sum, m) => sum + m.value, 0);

  // 4. Somar modificadores de dados do uso
  const useDiceModifiers = useModifiers
    .filter((m) => m.affectsDice)
    .reduce((sum, m) => sum + m.value, 0);

  // 5. Calcular dados reais antes do Math.max para detectar takeLowest
  const realDiceCount =
    baseDiceCount + skillDiceModifiers + useDiceModifiers + attackDiceModifier;
  let finalDiceCount: number;
  let takeLowest = false;

  if (realDiceCount < 1) {
    // Quando total < 1, rola 2 - realDiceCount e pega menor
    finalDiceCount = 2 - realDiceCount;
    takeLowest = true;
  } else {
    finalDiceCount = realDiceCount;
  }

  // 6. Somar modificadores numéricos da habilidade
  const skillNumericModifiers = skillModifiers
    .filter((m) => !m.affectsDice)
    .reduce((sum, m) => sum + m.value, 0);

  // 7. Somar modificadores numéricos do uso
  const useNumericModifiers = useModifiers
    .filter((m) => !m.affectsDice)
    .reduce((sum, m) => sum + m.value, 0);

  // 8. Modificador total (proficiência + modificadores skill + modificadores uso + bônus adicional)
  const modifier =
    proficiencyModifier +
    skillNumericModifiers +
    useNumericModifiers +
    attackBonus;

  // Formatar fórmula com "-" quando aplicável
  const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  const formula = `${takeLowest ? '-' : ''}${finalDiceCount}d20${modifierStr}`;

  return {
    diceCount: finalDiceCount,
    modifier,
    attribute: keyAttribute,
    skillName: attackSkill,
    useName,
    takeLowest,
    formula,
  };
}

/**
 * Calcula o resultado de um teste de ataque
 *
 * @param attackRoll - Resultado total da rolagem de ataque (d20 + modificadores)
 * @param naturalRoll - Resultado natural do d20 (sem modificadores)
 * @param targetDefense - Defesa do alvo
 * @param criticalRange - Margem de crítico (ex: 20, 19, 18)
 * @returns Cálculo detalhado do resultado
 */
export function calculateAttackOutcome(
  attackRoll: number,
  naturalRoll: number,
  targetDefense: number,
  criticalRange: number = 20
): AttackCalculation {
  // Verificar se é crítico (baseado no natural roll e margem)
  const isCritical = naturalRoll >= criticalRange;

  // Margem de sucesso/falha
  const margin = attackRoll - targetDefense;

  // Natural 20 sempre acerta
  const autoHit = naturalRoll === 20;

  // Determinar resultado
  let outcome: AttackOutcome;
  let isTrueCritical = false;

  if (autoHit || attackRoll > targetDefense) {
    // Acertou
    if (isCritical && margin >= 5) {
      outcome = 'true-critical';
      isTrueCritical = true;
    } else if (isCritical) {
      outcome = 'critical';
    } else {
      outcome = 'hit';
    }
  } else if (attackRoll === targetDefense) {
    // Ataque de Raspão (igual à Defesa)
    outcome = 'graze';
  } else {
    // Errou
    outcome = 'miss';
  }

  return {
    attackRoll,
    targetDefense,
    naturalRoll,
    criticalRange,
    outcome,
    isCritical,
    isTrueCritical,
    isGraze: outcome === 'graze',
    margin,
  };
}

/**
 * Calcula o dano de um ataque
 *
 * Regras:
 * - Crítico: Dano base é MAXIMIZADO (não rola, usa valor máximo dos dados)
 * - Crítico Verdadeiro: Dano base maximizado + rola dados extras de crítico
 * - Ataque de Raspão: Dano base / 2 (sem modificador, mínimo 1)
 * - Ataques sem dados: Dano base reduzido em 1/3 (arredonda pra baixo)
 *
 * @param config - Configuração do dano
 * @returns Cálculo detalhado do dano
 */
export function calculateAttackDamage(
  config: CriticalDamageConfig
): DamageCalculation {
  const {
    baseDamageRoll,
    criticalDamageRoll,
    isCritical,
    isTrueCritical,
    isGraze,
  } = config;

  let totalDamage = 0;
  let baseDamageMaximized: number | undefined;
  let trueCriticalDamage: number | undefined;
  let breakdown = '';

  if (isGraze) {
    // Ataque de Raspão: dado de dano / 2 (sem modificador)
    if (baseDamageRoll.quantity > 0) {
      // Com dados: soma máximo dos dados e divide por 2
      const diceMax = extractDiceMax(baseDamageRoll.type);
      const baseDice = baseDamageRoll.quantity * diceMax;
      totalDamage = Math.max(1, Math.floor(baseDice / 2));
      breakdown = `Raspão: ${baseDamageRoll.quantity}×${diceMax} ÷ 2 = ${totalDamage}`;
    } else {
      // Sem dados: dano base / 3 (mínimo 1)
      totalDamage = Math.max(1, Math.floor(baseDamageRoll.modifier / 3));
      breakdown = `Raspão (sem dados): ${baseDamageRoll.modifier} ÷ 3 = ${totalDamage}`;
    }
  } else if (isCritical) {
    // Crítico: Dano base MAXIMIZADO
    const diceMax = extractDiceMax(baseDamageRoll.type);
    baseDamageMaximized = baseDamageRoll.quantity * diceMax;
    totalDamage = baseDamageMaximized + baseDamageRoll.modifier;

    breakdown = `Crítico: ${baseDamageRoll.quantity}×${diceMax} (max) + ${baseDamageRoll.modifier} = ${totalDamage}`;

    if (isTrueCritical) {
      // Crítico Verdadeiro: + dados extras rolados
      trueCriticalDamage = rollCriticalDice(criticalDamageRoll);
      totalDamage += trueCriticalDamage;
      breakdown += ` + ${criticalDamageRoll.quantity}${criticalDamageRoll.type} extras = ${totalDamage}`;
    }
  } else {
    // Hit normal: rola dados normalmente
    const diceTotal = rollDice(baseDamageRoll);
    totalDamage = diceTotal + baseDamageRoll.modifier;
    breakdown = `${baseDamageRoll.quantity}${baseDamageRoll.type}+${baseDamageRoll.modifier} = ${totalDamage}`;
  }

  return {
    totalDamage: Math.max(0, totalDamage), // Dano nunca negativo
    baseDamageMaximized,
    trueCriticalDamage,
    modifiers: baseDamageRoll.modifier,
    breakdown,
  };
}

/**
 * Extrai o valor máximo de um tipo de dado
 */
function extractDiceMax(diceType: string): number {
  const match = diceType.match(/d(\d+)/);
  return match ? parseInt(match[1], 10) : 6;
}

/**
 * Rola dados (simulado - gera valor aleatório)
 */
function rollDice(diceRoll: DiceRoll): number {
  const diceMax = extractDiceMax(diceRoll.type);
  let total = 0;
  for (let i = 0; i < diceRoll.quantity; i++) {
    total += Math.floor(Math.random() * diceMax) + 1;
  }
  return total;
}

/**
 * Rola dados de crítico verdadeiro
 */
function rollCriticalDice(criticalRoll: DiceRoll): number {
  const diceTotal = rollDice(criticalRoll);
  return diceTotal + criticalRoll.modifier;
}

/**
 * Formata um resultado de ataque para exibição
 */
export function formatAttackOutcome(calc: AttackCalculation): string {
  switch (calc.outcome) {
    case 'miss':
      return 'ERROU';
    case 'graze':
      return 'ATAQUE DE RASPÃO';
    case 'hit':
      return 'ACERTOU';
    case 'critical':
      return 'CRÍTICO!';
    case 'true-critical':
      return 'CRÍTICO VERDADEIRO!!';
  }
}

/**
 * Obtém a cor do resultado
 */
export function getAttackOutcomeColor(
  outcome: AttackOutcome
): 'success' | 'warning' | 'error' | 'info' {
  switch (outcome) {
    case 'miss':
      return 'error';
    case 'graze':
      return 'info';
    case 'hit':
      return 'success';
    case 'critical':
      return 'warning';
    case 'true-critical':
      return 'warning';
  }
}
