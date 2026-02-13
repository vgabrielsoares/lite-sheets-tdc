/**
 * Damage Types - Tipos de Dano do Sistema
 *
 * Este arquivo contém as constantes relacionadas aos tipos de dano
 * disponíveis no sistema Tabuleiro do Caos RPG.
 *
 * Os tipos de dano são usados em:
 * - Resistências (RD e Resistência Aprimorada)
 * - Imunidades
 * - Vulnerabilidades
 * - Ataques e Feitiços
 */

import type { DamageType } from '@/types/common';

/**
 * Informações de um tipo de dano
 */
export interface DamageTypeInfo {
  /** Identificador do tipo (em inglês/código) */
  id: DamageType;
  /** Nome em português para exibição */
  label: string;
  /** Descrição do tipo de dano */
  description: string;
  /** Ícone MUI associado (nome do ícone) */
  icon: string;
  /** Cor temática para o tipo de dano */
  color: string;
}

/**
 * Lista ordenada de tipos de dano com suas informações
 * Baseado no sistema Tabuleiro do Caos RPG
 */
export const DAMAGE_TYPES: readonly DamageTypeInfo[] = [
  {
    id: 'acido',
    label: 'Ácido',
    description: 'Dano causado por substâncias corrosivas e ácidas.',
    icon: 'Science',
    color: '#7CB342', // Verde ácido
  },
  {
    id: 'eletrico',
    label: 'Elétrico',
    description: 'Dano causado por eletricidade e raios.',
    icon: 'ElectricBolt',
    color: '#FDD835', // Amarelo elétrico
  },
  {
    id: 'fisico',
    label: 'Físico',
    description:
      'Dano físico geral, categoria que engloba corte, perfuração e impacto.',
    icon: 'FitnessCenterOutlined',
    color: '#78909C', // Cinza azulado
  },
  {
    id: 'corte',
    label: 'Corte',
    description:
      'Dano físico causado por lâminas afiadas, como espadas e machados.',
    icon: 'ContentCut',
    color: '#B0BEC5', // Cinza prateado
  },
  {
    id: 'perfuracao',
    label: 'Perfuração',
    description:
      'Dano físico causado por objetos pontiagudos, como lanças e flechas.',
    icon: 'ArrowUpward',
    color: '#8D6E63', // Marrom
  },
  {
    id: 'impacto',
    label: 'Impacto',
    description:
      'Dano físico causado por pancadas, como maças, martelos ou quedas.',
    icon: 'Gavel',
    color: '#5D4037', // Marrom escuro
  },
  {
    id: 'fogo',
    label: 'Fogo',
    description: 'Dano causado por chamas e calor intenso.',
    icon: 'LocalFireDepartment',
    color: '#FF5722', // Laranja fogo
  },
  {
    id: 'frio',
    label: 'Frio',
    description: 'Dano causado por temperaturas extremamente baixas e gelo.',
    icon: 'AcUnit',
    color: '#4FC3F7', // Azul gelo
  },
  {
    id: 'interno',
    label: 'Interno',
    description: 'Dano que afeta órgãos internos, hemorragias ou doenças.',
    icon: 'Bloodtype',
    color: '#C62828', // Vermelho escuro
  },
  {
    id: 'mental',
    label: 'Mental',
    description: 'Dano causado diretamente à mente e consciência.',
    icon: 'Psychology',
    color: '#E040FB', // Rosa/magenta
  },
  {
    id: 'mistico',
    label: 'Místico',
    description: 'Dano causado por energia mágica pura e arcana.',
    icon: 'AutoAwesome',
    color: '#9C27B0', // Roxo
  },
  {
    id: 'profano',
    label: 'Profano',
    description: 'Dano causado por energia profana, morte e corrupção.',
    icon: 'Skull',
    color: '#4A148C', // Roxo escuro
  },
  {
    id: 'sagrado',
    label: 'Sagrado',
    description: 'Dano causado por energia divina ou luz purificadora.',
    icon: 'WbSunny',
    color: '#FFD54F', // Dourado/amarelo
  },
  {
    id: 'sonoro',
    label: 'Sonoro',
    description: 'Dano causado por ondas sonoras intensas e explosões.',
    icon: 'VolumeUp',
    color: '#9575CD', // Lilás
  },
  {
    id: 'veneno',
    label: 'Veneno',
    description: 'Dano causado por substâncias tóxicas e venenos.',
    icon: 'Coronavirus',
    color: '#8BC34A', // Verde veneno
  },
  {
    id: 'qualquer',
    label: 'Qualquer',
    description: 'RD aplicada a qualquer tipo de dano recebido.',
    icon: 'AllInclusive',
    color: '#9E9E9E', // Cinza neutro
  },
] as const;

/**
 * Mapa de tipos de dano por ID para acesso rápido
 */
export const DAMAGE_TYPE_MAP: Record<DamageType, DamageTypeInfo> =
  DAMAGE_TYPES.reduce(
    (acc, type) => {
      acc[type.id] = type;
      return acc;
    },
    {} as Record<DamageType, DamageTypeInfo>
  );

/**
 * Lista de IDs de tipos de dano para uso em selects
 */
export const DAMAGE_TYPE_IDS: readonly DamageType[] = DAMAGE_TYPES.map(
  (t) => t.id
);

/**
 * Obtém informações de um tipo de dano pelo ID
 */
export function getDamageTypeInfo(id: DamageType): DamageTypeInfo | undefined {
  return DAMAGE_TYPE_MAP[id];
}

/**
 * Obtém o label de um tipo de dano pelo ID
 */
export function getDamageTypeLabel(id: DamageType): string {
  // Retorna o label do mapa, ou capitaliza o ID se não encontrado
  const info = DAMAGE_TYPE_MAP[id];
  if (info) return info.label;
  // Fallback: capitaliza a primeira letra
  return id.charAt(0).toUpperCase() + id.slice(1);
}
