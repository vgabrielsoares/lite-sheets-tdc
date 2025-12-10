/**
 * NotesTab - Tab de Anotações do Personagem
 *
 * Wrapper que integra o sistema de anotações à ficha de personagem,
 * conectando-se ao Redux para gerenciar as notas.
 */

'use client';

import React, { useCallback } from 'react';
import { Box } from '@mui/material';
import type { Character, Note } from '@/types';
import { NotesTab as NotesTabComponent } from '../notes';
import { useAppDispatch } from '@/store/hooks';
import { updateCharacter } from '@/features/characters/charactersSlice';

/**
 * Props do componente NotesTab
 */
export interface NotesTabProps {
  /** Dados completos do personagem */
  character: Character;
  /** Callback para atualizar personagem (não usado diretamente, mas mantido por consistência) */
  onUpdate?: (updates: Partial<Character>) => void;
  /** Callback para abrir nota na sidebar (do CharacterSheet) */
  onOpenNote?: (note: Note) => void;
}

/**
 * Componente NotesTab
 */
export const NotesTab: React.FC<NotesTabProps> = ({
  character,
  onOpenNote,
}) => {
  const dispatch = useAppDispatch();

  /**
   * Atualiza as notas do personagem
   */
  const handleUpdateNotes = useCallback(
    (updatedNotes: Note[]) => {
      dispatch(
        updateCharacter({
          id: character.id,
          updates: { notes: updatedNotes },
        })
      );
    },
    [character.id, dispatch]
  );

  return (
    <Box role="region" aria-labelledby="notes-tab" id="section-notes-list">
      <NotesTabComponent
        characterId={character.id}
        notes={character.notes}
        onUpdateNotes={handleUpdateNotes}
        onViewNote={
          onOpenNote
            ? (noteId) => {
                const note = character.notes?.find((n) => n.id === noteId);
                if (note) {
                  onOpenNote(note);
                }
              }
            : undefined
        }
      />
    </Box>
  );
};

export default NotesTab;
