/**
 * Níveis de Ataque e Defesa - Sistema Padronizado por Nível
 *
 * Os testes de ataque físico e defesa são padronizados para todos os personagens.
 * Não existem graus de habilidade: o tamanho do dado é determinado pelo
 * nível do personagem. A quantidade de dados é determinada pelo atributo usado.
 *
 * Regras:
 * - Ataques Físicos: Corpo ou Agilidade dados (escolha do jogador)
 * - Defesa: Corpo ou Agilidade dados (escolha do jogador)
 *
 * Tamanho do dado por nível:
 * | Nível     | Dado |
 * |-----------|------|
 * | 0º        | d6   |
 * | 1º a 3º   | d8   |
 * | 4º a 10º  | d10  |
 * | +11º      | d12  |
 *
 * NOTA: Ataques não-físicos (Arcano, Natureza, Religião) continuam usando
 * o sistema de proficiência normal da habilidade.
 *
 * @see base-files/v0.2.md
 */

import type { DieSize } from '@/types/common';
import type { AttributeName } from '@/types/attributes';

/**
 * Obtém o tamanho do dado de ataque/defesa baseado no nível do personagem.
 *
 * @param level - Nível do personagem (0-15+)
 * @returns Tamanho do dado (d6, d8, d10 ou d12)
 */
export function getAttackDefenseDieSize(level: number): DieSize {
  if (level <= 0) return 'd6';
  if (level <= 3) return 'd8';
  if (level <= 10) return 'd10';
  return 'd12';
}

/**
 * Tabela de dados de ataque/defesa por faixa de nível
 */
export const ATTACK_DEFENSE_LEVEL_TABLE: {
  minLevel: number;
  maxLevel: number;
  dieSize: DieSize;
  label: string;
}[] = [
  { minLevel: 0, maxLevel: 0, dieSize: 'd6', label: '0º Nível' },
  { minLevel: 1, maxLevel: 3, dieSize: 'd8', label: '1º ao 3º Nível' },
  { minLevel: 4, maxLevel: 10, dieSize: 'd10', label: '4º ao 10º Nível' },
  { minLevel: 11, maxLevel: 15, dieSize: 'd12', label: '11º+ Nível' },
];

/**
 * Obtém o atributo sugerido para ataques físicos baseado no tipo de ataque.
 * Este é apenas uma sugestão; o jogador pode escolher livremente entre Corpo e Agilidade.
 *
 * Sugestão padrão:
 * - Corpo a Corpo → Corpo
 * - Distância → Agilidade
 *
 * @param attackType - Tipo de ataque ('corpo-a-corpo' | 'distancia')
 * @returns Nome do atributo sugerido
 */
export function getSuggestedPhysicalAttackAttribute(
  attackType: 'corpo-a-corpo' | 'distancia'
): AttributeName {
  return attackType === 'corpo-a-corpo' ? 'corpo' : 'agilidade';
}

/**
 * @deprecated Use getSuggestedPhysicalAttackAttribute. O atributo é escolha do jogador.
 */
export const getPhysicalAttackAttribute = getSuggestedPhysicalAttackAttribute;

/**
 * Atributos disponíveis para ataques físicos (escolha do jogador)
 */
export const PHYSICAL_ATTACK_ATTRIBUTES: {
  attribute: AttributeName;
  label: string;
  description: string;
}[] = [
  {
    attribute: 'corpo',
    label: 'Corpo',
    description: 'Força, resistência, impacto.',
  },
  {
    attribute: 'agilidade',
    label: 'Agilidade',
    description: 'Destreza, precisão, rapidez.',
  },
];

/**
 * Verifica se um ataque usa o sistema padronizado de nível
 * (vs. o sistema de proficiência de habilidade).
 *
 * Ataques físicos (corpo a corpo e distância) usam o sistema de nível.
 * Ataques mágicos (Arcano, Natureza, Religião, etc.) usam proficiência.
 *
 * @param attackSkill - Habilidade do ataque
 * @param attackType - Tipo do ataque
 * @returns true se usa sistema de nível padronizado
 */
export function isLevelBasedAttack(
  attackSkill: string,
  attackType: string
): boolean {
  // Ataques mágicos sempre usam sistema de proficiência
  if (attackType === 'magico') return false;

  // Habilidades de conjuração usam sistema de proficiência
  const spellcastingSkills = ['arcano', 'natureza', 'religiao'];
  if (spellcastingSkills.includes(attackSkill)) return false;

  // Demais ataques corpo a corpo e distância usam sistema de nível
  return true;
}

/**
 * Labels para o sistema de ataque/defesa padronizado
 */
export const COMBAT_LEVEL_LABELS = {
  meleeAttack: 'Ataque Corpo a Corpo',
  rangedAttack: 'Ataque à Distância',
  defense: 'Defesa',
} as const;

/**
 * Atributos de defesa disponíveis
 */
export const DEFENSE_ATTRIBUTES: {
  attribute: AttributeName;
  label: string;
  description: string;
}[] = [
  {
    attribute: 'corpo',
    label: 'Corpo',
    description: 'Resistir, bloquear, aguentar o impacto.',
  },
  {
    attribute: 'agilidade',
    label: 'Agilidade',
    description: 'Esquivar, aparar, reação rápida.',
  },
];
