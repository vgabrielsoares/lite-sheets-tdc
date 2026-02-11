/**
 * System Symbols — Símbolos e Significados do Sistema
 *
 * Referência centralizada de todos os símbolos usados no
 * Tabuleiro do Caos RPG (livro v0.1.7).
 *
 * Usar esta constante em toda a UI para garantir consistência.
 */

/**
 * Informações de um símbolo do sistema
 */
export interface SystemSymbolInfo {
  /** O caractere/símbolo visual */
  symbol: string;
  /** Nome curto do símbolo */
  name: string;
  /** Descrição completa do significado */
  description: string;
  /** Exemplo de uso no sistema */
  example: string;
}

/**
 * Símbolos do sistema de resolução (dados e testes)
 */
export const SYMBOL_SUCCESS = '✶';
export const SYMBOL_FAILURE = '0✶';
export const SYMBOL_ACTION = '▶';
export const SYMBOL_REACTION = '↩';
export const SYMBOL_FREE_ACTION = '∆';

/**
 * Constante centralizada com todos os símbolos do sistema e seus significados.
 * Usada para referência in-app, tooltips e seção de ajuda.
 */
export const SYSTEM_SYMBOLS: readonly SystemSymbolInfo[] = [
  {
    symbol: SYMBOL_SUCCESS,
    name: 'Sucesso',
    description:
      'Indica um sucesso em uma rolagem. Resultado ≥ 6 no dado conta como 1 sucesso. Resultados = 1 cancelam 1 sucesso (mínimo 0✶). Geralmente acompanhado de um número, como 1✶, 2✶ ou 3✶.',
    example: '3✶ (três sucessos)',
  },
  {
    symbol: SYMBOL_FAILURE,
    name: 'Falha',
    description:
      'Indica que nenhum sucesso foi obtido em um teste. A rolagem resultou em zero sucessos após cancelamentos.',
    example: '0✶ (falha no teste)',
  },
  {
    symbol: SYMBOL_ACTION,
    name: 'Ação',
    description:
      'Indica o custo em ações de uma habilidade ou efeito. Em combate, cada turno concede ações: Turno Rápido (▶▶) ou Turno Lento (▶▶▶).',
    example: '▶▶ (custo de 2 ações)',
  },
  {
    symbol: SYMBOL_REACTION,
    name: 'Reação',
    description:
      'Indica o custo em reações. Cada criatura tem 1 reação por rodada, usada em resposta a gatilhos específicos (como defesa ativa).',
    example: '↩ (custo de 1 reação)',
  },
  {
    symbol: SYMBOL_FREE_ACTION,
    name: 'Ação Livre',
    description:
      'Indica uma ação livre. Não gastam recursos e podem ser usadas à vontade durante o turno, sem consumir ações ou reações.',
    example: '∆ (ação livre, sem custo)',
  },
] as const;

/**
 * Mapa rápido de símbolo → nome para tooltips e labels
 */
export const SYMBOL_NAME_MAP: Record<string, string> = Object.fromEntries(
  SYSTEM_SYMBOLS.map((s) => [s.symbol, s.name])
);

/**
 * Retorna a informação completa de um símbolo pelo caractere
 */
export function getSymbolInfo(symbol: string): SystemSymbolInfo | undefined {
  return SYSTEM_SYMBOLS.find((s) => s.symbol === symbol);
}
