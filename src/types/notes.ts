/**
 * Notes System Types - Tipos para o Sistema de Anotações
 *
 * Este arquivo contém tipos específicos para o sistema de anotações do personagem.
 */

/**
 * Campos disponíveis para ordenação de notas
 */
export type NotesSortField = 'createdAt' | 'updatedAt' | 'title';

/**
 * Direção de ordenação
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Filtros e ordenação para listagem de notas
 */
export interface NotesFilter {
  /** Campo usado para ordenação */
  sortBy: NotesSortField;
  /** Direção da ordenação */
  sortOrder: SortOrder;
  /** Filtro por categoria */
  category?: string;
  /** Filtro por tags (OR - se a nota contém alguma dessas tags) */
  tags?: string[];
  /** Filtro de busca textual (busca em título e conteúdo) */
  searchTerm?: string;
  /** Mostrar apenas notas fixadas */
  pinnedOnly?: boolean;
}

/**
 * Estado padrão dos filtros
 */
export const DEFAULT_NOTES_FILTER: NotesFilter = {
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  pinnedOnly: false,
};
