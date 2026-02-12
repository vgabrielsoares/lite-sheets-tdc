/**
 * Usos padrões de habilidades do Tabuleiro do Caos RPG
 *
 * Define os usos oficiais de cada habilidade conforme livro v0.1.7,
 * organizados por nível de proficiência requerido.
 *
 * Cada uso inclui:
 * - Nome e descrição
 * - Proficiência mínima requerida
 * - Custo de ação em combate (▶/↩/∆)
 * - Atributo alternativo (quando aplicável)
 *
 * @see base-files/v0.2.md — Seção de Habilidades
 */

import type { SkillName, ProficiencyLevel, AttributeName } from '@/types';

/**
 * Custo de ação para usos de habilidade em combate
 *
 * ▶ = ação rápida (1 ação)
 * ▶▶ = ação padrão (2 ações, turno rápido)
 * ▶▶▶ = ação completa (3 ações, turno lento)
 * ↩ = reação
 * ∆ = ação livre
 */
export type ActionCost = '▶' | '▶▶' | '▶▶▶' | '↩' | '∆';

/**
 * Uso padrão de uma habilidade
 */
export interface DefaultSkillUse {
  /** Nome do uso */
  name: string;
  /** Proficiência mínima requerida (undefined = sem requisito / Leigo) */
  requiredProficiency?: ProficiencyLevel;
  /** Descrição breve do uso */
  description?: string;
  /** Custo de ação em combate (undefined = variável ou fora de combate) */
  actionCost?: ActionCost;
  /** Informação adicional sobre o teste (requisitos especiais, notas) */
  testInfo?: string;
  /** Atributo alternativo que pode ser usado no teste */
  alternateAttribute?: AttributeName;
  /** Nota sobre quando usar o atributo alternativo */
  alternateAttributeNote?: string;
}

/**
 * Mapa de usos padrões por habilidade
 *
 * Fonte autoritativa: base-files/v0.2.md
 */
export const DEFAULT_SKILL_USES: Record<SkillName, DefaultSkillUse[]> = {
  // ─────────────────────────────────────────
  // Acerto (Agilidade - Combate)
  // ─────────────────────────────────────────
  acerto: [
    {
      name: 'Atacar',
      description: 'Teste de ataque à distância ou com armas de arremesso.',
      alternateAttribute: 'corpo',
      alternateAttributeNote: 'Para objetos pesados (arremesso de força)',
    },
    {
      name: 'Mirar',
      requiredProficiency: 'adepto',
      actionCost: '▶',
      description:
        'Concentrar-se para evitar penalidade ao atacar alvos engajados com aliados.',
    },
  ],

  // ─────────────────────────────────────────
  // Acrobacia (Agilidade - Carga)
  // ─────────────────────────────────────────
  acrobacia: [
    {
      name: 'Equilibrar',
      actionCost: '∆',
      description: 'Manter equilíbrio em superfícies precárias.',
    },
    {
      name: 'Atravessar Inimigo',
      description:
        'Passar pelo espaço ocupado por um inimigo sem provocar ataque de oportunidade.',
    },
    {
      name: 'Saltar de Pé',
      requiredProficiency: 'adepto',
      actionCost: '∆',
      description: 'Levantar-se de caído rapidamente.',
      testInfo: 'Requer ter ▶ disponível no turno',
    },
    {
      name: 'Esgueirar por Aperto',
      requiredProficiency: 'adepto',
      actionCost: '▶▶▶',
      description: 'Passar por espaços apertados usando metade do movimento.',
    },
    {
      name: 'Amortecer Queda',
      requiredProficiency: 'versado',
      actionCost: '↩',
      description: 'Reduzir dano de queda.',
    },
  ],

  // ─────────────────────────────────────────
  // Adestramento (Influência - Proficiente)
  // ─────────────────────────────────────────
  adestramento: [
    {
      name: 'Comando Animal',
      requiredProficiency: 'adepto',
      description: 'Dar comandos a um animal treinado ou doméstico.',
    },
    {
      name: 'Pacificar Animal',
      requiredProficiency: 'adepto',
      actionCost: '▶▶▶',
      description: 'Acalmar um animal agressivo ou nervoso.',
    },
  ],

  // ─────────────────────────────────────────
  // Arcano (Essência - Proficiente - Combate)
  // ─────────────────────────────────────────
  arcano: [
    {
      name: 'Aprender Feitiço',
      requiredProficiency: 'adepto',
      description: 'Aprender feitiços de determinadas matrizes arcanas.',
      alternateAttribute: 'mente',
      alternateAttributeNote: 'Para estudos teóricos e pesquisa arcana',
    },
    {
      name: 'Conhecimento Arcano',
      requiredProficiency: 'adepto',
      description: 'Conhecimento sobre magia, artefatos e fenômenos arcanos.',
      alternateAttribute: 'mente',
      alternateAttributeNote: 'Para conhecimento baseado em estudo',
    },
    {
      name: 'Conjurar Feitiço',
      requiredProficiency: 'adepto',
      description: 'Lançar feitiços arcanos.',
    },
    {
      name: 'Detectar Magia',
      requiredProficiency: 'adepto',
      actionCost: '▶▶▶',
      description: 'Detectar a presença de magia na área.',
    },
    {
      name: 'Identificar Feitiço',
      requiredProficiency: 'adepto',
      actionCost: '↩',
      description: 'Identificar um feitiço sendo conjurado.',
    },
    {
      name: 'Identificar Monstro',
      requiredProficiency: 'adepto',
      description: 'Identificar monstros mágicos previamente estudados.',
    },
  ],

  // ─────────────────────────────────────────
  // Arte (Mente - Proficiente)
  // ─────────────────────────────────────────
  arte: [
    {
      name: 'Belas Artes',
      requiredProficiency: 'adepto',
      description: 'Conhecimento artístico e apreciação estética.',
    },
    {
      name: 'Criar Arte',
      requiredProficiency: 'adepto',
      description:
        'Criar obras de arte (texto, pintura, música, escultura, etc.).',
    },
  ],

  // ─────────────────────────────────────────
  // Atletismo (Corpo - Carga)
  // ─────────────────────────────────────────
  atletismo: [
    {
      name: 'Correr',
      actionCost: '▶▶',
      description: 'Correr em linha reta usando velocidade extra.',
    },
    {
      name: 'Derrubar Porta',
      actionCost: '▶',
      description: 'Arrombar uma porta trancada ou emperrada.',
    },
    {
      name: 'Escalar',
      description: 'Subir superfícies íngremes ou verticais.',
    },
    {
      name: 'Levantar Peso',
      description:
        'Teste de capacidade de carga; ✶ obtidos somam a Corpo para cálculos.',
    },
    {
      name: 'Nadar',
      actionCost: '▶',
      description: 'Nadar; teste a cada rodada para não afundar.',
    },
    {
      name: 'Saltar',
      actionCost: '▶',
      description: 'Pular ou saltar distâncias.',
    },
  ],

  // ─────────────────────────────────────────
  // Condução (Agilidade - Carga - Instrumento - Proficiente)
  // ─────────────────────────────────────────
  conducao: [
    {
      name: 'Cavalgar',
      requiredProficiency: 'adepto',
      actionCost: '▶',
      description: 'Mover-se com montaria usando velocidade dela.',
    },
    {
      name: 'Conduzir Veículo',
      requiredProficiency: 'adepto',
      description: 'Conduzir carruagens, barcos, automóveis, etc.',
    },
    {
      name: 'Montar Depressa',
      requiredProficiency: 'adepto',
      description: 'Montar ou desmontar de uma montaria rapidamente.',
    },
  ],

  // ─────────────────────────────────────────
  // Destreza (Agilidade - Carga - Instrumento - Proficiente)
  // ─────────────────────────────────────────
  destreza: [
    {
      name: 'Abrir Fechaduras',
      requiredProficiency: 'adepto',
      actionCost: '▶▶▶',
      description: 'Abrir uma fechadura trancada.',
    },
    {
      name: 'Escapar',
      requiredProficiency: 'adepto',
      description: 'Escapar de amarras, algemas ou contenções.',
    },
    {
      name: 'Prestidigitar',
      requiredProficiency: 'adepto',
      description: 'Truques de mão, furtar objetos pequenos.',
    },
    {
      name: 'Sabotar',
      requiredProficiency: 'versado',
      description:
        'Sabotar equipamentos (de travas simples a mecanismos complexos).',
    },
  ],

  // ─────────────────────────────────────────
  // Determinação (Mente - Combate)
  // ─────────────────────────────────────────
  determinacao: [
    {
      name: 'Concentrar',
      description:
        'Teste de concentração (principalmente para manter feitiços).',
    },
    {
      name: 'Resistir',
      description: 'Resistir a efeitos que afetam a mente.',
    },
  ],

  // ─────────────────────────────────────────
  // Enganação (Influência - Instrumento)
  // ─────────────────────────────────────────
  enganacao: [
    {
      name: 'Insinuar',
      description: 'Passar mensagem oculta em meio a um discurso.',
    },
    {
      name: 'Intrigar',
      description: 'Espalhar informações falsas de forma convincente.',
    },
    {
      name: 'Mentir',
      description: 'Mentir de forma convincente.',
    },
    {
      name: 'Disfarçar',
      requiredProficiency: 'adepto',
      description: 'Disfarçar a si mesmo ou outros.',
    },
    {
      name: 'Falsificar',
      requiredProficiency: 'versado',
      description: 'Forjar documentos falsos.',
    },
  ],

  // ─────────────────────────────────────────
  // Estratégia (Mente - Proficiente)
  // ─────────────────────────────────────────
  estrategia: [
    {
      name: 'Conhecimento Estratégico',
      requiredProficiency: 'adepto',
      description: 'Conhecimento de táticas, cercos e batalhas.',
    },
    {
      name: 'Analisar Vantagens',
      requiredProficiency: 'adepto',
      description: 'Analisar vantagens e desvantagens do campo de batalha.',
    },
    {
      name: 'Planejar Ação',
      requiredProficiency: 'versado',
      description: 'Ajudar aliado em alcance médio com um plano de ação.',
    },
  ],

  // ─────────────────────────────────────────
  // Furtividade (Agilidade - Carga)
  // ─────────────────────────────────────────
  furtividade: [
    {
      name: 'Esconder-se',
      description: 'Esconder-se de criaturas.',
    },
    {
      name: 'Seguir',
      description: 'Seguir uma criatura sem ser visto.',
    },
  ],

  // ─────────────────────────────────────────
  // História (Mente)
  // ─────────────────────────────────────────
  historia: [
    {
      name: 'Conhecimento Histórico',
      description: 'Conhecimento sobre eventos, eras e figuras históricas.',
    },
  ],

  // ─────────────────────────────────────────
  // Instrução (Mente - Proficiente)
  // ─────────────────────────────────────────
  instrucao: [
    {
      name: 'Conhecimento Acadêmico',
      requiredProficiency: 'adepto',
      description: 'Conhecimento acadêmico geral.',
    },
    {
      name: 'Ciências',
      requiredProficiency: 'adepto',
      description:
        'Compreender e praticar ciências (física, matemática, química, biologia, tecnologia).',
    },
    {
      name: 'Idiomas',
      requiredProficiency: 'adepto',
      description: 'Tentar compreender ou decifrar idioma desconhecido.',
    },
  ],

  // ─────────────────────────────────────────
  // Intimidação (Influência)
  // ─────────────────────────────────────────
  intimidacao: [
    {
      name: 'Ameaçar',
      description: 'Ameaçar, ofender ou irritar uma criatura.',
    },
    {
      name: 'Coagir',
      description: 'Coagir uma criatura em alcance curto a cumprir uma ordem.',
    },
    {
      name: 'Assustar',
      requiredProficiency: 'adepto',
      description: 'Assustar uma criatura.',
    },
  ],

  // ─────────────────────────────────────────
  // Investigação (Mente)
  // ─────────────────────────────────────────
  investigacao: [
    {
      name: 'Procurar',
      description: 'Procurar por coisas escondidas ou específicas.',
    },
    {
      name: 'Interrogar',
      requiredProficiency: 'adepto',
      description: 'Extrair informações específicas através de perguntas.',
    },
    {
      name: 'Achar Documento',
      requiredProficiency: 'adepto',
      description: 'Encontrar documento específico em grande arquivo.',
    },
    {
      name: 'Analisar Objeto',
      requiredProficiency: 'adepto',
      description:
        'Analisar detalhes de um objeto (marcas, idade, compartimentos secretos).',
    },
  ],

  // ─────────────────────────────────────────
  // Luta (Corpo - Combate)
  // ─────────────────────────────────────────
  luta: [
    {
      name: 'Atacar',
      description:
        'Teste de ataque corpo a corpo. Resultados variam conforme ✶ obtidos.',
    },
  ],

  // ─────────────────────────────────────────
  // Medicina (Mente - Instrumento - Proficiente)
  // ─────────────────────────────────────────
  medicina: [
    {
      name: 'Administrar Tratamento',
      requiredProficiency: 'adepto',
      actionCost: '▶▶▶',
      description: 'Ajudar criatura sofrendo de doença ou veneno contínuo.',
    },
    {
      name: 'Conhecimento Médico',
      requiredProficiency: 'adepto',
      description: 'Conhecimento médico e de anatomia.',
    },
    {
      name: 'Administrar Primeiros Socorros',
      requiredProficiency: 'adepto',
      description: 'Primeiros socorros em criatura adjacente.',
      testInfo: '▶▶ + 2✶, ou ▶▶▶ + 1✶',
    },
    {
      name: 'Necropsia',
      requiredProficiency: 'adepto',
      description: 'Examinar um corpo para determinar causa e hora da morte.',
    },
    {
      name: 'Tratar Prolongadamente',
      requiredProficiency: 'versado',
      description: 'Tratar (valor de Mente) criaturas durante um Descanso.',
    },
  ],

  // ─────────────────────────────────────────
  // Natureza (Instinto - Combate)
  // ─────────────────────────────────────────
  natureza: [
    {
      name: 'Aprender Feitiço',
      description: 'Aprender feitiços de determinadas matrizes naturais.',
    },
    {
      name: 'Conhecimento Natural',
      description: 'Conhecimento sobre plantas, animais e fenômenos naturais.',
    },
    {
      name: 'Conjurar Feitiço',
      description: 'Lançar feitiços naturais.',
    },
    {
      name: 'Identificar Animal',
      actionCost: '▶',
      description: 'Identificar espécie de fauna.',
    },
    {
      name: 'Identificar Planta',
      actionCost: '▶',
      description: 'Identificar espécie de flora.',
    },
  ],

  // ─────────────────────────────────────────
  // Ofício (Especial - Instrumento)
  // ─────────────────────────────────────────
  oficio: [],

  // ─────────────────────────────────────────
  // Percepção (Instinto)
  // ─────────────────────────────────────────
  percepcao: [
    {
      name: 'Farejar',
      description: 'Perceber cheiros e odores.',
    },
    {
      name: 'Observar',
      description: 'Observar coisas escondidas ou evidentes à vista.',
    },
    {
      name: 'Ouvir',
      description: 'Ouvir sons distantes ou baixos.',
    },
    {
      name: 'Ler Lábios',
      requiredProficiency: 'adepto',
      description: 'Ler os lábios de uma criatura visível.',
    },
  ],

  // ─────────────────────────────────────────
  // Performance (Influência - Carga)
  // ─────────────────────────────────────────
  performance: [
    {
      name: 'Apresentar',
      description:
        'Apresentar-se por dinheiro (música, atuação, literatura, etc.).',
    },
    {
      name: 'Impressionar',
      description: 'Impressionar uma criatura com habilidade artística.',
    },
  ],

  // ─────────────────────────────────────────
  // Perspicácia (Instinto)
  // ─────────────────────────────────────────
  perspicacia: [
    {
      name: 'Perceber Inverdades',
      description:
        'Detectar mentiras via inconsistências e linguagem corporal.',
    },
    {
      name: 'Julgar Comportamento',
      requiredProficiency: 'adepto',
      description: 'Detectar comportamento estranho analisando uma criatura.',
    },
  ],

  // ─────────────────────────────────────────
  // Persuasão (Influência)
  // ─────────────────────────────────────────
  persuasao: [
    {
      name: 'Mudar Atitude',
      description:
        'Mudar a atitude de uma criatura (requer mais ✶ que Determinação do alvo).',
      alternateAttribute: 'mente',
      alternateAttributeNote: 'Para argumentos baseados em fatos e evidências',
    },
    {
      name: 'Pechinchar',
      description: 'Barganhar preço (requer mais ✶ que Determinação do alvo).',
      alternateAttribute: 'mente',
      alternateAttributeNote: 'Para argumentos baseados em fatos e evidências',
    },
    {
      name: 'Persuadir',
      description: 'Persuadir criatura a agir ou fazer um favor.',
      alternateAttribute: 'mente',
      alternateAttributeNote: 'Para argumentos baseados em fatos e evidências',
    },
    {
      name: 'Motivar',
      requiredProficiency: 'adepto',
      actionCost: '▶▶▶',
      description: 'Remover algumas condições mentais de criatura aliada.',
    },
  ],

  // ─────────────────────────────────────────
  // Rastreamento (Instinto - Proficiente)
  // ─────────────────────────────────────────
  rastreamento: [
    {
      name: 'Encontrar Rastro',
      requiredProficiency: 'adepto',
      description: 'Encontrar rastros no ambiente.',
    },
    {
      name: 'Estudar Rastro',
      requiredProficiency: 'adepto',
      description:
        'Analisar rastro para determinar peso, tipo e número de criaturas.',
    },
    {
      name: 'Seguir Rastro',
      requiredProficiency: 'adepto',
      description: 'Seguir rastros encontrados.',
    },
    {
      name: 'Cobrir Rastros',
      requiredProficiency: 'versado',
      description: 'Cobrir rastros do grupo durante viagem.',
    },
  ],

  // ─────────────────────────────────────────
  // Reflexo (Agilidade - Carga - Combate)
  // ─────────────────────────────────────────
  reflexo: [
    {
      name: 'Agarrar-se à Beirada',
      actionCost: '↩',
      description: 'Agarrar-se à beirada durante uma queda (requer mão livre).',
    },
    {
      name: 'Resistir',
      description: 'Resistir a efeitos que exigem reação rápida.',
    },
  ],

  // ─────────────────────────────────────────
  // Religião (Influência - Proficiente - Combate)
  // ─────────────────────────────────────────
  religiao: [
    {
      name: 'Acalmar',
      requiredProficiency: 'adepto',
      description:
        'Melhorar a atitude de uma criatura (precisa compartilhar princípios de crença).',
      alternateAttribute: 'mente',
      alternateAttributeNote: 'Para conhecimento teológico',
    },
    {
      name: 'Aprender Feitiço',
      requiredProficiency: 'adepto',
      description: 'Aprender feitiços de determinadas matrizes divinas.',
    },
    {
      name: 'Conhecimento Religioso',
      requiredProficiency: 'adepto',
      description: 'Conhecimento sobre religiões, divindades e rituais.',
      alternateAttribute: 'mente',
      alternateAttributeNote: 'Para conhecimento teológico acadêmico',
    },
    {
      name: 'Conjurar Feitiço',
      requiredProficiency: 'adepto',
      description: 'Lançar feitiços divinos.',
    },
    {
      name: 'Identificar Monstro',
      requiredProficiency: 'adepto',
      description: 'Identificar monstros de origem divina/demoníaca.',
    },
    {
      name: 'Realizar Ritual Religioso',
      requiredProficiency: 'versado',
      description: 'Gastar 5 PP e realizar cerimônia religiosa por 1 hora.',
      testInfo: 'Custo: 5 PP, Duração: 1 hora',
    },
  ],

  // ─────────────────────────────────────────
  // Sintonia (Essência - Combate)
  // ─────────────────────────────────────────
  sintonia: [
    {
      name: 'Resistir',
      description: 'Resistir a efeitos que afetam o espírito.',
    },
  ],

  // ─────────────────────────────────────────
  // Sobrevivência (Mente)
  // ─────────────────────────────────────────
  sobrevivencia: [
    {
      name: 'Encontrar Suprimentos',
      description: 'Forragear por suprimentos no ambiente.',
    },
    {
      name: 'Orientar-se',
      description: 'Orientar-se durante viagem em terreno aberto.',
    },
    {
      name: 'Acampar',
      requiredProficiency: 'adepto',
      description: 'Montar acampamento adequado ao bioma.',
    },
  ],

  // ─────────────────────────────────────────
  // Sociedade (Influência)
  // ─────────────────────────────────────────
  sociedade: [
    {
      name: 'Conhecimento Geral',
      description:
        'Conhecimento sobre costumes locais, governantes e conduta regional.',
    },
    {
      name: 'Enturmar',
      description: 'Misturar-se numa multidão ou ambiente aristocrático.',
    },
    {
      name: 'Arrancar Informações',
      requiredProficiency: 'adepto',
      description: 'Extrair informação específica de alvos.',
    },
    {
      name: 'Espalhar Boato',
      requiredProficiency: 'adepto',
      description: 'Espalhar informações sobre alguém ou algo.',
    },
  ],

  // ─────────────────────────────────────────
  // Sorte (Especial - 7 níveis)
  // ─────────────────────────────────────────
  sorte: [
    {
      name: 'Apostar',
      description:
        'Apostar em jogos de azar. O resultado depende dos ✶ obtidos e do local/nível da aposta.',
      testInfo: 'Uso requer 1d6 horas',
    },
  ],

  // ─────────────────────────────────────────
  // Tenacidade (Corpo - Combate)
  // ─────────────────────────────────────────
  tenacidade: [
    {
      name: 'Resistir',
      description:
        'Resistir a efeitos que exigem força física e integridade muscular.',
    },
    {
      name: 'Resilir Condições',
      requiredProficiency: 'adepto',
      description: 'Tentar sair de determinadas condições.',
    },
    {
      name: 'Suportar Resistências',
      requiredProficiency: 'adepto',
      actionCost: '↩',
      description:
        'Teste de Tenacidade; se obtiver ✶, teste de resistência recebe +2d de bônus.',
    },
  ],

  // ─────────────────────────────────────────
  // Vigor (Corpo - Combate)
  // ─────────────────────────────────────────
  vigor: [
    {
      name: 'Resistir',
      description: 'Resistir a efeitos que afetam saúde física e constituição.',
    },
    {
      name: 'Manter Fôlego',
      description: 'Segurar a respiração.',
    },
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
