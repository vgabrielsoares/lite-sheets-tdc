/**
 * Conditions - Condições do Sistema Tabuleiro do Caos RPG
 *
 * Este arquivo contém as constantes relacionadas às condições
 * disponíveis no sistema Tabuleiro do Caos RPG.
 *
 * As condições são estados que afetam personagens temporariamente,
 * podendo aplicar penalidades, restrições ou efeitos especiais.
 */

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
  | 'caido'
  | 'cego'
  | 'desequilibrado'
  | 'desprevenido'
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
 * Informações de uma condição
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
}

/**
 * Lista ordenada de condições com suas informações
 * Baseado no sistema Tabuleiro do Caos RPG
 */
export const CONDITIONS: readonly ConditionInfo[] = [
  {
    id: 'abalado',
    label: 'Abalado',
    description:
      'A criatura está emocionalmente abalada, sofrendo penalidades em testes mentais e sociais.',
    icon: 'SentimentDissatisfied',
    color: '#7B1FA2', // Roxo
    type: 'negativa',
  },
  {
    id: 'abatido',
    label: 'Abatido',
    description:
      'A criatura está desanimada e com moral baixo, afetando seu desempenho geral.',
    icon: 'MoodBad',
    color: '#5D4037', // Marrom
    type: 'negativa',
  },
  {
    id: 'agarrado',
    label: 'Agarrado',
    description:
      'A criatura está sendo segurada por outra. Seu movimento é reduzido a 0.',
    icon: 'PanTool',
    color: '#5D4037', // Marrom
    type: 'negativa',
  },
  {
    id: 'asfixiado',
    label: 'Asfixiado',
    description:
      'A criatura não consegue respirar e pode sofrer dano contínuo até conseguir ar.',
    icon: 'AirOutlined',
    color: '#1565C0', // Azul escuro
    type: 'negativa',
  },
  {
    id: 'amedrontado',
    label: 'Amedrontado',
    description:
      'A criatura não pode se aproximar voluntariamente da fonte do medo. Pode sofrer penalidades em testes.',
    icon: 'SentimentVeryDissatisfied',
    color: '#7B1FA2', // Roxo
    type: 'negativa',
  },
  {
    id: 'atordoado',
    label: 'Atordoado',
    description:
      'A criatura está confusa e desorientada. Não pode realizar ações e tem penalidades na defesa.',
    icon: 'StarBorder',
    color: '#FFC107', // Amarelo
    type: 'negativa',
  },
  {
    id: 'caido',
    label: 'Caído',
    description:
      'A criatura está no chão. Ataques corpo a corpo contra ela têm vantagem. Levantar custa movimento.',
    icon: 'Download',
    color: '#795548', // Marrom terra
    type: 'negativa',
  },
  {
    id: 'cego',
    label: 'Cego',
    description:
      'A criatura não pode ver. Falha automaticamente em testes que requerem visão. Ataques têm desvantagem.',
    icon: 'VisibilityOff',
    color: '#37474F', // Cinza escuro
    type: 'negativa',
  },
  {
    id: 'desequilibrado',
    label: 'Desequilibrado',
    description:
      'A criatura perdeu o equilíbrio, sofrendo penalidades em testes físicos e de movimento.',
    icon: 'Balance',
    color: '#FF9800', // Laranja
    type: 'negativa',
  },
  {
    id: 'desprevenido',
    label: 'Desprevenido',
    description:
      'A criatura foi pega de surpresa, sofrendo penalidades na defesa e reações.',
    icon: 'ReportProblem',
    color: '#FF5722', // Laranja escuro
    type: 'negativa',
  },
  {
    id: 'doente',
    label: 'Doente',
    description:
      'A criatura está doente, sofrendo penalidades gerais e possivelmente dano contínuo.',
    icon: 'Sick',
    color: '#4CAF50', // Verde (irônico)
    type: 'negativa',
  },
  {
    id: 'enfeiticado',
    label: 'Enfeitiçado',
    description:
      'A criatura está sob efeito de encantamento, podendo ter sua percepção ou comportamento alterados.',
    icon: 'Favorite',
    color: '#E91E63', // Rosa
    type: 'negativa',
  },
  {
    id: 'emChamas',
    label: 'Em Chamas',
    description:
      'A criatura está pegando fogo, sofrendo dano de fogo contínuo até apagar as chamas.',
    icon: 'LocalFireDepartment',
    color: '#FF5722', // Laranja fogo
    type: 'negativa',
  },
  {
    id: 'enjoado',
    label: 'Enjoado',
    description:
      'A criatura está enjoada, podendo sofrer penalidades em ações e concentração.',
    icon: 'SickOutlined',
    color: '#8BC34A', // Verde claro
    type: 'negativa',
  },
  {
    id: 'enraizado',
    label: 'Enraizado',
    description:
      'A criatura está presa ao chão, não podendo se mover mas mantendo outras ações.',
    icon: 'Park',
    color: '#4E342E', // Marrom escuro
    type: 'negativa',
  },
  {
    id: 'envenenado',
    label: 'Envenenado',
    description:
      'A criatura está sob efeito de veneno. Sofre penalidades em testes e pode receber dano contínuo.',
    icon: 'Coronavirus',
    color: '#8BC34A', // Verde veneno
    type: 'negativa',
  },
  {
    id: 'esgotado',
    label: 'Esgotado',
    description:
      'A criatura está fisicamente esgotada, com capacidades reduzidas.',
    icon: 'BatteryAlert',
    color: '#FF5722', // Laranja
    type: 'negativa',
  },
  {
    id: 'exausto',
    label: 'Exausto',
    description:
      'A criatura está extremamente cansada. Sofre penalidades cumulativas em diversos testes e capacidades.',
    icon: 'Battery0Bar',
    color: '#D32F2F', // Vermelho
    type: 'negativa',
  },
  {
    id: 'fotossensivel',
    label: 'Fotossensível',
    description:
      'A criatura é sensível à luz, sofrendo penalidades quando exposta a iluminação forte.',
    icon: 'WbSunny',
    color: '#FFEB3B', // Amarelo
    type: 'negativa',
  },
  {
    id: 'fraco',
    label: 'Fraco',
    description:
      'A criatura está enfraquecida, com força e resistência reduzidas.',
    icon: 'TrendingDown',
    color: '#9E9E9E', // Cinza
    type: 'negativa',
  },
  {
    id: 'incapacitado',
    label: 'Incapacitado',
    description:
      'A criatura não pode realizar ações ou reações. Ainda pode se mover.',
    icon: 'PersonOff',
    color: '#9E9E9E', // Cinza
    type: 'negativa',
  },
  {
    id: 'inconsciente',
    label: 'Inconsciente',
    description:
      'A criatura está desacordada. Não pode se mover, agir ou perceber o ambiente.',
    icon: 'Hotel',
    color: '#263238', // Cinza muito escuro
    type: 'negativa',
  },
  {
    id: 'indefeso',
    label: 'Indefeso',
    description:
      'A criatura está completamente vulnerável, sem capacidade de se defender.',
    icon: 'ShieldOutlined',
    color: '#C62828', // Vermelho escuro
    type: 'negativa',
  },
  {
    id: 'lento',
    label: 'Lento',
    description:
      'O movimento da criatura é reduzido. Pode afetar ações também.',
    icon: 'SlowMotionVideo',
    color: '#00BCD4', // Ciano
    type: 'negativa',
  },
  {
    id: 'machucado',
    label: 'Machucado',
    description:
      'A criatura está ferida, sofrendo penalidades por conta de seus ferimentos.',
    icon: 'Healing',
    color: '#F44336', // Vermelho
    type: 'negativa',
  },
  {
    id: 'manipulado',
    label: 'Manipulado',
    description:
      'A criatura está sendo controlada por outra entidade, agindo contra sua vontade.',
    icon: 'Psychology',
    color: '#9C27B0', // Roxo
    type: 'negativa',
  },
  {
    id: 'morrendo',
    label: 'Morrendo',
    description:
      'A criatura está entre a vida e a morte. Deve fazer testes de morte a cada rodada.',
    icon: 'Warning',
    color: '#D32F2F', // Vermelho escuro
    type: 'negativa',
  },
  {
    id: 'paralisado',
    label: 'Paralisado',
    description:
      'A criatura está completamente imóvel. Não pode se mover, falar ou agir. Ataques têm vantagem.',
    icon: 'PauseCircle',
    color: '#4527A0', // Roxo escuro
    type: 'negativa',
  },
  {
    id: 'petrificado',
    label: 'Petrificado',
    description:
      'A criatura foi transformada em pedra. Está incapacitada e imune a maioria dos efeitos.',
    icon: 'Landscape',
    color: '#757575', // Cinza pedra
    type: 'negativa',
  },
  {
    id: 'perplexo',
    label: 'Perplexo',
    description:
      'A criatura está confusa e desorientada, tendo dificuldade para agir com clareza.',
    icon: 'HelpOutline',
    color: '#FFC107', // Amarelo
    type: 'negativa',
  },
  {
    id: 'perturbado',
    label: 'Perturbado',
    description:
      'A criatura está mentalmente perturbada, afetando sua concentração e decisões.',
    icon: 'PsychologyAlt',
    color: '#7B1FA2', // Roxo
    type: 'negativa',
  },
  {
    id: 'sangrando',
    label: 'Sangrando',
    description:
      'A criatura está perdendo sangue. Pode sofrer dano contínuo até receber tratamento.',
    icon: 'Bloodtype',
    color: '#C62828', // Vermelho sangue
    type: 'negativa',
  },
  {
    id: 'sobrecarregado',
    label: 'Sobrecarregado',
    description:
      'A criatura está carregando peso demais. Movimento reduzido e penalidades em testes físicos.',
    icon: 'FitnessCenter',
    color: '#8D6E63', // Marrom
    type: 'negativa',
  },
  {
    id: 'surdo',
    label: 'Surdo',
    description:
      'A criatura não pode ouvir. Falha automaticamente em testes que requerem audição.',
    icon: 'HearingDisabled',
    color: '#546E7A', // Azul cinza
    type: 'negativa',
  },
  {
    id: 'vulneravel',
    label: 'Vulnerável',
    description:
      'A criatura está vulnerável, recebendo dano adicional ou sofrendo efeitos ampliados.',
    icon: 'BrokenImage',
    color: '#F44336', // Vermelho
    type: 'negativa',
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
