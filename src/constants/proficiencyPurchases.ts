/**
 * Proficiency Purchases — Sistema de compra de proficiências por atributos
 *
 * Cada atributo dá pontos de compra = valor do atributo.
 * Proficiências podem ser compradas gastando pontos do atributo relevante.
 * Retroativo: ao aumentar atributo, pontos de compra sobem.
 *
 * Livro v0.1.7 — Tabela de proficiências compráveis.
 */

import type { AttributeName } from '@/types/attributes';

// ─── Types ──────────────────────────────────────────────────

/**
 * Uma opção de proficiência que pode ser comprada.
 */
export interface PurchasableProficiency {
  /** ID único para referência */
  id: string;
  /** Nome da proficiência */
  label: string;
  /** Descrição curta */
  description: string;
  /** Categoria da proficiência no sistema */
  category: 'weapon' | 'armor' | 'skill' | 'language' | 'tool';
  /** Se compra todas de uma categoria (true) ou apenas uma (false) */
  isGroupPurchase: boolean;
  /** Opções de custo (atributo → custo). Jogador escolhe UMA opção. */
  costOptions: Partial<Record<AttributeName, number>>;
}

/**
 * Registro de uma proficiência efetivamente comprada pelo personagem.
 */
export interface ProficiencyPurchaseRecord {
  /** ID único do registro de compra */
  id: string;
  /** ID da proficiência comprada (referência a PurchasableProficiency.id) */
  proficiencyId: string;
  /** Nome (para exibição, mesmo que PurchasableProficiency.label) */
  name: string;
  /** Nome específico (para compra unitária, ex: "Espada Longa") */
  specificName?: string;
  /** Atributo usado para pagar */
  paidWithAttribute: AttributeName;
  /** Custo pago */
  cost: number;
  /** Se esta proficiência foi devolvida (ganhou de outra fonte) */
  refunded: boolean;
}

// ─── Constants ──────────────────────────────────────────────

/**
 * Lista completa de proficiências compráveis no sistema.
 * Baseada na tabela do livro v0.1.7.
 */
export const PURCHASABLE_PROFICIENCIES: readonly PurchasableProficiency[] = [
  // ── Armas ──
  {
    id: 'one-weapon-marcial',
    label: '1 Arma Marcial',
    description: 'Proficiência com uma arma marcial específica.',
    category: 'weapon',
    isGroupPurchase: false,
    costOptions: { agilidade: 1, corpo: 1 },
  },
  {
    id: 'all-weapons-marcial',
    label: 'Armas Marciais (todas)',
    description: 'Proficiência com todas as armas marciais.',
    category: 'weapon',
    isGroupPurchase: true,
    costOptions: { agilidade: 3, corpo: 3 },
  },
  {
    id: 'one-weapon-complexa',
    label: '1 Arma Complexa',
    description: 'Proficiência com uma arma complexa específica.',
    category: 'weapon',
    isGroupPurchase: false,
    costOptions: { agilidade: 2, mente: 1 },
  },
  {
    id: 'all-weapons-complexa',
    label: 'Armas Complexas (todas)',
    description: 'Proficiência com todas as armas complexas.',
    category: 'weapon',
    isGroupPurchase: true,
    costOptions: { agilidade: 4, mente: 3 },
  },
  {
    id: 'one-weapon-pesada',
    label: '1 Arma Pesada',
    description: 'Proficiência com uma arma pesada específica.',
    category: 'weapon',
    isGroupPurchase: false,
    costOptions: { corpo: 2 },
  },
  {
    id: 'all-weapons-pesada',
    label: 'Armas Pesadas (todas)',
    description: 'Proficiência com todas as armas pesadas.',
    category: 'weapon',
    isGroupPurchase: true,
    costOptions: { corpo: 4 },
  },

  // ── Armaduras ──
  {
    id: 'one-armor-leve',
    label: '1 Armadura Leve',
    description: 'Proficiência com uma armadura leve específica.',
    category: 'armor',
    isGroupPurchase: false,
    costOptions: { agilidade: 1, corpo: 1 },
  },
  {
    id: 'all-armors-leve',
    label: 'Armaduras Leves (todas)',
    description: 'Proficiência com todas as armaduras leves.',
    category: 'armor',
    isGroupPurchase: true,
    costOptions: { agilidade: 3, corpo: 3 },
  },
  {
    id: 'one-armor-media',
    label: '1 Armadura Média',
    description: 'Proficiência com uma armadura média específica.',
    category: 'armor',
    isGroupPurchase: false,
    costOptions: { agilidade: 2, corpo: 2 },
  },
  {
    id: 'all-armors-media',
    label: 'Armaduras Médias (todas)',
    description: 'Proficiência com todas as armaduras médias.',
    category: 'armor',
    isGroupPurchase: true,
    costOptions: { agilidade: 4, corpo: 4 },
  },
  {
    id: 'one-armor-pesada',
    label: '1 Armadura Pesada',
    description: 'Proficiência com uma armadura pesada específica.',
    category: 'armor',
    isGroupPurchase: false,
    costOptions: { corpo: 3 },
  },
  {
    id: 'all-armors-pesada',
    label: 'Armaduras Pesadas (todas)',
    description: 'Proficiência com todas as armaduras pesadas.',
    category: 'armor',
    isGroupPurchase: true,
    costOptions: { corpo: 5 },
  },

  // ── Habilidades ──
  {
    id: 'skill-proficiency',
    label: '1 Habilidade (Leigo → Adepto)',
    description:
      'Ganha proficiência (Adepto) em uma habilidade. Custa 1 ponto do atributo-chave da habilidade.',
    category: 'skill',
    isGroupPurchase: false,
    costOptions: {
      agilidade: 1,
      corpo: 1,
      influencia: 1,
      mente: 1,
      essencia: 1,
      instinto: 1,
    },
  },

  // ── Idiomas ──
  {
    id: 'language',
    label: '1 Idioma',
    description: 'Aprende um idioma adicional.',
    category: 'language',
    isGroupPurchase: false,
    costOptions: { influencia: 1, mente: 1 },
  },

  // ── Instrumentos ──
  {
    id: 'skill-tool',
    label: '1 Instrumento de Habilidade',
    description:
      'Proficiência com um instrumento de habilidade. Custa 1 ponto do atributo relevante.',
    category: 'tool',
    isGroupPurchase: false,
    costOptions: {
      agilidade: 1,
      corpo: 1,
      influencia: 1,
      mente: 1,
      essencia: 1,
      instinto: 1,
    },
  },
  {
    id: 'craft-tool',
    label: '1 Instrumento de Ofício',
    description:
      'Proficiência com um instrumento de ofício. Custa 1 ponto do atributo relevante.',
    category: 'tool',
    isGroupPurchase: false,
    costOptions: {
      agilidade: 1,
      corpo: 1,
      influencia: 1,
      mente: 1,
      essencia: 1,
      instinto: 1,
    },
  },
] as const;

/**
 * Labels para exibição da categoria de proficiência.
 */
export const PROFICIENCY_PURCHASE_CATEGORY_LABELS: Record<
  PurchasableProficiency['category'],
  string
> = {
  weapon: 'Armas',
  armor: 'Armaduras',
  skill: 'Habilidades',
  language: 'Idiomas',
  tool: 'Instrumentos',
};

// ─── Utility Functions ──────────────────────────────────────

/**
 * Calcula os pontos totais disponíveis para compra por atributo.
 * Pontos = valor do atributo.
 */
export function getAvailablePurchasePoints(
  attributes: Record<AttributeName, number>
): Record<AttributeName, number> {
  return { ...attributes };
}

/**
 * Calcula os pontos gastos por atributo com base nos registros de compra.
 */
export function getSpentPurchasePoints(
  purchases: ProficiencyPurchaseRecord[]
): Partial<Record<AttributeName, number>> {
  const spent: Partial<Record<AttributeName, number>> = {};
  for (const purchase of purchases) {
    if (purchase.refunded) continue;
    const attr = purchase.paidWithAttribute;
    spent[attr] = (spent[attr] ?? 0) + purchase.cost;
  }
  return spent;
}

/**
 * Calcula os pontos restantes (disponíveis - gastos) por atributo.
 */
export function getRemainingPurchasePoints(
  attributes: Record<AttributeName, number>,
  purchases: ProficiencyPurchaseRecord[]
): Record<AttributeName, number> {
  const spent = getSpentPurchasePoints(purchases);
  const remaining: Record<AttributeName, number> = { ...attributes };
  for (const attr of Object.keys(spent) as AttributeName[]) {
    remaining[attr] = Math.max(0, remaining[attr] - (spent[attr] ?? 0));
  }
  return remaining;
}

/**
 * Verifica se o personagem pode comprar uma proficiência específica
 * com um determinado atributo.
 */
export function canPurchaseProficiency(
  proficiency: PurchasableProficiency,
  payAttribute: AttributeName,
  attributes: Record<AttributeName, number>,
  purchases: ProficiencyPurchaseRecord[]
): boolean {
  const cost = proficiency.costOptions[payAttribute];
  if (cost === undefined) return false;

  const remaining = getRemainingPurchasePoints(attributes, purchases);
  return remaining[payAttribute] >= cost;
}
