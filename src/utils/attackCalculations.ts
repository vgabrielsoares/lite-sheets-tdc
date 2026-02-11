/**
 * Cálculos e Utilitários para Sistema de Combate
 *
 * v0.0.2 - Sistema de Pool de Dados com Contagem de Sucessos:
 * - Ataque = pool de XdY (X = atributo + mods, Y = proficiência)
 * - Resultados ≥ 6 = ✶ (sucesso), = 1 cancela 1✶
 * - Sem comparação com defesa fixa (defensor rola separadamente)
 * - Dano = soma de dados (sistema separado, não usa ✶)
 *
 * Funções antigas (d20) mantidas com @deprecated para compatibilidade.
 */

import type { DiceRoll, DieSize, Modifier } from '@/types/common';
import type { Character, SkillName, AttributeName } from '@/types';
import {
  SKILL_PROFICIENCY_LEVELS,
  COMBAT_SKILLS,
  getSkillDieSize,
} from '@/constants/skills';
import { calculateSignatureAbilityBonus } from './calculations';

// ============================================================
// v0.0.2 — Pool System (Contagem de Sucessos)
// ============================================================

/**
 * Resultado do cálculo de pool de ataque (v0.0.2)
 */
export interface AttackPoolCalculation {
  /** Quantidade de dados na pool */
  diceCount: number;
  /** Tamanho do dado (d6/d8/d10/d12) baseado na proficiência */
  dieSize: DieSize;
  /** Se deve rolar 2 dados e pegar o menor (pool ≤ 0) */
  isPenaltyRoll: boolean;
  /** Fórmula legível (ex: "4d8", "2d6 (menor)") */
  formula: string;
  /** Atributo sendo usado */
  attribute: AttributeName;
  /** Nome da habilidade */
  skillName: SkillName;
  /** Nome do uso específico (se aplicável) */
  useName?: string;
}

/**
 * Resultado de uma rolagem de pool com contagem de sucessos
 */
export interface PoolRollResult {
  /** Valores individuais de cada dado */
  rolls: number[];
  /** Sucessos brutos (resultados ≥ 6) */
  rawSuccesses: number;
  /** Cancelamentos (resultados = 1) */
  cancellations: number;
  /** Sucessos líquidos (rawSuccesses - cancellations, mín 0) */
  netSuccesses: number;
  /** Tamanho do dado usado */
  dieSize: DieSize;
  /** Se foi rolagem de penalidade (2d, menor) */
  isPenaltyRoll: boolean;
}

/**
 * Calcula a pool de dados para um ataque (v0.0.2)
 *
 * Regras:
 * - Base = valor do atributo da habilidade/uso
 * - +Xd de modificadores de dados da habilidade
 * - +Xd de modificadores de dados do uso
 * - +Xd de attackDiceModifier (bônus da arma)
 * - +Xd de Habilidade de Assinatura (1d/2d/3d por nível)
 * - Tamanho do dado = proficiência (Leigo=d6, Adepto=d8, Versado=d10, Mestre=d12)
 * - Se pool ≤ 0, rola 2d e pega o menor
 * - Máximo 8 dados por teste
 *
 * @param character - Dados do personagem
 * @param attackSkill - Habilidade usada no ataque (ex: 'luta', 'acerto')
 * @param attackSkillUseId - ID do uso específico (opcional)
 * @param attackDiceModifier - Modificador de dados adicional (+Xd/-Xd da arma)
 * @param attributeOverride - Atributo alternativo (opcional)
 * @returns Pool de dados calculada
 */
export function calculateAttackPool(
  character: Character,
  attackSkill: SkillName,
  attackSkillUseId: string | undefined,
  attackDiceModifier: number = 0,
  attributeOverride?: AttributeName
): AttackPoolCalculation {
  const skill = character.skills[attackSkill];

  // Fallback se habilidade não existir
  if (!skill) {
    const attr = attributeOverride || 'corpo';
    const attrValue = character.attributes[attr];
    const totalDice = attrValue + attackDiceModifier;

    if (totalDice <= 0) {
      return {
        diceCount: 2,
        dieSize: 'd6',
        isPenaltyRoll: true,
        formula: '2d6 (menor)',
        attribute: attr,
        skillName: attackSkill,
      };
    }

    const capped = Math.min(8, totalDice);
    return {
      diceCount: capped,
      dieSize: 'd6',
      isPenaltyRoll: false,
      formula: `${capped}d6`,
      attribute: attr,
      skillName: attackSkill,
    };
  }

  // Determinar atributo e uso
  let keyAttribute: AttributeName = skill.keyAttribute;
  let useName: string | undefined;
  let useModifiers: Modifier[] = [];

  if (attackSkillUseId) {
    // Verificar uso customizado
    if (skill.customUses) {
      const customUse = skill.customUses.find((u) => u.id === attackSkillUseId);
      if (customUse) {
        useName = customUse.name;
        keyAttribute = customUse.keyAttribute;
        useModifiers = customUse.modifiers || [];
      }
    }

    // Verificar uso padrão com overrides
    if (!useName && attackSkillUseId.startsWith('default-')) {
      const defaultUseName = attackSkillUseId.replace('default-', '');
      useName = defaultUseName;

      if (skill.defaultUseAttributeOverrides?.[defaultUseName]) {
        keyAttribute = skill.defaultUseAttributeOverrides[defaultUseName];
      }
      if (skill.defaultUseModifierOverrides?.[defaultUseName]) {
        useModifiers = skill.defaultUseModifierOverrides[defaultUseName];
      }
    }
  }

  if (attributeOverride) {
    keyAttribute = attributeOverride;
  }

  const attributeValue = character.attributes[keyAttribute];
  const dieSize = getSkillDieSize(skill.proficiencyLevel);

  // Bônus de assinatura (+1d/+2d/+3d)
  const signatureBonus = skill.isSignature
    ? calculateSignatureAbilityBonus(character.level, true)
    : 0;

  // Modificadores de dados da habilidade
  const skillDiceMods = (skill.modifiers || [])
    .filter((m) => m.affectsDice)
    .reduce((sum, m) => sum + m.value, 0);

  // Modificadores de dados do uso
  const useDiceMods = useModifiers
    .filter((m) => m.affectsDice)
    .reduce((sum, m) => sum + m.value, 0);

  // Total da pool
  const totalDice =
    attributeValue +
    skillDiceMods +
    useDiceMods +
    attackDiceModifier +
    signatureBonus;

  if (totalDice <= 0) {
    return {
      diceCount: 2,
      dieSize,
      isPenaltyRoll: true,
      formula: `2${dieSize} (menor)`,
      attribute: keyAttribute,
      skillName: attackSkill,
      useName,
    };
  }

  const capped = Math.min(8, totalDice);
  return {
    diceCount: capped,
    dieSize,
    isPenaltyRoll: false,
    formula: `${capped}${dieSize}`,
    attribute: keyAttribute,
    skillName: attackSkill,
    useName,
  };
}

/**
 * Rola uma pool de dados e conta sucessos (v0.0.2)
 *
 * Regras:
 * - Resultado ≥ 6 = 1✶ (sucesso)
 * - Resultado = 1 cancela 1✶
 * - Mínimo 0✶ (net successes nunca negativo)
 * - Se isPenaltyRoll: rola os dados e usa apenas o menor resultado
 *
 * @param pool - Pool calculada
 * @returns Resultado da rolagem com contagem de ✶
 */
export function rollAttackPool(pool: AttackPoolCalculation): PoolRollResult {
  const diceMax = extractDiceMax(pool.dieSize);

  // Gera rolagens aleatórias
  const rolls: number[] = [];
  for (let i = 0; i < pool.diceCount; i++) {
    rolls.push(Math.floor(Math.random() * diceMax) + 1);
  }

  if (pool.isPenaltyRoll) {
    // Penalidade: usa apenas o menor resultado
    const minRoll = Math.min(...rolls);
    const success = minRoll >= 6 ? 1 : 0;
    const cancel = minRoll === 1 ? 1 : 0;
    return {
      rolls,
      rawSuccesses: success,
      cancellations: cancel,
      netSuccesses: Math.max(0, success - cancel),
      dieSize: pool.dieSize,
      isPenaltyRoll: true,
    };
  }

  // Contagem normal
  const rawSuccesses = rolls.filter((r) => r >= 6).length;
  const cancellations = rolls.filter((r) => r === 1).length;
  const netSuccesses = Math.max(0, rawSuccesses - cancellations);

  return {
    rolls,
    rawSuccesses,
    cancellations,
    netSuccesses,
    dieSize: pool.dieSize,
    isPenaltyRoll: false,
  };
}

/**
 * Formata o resultado de uma rolagem de pool para exibição
 *
 * @param result - Resultado da rolagem
 * @returns String formatada (ex: "3✶ (5 sucessos - 2 cancelamentos)")
 */
export function formatPoolResult(result: PoolRollResult): string {
  if (result.isPenaltyRoll) {
    return `${result.netSuccesses}✶ (menor de ${result.rolls.join(', ')})`;
  }

  if (result.cancellations > 0) {
    return `${result.netSuccesses}✶ (${result.rawSuccesses} sucessos - ${result.cancellations} cancelamentos)`;
  }

  return `${result.netSuccesses}✶`;
}

// ============================================================
// Funções de dano (ainda válidas em v0.0.2 — dano é soma de dados)
// ============================================================

/**
 * Configuração de dano (v0.0.2: simplificado, sem graze/true-critical)
 */
export interface DamageConfig {
  /** Dados de dano base da arma */
  baseDamageRoll: DiceRoll;
  /** Modificadores fixos de dano */
  damageModifier?: number;
}

/**
 * Resultado do cálculo de dano
 */
export interface DamageResult {
  /** Dano total */
  totalDamage: number;
  /** Rolagens individuais */
  rolls: number[];
  /** Descrição do cálculo */
  breakdown: string;
}

/**
 * Calcula dano de um ataque (v0.0.2)
 * Dano = soma dos dados + modificador fixo (se houver)
 *
 * @param config - Configuração do dano (dados + modificador)
 * @returns Resultado do cálculo de dano
 */
export function calculateDamage(config: DamageConfig): DamageResult {
  const { baseDamageRoll, damageModifier = 0 } = config;
  const diceMax = extractDiceMax(baseDamageRoll.type);

  const rolls: number[] = [];
  let diceTotal = 0;
  for (let i = 0; i < baseDamageRoll.quantity; i++) {
    const roll = Math.floor(Math.random() * diceMax) + 1;
    rolls.push(roll);
    diceTotal += roll;
  }

  const totalDamage = Math.max(
    0,
    diceTotal + baseDamageRoll.modifier + damageModifier
  );
  const modStr =
    baseDamageRoll.modifier + damageModifier >= 0
      ? `+${baseDamageRoll.modifier + damageModifier}`
      : `${baseDamageRoll.modifier + damageModifier}`;
  const breakdown = `${baseDamageRoll.quantity}${baseDamageRoll.type}${modStr} = [${rolls.join(', ')}]${modStr} = ${totalDamage}`;

  return { totalDamage, rolls, breakdown };
}

// ============================================================
// DEPRECATED: Sistema antigo d20 (mantido para compatibilidade)
// ============================================================

/**
 * @deprecated v0.0.2: Use PoolRollResult com contagem de ✶ em vez de outcomes fixos
 */
export type AttackOutcome =
  | 'miss'
  | 'graze'
  | 'hit'
  | 'critical'
  | 'true-critical';

/**
 * @deprecated v0.0.2: Use AttackPoolCalculation (pool de dados)
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
 * @deprecated v0.0.2: Defesa é teste ativo, não comparação fixa
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
 * @deprecated v0.0.2: Use calculateAttackPool (pool de dados)
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

    // Bônus de assinatura (mesmo para proficiência leiga)
    let signatureBonus = 0;
    if (skill.isSignature) {
      const isCombatSkill = COMBAT_SKILLS.includes(attackSkill);
      signatureBonus = calculateSignatureAbilityBonus(
        character.level,
        isCombatSkill
      );
    }

    const totalModifier = attackBonus + signatureBonus;
    const modifierStr =
      totalModifier >= 0 ? `+${totalModifier}` : `${totalModifier}`;
    const formula = `${takeLowest ? '-' : ''}${finalDiceCount}d20${modifierStr}`;

    return {
      diceCount: finalDiceCount,
      modifier: totalModifier,
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

  // 8. Bônus de Habilidade de Assinatura
  let signatureBonus = 0;
  if (skill.isSignature) {
    const isCombatSkill = COMBAT_SKILLS.includes(attackSkill);
    signatureBonus = calculateSignatureAbilityBonus(
      character.level,
      isCombatSkill
    );
  }

  // 9. Modificador total (proficiência + modificadores skill + modificadores uso + bônus assinatura + bônus adicional)
  const modifier =
    proficiencyModifier +
    skillNumericModifiers +
    useNumericModifiers +
    signatureBonus +
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
 * @deprecated v0.0.2: Não há mais comparação com defesa fixa
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
 * @deprecated v0.0.2: Use calculateDamage (simplificado, sem graze/true-critical)
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
