/**
 * Constantes relacionadas às Habilidades (Perícias) do personagem
 *
 * São 33 habilidades no total, cada uma com:
 * - Atributo-chave padrão
 * - Propriedades especiais (Carga, Instrumento, Proficiência, Combate)
 * - Graus de proficiência (Leigo, Adepto, Versado, Mestre)
 */

import { SkillName, AttributeName, ProficiencyLevel } from '@/types';
import { SKILL_LIST } from '@/types';

/**
 * Graus de proficiência em habilidades
 * O multiplicador é aplicado ao atributo-chave para calcular o bônus
 */
export const SKILL_PROFICIENCY_LEVELS: Record<ProficiencyLevel, number> = {
  leigo: 0,
  adepto: 1,
  versado: 2,
  mestre: 3,
};

/**
 * Nomes amigáveis dos graus de proficiência
 */
export const SKILL_PROFICIENCY_LABELS: Record<ProficiencyLevel, string> = {
  leigo: 'Leigo',
  adepto: 'Adepto',
  versado: 'Versado',
  mestre: 'Mestre',
};

/**
 * Nomes amigáveis das habilidades (para exibição)
 */
export const SKILL_LABELS: Record<SkillName, string> = {
  acerto: 'Acerto',
  acrobacia: 'Acrobacia',
  adestramento: 'Adestramento',
  arcano: 'Arcano',
  arte: 'Arte',
  atletismo: 'Atletismo',
  conducao: 'Condução',
  destreza: 'Destreza',
  determinacao: 'Determinação',
  enganacao: 'Enganação',
  estrategia: 'Estratégia',
  furtividade: 'Furtividade',
  historia: 'História',
  iniciativa: 'Iniciativa',
  instrucao: 'Instrução',
  intimidacao: 'Intimidação',
  investigacao: 'Investigação',
  luta: 'Luta',
  medicina: 'Medicina',
  natureza: 'Natureza',
  oficio: 'Ofício',
  percepcao: 'Percepção',
  performance: 'Performance',
  perspicacia: 'Perspicácia',
  persuasao: 'Persuasão',
  rastreamento: 'Rastreamento',
  reflexo: 'Reflexo',
  religiao: 'Religião',
  sobrevivencia: 'Sobrevivência',
  sociedade: 'Sociedade',
  sorte: 'Sorte',
  tenacidade: 'Tenacidade',
  vigor: 'Vigor',
};

/**
 * Metadados completos de cada habilidade
 */
export interface SkillMetadata {
  name: SkillName;
  /** Nome amigável para exibição */
  label: string;
  /** Atributo-chave padrão usado para testes desta habilidade */
  keyAttribute: AttributeName | 'especial';
  /** Se sofre penalidade quando personagem está Sobrecarregado */
  hasCargaPenalty: boolean;
  /** Se requer instrumento específico para uso */
  requiresInstrument: boolean;
  /** Se requer proficiência para uso efetivo */
  requiresProficiency: boolean;
  /** Se é uma habilidade de combate */
  isCombatSkill: boolean;
}

/**
 * Mapa completo de metadados de todas as habilidades
 * Baseado na tabela oficial das Regras Básicas do Tabuleiro do Caos RPG
 */
export const SKILL_METADATA: Record<SkillName, SkillMetadata> = {
  acerto: {
    name: 'acerto',
    label: 'Acerto',
    keyAttribute: 'agilidade',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  acrobacia: {
    name: 'acrobacia',
    label: 'Acrobacia',
    keyAttribute: 'agilidade',
    hasCargaPenalty: true,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  adestramento: {
    name: 'adestramento',
    label: 'Adestramento',
    keyAttribute: 'influencia',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  arcano: {
    name: 'arcano',
    label: 'Arcano',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: true,
  },
  arte: {
    name: 'arte',
    label: 'Arte',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  atletismo: {
    name: 'atletismo',
    label: 'Atletismo',
    keyAttribute: 'constituicao',
    hasCargaPenalty: true,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  conducao: {
    name: 'conducao',
    label: 'Condução',
    keyAttribute: 'agilidade',
    hasCargaPenalty: true,
    requiresInstrument: true,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  destreza: {
    name: 'destreza',
    label: 'Destreza',
    keyAttribute: 'agilidade',
    hasCargaPenalty: true,
    requiresInstrument: true,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  determinacao: {
    name: 'determinacao',
    label: 'Determinação',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  enganacao: {
    name: 'enganacao',
    label: 'Enganação',
    keyAttribute: 'influencia',
    hasCargaPenalty: false,
    requiresInstrument: true,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  estrategia: {
    name: 'estrategia',
    label: 'Estratégia',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  furtividade: {
    name: 'furtividade',
    label: 'Furtividade',
    keyAttribute: 'agilidade',
    hasCargaPenalty: true,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  historia: {
    name: 'historia',
    label: 'História',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  iniciativa: {
    name: 'iniciativa',
    label: 'Iniciativa',
    keyAttribute: 'agilidade',
    hasCargaPenalty: true,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  instrucao: {
    name: 'instrucao',
    label: 'Instrução',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  intimidacao: {
    name: 'intimidacao',
    label: 'Intimidação',
    keyAttribute: 'influencia',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  investigacao: {
    name: 'investigacao',
    label: 'Investigação',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  luta: {
    name: 'luta',
    label: 'Luta',
    keyAttribute: 'forca',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  medicina: {
    name: 'medicina',
    label: 'Medicina',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: true,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  natureza: {
    name: 'natureza',
    label: 'Natureza',
    keyAttribute: 'presenca',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  oficio: {
    name: 'oficio',
    label: 'Ofício',
    keyAttribute: 'especial',
    hasCargaPenalty: false,
    requiresInstrument: true,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  percepcao: {
    name: 'percepcao',
    label: 'Percepção',
    keyAttribute: 'presenca',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  performance: {
    name: 'performance',
    label: 'Performance',
    keyAttribute: 'influencia',
    hasCargaPenalty: true,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  perspicacia: {
    name: 'perspicacia',
    label: 'Perspicácia',
    keyAttribute: 'presenca',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  persuasao: {
    name: 'persuasao',
    label: 'Persuasão',
    keyAttribute: 'influencia',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  rastreamento: {
    name: 'rastreamento',
    label: 'Rastreamento',
    keyAttribute: 'presenca',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: false,
  },
  reflexo: {
    name: 'reflexo',
    label: 'Reflexo',
    keyAttribute: 'agilidade',
    hasCargaPenalty: true,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  religiao: {
    name: 'religiao',
    label: 'Religião',
    keyAttribute: 'presenca',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: true,
    isCombatSkill: true,
  },
  sobrevivencia: {
    name: 'sobrevivencia',
    label: 'Sobrevivência',
    keyAttribute: 'mente',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  sociedade: {
    name: 'sociedade',
    label: 'Sociedade',
    keyAttribute: 'influencia',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  sorte: {
    name: 'sorte',
    label: 'Sorte',
    keyAttribute: 'especial',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: false,
  },
  tenacidade: {
    name: 'tenacidade',
    label: 'Tenacidade',
    keyAttribute: 'forca',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
  vigor: {
    name: 'vigor',
    label: 'Vigor',
    keyAttribute: 'constituicao',
    hasCargaPenalty: false,
    requiresInstrument: false,
    requiresProficiency: false,
    isCombatSkill: true,
  },
};

/**
 * Habilidades de combate (usadas em combate)
 */
export const COMBAT_SKILLS: SkillName[] = SKILL_LIST.filter(
  (skill) => SKILL_METADATA[skill].isCombatSkill
);

/**
 * Habilidades que sofrem penalidade de carga
 * Sofrem -5 quando o personagem está Sobrecarregado
 */
export const SKILLS_WITH_CARGA_PENALTY: SkillName[] = SKILL_LIST.filter(
  (skill) => SKILL_METADATA[skill].hasCargaPenalty
);

/**
 * Penalidade aplicada a habilidades com propriedade "Carga"
 * quando o personagem está Sobrecarregado
 */
export const CARGA_PENALTY_VALUE = -5;

/**
 * Número inicial de proficiências com habilidades no nível 1
 * Fórmula: 3 + Mente (retroativo)
 */
export const BASE_SKILL_PROFICIENCIES = 3;

/**
 * Re-exporta SKILL_LIST para conveniência
 */
export { SKILL_LIST };
