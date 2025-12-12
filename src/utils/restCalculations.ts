/**
 * Utilitários para cálculos de descanso e recuperação
 *
 * Regras:
 * - Dormir: Nível × Constituição + Modificadores
 * - Relaxar (Meditar): Nível × Presença + Modificadores
 * - Total: (Dormir + Relaxar) × Multiplicador de Qualidade
 * - Arredondar para baixo
 */

/**
 * Qualidades de descanso disponíveis
 */
export type RestQuality =
  | 'precario' // 0.5x
  | 'normal' // 1x
  | 'confortavel' // 1.5x
  | 'abastado1' // 2.5x
  | 'abastado2' // 3x
  | 'abastado3' // 3.5x
  | 'abastado4' // 4x
  | 'abastado5'; // 4.5x

/**
 * Nomes amigáveis para as qualidades de descanso
 */
export const REST_QUALITY_LABELS: Record<RestQuality, string> = {
  precario: 'Precário',
  normal: 'Normal',
  confortavel: 'Confortável',
  abastado1: 'Abastado 1',
  abastado2: 'Abastado 2',
  abastado3: 'Abastado 3',
  abastado4: 'Abastado 4',
  abastado5: 'Abastado 5',
};

/**
 * Descrições das qualidades de descanso
 */
export const REST_QUALITY_DESCRIPTIONS: Record<RestQuality, string> = {
  precario: 'Descanso em condições ruins (chão duro, clima hostil, etc.)',
  normal:
    'Descanso em condições adequadas (acampamento simples, estalagem básica)',
  confortavel: 'Descanso em condições boas (cama macia, ambiente tranquilo)',
  abastado1: 'Descanso luxuoso nível 1 (quartos de hotel, serviço de quarto)',
  abastado2: 'Descanso luxuoso nível 2 (suíte premium, massagens)',
  abastado3: 'Descanso luxuoso nível 3 (suíte real, spa completo)',
  abastado4: 'Descanso luxuoso nível 4 (palácio, tratamento VIP)',
  abastado5: 'Descanso luxuoso nível 5 (o melhor possível, mimo total)',
};

/**
 * Retorna o multiplicador de qualidade do descanso
 */
export function getQualityMultiplier(quality: RestQuality): number {
  const multipliers: Record<RestQuality, number> = {
    precario: 0.5,
    normal: 1,
    confortavel: 1.5,
    abastado1: 2.5,
    abastado2: 3,
    abastado3: 3.5,
    abastado4: 4,
    abastado5: 4.5,
  };
  return multipliers[quality];
}

/**
 * Resultado do cálculo de recuperação em descanso
 */
export interface RestRecovery {
  /** Recuperação de PV (via Dormir) */
  pvRecovery: number;
  /** Recuperação de PP (via Relaxar) */
  ppRecovery: number;
  /** Recuperação base de Dormir (antes do multiplicador) */
  sleepBase: number;
  /** Recuperação base de Relaxar (antes do multiplicador) */
  meditateBase: number;
  /** Multiplicador aplicado */
  multiplier: number;
}

/**
 * Calcula recuperação de PV e PP durante um descanso
 *
 * @param level - Nível do personagem
 * @param constitution - Valor do atributo Constituição
 * @param presenca - Valor do atributo Presença
 * @param quality - Qualidade do descanso
 * @param useSleep - Se o personagem dormiu (padrão: true)
 * @param useMeditate - Se o personagem relaxou/meditou (padrão: true)
 * @param sleepModifiers - Modificadores adicionais para Dormir (padrão: 0)
 * @param meditateModifiers - Modificadores adicionais para Relaxar (padrão: 0)
 * @returns Objeto com recuperação de PV e PP e detalhes do cálculo
 */
export function calculateRestRecovery(
  level: number,
  constitution: number,
  presenca: number,
  quality: RestQuality = 'normal',
  useSleep: boolean = true,
  useMeditate: boolean = true,
  sleepModifiers: number = 0,
  meditateModifiers: number = 0
): RestRecovery {
  // Calcular recuperação base de Dormir (recupera PV)
  const sleepBase = useSleep ? level * constitution + sleepModifiers : 0;

  // Calcular recuperação base de Relaxar/Meditar (recupera PP)
  const meditateBase = useMeditate ? level * presenca + meditateModifiers : 0;

  // Aplicar multiplicador de qualidade
  const multiplier = getQualityMultiplier(quality);

  // Dormir recupera PV, Relaxar recupera PP (separadamente)
  const pvRecovery = Math.floor(sleepBase * multiplier);
  const ppRecovery = Math.floor(meditateBase * multiplier);

  return {
    pvRecovery,
    ppRecovery,
    sleepBase,
    meditateBase,
    multiplier,
  };
}

/**
 * Valida se os valores de entrada são válidos
 */
export function validateRestInputs(
  level: number,
  constitution: number,
  presenca: number
): { valid: boolean; error?: string } {
  if (level < 1) {
    return { valid: false, error: 'Nível deve ser maior que 0' };
  }

  if (constitution < 0) {
    return {
      valid: false,
      error: 'Constituição não pode ser negativa',
    };
  }

  if (presenca < 0) {
    return {
      valid: false,
      error: 'Presença não pode ser negativa',
    };
  }

  return { valid: true };
}
