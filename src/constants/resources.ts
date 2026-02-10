/**
 * Resources Constants - Constantes para o sistema de dados de recurso
 *
 * Define os recursos padrão, pré-definidos e configurações do sistema
 * de dados de recurso do Tabuleiro do Caos RPG v0.1.7.
 */

import type { DiceType } from '@/types/common';
import type { ResourceDie } from '@/types/resources';

/**
 * Informações de um recurso pré-definido (template para adição)
 */
export interface PresetResourceInfo {
  /** Nome do recurso */
  name: string;
  /** Dado mínimo padrão */
  defaultMinDie: DiceType;
  /** Dado máximo padrão */
  defaultMaxDie: DiceType;
  /** Dado inicial padrão (ao adicionar) */
  defaultCurrentDie: DiceType;
  /** Descrição breve */
  description: string;
}

/**
 * Recursos pré-definidos disponíveis para adição rápida.
 * Inclui os padrões (Água, Comida) e outros comuns do sistema.
 */
export const PRESET_RESOURCES: readonly PresetResourceInfo[] = [
  {
    name: 'Água',
    defaultMinDie: 'd2',
    defaultMaxDie: 'd12',
    defaultCurrentDie: 'd12',
    description: 'Suprimento de água do personagem',
  },
  {
    name: 'Comida',
    defaultMinDie: 'd2',
    defaultMaxDie: 'd12',
    defaultCurrentDie: 'd12',
    description: 'Suprimento de comida do personagem',
  },
  {
    name: 'Tocha',
    defaultMinDie: 'd2',
    defaultMaxDie: 'd8',
    defaultCurrentDie: 'd8',
    description: 'Tochas para iluminação',
  },
  {
    name: 'Flechas',
    defaultMinDie: 'd2',
    defaultMaxDie: 'd12',
    defaultCurrentDie: 'd12',
    description: 'Munição de flechas para arcos',
  },
  {
    name: 'Arma',
    defaultMinDie: 'd2',
    defaultMaxDie: 'd20',
    defaultCurrentDie: 'd20',
    description: 'Durabilidade de arma principal',
  },
  {
    name: 'Armadura',
    defaultMinDie: 'd2',
    defaultMaxDie: 'd20',
    defaultCurrentDie: 'd20',
    description: 'Durabilidade de armadura',
  },
  {
    name: 'Pólvora',
    defaultMinDie: 'd2',
    defaultMaxDie: 'd10',
    defaultCurrentDie: 'd10',
    description: 'Suprimento de pólvora para armas de fogo',
  },
  {
    name: 'Balas de Chumbo',
    defaultMinDie: 'd2',
    defaultMaxDie: 'd12',
    defaultCurrentDie: 'd12',
    description: 'Munição de balas de chumbo',
  },
  {
    name: 'Virotes',
    defaultMinDie: 'd2',
    defaultMaxDie: 'd12',
    defaultCurrentDie: 'd12',
    description: 'Munição de virotes para bestas',
  },
  {
    name: 'Agulhas',
    defaultMinDie: 'd2',
    defaultMaxDie: 'd8',
    defaultCurrentDie: 'd8',
    description: 'Agulhas para uso diverso',
  },
] as const;

/**
 * Nomes dos recursos padrão que todo personagem começa (aparecem automaticamente)
 */
export const DEFAULT_RESOURCE_NAMES = ['Água', 'Comida'] as const;

/**
 * Cria um recurso a partir de um preset
 */
export function createResourceFromPreset(
  preset: PresetResourceInfo,
  id: string
): ResourceDie {
  return {
    id,
    name: preset.name,
    currentDie: preset.defaultCurrentDie,
    minDie: preset.defaultMinDie,
    maxDie: preset.defaultMaxDie,
    state: 'active',
    isCustom: false,
  };
}

/**
 * Cria um recurso customizado com valores padrão
 */
export function createCustomResource(
  name: string,
  id: string,
  maxDie: DiceType = 'd12',
  minDie: DiceType = 'd2'
): ResourceDie {
  return {
    id,
    name,
    currentDie: maxDie,
    minDie,
    maxDie,
    state: 'active',
    isCustom: true,
  };
}

/**
 * Cria os recursos padrão do personagem (Água e Comida)
 */
export function createDefaultResources(
  generateId: () => string
): ResourceDie[] {
  return DEFAULT_RESOURCE_NAMES.map((name) => {
    const preset = PRESET_RESOURCES.find((p) => p.name === name);
    if (!preset) {
      throw new Error(`Preset de recurso "${name}" não encontrado`);
    }
    return createResourceFromPreset(preset, generateId());
  });
}
