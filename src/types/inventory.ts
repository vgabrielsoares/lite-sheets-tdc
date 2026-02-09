/**
 * Inventory - Tipos relacionados a inventário e equipamentos
 *
 * Este arquivo contém os tipos e interfaces relacionados ao sistema de inventário,
 * incluindo itens, equipamentos, armas, armaduras e moedas.
 */

import type { UUID, DiceRoll, DamageType, CurrencyType } from './common';
import type { AttributeName } from './attributes';

/**
 * Categoria de item
 */
export type ItemCategory =
  | 'arma'
  | 'armadura'
  | 'escudo'
  | 'ferramenta'
  | 'consumivel'
  | 'material'
  | 'magico'
  | 'diversos';

/**
 * Item base do inventário
 */
export interface InventoryItem {
  /** ID único do item */
  id: UUID;
  /** Nome do item */
  name: string;
  /** Descrição do item */
  description?: string;
  /** Categoria do item */
  category: ItemCategory;
  /** Quantidade no inventário */
  quantity: number;
  /**
   * Peso unitário (na medida "Peso" do RPG).
   * - null/undefined: Item sem peso (não conta para nenhum cálculo)
   * - 0: Item de peso zero (5 itens de peso 0 = 1 de peso)
   * - negativo: Item que aumenta capacidade de carga
   * - positivo: Peso normal
   */
  weight: number | null;
  /** Valor em moedas de ouro */
  value: number;
  /** Se o item está equipado */
  equipped: boolean;
  /** Propriedades customizadas do item */
  customProperties?: Record<string, any>;
}

/**
 * Tipos de arma por categoria de proficiência
 */
export type WeaponProficiencyCategory = 'simples' | 'marcial' | 'complexa';

/**
 * Propriedades especiais de armas
 */
export type WeaponProperty =
  | 'acuidade' // Pode usar Agilidade ou Corpo
  | 'alcance' // Alcance estendido
  | 'arremesso' // Pode ser arremessada
  | 'carregamento' // Requer ação para recarregar
  | 'dupla' // Duas pontas de ataque
  | 'duas-maos' // Requer duas mãos
  | 'leve' // Arma leve para duas armas
  | 'municao' // Requer munição
  | 'pesada' // Penalidade para criaturas pequenas
  | 'versatil'; // Pode usar uma ou duas mãos

/**
 * Arma
 */
export interface Weapon extends InventoryItem {
  category: 'arma';
  /** Categoria de proficiência */
  proficiencyCategory: WeaponProficiencyCategory;
  /** Tipo de ataque (corpo-a-corpo ou distância) */
  attackType: 'corpo-a-corpo' | 'distancia';
  /** Rolagem de dano */
  damage: DiceRoll;
  /** Tipo de dano */
  damageType: DamageType;
  /** Alcance (para armas de distância) */
  range?: {
    normal: number;
    longo: number;
  };
  /** Propriedades especiais */
  properties: WeaponProperty[];
  /** Bônus mágico (se aplicável) */
  magicBonus?: number;
}

/**
 * Tipo de armadura
 */
export type ArmorType = 'leve' | 'media' | 'pesada';

/**
 * Armadura
 */
export interface Armor extends InventoryItem {
  category: 'armadura';
  /** Tipo de armadura */
  armorType: ArmorType;
  /** Bônus de defesa fornecido */
  defenseBonus: number;
  /** Penalidade de agilidade (se aplicável) */
  agilityPenalty?: number;
  /** Requisito de atributo (Corpo para armaduras pesadas) */
  attributeRequirement?: {
    attribute: AttributeName;
    value: number;
  };
  /** Bônus mágico (se aplicável) */
  magicBonus?: number;
}

/**
 * Escudo
 */
export interface Shield extends InventoryItem {
  category: 'escudo';
  /** Bônus de defesa fornecido */
  defenseBonus: number;
  /** Bônus mágico (se aplicável) */
  magicBonus?: number;
}

/**
 * Tipo de ferramenta
 */
export type ToolType =
  | 'artesao'
  | 'musical'
  | 'jogo'
  | 'kit'
  | 'veiculo'
  | 'outros';

/**
 * Ferramenta
 */
export interface Tool extends InventoryItem {
  category: 'ferramenta';
  /** Tipo de ferramenta */
  toolType: ToolType;
  /** Se requer proficiência para uso */
  requiresProficiency: boolean;
}

/**
 * Capacidade de carga do personagem
 */
export interface CarryingCapacity {
  /** Capacidade base (5 + Corpo × 5) */
  base: number;
  /** Modificadores de tamanho (da linhagem) */
  sizeModifier: number;
  /** Modificadores adicionais (habilidades, poderes, condições, etc.) */
  otherModifiers: number;
  /** Total de todos os modificadores (sizeModifier + otherModifiers) */
  modifiers: number;
  /** Capacidade total */
  total: number;
  /** Peso atualmente carregado */
  currentWeight: number;
  /** Estado de carga */
  encumbranceState: 'normal' | 'sobrecarregado' | 'imobilizado';
  /** Peso máximo que pode empurrar (dobro da capacidade) */
  pushLimit: number;
  /** Peso máximo que pode levantar (metade da capacidade) */
  liftLimit: number;
}

/**
 * Moedas do personagem
 */
export interface Currency {
  /** Moedas físicas (contam para peso) */
  physical: {
    /** Chamas de Cobre (C$) */
    cobre: number;
    /** Pepitas de Ouro (PO$) */
    ouro: number;
    /** Estrelas de Platina (PP$) */
    platina: number;
  };
  /** Moedas no banco (não contam para peso) */
  bank: {
    /** Chamas de Cobre (C$) */
    cobre: number;
    /** Pepitas de Ouro (PO$) */
    ouro: number;
    /** Estrelas de Platina (PP$) */
    platina: number;
  };
}

/**
 * Riqueza total em cada tipo de moeda
 */
export interface TotalWealth {
  /** Total em Chamas de Cobre (C$) */
  totalCobre: number;
  /** Total em Pepitas de Ouro (PO$) */
  totalOuro: number;
  /** Total em Estrelas de Platina (PP$) */
  totalPlatina: number;
}

/**
 * Conversão de moedas
 */
export interface CurrencyConversion {
  /** Tipo de moeda de origem */
  from: CurrencyType;
  /** Tipo de moeda de destino */
  to: CurrencyType;
  /** Quantidade a converter */
  amount: number;
  /** Resultado da conversão */
  result: number;
}

/**
 * Inventário completo do personagem
 */
export interface Inventory {
  /** Lista de itens */
  items: InventoryItem[];
  /** Capacidade de carga */
  carryingCapacity: CarryingCapacity;
  /** Moedas */
  currency: Currency;
}

/**
 * Capacidade de carga base
 */
export const BASE_CARRYING_CAPACITY = 5;

/**
 * Multiplicador de Corpo para capacidade de carga
 */
export const STRENGTH_CARRY_MULTIPLIER = 5;

/**
 * Peso de 100 moedas físicas
 */
export const COINS_WEIGHT_RATIO = 100; // 100 moedas = 1 peso

/**
 * Itens padrão do inventário inicial
 */
export const DEFAULT_STARTING_ITEMS = {
  mochila: {
    name: 'Mochila',
    weight: 0,
    value: 0,
  },
  cartaoBanco: {
    name: 'Cartão do Banco',
    weight: 0,
    value: 0,
  },
} as const;

/**
 * Dinheiro inicial (em PO$)
 */
export const STARTING_GOLD = 10;
