/**
 * Usos padrões de habilidades do Tabuleiro do Caos RPG
 *
 * Define os usos oficiais de cada habilidade, organizados por
 * nível de proficiência requerido (nenhum, adepto, versado, mestre).
 */

import type { SkillName, ProficiencyLevel } from '@/types';

/**
 * Uso padrão de uma habilidade
 */
export interface DefaultSkillUse {
  /** Nome do uso */
  name: string;
  /** Proficiência mínima requerida (undefined = sem requisito) */
  requiredProficiency?: ProficiencyLevel;
  /** Descrição breve do uso (opcional) */
  description?: string;
}

/**
 * Mapa de usos padrões por habilidade
 */
export const DEFAULT_SKILL_USES: Record<SkillName, DefaultSkillUse[]> = {
  acerto: [
    { name: 'Atacar' },
    { name: 'Mirar', requiredProficiency: 'adepto' },
  ],

  acrobacia: [
    { name: 'Equilibrar' },
    { name: 'Atravessar Inimigo' },
    { name: 'Saltar de Pé', requiredProficiency: 'adepto' },
    { name: 'Esgueirar por Aperto', requiredProficiency: 'adepto' },
    { name: 'Amortecer Queda', requiredProficiency: 'versado' },
  ],

  adestramento: [
    { name: 'Comando Animal', requiredProficiency: 'adepto' },
    { name: 'Pacificar Animal', requiredProficiency: 'adepto' },
  ],

  arcano: [
    { name: 'Aprender Feitiço', requiredProficiency: 'adepto' },
    { name: 'Conhecimento Arcano', requiredProficiency: 'adepto' },
    { name: 'Conjurar Feitiço', requiredProficiency: 'adepto' },
    { name: 'Detectar Magia', requiredProficiency: 'adepto' },
    { name: 'Identificar Feitiço', requiredProficiency: 'adepto' },
    { name: 'Identificar Monstro', requiredProficiency: 'adepto' },
  ],

  arte: [
    { name: 'Belas Artes', requiredProficiency: 'adepto' },
    { name: 'Criar Arte', requiredProficiency: 'adepto' },
  ],

  atletismo: [
    { name: 'Correr' },
    { name: 'Derrubar Porta' },
    { name: 'Escalar' },
    { name: 'Levantar Peso' },
    { name: 'Nadar' },
    { name: 'Saltar' },
  ],

  conducao: [
    { name: 'Cavalgar', requiredProficiency: 'adepto' },
    { name: 'Conduzir Veículo', requiredProficiency: 'adepto' },
    { name: 'Montar Depressa', requiredProficiency: 'adepto' },
  ],

  destreza: [
    { name: 'Abrir Fechaduras', requiredProficiency: 'adepto' },
    { name: 'Escapar', requiredProficiency: 'adepto' },
    { name: 'Prestidigitar', requiredProficiency: 'adepto' },
    { name: 'Sabotar', requiredProficiency: 'versado' },
  ],

  determinacao: [{ name: 'Concentrar' }, { name: 'Resistir Mentalmente' }],

  enganacao: [
    { name: 'Insinuar' },
    { name: 'Intrigar' },
    { name: 'Mentir' },
    { name: 'Disfarçar', requiredProficiency: 'adepto' },
    { name: 'Falsificar', requiredProficiency: 'versado' },
  ],

  estrategia: [
    { name: 'Conhecimento Estratégico', requiredProficiency: 'adepto' },
    { name: 'Analisar Vantagens', requiredProficiency: 'adepto' },
    { name: 'Planejar Ação', requiredProficiency: 'versado' },
  ],

  furtividade: [{ name: 'Esconder-se' }, { name: 'Seguir' }],

  historia: [{ name: 'Conhecimento Histórico' }],

  iniciativa: [{ name: 'Acordar Cedo' }, { name: 'Iniciativa de Combate' }],

  instrucao: [
    { name: 'Conhecimento Acadêmico', requiredProficiency: 'adepto' },
    { name: 'Ciências', requiredProficiency: 'adepto' },
    { name: 'Idiomas', requiredProficiency: 'adepto' },
  ],

  intimidacao: [
    { name: 'Ameaçar' },
    { name: 'Coagir' },
    { name: 'Assustar', requiredProficiency: 'adepto' },
  ],

  investigacao: [
    { name: 'Interrogar' },
    { name: 'Procurar' },
    { name: 'Achar Documento', requiredProficiency: 'adepto' },
    { name: 'Analisar Objeto', requiredProficiency: 'adepto' },
  ],

  luta: [
    { name: 'Atacar' },
    { name: 'Contra-Atacar', requiredProficiency: 'adepto' },
  ],

  medicina: [
    { name: 'Administrar Tratamento', requiredProficiency: 'adepto' },
    { name: 'Conhecimento Médico', requiredProficiency: 'adepto' },
    { name: 'Administrar Primeiros Socorros', requiredProficiency: 'adepto' },
    { name: 'Necropsia', requiredProficiency: 'adepto' },
    { name: 'Tratar Prolongadamente', requiredProficiency: 'versado' },
  ],

  natureza: [
    { name: 'Aprender Feitiço' },
    { name: 'Conhecimento Natural' },
    { name: 'Conjurar Feitiço' },
    { name: 'Identificar Animal' },
    { name: 'Identificar Planta' },
  ],

  oficio: [],

  percepcao: [
    { name: 'Farejar' },
    { name: 'Observar' },
    { name: 'Ouvir' },
    { name: 'Ler Lábios', requiredProficiency: 'adepto' },
  ],

  performance: [{ name: 'Apresentar' }, { name: 'Impressionar' }],

  perspicacia: [
    { name: 'Perceber Inverdades' },
    { name: 'Julgar Comportamento', requiredProficiency: 'adepto' },
  ],

  persuasao: [
    { name: 'Mudar Atitude' },
    { name: 'Pechinchar' },
    { name: 'Persuadir' },
    { name: 'Motivar', requiredProficiency: 'adepto' },
  ],

  rastreamento: [
    { name: 'Encontrar Rastro', requiredProficiency: 'adepto' },
    { name: 'Estudar Rastro', requiredProficiency: 'adepto' },
    { name: 'Seguir Rastro', requiredProficiency: 'adepto' },
    { name: 'Cobrir Rastros', requiredProficiency: 'versado' },
  ],

  reflexo: [
    { name: 'Agarrar-se à Beirada' },
    { name: 'Evitar Finta' },
    { name: 'Resistir' },
    { name: 'Esquivar', requiredProficiency: 'adepto' },
    { name: 'Esquivar Superiormente', requiredProficiency: 'versado' },
  ],

  religiao: [
    { name: 'Acalmar', requiredProficiency: 'adepto' },
    { name: 'Aprender Feitiço', requiredProficiency: 'adepto' },
    { name: 'Conhecimento Religioso', requiredProficiency: 'adepto' },
    { name: 'Conjurar Feitiço', requiredProficiency: 'adepto' },
    { name: 'Identificar Monstro', requiredProficiency: 'adepto' },
    { name: 'Realizar Ritual Religioso', requiredProficiency: 'versado' },
  ],

  sobrevivencia: [
    { name: 'Encontrar Suprimentos' },
    { name: 'Orientar-se' },
    { name: 'Acampar', requiredProficiency: 'adepto' },
  ],

  sociedade: [
    { name: 'Conhecimento Geral' },
    { name: 'Enturmar' },
    { name: 'Arrancar Informações', requiredProficiency: 'adepto' },
    { name: 'Espalhar Boato', requiredProficiency: 'adepto' },
  ],

  sorte: [{ name: 'Apostar' }],

  sintonia: [
    { name: 'Resistir' },
    { name: 'Dissipar Efeito Mágico', requiredProficiency: 'adepto' },
  ],

  tenacidade: [
    { name: 'Resistir' },
    { name: 'Resilir Condições', requiredProficiency: 'adepto' },
    { name: 'Suportar Resistências', requiredProficiency: 'adepto' },
  ],

  vigor: [
    { name: 'Resistir' },
    { name: 'Manter Fôlego' },
    { name: 'Bloquear', requiredProficiency: 'adepto' },
    { name: 'Bloquear Superiormente', requiredProficiency: 'versado' },
  ],
};

/**
 * Obtém os usos padrões de uma habilidade
 *
 * @param skillName - Nome da habilidade
 * @returns Array de usos padrões
 */
export function getDefaultSkillUses(skillName: SkillName): DefaultSkillUse[] {
  return DEFAULT_SKILL_USES[skillName] || [];
}

/**
 * Verifica se um uso padrão está disponível com base na proficiência atual
 *
 * @param use - Uso padrão a verificar
 * @param currentProficiency - Proficiência atual do personagem na habilidade
 * @returns true se o uso está disponível
 */
export function isDefaultUseAvailable(
  use: DefaultSkillUse,
  currentProficiency: ProficiencyLevel
): boolean {
  // Se não tem requisito, está sempre disponível
  if (!use.requiredProficiency) {
    return true;
  }

  const proficiencyOrder: ProficiencyLevel[] = [
    'leigo',
    'adepto',
    'versado',
    'mestre',
  ];

  const currentLevel = proficiencyOrder.indexOf(currentProficiency);
  const requiredLevel = proficiencyOrder.indexOf(use.requiredProficiency);

  return currentLevel >= requiredLevel;
}

/**
 * Filtra usos padrões disponíveis com base na proficiência
 *
 * @param skillName - Nome da habilidade
 * @param currentProficiency - Proficiência atual do personagem
 * @returns Array de usos disponíveis
 */
export function getAvailableDefaultUses(
  skillName: SkillName,
  currentProficiency: ProficiencyLevel
): DefaultSkillUse[] {
  const allUses = getDefaultSkillUses(skillName);
  return allUses.filter((use) =>
    isDefaultUseAvailable(use, currentProficiency)
  );
}
