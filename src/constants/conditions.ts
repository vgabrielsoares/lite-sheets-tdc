/**
 * Conditions - Condições do Sistema Tabuleiro do Caos RPG
 *
 * Condições são estados que afetam personagens temporariamente,
 * podendo aplicar penalidades, restrições ou efeitos especiais.
 *
 * Condições agora possuem 4 categorias (corporal, mental, sensorial, espiritual),
 * condições empilháveis, condições automáticas (Avariado, Machucado, Esgotado),
 * e 4 novas condições espirituais: Desconexo, Dissonante, Esgotado (reclassificado), Manipulado.
 */

import type { ConditionCategory } from '@/types/combat';

/**
 * Identificador de uma condição
 */
export type ConditionId =
  | 'abalado'
  | 'abatido'
  | 'agarrado'
  | 'asfixiado'
  | 'amedrontado'
  | 'atordoado'
  | 'avariado'
  | 'caido'
  | 'cego'
  | 'desconexo'
  | 'desequilibrado'
  | 'desprevenido'
  | 'dissonante'
  | 'doente'
  | 'enfeiticado'
  | 'emChamas'
  | 'enjoado'
  | 'enraizado'
  | 'envenenado'
  | 'esgotado'
  | 'exausto'
  | 'fotossensivel'
  | 'fraco'
  | 'incapacitado'
  | 'inconsciente'
  | 'indefeso'
  | 'invisivel'
  | 'lento'
  | 'machucado'
  | 'manipulado'
  | 'morrendo'
  | 'paralisado'
  | 'petrificado'
  | 'perplexo'
  | 'perturbado'
  | 'sangrando'
  | 'sobrecarregado'
  | 'surdo'
  | 'vulneravel';

/**
 * Tipo de gatilho automático para condições
 * - ga_half: GA_current ≤ GA_max / 2 → Avariado
 * - pv_damage: PV_current < PV_max → Machucado
 * - pp_zero: PP = 0 → Esgotado
 */
export type AutoTriggerType = 'ga_half' | 'pv_damage' | 'pp_zero';

/**
 * Informações de uma condição)
 */
export interface ConditionInfo {
  /** Identificador da condição */
  id: ConditionId;
  /** Nome em português para exibição */
  label: string;
  /** Descrição dos efeitos da condição */
  description: string;
  /** Ícone MUI associado (nome do ícone) */
  icon: string;
  /** Cor temática para a condição */
  color: string;
  /** Se a condição é negativa (penalidade) ou positiva (bônus) */
  type: 'negativa' | 'positiva' | 'neutra';
  /** Categoria da condição) */
  category: ConditionCategory;
  /** Se a condição é empilhável (ex: Abalado, Dissonante, Exausto) */
  stackable?: boolean;
  /** Número máximo de pilhas (se empilhável) */
  maxStacks?: number;
  /** Condições automaticamente implicadas (ex: Morrendo → Caído + Incapacitado) */
  impliedConditions?: ConditionId[];
  /** Gatilho automático para aplicação da condição */
  autoTrigger?: {
    type: AutoTriggerType;
    description: string;
  };
  /** Penalidade em dados quando a condição está ativa) */
  dicePenalty?: {
    /** Atributos ou habilidades afetados */
    targets: string[];
    /** Modificador de dados (negativo = penalidade) */
    modifier: number;
    /** Se escala com pilhas */
    scalesWithStacks?: boolean;
  };
  /**
   * Penalidade de defesa para PJs quando esta condição está ativa.
   * Condições que dão "+Xd ataques contra a criatura" se traduzem
   * em "-Xd no teste de defesa" do PJ afetado.
   */
  defensePenalty?: {
    /** Modificador de dados no teste de defesa (negativo = penalidade) */
    modifier: number;
    /** Se escala com pilhas (ex: Vulnerável nível 1: -1d, nível 2: -2d) */
    scalesWithStacks?: boolean;
  };
}

/**
 * Lista completa de condições v0.2, organizadas por categoria.
 * Baseado no sistema Tabuleiro do Caos RPG
 */
export const CONDITIONS: readonly ConditionInfo[] = [
  // ═══════════════════════════════════════════════════
  // CORPORAIS
  // ═══════════════════════════════════════════════════
  {
    id: 'abatido',
    label: 'Abatido',
    description: 'A criatura sofre -1d em todos os testes.',
    icon: 'MoodBad',
    color: '#5D4037',
    type: 'negativa',
    category: 'corporal',
    dicePenalty: {
      targets: ['todos'],
      modifier: -1,
    },
  },
  {
    id: 'agarrado',
    label: 'Agarrado',
    description:
      'A criatura sofre -1d em testes de Reflexo e -1d em testes de ataque. Não pode atacar com armas de Duas Mãos. Ataques contra ela têm +1d. Deslocamento reduzido a 0. Ataques à distância contra criaturas envolvidas no agarre têm 50% de chance de acertar o alvo errado (se adjacentes).',
    icon: 'PanTool',
    color: '#5D4037',
    type: 'negativa',
    category: 'corporal',
    dicePenalty: {
      targets: ['reflexo', 'ataque'],
      modifier: -1,
    },
    defensePenalty: {
      modifier: -1,
    },
  },
  {
    id: 'asfixiado',
    label: 'Asfixiado',
    description:
      'A criatura está impossibilitada de respirar. Pode manter a consciência por Corpo + 1 rodadas. Ao sofrer dano, deve ter 1✶+ em Vigor ou perde 1 rodada. No fim do último turno, fica Morrendo e Inconsciente.',
    icon: 'AirOutlined',
    color: '#1565C0',
    type: 'negativa',
    category: 'corporal',
    impliedConditions: ['morrendo', 'inconsciente'],
  },
  {
    id: 'avariado',
    label: 'Avariado',
    description:
      'A criatura fica Avariada ao ficar com metade da Guarda ou menos em relação à Guarda máxima (GA ≤ GA_max / 2).',
    icon: 'Shield',
    color: '#FFA726',
    type: 'negativa',
    category: 'corporal',
    autoTrigger: {
      type: 'ga_half',
      description: 'Aplicado automaticamente quando GA ≤ GA_max / 2',
    },
  },
  {
    id: 'caido',
    label: 'Caído',
    description:
      'A criatura está no chão. Sofre -2d em ataques corpo a corpo. Deslocamento reduzido a 1/3. Ataques corpo a corpo contra ela têm +1d, ataques à distância sofrem -1d. Levantar custa ▶. Outra criatura pode levantá-la com ▶.',
    icon: 'Download',
    color: '#795548',
    type: 'negativa',
    category: 'corporal',
    dicePenalty: {
      targets: ['ataque-cac'],
      modifier: -2,
    },
    defensePenalty: {
      modifier: -1,
    },
  },
  {
    id: 'doente',
    label: 'Doente',
    description:
      'A criatura fica sob efeito de uma doença. Efeitos variam conforme a doença.',
    icon: 'Sick',
    color: '#4CAF50',
    type: 'negativa',
    category: 'corporal',
  },
  {
    id: 'emChamas',
    label: 'Em Chamas',
    description:
      'Corpo, roupas e itens carregados atingidos pelo fogo. No início de cada turno, sofre 1d6 de dano de fogo. O personagem pode usar ▶ para apagar. Submergir em água/líquido não inflamável encerra a condição.',
    icon: 'LocalFireDepartment',
    color: '#FF5722',
    type: 'negativa',
    category: 'corporal',
  },
  {
    id: 'enjoado',
    label: 'Enjoado',
    description: 'A criatura só pode utilizar uma ▶ por turno.',
    icon: 'SickOutlined',
    color: '#8BC34A',
    type: 'negativa',
    category: 'corporal',
  },
  {
    id: 'enraizado',
    label: 'Enraizado',
    description:
      'A criatura é impedida de se deslocar. Deslocamento reduzido a 0.',
    icon: 'Park',
    color: '#4E342E',
    type: 'negativa',
    category: 'corporal',
  },
  {
    id: 'envenenado',
    label: 'Envenenado',
    description:
      'A criatura fica sob efeito de um veneno. Efeitos variam conforme o veneno. Dano de envenenamento é cumulativo.',
    icon: 'Coronavirus',
    color: '#8BC34A',
    type: 'negativa',
    category: 'corporal',
  },
  {
    id: 'exausto',
    label: 'Exausto',
    description:
      'Nível 1: -1d em Agilidade e Corpo, ataques contra a criatura têm +1d. Nível 2: -2d em Agilidade e Corpo, deslocamento reduzido pela metade, não pode correr. Nível 3: Incapacitado.',
    icon: 'Battery0Bar',
    color: '#D32F2F',
    type: 'negativa',
    category: 'corporal',
    stackable: true,
    maxStacks: 3,
    dicePenalty: {
      targets: ['agilidade', 'corpo'],
      modifier: -1,
      scalesWithStacks: true,
    },
    defensePenalty: {
      modifier: -1,
    },
  },
  {
    id: 'fraco',
    label: 'Fraco',
    description:
      'Nível 1: -1d em Agilidade e Corpo. Nível 2: -2d. Nível 3: Incapacitado.',
    icon: 'TrendingDown',
    color: '#9E9E9E',
    type: 'negativa',
    category: 'corporal',
    stackable: true,
    maxStacks: 3,
    dicePenalty: {
      targets: ['agilidade', 'corpo'],
      modifier: -1,
      scalesWithStacks: true,
    },
  },
  {
    id: 'invisivel',
    label: 'Invisível',
    description:
      'A criatura tem +2d em ataques contra alvos que não possam vê-la, ou -2d em Defesa contra atacantes invisíveis. Se a localização for conhecida, -2d no ataque ou +2d na Defesa. Ainda produz sons e cheiros.',
    icon: 'VisibilityOff',
    color: '#B0BEC5',
    type: 'positiva',
    category: 'corporal',
  },
  {
    id: 'lento',
    label: 'Lento',
    description:
      'Todo tipo de deslocamento da criatura é reduzido pela metade e ela não pode correr.',
    icon: 'SlowMotionVideo',
    color: '#00BCD4',
    type: 'negativa',
    category: 'corporal',
  },
  {
    id: 'machucado',
    label: 'Machucado',
    description:
      'A criatura fica Machucada quando seus PV atuais ficam abaixo dos PV totais (PV < PV_max).',
    icon: 'Healing',
    color: '#F44336',
    type: 'negativa',
    category: 'corporal',
    autoTrigger: {
      type: 'pv_damage',
      description: 'Aplicado automaticamente quando PV < PV_max',
    },
  },
  {
    id: 'morrendo',
    label: 'Morrendo',
    description:
      'A criatura fica caída e Incapacitada. Pode permanecer nesta condição por 2 + Corpo rodadas. A cada rodada diminui 1. Golpe de misericórdia reduz 1 rodada adicional. Precisa de 10 pontos de cura para sair (+5 para cada vez adicional no mesmo combate). Ao sair: 1 GA + excedente, 0 PV, continua Caído.',
    icon: 'Warning',
    color: '#D32F2F',
    type: 'negativa',
    category: 'corporal',
    impliedConditions: ['caido', 'incapacitado'],
  },
  {
    id: 'petrificado',
    label: 'Petrificado',
    description:
      'Ataques contra a criatura têm +2d. Falha automaticamente em testes de resistência. Não pode fazer ações ou reações. Ataques corpo a corpo são críticos. Peso 5x maior. Recebe RD 5 e Resistência Aprimorada. Considerada Incapacitada.',
    icon: 'Landscape',
    color: '#757575',
    type: 'negativa',
    category: 'corporal',
    impliedConditions: ['incapacitado'],
    defensePenalty: {
      modifier: -2,
    },
  },
  {
    id: 'sangrando',
    label: 'Sangrando',
    description:
      'No início de cada turno, teste de Vigor: 1✶ encerra em 1d6 turnos, 2✶ em 1d3, 3✶ imediatamente. Em falha, sofre 1d6 de dano interno no final do turno. Cura de 10 pontos encerra (sem restaurar GA). Medicina também encerra. Cada instância adicional +1d6 dano.',
    icon: 'Bloodtype',
    color: '#C62828',
    type: 'negativa',
    category: 'corporal',
    stackable: true,
  },
  {
    id: 'sobrecarregado',
    label: 'Sobrecarregado',
    description:
      'Ataques contra a criatura têm +1d. Sofre -2d em testes com "penalidade de carga". Deslocamento reduzido em 2 metros.',
    icon: 'FitnessCenter',
    color: '#8D6E63',
    type: 'negativa',
    category: 'corporal',
    defensePenalty: {
      modifier: -1,
    },
  },

  // ═══════════════════════════════════════════════════
  // MENTAIS
  // ═══════════════════════════════════════════════════
  {
    id: 'abalado',
    label: 'Abalado',
    description:
      'Nível 1: -1d em todos os testes, dura 1d8 rodadas. Teste de Determinação a cada turno (1✶+) para encerrar. Empilha até -5d.',
    icon: 'SentimentDissatisfied',
    color: '#7B1FA2',
    type: 'negativa',
    category: 'mental',
    stackable: true,
    maxStacks: 5,
    dicePenalty: {
      targets: ['todos'],
      modifier: -1,
      scalesWithStacks: true,
    },
  },
  {
    id: 'amedrontado',
    label: 'Amedrontado',
    description:
      'A criatura sofre -1d em testes de habilidade e não pode se aproximar da fonte do medo voluntariamente. Enquanto a fonte do medo estiver visível, ataques sofrem -2d.',
    icon: 'SentimentVeryDissatisfied',
    color: '#7B1FA2',
    type: 'negativa',
    category: 'mental',
    dicePenalty: {
      targets: ['todos'],
      modifier: -1,
    },
  },
  {
    id: 'enfeiticado',
    label: 'Enfeitiçado',
    description:
      'A criatura não pode atacar ou atingir o enfeitiçador com efeitos nocivos. O enfeitiçador tem +3d em testes sociais contra o enfeitiçado.',
    icon: 'Favorite',
    color: '#E91E63',
    type: 'negativa',
    category: 'mental',
  },
  {
    id: 'incapacitado',
    label: 'Incapacitado',
    description:
      'A criatura não pode fazer ações ou reações, e não pode manter concentração. Se ficar Incapacitada novamente, fica Inconsciente. Mesmo se acordada, permanece incapacitada até o efeito encerrar.',
    icon: 'PersonOff',
    color: '#9E9E9E',
    type: 'negativa',
    category: 'mental',
    stackable: true,
    maxStacks: 2,
  },
  {
    id: 'inconsciente',
    label: 'Inconsciente',
    description:
      'Ataques contra a criatura têm +2d. Falha automaticamente em Reflexo e Tenacidade. Não pode fazer ações/reações. -2d em Percepção. Acordar requer ▶ de criatura adjacente. Pode sofrer golpes de misericórdia. Considerada Incapacitada.',
    icon: 'Hotel',
    color: '#263238',
    type: 'negativa',
    category: 'mental',
    impliedConditions: ['incapacitado'],
    defensePenalty: {
      modifier: -2,
    },
  },
  {
    id: 'perplexo',
    label: 'Perplexo',
    description:
      'Sofre -2d em Percepção. Não pode fazer ações ou reações, atenção fixa em um ponto. Ações hostis encerram a condição. Acordar requer ▶ de criatura adjacente. Considerada Incapacitada.',
    icon: 'HelpOutline',
    color: '#FFC107',
    type: 'negativa',
    category: 'mental',
    impliedConditions: ['incapacitado'],
  },
  {
    id: 'perturbado',
    label: 'Perturbado',
    description:
      'Nível 1: -1d em Influência e Mente. Nível 2: -2d. Nível 3: Incapacitado.',
    icon: 'PsychologyAlt',
    color: '#7B1FA2',
    type: 'negativa',
    category: 'mental',
    stackable: true,
    maxStacks: 3,
    dicePenalty: {
      targets: ['influencia', 'mente'],
      modifier: -1,
      scalesWithStacks: true,
    },
  },

  // ═══════════════════════════════════════════════════
  // SENSORIAIS
  // ═══════════════════════════════════════════════════
  {
    id: 'atordoado',
    label: 'Atordoado',
    description:
      'Falha automaticamente em testes de Reflexo e Tenacidade. Ataques contra a criatura têm +1d (ou -1d em Defesa para PJs). Não pode fazer ações.',
    icon: 'StarBorder',
    color: '#FFC107',
    type: 'negativa',
    category: 'sensorial',
    defensePenalty: {
      modifier: -1,
    },
  },
  {
    id: 'cego',
    label: 'Cego',
    description:
      'Sofre -1d em Reflexo e -1d em habilidades de Agilidade ou Corpo (cumulativo). Ataques contra a criatura têm +1d. Deslocamento reduzido pela metade, não pode correr (exceto com 1✶ em Determinação). Falha em testes de Percepção com visão. Alvos de ataque recebem Invisibilidade.',
    icon: 'VisibilityOff',
    color: '#37474F',
    type: 'negativa',
    category: 'sensorial',
    dicePenalty: {
      targets: ['agilidade', 'corpo'],
      modifier: -1,
    },
    defensePenalty: {
      modifier: -1,
    },
  },
  {
    id: 'desequilibrado',
    label: 'Desequilibrado',
    description:
      'Sofre -1d em testes de Reflexo e Tenacidade. Não pode fazer reações. Se ficar Desequilibrada novamente, fica Atordoada.',
    icon: 'Balance',
    color: '#FF9800',
    type: 'negativa',
    category: 'sensorial',
    stackable: true,
    maxStacks: 2,
  },
  {
    id: 'desprevenido',
    label: 'Desprevenido',
    description:
      'Sofre -1d em testes de Reflexo. Ataques contra a criatura têm +1d. Se por Surpresa: sempre Turno Lento e possui apenas ▶▶.',
    icon: 'ReportProblem',
    color: '#FF5722',
    type: 'negativa',
    category: 'sensorial',
    defensePenalty: {
      modifier: -1,
    },
  },
  {
    id: 'fotossensivel',
    label: 'Fotossensível',
    description:
      'Grau 1: -3d em Observar (Percepção), ataques à distância contra a criatura têm +1d. Grau 2: +1d6 dano por hora em luz brilhante. Grau 3: por minuto. Grau 4: por rodada.',
    icon: 'WbSunny',
    color: '#FFEB3B',
    type: 'negativa',
    category: 'sensorial',
    stackable: true,
    maxStacks: 4,
    defensePenalty: {
      modifier: -1,
    },
  },
  {
    id: 'indefeso',
    label: 'Indefeso',
    description:
      'Ataques contra a criatura têm +2d. Falha automaticamente em testes de Reflexo.',
    icon: 'ShieldOutlined',
    color: '#C62828',
    type: 'negativa',
    category: 'sensorial',
    defensePenalty: {
      modifier: -2,
    },
  },
  {
    id: 'paralisado',
    label: 'Paralisado',
    description:
      'Deslocamento reduzido a 0. Ataques contra a criatura têm +2d. Falha automaticamente em Reflexo e Tenacidade. Não pode mover o corpo, mas pode realizar ações mentais.',
    icon: 'PauseCircle',
    color: '#4527A0',
    type: 'negativa',
    category: 'sensorial',
    defensePenalty: {
      modifier: -2,
    },
  },
  {
    id: 'surdo',
    label: 'Surdo',
    description:
      'Falha em testes de Percepção com audição. Sofre -1d em Reflexo. Fica Desprevenida contra inimigos fora de sua linha de visão.',
    icon: 'HearingDisabled',
    color: '#546E7A',
    type: 'negativa',
    category: 'sensorial',
  },
  {
    id: 'vulneravel',
    label: 'Vulnerável',
    description:
      'Nível 1: Ataques contra a criatura ganham +1d. Nível 2: +2d ataques, -2d Reflexo, fica Desprevenida.',
    icon: 'BrokenImage',
    color: '#F44336',
    type: 'negativa',
    category: 'sensorial',
    stackable: true,
    maxStacks: 2,
    defensePenalty: {
      modifier: -1,
      scalesWithStacks: true,
    },
  },

  // ═══════════════════════════════════════════════════
  // ESPIRITUAIS: nova categoria)
  // ═══════════════════════════════════════════════════
  {
    id: 'desconexo',
    label: 'Desconexo',
    description:
      'A criatura não pode usar ou gastar PP, nem usar habilidades especiais que precisem de PP atuais.',
    icon: 'LinkOff',
    color: '#6A1B9A',
    type: 'negativa',
    category: 'espiritual',
  },
  {
    id: 'dissonante',
    label: 'Dissonante',
    description:
      'Nível 1: -1d em Instinto e Essência. Nível 2: -2d. Nível 3: Incapacitada.',
    icon: 'VolumeOff',
    color: '#8E24AA',
    type: 'negativa',
    category: 'espiritual',
    stackable: true,
    maxStacks: 3,
    dicePenalty: {
      targets: ['instinto', 'essencia'],
      modifier: -1,
      scalesWithStacks: true,
    },
  },
  {
    id: 'esgotado',
    label: 'Esgotado',
    description:
      'Corpo, alma e magia depletados. Fica Esgotado ao chegar em 0 PP (e vice-versa). Sofre -1d em testes de Corpo e Essência.',
    icon: 'BatteryAlert',
    color: '#FF5722',
    type: 'negativa',
    category: 'espiritual',
    autoTrigger: {
      type: 'pp_zero',
      description: 'Aplicado automaticamente quando PP = 0 (bidirecional)',
    },
    dicePenalty: {
      targets: ['corpo', 'essencia'],
      modifier: -1,
    },
  },
  {
    id: 'manipulado',
    label: 'Manipulado',
    description:
      'A criatura está sob controle parcial ou total de um efeito ou criatura. Pode agir contra sua vontade. Considerada Enfeitiçada.',
    icon: 'Psychology',
    color: '#9C27B0',
    type: 'negativa',
    category: 'espiritual',
    impliedConditions: ['enfeiticado'],
  },
] as const;

/**
 * Mapa de condições por ID para acesso rápido
 */
export const CONDITION_MAP: Record<ConditionId, ConditionInfo> =
  CONDITIONS.reduce(
    (acc, condition) => {
      acc[condition.id] = condition;
      return acc;
    },
    {} as Record<ConditionId, ConditionInfo>
  );

/**
 * Lista de IDs de condições para uso em selects
 */
export const CONDITION_IDS: readonly ConditionId[] = CONDITIONS.map(
  (c) => c.id
);

/**
 * Condições agrupadas por categoria)
 */
export const CONDITIONS_BY_CATEGORY: Record<
  ConditionCategory,
  readonly ConditionInfo[]
> = {
  corporal: CONDITIONS.filter((c) => c.category === 'corporal'),
  mental: CONDITIONS.filter((c) => c.category === 'mental'),
  sensorial: CONDITIONS.filter((c) => c.category === 'sensorial'),
  espiritual: CONDITIONS.filter((c) => c.category === 'espiritual'),
};

/**
 * Labels para categorias de condições
 */
export const CONDITION_CATEGORY_LABELS: Record<ConditionCategory, string> = {
  corporal: 'Corporais',
  mental: 'Mentais',
  sensorial: 'Sensoriais',
  espiritual: 'Espirituais',
};

/**
 * Ícones para categorias de condições (nomes de ícones MUI)
 */
export const CONDITION_CATEGORY_ICONS: Record<ConditionCategory, string> = {
  corporal: 'FitnessCenter',
  mental: 'Psychology',
  sensorial: 'Visibility',
  espiritual: 'AutoFixHigh',
};

/**
 * Condições com gatilho automático
 */
export const AUTO_TRIGGER_CONDITIONS = CONDITIONS.filter(
  (c) => c.autoTrigger != null
);

/**
 * Obtém informações de uma condição pelo ID
 */
export function getConditionInfo(id: ConditionId): ConditionInfo | undefined {
  return CONDITION_MAP[id];
}

/**
 * Obtém o label de uma condição pelo ID
 */
export function getConditionLabel(id: ConditionId): string {
  return CONDITION_MAP[id]?.label ?? id;
}

/**
 * Filtra condições por tipo
 */
export function getConditionsByType(
  type: 'negativa' | 'positiva' | 'neutra'
): readonly ConditionInfo[] {
  return CONDITIONS.filter((c) => c.type === type);
}

/**
 * Filtra condições por categoria)
 */
export function getConditionsByCategory(
  category: ConditionCategory
): readonly ConditionInfo[] {
  return CONDITIONS_BY_CATEGORY[category];
}

/**
 * Retorna condições empilháveis
 */
export function getStackableConditions(): readonly ConditionInfo[] {
  return CONDITIONS.filter((c) => c.stackable);
}

/**
 * Verifica se uma condição deveria estar ativa com base no estado do personagem.
 * Útil para auto-aplicação de Avariado, Machucado e Esgotado.
 *
 * @param conditionId - ID da condição a verificar
 * @param state - Estado atual do personagem (GA, PV, PP)
 * @returns true se a condição deveria estar ativa
 */
export function shouldConditionBeActive(
  conditionId: ConditionId,
  state: {
    gaCurrent: number;
    gaMax: number;
    pvCurrent: number;
    pvMax: number;
    ppCurrent: number;
  }
): boolean {
  switch (conditionId) {
    case 'avariado':
      return state.gaCurrent <= Math.floor(state.gaMax / 2);
    case 'machucado':
      return state.pvCurrent < state.pvMax;
    case 'esgotado':
      return state.ppCurrent <= 0;
    default:
      return false;
  }
}
