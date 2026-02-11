/**
 * Origin Utilities - Utilitários para manipulação de origens
 *
 * Funções utilitárias para criar, validar e manipular dados de origem.
 */

import type { Origin } from '@/types/character';
import type { SkillName } from '@/types/skills';
import type { AttributeName } from '@/types/attributes';
import { ORIGIN_VALIDATION } from '@/constants/origins';

/**
 * Cria uma origem padrão vazia
 *
 * @returns Origem com valores padrão
 */
export function createDefaultOrigin(): Origin {
  return {
    name: '',
    description: '',
    skillProficiencies: [],
    attributeModifiers: [],
    specialAbility: {
      name: '',
      description: '',
    },
  };
}

/**
 * Valida se uma origem está completa e correta
 *
 * @param origin - Origem a validar
 * @returns Resultado da validação com erros (se houver)
 */
export function validateOrigin(origin: Origin): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Valida nome
  if (!origin.name || origin.name.trim() === '') {
    errors.push('Nome da origem é obrigatório');
  }

  // Valida proficiências
  const profValidation = ORIGIN_VALIDATION.validateSkillProficiencies(
    origin.skillProficiencies
  );
  if (!profValidation.valid) {
    errors.push(...profValidation.errors);
  }

  // Valida modificadores de atributos
  const attrValidation = ORIGIN_VALIDATION.validateAttributeModifiers(
    origin.attributeModifiers
  );
  if (!attrValidation.valid) {
    errors.push(...attrValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Verifica se uma origem está vazia (não definida)
 *
 * @param origin - Origem a verificar
 * @returns True se a origem está vazia
 */
export function isOriginEmpty(origin?: Origin): boolean {
  if (!origin) return true;

  return (
    !origin.name ||
    origin.name.trim() === '' ||
    origin.skillProficiencies.length === 0 ||
    origin.attributeModifiers.length === 0
  );
}

/**
 * Obtém resumo textual dos modificadores de atributos
 *
 * @param origin - Origem com modificadores
 * @returns String descritiva dos modificadores (ex: "+1 AGI, +1 MEN, -1 FOR")
 */
export function getAttributeModifiersSummary(origin: Origin): string {
  if (!origin.attributeModifiers || origin.attributeModifiers.length === 0) {
    return 'Nenhum modificador';
  }

  return origin.attributeModifiers
    .map((mod) => {
      const sign = mod.value >= 0 ? '+' : '';
      const attrAbbr = mod.attribute.substring(0, 3).toUpperCase();
      return `${sign}${mod.value} ${attrAbbr}`;
    })
    .join(', ');
}

/**
 * Aplica os modificadores de atributos da origem aos atributos base
 *
 * @param baseAttributes - Atributos base do personagem
 * @param origin - Origem com modificadores
 * @returns Objeto com os valores modificados por atributo
 */
export function applyOriginAttributeModifiers(
  baseAttributes: Record<AttributeName, number>,
  origin: Origin
): Record<AttributeName, number> {
  const modified = { ...baseAttributes };

  origin.attributeModifiers.forEach((mod) => {
    modified[mod.attribute] = (modified[mod.attribute] || 0) + mod.value;
  });

  return modified;
}

/**
 * Cria uma origem de exemplo para testes
 *
 * @returns Origem de exemplo válida
 */
export function createExampleOrigin(): Origin {
  return {
    name: 'Nobre',
    description:
      'Você cresceu em uma família aristocrática, aprendendo etiqueta, política e o valor das aparências.',
    skillProficiencies: ['historia', 'persuasao'],
    attributeModifiers: [
      { attribute: 'influencia', value: 1 },
      { attribute: 'mente', value: 1 },
      { attribute: 'corpo', value: -1 },
    ],
    specialAbility: {
      name: 'Prestígio',
      description:
        'Você pode usar seu nome e título para obter audiência com figuras importantes e acesso a lugares normalmente restritos.',
    },
  };
}
