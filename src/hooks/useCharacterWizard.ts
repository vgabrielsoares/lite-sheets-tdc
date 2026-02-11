/**
 * useCharacterWizard - Hook para gerenciar o wizard de criação de personagem
 *
 * Gerencia o estado do wizard, navegação entre passos, persistência em localStorage
 * e validação antes da criação final do personagem.
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { addCharacter } from '@/features/characters/charactersSlice';
import { useNotifications } from './useNotifications';
import {
  WizardState,
  WizardStep,
  WizardValidationError,
  WIZARD_STEPS,
  createInitialWizardState,
} from '@/types/wizard';
import type { Character, AttributeName } from '@/types';

/** Prefixo para chave do localStorage */
const WIZARD_STORAGE_KEY_PREFIX = 'wizard-progress-';

/** Tempo de debounce para salvar no localStorage (ms) */
const SAVE_DEBOUNCE_MS = 500;

/**
 * Gera um UUID v4 simples para sessão do wizard
 */
function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Recupera o estado do wizard do localStorage
 */
function loadWizardState(): WizardState | null {
  if (typeof window === 'undefined') return null;

  // Procurar por qualquer sessão existente
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith(WIZARD_STORAGE_KEY_PREFIX)
  );

  if (keys.length === 0) return null;

  // Usar a sessão mais recente
  let latestState: WizardState | null = null;
  let latestTimestamp = 0;

  for (const key of keys) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const state = JSON.parse(stored) as WizardState;
        if (state.lastUpdated > latestTimestamp) {
          latestTimestamp = state.lastUpdated;
          latestState = state;
        }
      }
    } catch {
      // Ignorar erros de parsing
    }
  }

  return latestState;
}

/**
 * Salva o estado do wizard no localStorage
 */
function saveWizardState(state: WizardState): void {
  if (typeof window === 'undefined') return;
  const key = WIZARD_STORAGE_KEY_PREFIX + state.sessionId;
  localStorage.setItem(key, JSON.stringify(state));
}

/**
 * Remove o estado do wizard do localStorage
 */
function clearWizardState(sessionId: string): void {
  if (typeof window === 'undefined') return;
  const key = WIZARD_STORAGE_KEY_PREFIX + sessionId;
  localStorage.removeItem(key);
}

/**
 * Limpa todas as sessões antigas do wizard
 */
function clearAllWizardSessions(): void {
  if (typeof window === 'undefined') return;
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith(WIZARD_STORAGE_KEY_PREFIX)
  );
  for (const key of keys) {
    localStorage.removeItem(key);
  }
}

/**
 * Helper type para extrair chaves cujos valores são objetos
 */
type ObjectKeys<T> = {
  [K in keyof T]: T[K] extends object ? K : never;
}[keyof T];

/**
 * Chaves do WizardState que são objetos (para updateNestedState)
 */
export type WizardStateObjectKeys = ObjectKeys<WizardState>;

/**
 * Retorno do hook useCharacterWizard
 */
export interface UseCharacterWizardReturn {
  /** Estado atual do wizard */
  state: WizardState;
  /** Passo atual */
  currentStep: WizardStep;
  /** Índice do passo atual (0-8) */
  currentStepIndex: number;
  /** Total de passos */
  totalSteps: number;
  /** Se é o primeiro passo */
  isFirstStep: boolean;
  /** Se é o último passo */
  isLastStep: boolean;
  /** Passos visitados */
  visitedSteps: WizardStep[];
  /** Se o wizard foi carregado do localStorage */
  isRestored: boolean;

  // Navegação
  /** Ir para o próximo passo */
  goNext: () => void;
  /** Voltar para o passo anterior */
  goBack: () => void;
  /** Ir para um passo específico */
  goToStep: (step: WizardStep) => void;
  /** Verificar se pode ir para um passo */
  canGoToStep: (step: WizardStep) => boolean;

  // Estado
  /** Atualizar parte do estado */
  updateState: <K extends keyof WizardState>(
    key: K,
    value: WizardState[K]
  ) => void;
  /** Atualizar estado aninhado - apenas para propriedades que são objetos */
  updateNestedState: <K extends WizardStateObjectKeys>(
    key: K,
    partial: Partial<WizardState[K]>
  ) => void;

  // Ações
  /** Reiniciar o wizard (limpa progresso) */
  resetWizard: () => void;
  /** Validar o wizard completo */
  getValidationErrors: () => WizardValidationError[];
  /** Criar o personagem final */
  commitCharacter: () => Promise<void>;
  /** Cancelar e voltar para a lista de personagens */
  cancel: () => void;

  // Estados de UI
  /** Se está salvando/criando */
  isLoading: boolean;
  /** Mensagem de erro */
  error: string | null;
}

/**
 * Hook para gerenciar o wizard de criação de personagem
 */
export function useCharacterWizard(): UseCharacterWizardReturn {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showSuccess, showError, showWarning } = useNotifications();

  // Estado do wizard
  const [state, setState] = useState<WizardState>(() => {
    const initial = createInitialWizardState();
    initial.sessionId = generateSessionId();
    return initial;
  });
  const [isRestored, setIsRestored] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar estado do localStorage na inicialização
  useEffect(() => {
    const savedState = loadWizardState();
    if (savedState) {
      setState(savedState);
      setIsRestored(true);
      showWarning('Progresso anterior restaurado');
    }
  }, [showWarning]);

  // Salvar estado no localStorage quando mudar (com debounce)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const stateToSave = { ...state, lastUpdated: Date.now() };
      saveWizardState(stateToSave);
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [state]);

  // Índice e informações do passo atual
  const currentStepIndex = useMemo(
    () => WIZARD_STEPS.indexOf(state.currentStep),
    [state.currentStep]
  );

  const totalSteps = WIZARD_STEPS.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  /**
   * Ir para o próximo passo
   */
  const goNext = useCallback(() => {
    if (isLastStep) return;

    const nextStep = WIZARD_STEPS[currentStepIndex + 1];
    setState((prev) => ({
      ...prev,
      currentStep: nextStep,
      visitedSteps: prev.visitedSteps.includes(nextStep)
        ? prev.visitedSteps
        : [...prev.visitedSteps, nextStep],
    }));
  }, [currentStepIndex, isLastStep]);

  /**
   * Voltar para o passo anterior
   */
  const goBack = useCallback(() => {
    if (isFirstStep) return;

    const prevStep = WIZARD_STEPS[currentStepIndex - 1];
    setState((prev) => ({
      ...prev,
      currentStep: prevStep,
    }));
  }, [currentStepIndex, isFirstStep]);

  /**
   * Ir para um passo específico
   */
  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
      visitedSteps: prev.visitedSteps.includes(step)
        ? prev.visitedSteps
        : [...prev.visitedSteps, step],
    }));
  }, []);

  /**
   * Verificar se pode ir para um passo
   * Pode ir para qualquer passo já visitado
   */
  const canGoToStep = useCallback(
    (step: WizardStep) => {
      return state.visitedSteps.includes(step);
    },
    [state.visitedSteps]
  );

  /**
   * Atualizar parte do estado
   */
  const updateState = useCallback(
    <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
      setState((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  /**
   * Atualizar estado aninhado (apenas para campos que são objetos)
   */
  const updateNestedState = useCallback(
    <K extends WizardStateObjectKeys>(
      key: K,
      partial: Partial<WizardState[K]>
    ) => {
      setState((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] as object),
          ...partial,
        },
      }));
    },
    []
  );

  /**
   * Reiniciar o wizard
   */
  const resetWizard = useCallback(() => {
    clearWizardState(state.sessionId);
    const newState = createInitialWizardState();
    newState.sessionId = generateSessionId();
    setState(newState);
    setIsRestored(false);
    setError(null);
  }, [state.sessionId]);

  /**
   * Validar o wizard completo
   */
  const getValidationErrors = useCallback((): WizardValidationError[] => {
    const errors: WizardValidationError[] = [];

    // Validar Step 1: Conceito
    if (!state.concept.characterName.trim()) {
      errors.push({
        step: 'concept',
        field: 'characterName',
        message: 'O nome do personagem é obrigatório',
        severity: 'error',
      });
    }

    // Validar Step 2: Origem
    if (!state.origin.name.trim()) {
      errors.push({
        step: 'origin',
        field: 'name',
        message: 'O nome da origem é obrigatório',
        severity: 'error',
      });
    }
    if (state.origin.skillProficiencies.length !== 2) {
      errors.push({
        step: 'origin',
        field: 'skillProficiencies',
        message: 'Exatamente 2 habilidades devem ser escolhidas para a origem',
        severity: 'error',
      });
    }

    // Validar Step 3: Linhagem
    if (!state.lineage.name.trim()) {
      errors.push({
        step: 'lineage',
        field: 'name',
        message: 'O nome da linhagem é obrigatório',
        severity: 'error',
      });
    }

    // Validar Step 4: Atributos
    // Calcular valores totais dos atributos para validação
    const ATTRIBUTE_LIST: AttributeName[] = [
      'agilidade',
      'corpo',
      'influencia',
      'mente',
      'essencia',
      'instinto',
    ];
    const ATTRIBUTE_DEFAULT = 1;

    const attributeTotals: Record<AttributeName, number> = {
      agilidade: 0,
      corpo: 0,
      influencia: 0,
      mente: 0,
      essencia: 0,
      instinto: 0,
    };
    let hasNegativeAttribute = false;
    let negativeAttributeNames: string[] = [];

    ATTRIBUTE_LIST.forEach((attr) => {
      const base = ATTRIBUTE_DEFAULT;
      const originMod =
        state.origin.attributeModifiers.find((m) => m.attribute === attr)
          ?.value ?? 0;
      const lineageMod =
        state.lineage.attributeModifiers.find((m) => m.attribute === attr)
          ?.value ?? 0;
      const freePoints = state.attributes.freePoints[attr];
      const reducedToZero =
        state.attributes.usingExtraPointOption &&
        state.attributes.reducedAttribute === attr;

      const effectiveBase = reducedToZero ? 0 : base;
      const total = effectiveBase + originMod + lineageMod + freePoints;

      attributeTotals[attr] = total;

      if (total < 0) {
        hasNegativeAttribute = true;
        // Formatar nome do atributo para exibição
        const attrLabel = attr.charAt(0).toUpperCase() + attr.slice(1);
        negativeAttributeNames.push(`${attrLabel} (${total})`);
      }
    });

    if (hasNegativeAttribute) {
      errors.push({
        step: 'attributes',
        field: 'freePoints',
        message: `Os seguintes atributos estão com valores negativos: ${negativeAttributeNames.join(', ')}. Atributos não podem ter valor menor que 0.`,
        severity: 'error',
      });
    }

    // Validar opção de ponto extra (reduzir atributo a 0)
    if (
      state.attributes.usingExtraPointOption &&
      !state.attributes.reducedAttribute
    ) {
      errors.push({
        step: 'attributes',
        field: 'reducedAttribute',
        message:
          'Você ativou a opção de ponto extra, mas não escolheu qual atributo reduzir para 0',
        severity: 'error',
      });
    }

    // Validar Step 5: Arquétipo
    if (!state.archetype.name) {
      errors.push({
        step: 'archetype',
        field: 'name',
        message: 'Um arquétipo deve ser escolhido',
        severity: 'error',
      });
    }

    // Validar Step 6: Habilidades
    if (!state.skills.signatureSkill) {
      errors.push({
        step: 'skills',
        field: 'signatureSkill',
        message: 'Uma habilidade de assinatura deve ser escolhida',
        severity: 'error',
      });
    }

    return errors;
  }, [state]);

  /**
   * Converte o estado do wizard para um Character completo
   */
  const convertToCharacter = useCallback(async (): Promise<Character> => {
    // Importação dinâmica para evitar dependências circulares
    const { convertWizardToCharacter } = await import(
      '@/utils/wizardToCharacter'
    );
    return convertWizardToCharacter(state);
  }, [state]);

  /**
   * Criar o personagem final
   */
  const commitCharacter = useCallback(async () => {
    // Validar antes de criar
    const errors = getValidationErrors();
    const blockingErrors = errors.filter((e) => e.severity === 'error');

    if (blockingErrors.length > 0) {
      const firstError = blockingErrors[0];
      setError(firstError.message);
      showError(`Erro: ${firstError.message}`);
      goToStep(firstError.step);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Converter wizard state para Character
      const newCharacter = await convertToCharacter();

      // Salvar no Redux/IndexedDB
      const savedCharacter = await dispatch(
        addCharacter(newCharacter)
      ).unwrap();

      // Limpar localStorage do wizard
      clearWizardState(state.sessionId);

      // Notificar sucesso
      showSuccess('Personagem criado com sucesso!');

      // Navegar para a ficha
      router.push(`/characters?id=${savedCharacter.id}`);
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
  }, [
    getValidationErrors,
    goToStep,
    convertToCharacter,
    dispatch,
    state.sessionId,
    showSuccess,
    showError,
    router,
  ]);

  /**
   * Cancelar e voltar para a lista de personagens
   */
  const cancel = useCallback(() => {
    router.push('/');
  }, [router]);

  return {
    state,
    currentStep: state.currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    visitedSteps: state.visitedSteps,
    isRestored,

    goNext,
    goBack,
    goToStep,
    canGoToStep,

    updateState,
    updateNestedState,

    resetWizard,
    getValidationErrors,
    commitCharacter,
    cancel,

    isLoading,
    error,
  };
}
