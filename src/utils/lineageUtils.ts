/**
 * Lineage Utilities - Utilitários para manipulação de linhagens
 *
 * Funções utilitárias para aplicar modificadores de linhagem,
 * calcular impactos automáticos e validar dados de linhagem.
 */

import type { Attributes } from '@/types/attributes';
import type { Lineage, Character } from '@/types/character';
import type { MovementType } from '@/types/common';
import { getSizeModifiers } from '@/constants/lineage';

/**
 * Opções de modificador de atributo para linhagem/origem
 * Pode ser:
 * - +1 em um atributo
 * - +1 em dois atributos e -1 em um atributo
 */
export interface AttributeModifierOption {
  type: 'single' | 'multiple';
  positive: Partial<Record<keyof Attributes, number>>;
  negative?: Partial<Record<keyof Attributes, number>>;
}

/**
 * Aplica modificadores de atributos de uma linhagem ou origem
 *
 * @param baseAttributes - Atributos base do personagem
 * @param modifier - Modificador a aplicar
 * @returns Novos atributos com modificadores aplicados
 */
export function applyAttributeModifiers(
  baseAttributes: Attributes,
  modifier: AttributeModifierOption
): Attributes {
  const newAttributes = { ...baseAttributes };

  // Aplica modificadores positivos
  Object.entries(modifier.positive).forEach(([attr, value]) => {
    const key = attr as keyof Attributes;
    newAttributes[key] = (newAttributes[key] || 0) + (value || 0);
  });

  // Aplica modificadores negativos (se houver)
  if (modifier.negative) {
    Object.entries(modifier.negative).forEach(([attr, value]) => {
      const key = attr as keyof Attributes;
      newAttributes[key] = (newAttributes[key] || 0) - (value || 0);
    });
  }

  return newAttributes;
}

/**
 * Valida modificadores de atributos
 * Garante que o modificador segue as regras do sistema
 *
 * @param modifier - Modificador a validar
 * @returns true se válido, false caso contrário
 */
export function validateAttributeModifier(
  modifier: AttributeModifierOption
): boolean {
  const positiveCount = Object.values(modifier.positive).reduce(
    (sum, val) => sum + (val || 0),
    0
  );

  const negativeCount = modifier.negative
    ? Object.values(modifier.negative).reduce((sum, val) => sum + (val || 0), 0)
    : 0;

  if (modifier.type === 'single') {
    // Tipo single: apenas +1 em um atributo
    return positiveCount === 1 && negativeCount === 0;
  } else {
    // Tipo multiple: +1 em dois, -1 em um
    return positiveCount === 2 && negativeCount === 1;
  }
}

/**
 * Calcula capacidade de carga baseada em Corpo e modificadores de tamanho
 *
 * @param strength - Valor do atributo Corpo
 * @param size - Tamanho da criatura
 * @param otherModifiers - Outros modificadores de carga
 * @returns Capacidade de carga total
 */
export function calculateCarryingCapacity(
  strength: number,
  size: string,
  otherModifiers: number = 0
): number {
  const sizeModifiers = getSizeModifiers(size as any);
  const base = 5 + strength * 5;
  const withSize = base + sizeModifiers.carryingCapacity;
  return Math.floor(withSize + otherModifiers);
}

/**
 * Calcula velocidade de deslocamento padrão baseada em tamanho
 * Algumas linhagens podem ter velocidades diferentes
 *
 * @param size - Tamanho da criatura
 * @param movementType - Tipo de deslocamento
 * @returns Velocidade padrão em metros
 */
export function getDefaultMovementSpeed(
  size: string,
  movementType: MovementType
): number {
  // Para a maioria das criaturas, andando é 5m independente do tamanho (MVP-1)
  // Outros tipos de deslocamento são 0 por padrão
  if (movementType === 'andando') {
    return 5;
  }
  return 0;
}

/**
 * Cria um objeto de deslocamento padrão
 *
 * @returns Objeto com todos os tipos de deslocamento zerados
 */
export function createDefaultMovement(): Record<MovementType, number> {
  return {
    andando: 5,
    voando: 0,
    escalando: 0,
    escavando: 0,
    nadando: 0,
  };
}

/**
 * @deprecated Defesa agora é um teste ativo (Reflexo ou Vigor), não valor fixo.
 * Use DefenseTest.tsx para exibição. Use `getGuardSizeModifier` para modificador de GA.
 *
 * Calcula defesa baseada em agilidade e modificadores de tamanho (sistema antigo d20)
 */
export function calculateDefense(
  agility: number,
  size: string,
  armorBonus: number = 0,
  otherBonuses: number = 0
): number {
  const sizeModifiers = getSizeModifiers(size as any);
  const base = 15;
  return base + agility + sizeModifiers.defense + armorBonus + otherBonuses;
}

/**
 * Retorna o modificador de Guarda (GA) baseado no tamanho da criatura.
 * É um valor fixo adicionado/subtraído do GA máximo.
 *
 * @param size - Tamanho da criatura
 * @returns Modificador de GA (positivo = mais GA, negativo = menos GA)
 */
export function getGuardSizeModifier(size: string): number {
  const sizeModifiers = getSizeModifiers(size as any);
  return sizeModifiers.guard;
}

/**
 * Aplica modificadores de tamanho a uma habilidade específica
 * Retorna modificador em DADOS (+Xd/-Xd), não numérico.
 *
 * @param skillName - Nome da habilidade
 * @param size - Tamanho da criatura
 * @returns Modificador de dados para a habilidade (0 se não aplicável)
 */
export function getSizeModifierForSkill(
  skillName: string,
  size: string
): number {
  const sizeModifiers = getSizeModifiers(size as any);
  const skillModifiers = sizeModifiers.skillModifiers;

  const normalizedSkillName = skillName.toLowerCase();

  if (normalizedSkillName === 'acrobacia') return skillModifiers.acrobacia;
  if (normalizedSkillName === 'atletismo') return skillModifiers.atletismo;
  if (normalizedSkillName === 'furtividade') return skillModifiers.furtividade;
  if (normalizedSkillName === 'reflexo') return skillModifiers.reflexo;
  if (normalizedSkillName === 'tenacidade') return skillModifiers.tenacidade;

  return 0;
}

/**
 * Cria uma linhagem vazia/padrão
 *
 * @returns Objeto de linhagem com valores padrão
 */
export function createDefaultLineage(): Lineage {
  return {
    name: '',
    description: '',
    attributeModifiers: [],
    size: 'medio',
    height: 170,
    weightKg: 70,
    weightRPG: 10,
    age: 25,
    adulthood: undefined,
    lifeExpectancy: undefined,
    languages: [],
    movement: createDefaultMovement(),
    keenSenses: [],
    vision: 'normal',
    ancestryTraits: [],
  };
}

/**
 * Valida dados de uma linhagem
 *
 * @param lineage - Linhagem a validar
 * @returns true se válida, false caso contrário
 */
export function validateLineage(lineage: Partial<Lineage>): boolean {
  if (!lineage.name || lineage.name.trim() === '') {
    return false;
  }

  if (lineage.height && (lineage.height < 10 || lineage.height > 1000)) {
    return false;
  }

  if (lineage.weightKg && (lineage.weightKg < 1 || lineage.weightKg > 10000)) {
    return false;
  }

  if (lineage.age && lineage.age < 0) {
    return false;
  }

  return true;
}

/**
 * Calcula modificadores de percepção baseado em sentidos aguçados
 * Cada sentido aguçado concede seu bônus específico
 *
 * @param keenSenses - Array de sentidos aguçados com bônus
 * @returns Objeto com modificadores por tipo de sentido
 */
export function calculatePerceptionModifiers(
  keenSenses: import('@/types/common').KeenSense[]
): Record<import('@/types/common').SenseType, number> {
  const modifiers: Record<import('@/types/common').SenseType, number> = {
    visao: 0,
    olfato: 0,
    audicao: 0,
  };

  keenSenses.forEach((sense) => {
    modifiers[sense.type] = sense.bonus;
  });

  return modifiers;
}

/**
 * Aplica mudanças de linhagem ao personagem
 * Atualiza todos os campos relacionados automaticamente
 *
 * @param character - Personagem a atualizar
 * @param lineage - Nova linhagem
 * @returns Personagem atualizado
 */
export function applyLineageToCharacter(
  character: Character,
  lineage: Lineage
): Character {
  const updatedCharacter = { ...character };

  // Atualiza linhagem
  updatedCharacter.lineage = lineage;

  // Atualiza tamanho
  updatedCharacter.size = lineage.size;

  // Atualiza deslocamento - converte de número simples para estrutura base/bonus
  const lineageMovement = lineage.movement;
  updatedCharacter.movement = {
    speeds: {
      andando: { base: lineageMovement.andando ?? 0, bonus: 0 },
      voando: { base: lineageMovement.voando ?? 0, bonus: 0 },
      escalando: { base: lineageMovement.escalando ?? 0, bonus: 0 },
      escavando: { base: lineageMovement.escavando ?? 0, bonus: 0 },
      nadando: { base: lineageMovement.nadando ?? 0, bonus: 0 },
    },
    modifiers: 0,
  };

  // Atualiza sentidos
  updatedCharacter.senses = {
    vision: lineage.vision,
    keenSenses: lineage.keenSenses || [],
    perceptionModifiers: calculatePerceptionModifiers(lineage.keenSenses || []),
  };

  // Atualiza idiomas da linhagem (mantém Comum e outros idiomas já conhecidos)
  const existingLanguages = updatedCharacter.languages || ['comum'];
  const lineageLanguages = lineage.languages || [];

  // Combina idiomas sem duplicatas
  updatedCharacter.languages = Array.from(
    new Set([...existingLanguages, ...lineageLanguages])
  ) as any;

  return updatedCharacter;
}
