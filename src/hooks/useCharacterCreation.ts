import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { addCharacter } from '@/features/characters/charactersSlice';
import { createDefaultCharacter } from '@/utils/characterFactory';
import { useNotifications } from './useNotifications';
import type { Character } from '@/types';

/**
 * Interface para dados do formulário de criação de personagem
 */
export interface CharacterFormData {
  name: string;
  playerName?: string;
}

/**
 * Interface de retorno do hook useCharacterCreation
 */
export interface UseCharacterCreationReturn {
  /** Se está processando a criação */
  isLoading: boolean;
  /** Mensagem de erro, se houver */
  error: string | null;
  /** Personagem criado (disponível após sucesso) */
  createdCharacter: Character | null;
  /** Função para criar o personagem */
  createCharacter: (data: CharacterFormData) => Promise<void>;
  /** Função para limpar o erro */
  clearError: () => void;
  /** Função para cancelar e voltar à listagem */
  cancel: () => void;
}

/**
 * Hook customizado para gerenciar a criação de personagens
 *
 * Encapsula toda a lógica de:
 * - Validação de dados
 * - Criação do personagem com valores padrão
 * - Salvamento no Redux store (que sincroniza com IndexedDB)
 * - Navegação após sucesso
 * - Gerenciamento de estado de loading e erro
 *
 * @example
 * ```tsx
 * const { createCharacter, isLoading, error } = useCharacterCreation();
 *
 * const handleSubmit = async (data: CharacterFormData) => {
 *   await createCharacter(data);
 *   // Redireciona automaticamente após sucesso
 * };
 * ```
 */
export function useCharacterCreation(): UseCharacterCreationReturn {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCharacter, setCreatedCharacter] = useState<Character | null>(
    null
  );

  /**
   * Valida os dados do formulário
   * @returns mensagem de erro ou null se válido
   */
  const validateFormData = useCallback(
    (data: CharacterFormData): string | null => {
      if (!data.name || !data.name.trim()) {
        return 'O nome do personagem é obrigatório';
      }

      if (data.name.trim().length < 2) {
        return 'O nome do personagem deve ter pelo menos 2 caracteres';
      }

      if (data.name.trim().length > 100) {
        return 'O nome do personagem não pode ter mais de 100 caracteres';
      }

      return null;
    },
    []
  );

  /**
   * Cria um novo personagem com valores padrão
   */
  const createCharacter = useCallback(
    async (data: CharacterFormData) => {
      // Limpar erro anterior
      setError(null);

      // Validar dados
      const validationError = validateFormData(data);
      if (validationError) {
        setError(validationError);
        showError(validationError);
        return;
      }

      setIsLoading(true);

      try {
        // Criar personagem com valores padrão de nível 1
        const newCharacter = createDefaultCharacter({
          name: data.name.trim(),
          playerName: data.playerName?.trim() || undefined,
        });

        // Adicionar ao store Redux (que sincroniza com IndexedDB via middleware)
        dispatch(addCharacter(newCharacter));

        // Salvar personagem criado
        setCreatedCharacter(newCharacter);

        // Exibir notificação de sucesso
        showSuccess('Ficha criada com sucesso!');

        // Pequeno delay para garantir que o estado foi atualizado
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Redirecionar para a visualização da ficha criada
        router.push(`/characters/${newCharacter.id}`);
      } catch (err) {
        console.error('Erro ao criar personagem:', err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erro ao criar personagem. Tente novamente.';

        setError(errorMessage);
        showError(errorMessage);
        setIsLoading(false);
      }
    },
    [dispatch, router, validateFormData, showSuccess, showError]
  );

  /**
   * Limpa a mensagem de erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Cancela a criação e volta para a listagem
   */
  const cancel = useCallback(() => {
    router.push('/');
  }, [router]);

  return {
    isLoading,
    error,
    createdCharacter,
    createCharacter,
    clearError,
    cancel,
  };
}
