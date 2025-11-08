/**
 * Constantes relacionadas aos Arquétipos do personagem
 *
 * Os seis arquétipos são a principal forma de progresso de um personagem.
 * A cada novo nível ganho, um jogador pode escolher um dos seis arquétipos
 * para se avançar, combinando diferentes arquétipos para personalizar o personagem.
 */

/**
 * Lista dos 6 arquétipos do sistema
 */
export const ARCHETYPE_LIST = [
  'academico',
  'acolito',
  'combatente',
  'feiticeiro',
  'ladino',
  'natural',
] as const;

/**
 * Tipo para nome de arquétipo
 */
export type ArchetypeName = (typeof ARCHETYPE_LIST)[number];

/**
 * Nomes amigáveis dos arquétipos (para exibição)
 */
export const ARCHETYPE_LABELS: Record<ArchetypeName, string> = {
  academico: 'Acadêmico',
  acolito: 'Acólito',
  combatente: 'Combatente',
  feiticeiro: 'Feiticeiro',
  ladino: 'Ladino',
  natural: 'Natural',
};

/**
 * Descrições dos arquétipos
 */
export const ARCHETYPE_DESCRIPTIONS: Record<ArchetypeName, string> = {
  academico:
    'O Acadêmico é um intelectual que usa a inteligência para resolver problemas e se especializar. Também pode ser extremamente versátil em vários assuntos.',
  acolito:
    "O Acólito faz uso de poder divino, geralmente 'pegando emprestado' energia de alguma divindade, seja ela negativa ou positiva. Sua fé e devoção devem ser as principais fontes de suas habilidades.",
  combatente:
    'O Combatente, como o nome sugere, se especializa em combates. Eles brilham tanto na ofensiva quanto na defesa, mas não têm tantas ferramentas que ajudem fora disso.',
  feiticeiro:
    'O Feiticeiro usa magia em forma de feitiços. Seus feitiços podem ser muito versáteis para diversas situações, frequentemente vistos como canhões de vidro frágeis e muito poderosos.',
  ladino:
    'O Ladino é ágil e sagaz, utilizando sua destreza e agilidade para sair de encrencas e resolver problemas. Versátil, um ladino pode se dar bem em qualquer situação adversa.',
  natural:
    'O Natural explora seu contato com a natureza, às vezes voltando para seu lado primal e animalesco, virando um com o meio ambiente.',
};

/**
 * PV por nível ganho para cada arquétipo
 * Fórmula: Base + Constituição
 */
export const ARCHETYPE_HP_PER_LEVEL: Record<ArchetypeName, number> = {
  combatente: 5,
  ladino: 4,
  natural: 3,
  acolito: 3,
  academico: 2,
  feiticeiro: 1,
};

/**
 * PP por nível ganho para cada arquétipo
 * Fórmula: Base + Presença
 * Nota: Valores baseados no contexto do sistema (não especificados nas regras básicas)
 */
export const ARCHETYPE_PP_PER_LEVEL: Record<ArchetypeName, number> = {
  feiticeiro: 3,
  acolito: 2,
  natural: 2,
  academico: 1,
  ladino: 1,
  combatente: 0,
};

/**
 * Atributo primário sugerido para cada arquétipo
 */
export const ARCHETYPE_PRIMARY_ATTRIBUTE: Record<
  ArchetypeName,
  'agilidade' | 'constituicao' | 'forca' | 'influencia' | 'mente' | 'presenca'
> = {
  academico: 'mente',
  acolito: 'presenca',
  combatente: 'constituicao',
  feiticeiro: 'presenca',
  ladino: 'agilidade',
  natural: 'presenca',
};

/**
 * Indica se o arquétipo é focado em magia
 */
export const ARCHETYPE_IS_SPELLCASTER: Record<ArchetypeName, boolean> = {
  feiticeiro: true,
  acolito: true,
  natural: true,
  academico: false,
  ladino: false,
  combatente: false,
};
