/**
 * Constantes relacionadas às Origens do personagem
 *
 * As origens representam de onde o personagem veio, como ele viveu
 * até agora e o que fazia. Cada origem concede:
 * - 2 proficiências com habilidades
 * - Modificadores de atributos (+1 em um, ou +1 em dois e -1 em um)
 * - Uma habilidade especial única
 */

/**
 * Descrição de como os modificadores de atributos funcionam nas origens
 */
export const ORIGIN_ATTRIBUTE_MODIFIER_RULES = {
  /**
   * Opção 1: +1 em um único atributo
   */
  SINGLE_BONUS: {
    description: '+1 em um atributo à escolha',
    validation: (modifiers: { value: number }[]) =>
      modifiers.length === 1 && modifiers[0].value === 1,
  },
  /**
   * Opção 2: +1 em dois atributos e -1 em um atributo
   */
  DOUBLE_BONUS_SINGLE_PENALTY: {
    description: '+1 em dois atributos e -1 em um atributo',
    validation: (modifiers: { value: number }[]) => {
      const bonuses = modifiers.filter((m) => m.value === 1);
      const penalties = modifiers.filter((m) => m.value === -1);
      return bonuses.length === 2 && penalties.length === 1;
    },
  },
} as const;

/**
 * Número de proficiências com habilidades ganhas pela origem
 */
export const ORIGIN_SKILL_PROFICIENCIES_COUNT = 2;

/**
 * Validações para origem
 */
export const ORIGIN_VALIDATION = {
  /**
   * Valida se os modificadores de atributos seguem as regras
   */
  validateAttributeModifiers: (
    modifiers: { attribute: string; value: number }[]
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Opção 1: +1 em um atributo
    const isSingleBonus =
      ORIGIN_ATTRIBUTE_MODIFIER_RULES.SINGLE_BONUS.validation(modifiers);

    // Opção 2: +1 em dois e -1 em um
    const isDoubleBonusSinglePenalty =
      ORIGIN_ATTRIBUTE_MODIFIER_RULES.DOUBLE_BONUS_SINGLE_PENALTY.validation(
        modifiers
      );

    if (!isSingleBonus && !isDoubleBonusSinglePenalty) {
      errors.push(
        'Modificadores de atributos devem seguir uma das opções: ' +
          '(1) +1 em um atributo, ou ' +
          '(2) +1 em dois atributos e -1 em um atributo'
      );
    }

    // Verificar valores permitidos
    const invalidValues = modifiers.filter(
      (m) => m.value !== 1 && m.value !== -1
    );
    if (invalidValues.length > 0) {
      errors.push('Modificadores de atributos só podem ser +1 ou -1');
    }

    // Verificar duplicatas de atributos
    const attributes = modifiers.map((m) => m.attribute);
    const uniqueAttributes = new Set(attributes);
    if (attributes.length !== uniqueAttributes.size) {
      errors.push(
        'Não pode haver modificadores duplicados para o mesmo atributo'
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Valida se o número de proficiências está correto
   */
  validateSkillProficiencies: (
    proficiencies: string[]
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (proficiencies.length !== ORIGIN_SKILL_PROFICIENCIES_COUNT) {
      errors.push(
        `Origem deve ter exatamente ${ORIGIN_SKILL_PROFICIENCIES_COUNT} proficiências com habilidades`
      );
    }

    // Verificar duplicatas
    const uniqueProficiencies = new Set(proficiencies);
    if (proficiencies.length !== uniqueProficiencies.size) {
      errors.push('Não pode haver proficiências duplicadas');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
} as const;
