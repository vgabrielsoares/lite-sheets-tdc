/**
 * @file Testes do Sistema de Combate
 * @description Issue 3.10 - Testes completos para o sistema de combate redesenhado
 *
 * Cobre: GA/PV, dado de vulnerabilidade, economia de ações,
 * pool de ataque, condições automáticas e parâmetros por tamanho.
 */

import {
  calculateVitality,
  applyDamageToGuardVitality,
  healGuard,
  healVitality,
  getEffectiveGAMax,
  determineCombatState,
  adjustGAOnPVCrossing,
  stepDownVulnerabilityDie,
  resetVulnerabilityDie,
  calculateRestGARecovery,
} from '../calculations';

import {
  calculateAttackPool,
  rollAttackPool,
  formatPoolResult,
  calculateDamage,
} from '../attackCalculations';

import type { Character } from '@/types/character';
import type {
  GuardPoints,
  VitalityPoints,
  VulnerabilityDieSize,
} from '@/types/combat';
import type { AttributeName } from '@/types/attributes';
import type { SkillName } from '@/types/skills';

// ═══════════════════════════════════════════════════
// GA/PV: Dano, Overflow, Recuperação
// ═══════════════════════════════════════════════════

describe('Sistema de Guarda (GA) e Vitalidade (PV)', () => {
  describe('calculateVitality', () => {
    it('PV = floor(GA_max / 3)', () => {
      expect(calculateVitality(15)).toBe(5); // 15/3 = 5
      expect(calculateVitality(16)).toBe(5); // floor(16/3) = 5
      expect(calculateVitality(17)).toBe(5); // floor(17/3) = 5
      expect(calculateVitality(18)).toBe(6); // 18/3 = 6
      expect(calculateVitality(30)).toBe(10); // 30/3 = 10
    });

    it('arredonda para baixo sempre', () => {
      expect(calculateVitality(7)).toBe(2); // floor(7/3) = 2
      expect(calculateVitality(10)).toBe(3); // floor(10/3) = 3
      expect(calculateVitality(1)).toBe(0); // floor(1/3) = 0
    });

    it('retorna 0 para GA_max = 0', () => {
      expect(calculateVitality(0)).toBe(0);
    });
  });

  describe('applyDamageToGuardVitality', () => {
    it('dano absorvido inteiramente pela GA', () => {
      const guard: GuardPoints = { current: 15, max: 15 };
      const vitality: VitalityPoints = { current: 5, max: 5 };

      const result = applyDamageToGuardVitality(guard, vitality, 10);

      expect(result.guard.current).toBe(5);
      expect(result.vitality.current).toBe(5);
    });

    it('overflow de GA vai para PV', () => {
      const guard: GuardPoints = { current: 5, max: 15 };
      const vitality: VitalityPoints = { current: 5, max: 5 };

      const result = applyDamageToGuardVitality(guard, vitality, 8);

      expect(result.guard.current).toBe(0);
      expect(result.vitality.current).toBe(2); // 5 - (8-5) = 2
    });

    it('ferimento direto: dano quando GA = 0 vai para PV', () => {
      const guard: GuardPoints = { current: 0, max: 15 };
      const vitality: VitalityPoints = { current: 5, max: 5 };

      const result = applyDamageToGuardVitality(guard, vitality, 3);

      expect(result.guard.current).toBe(0);
      expect(result.vitality.current).toBe(2);
    });

    it('ferimento crítico: PV chega a 0', () => {
      const guard: GuardPoints = { current: 0, max: 15 };
      const vitality: VitalityPoints = { current: 3, max: 5 };

      const result = applyDamageToGuardVitality(guard, vitality, 5);

      expect(result.guard.current).toBe(0);
      expect(result.vitality.current).toBe(0);
    });

    it('PV não fica negativo', () => {
      const guard: GuardPoints = { current: 0, max: 15 };
      const vitality: VitalityPoints = { current: 2, max: 5 };

      const result = applyDamageToGuardVitality(guard, vitality, 10);

      expect(result.vitality.current).toBe(0);
    });

    it('dano zero não muda nada', () => {
      const guard: GuardPoints = { current: 10, max: 15 };
      const vitality: VitalityPoints = { current: 5, max: 5 };

      const result = applyDamageToGuardVitality(guard, vitality, 0);

      expect(result.guard.current).toBe(10);
      expect(result.vitality.current).toBe(5);
    });
  });

  describe('healGuard', () => {
    it('recupera GA até o máximo', () => {
      const guard: GuardPoints = { current: 5, max: 15 };
      const result = healGuard(guard, 20);

      expect(result.current).toBe(15);
      expect(result.max).toBe(15);
    });

    it('recupera parcialmente', () => {
      const guard: GuardPoints = { current: 5, max: 15 };
      const result = healGuard(guard, 5);

      expect(result.current).toBe(10);
    });

    it('não excede o máximo', () => {
      const guard: GuardPoints = { current: 14, max: 15 };
      const result = healGuard(guard, 10);

      expect(result.current).toBe(15);
    });
  });

  describe('healVitality', () => {
    it('recupera PV com custo 5:1', () => {
      const vitality: VitalityPoints = { current: 3, max: 5 };
      const result = healVitality(vitality, 10);

      expect(result.vitality.current).toBe(5); // 10/5=2 PV recuperados
      expect(result.remainingRecovery).toBe(0);
    });

    it('não excede PV máximo', () => {
      const vitality: VitalityPoints = { current: 4, max: 5 };
      const result = healVitality(vitality, 20);

      expect(result.vitality.current).toBe(5);
    });

    it('retorna cura restante quando PV está cheio', () => {
      const vitality: VitalityPoints = { current: 5, max: 5 };
      const result = healVitality(vitality, 10);

      expect(result.vitality.current).toBe(5);
      expect(result.remainingRecovery).toBe(10);
    });
  });

  describe('getEffectiveGAMax', () => {
    it('retorna GA_max completo quando PV > 0', () => {
      expect(getEffectiveGAMax(15, 1)).toBe(15);
      expect(getEffectiveGAMax(15, 3)).toBe(15);
      expect(getEffectiveGAMax(15, 5)).toBe(15);
    });

    it('reduz GA_max à metade quando PV = 0', () => {
      expect(getEffectiveGAMax(15, 0)).toBe(7); // roundDown(15/2) = 7
      expect(getEffectiveGAMax(20, 0)).toBe(10);
    });

    it('reduz GA_max à metade quando PV < 0', () => {
      expect(getEffectiveGAMax(15, -1)).toBe(7);
      expect(getEffectiveGAMax(15, -5)).toBe(7);
    });
  });

  describe('determineCombatState', () => {
    it('retorna "normal" com GA e PV cheios', () => {
      expect(determineCombatState(15, 15, 5, 5)).toBe('normal');
    });

    it('retorna "normal" quando GA ≤ GA_max/2 mas PV cheio', () => {
      expect(determineCombatState(7, 15, 5, 5)).toBe('normal');
    });

    it('retorna "ferimento-direto" quando PV < PV_max', () => {
      expect(determineCombatState(0, 15, 3, 5)).toBe('ferimento-direto');
    });

    it('retorna "ferimento-critico" quando PV = 0', () => {
      expect(determineCombatState(0, 15, 0, 5)).toBe('ferimento-critico');
    });
  });

  describe('adjustGAOnPVCrossing', () => {
    describe('quando PV chega a 0 (pvWasZero=false, pvIsZero=true)', () => {
      it('reduz GA atual à metade se estiver acima', () => {
        expect(adjustGAOnPVCrossing(15, 20, false, true)).toBe(10); // halfMax = 10
        expect(adjustGAOnPVCrossing(12, 20, false, true)).toBe(10);
      });

      it('mantém GA atual se já estiver na metade ou abaixo', () => {
        expect(adjustGAOnPVCrossing(10, 20, false, true)).toBe(10);
        expect(adjustGAOnPVCrossing(8, 20, false, true)).toBe(8);
        expect(adjustGAOnPVCrossing(5, 20, false, true)).toBe(5);
      });
    });

    describe('quando PV sai de 0 (pvWasZero=true, pvIsZero=false)', () => {
      it('restaura GA atual para pelo menos a metade se estiver abaixo', () => {
        expect(adjustGAOnPVCrossing(5, 20, true, false)).toBe(10); // halfMax = 10
        expect(adjustGAOnPVCrossing(0, 20, true, false)).toBe(10);
        expect(adjustGAOnPVCrossing(8, 20, true, false)).toBe(10);
      });

      it('mantém GA atual se já estiver na metade ou acima', () => {
        expect(adjustGAOnPVCrossing(10, 20, true, false)).toBe(10);
        expect(adjustGAOnPVCrossing(15, 20, true, false)).toBe(15);
        expect(adjustGAOnPVCrossing(20, 20, true, false)).toBe(20);
      });
    });

    describe('quando não há mudança de estado (ambos false ou ambos true)', () => {
      it('mantém GA atual inalterado quando ambos false', () => {
        expect(adjustGAOnPVCrossing(15, 20, false, false)).toBe(15);
        expect(adjustGAOnPVCrossing(5, 20, false, false)).toBe(5);
      });

      it('mantém GA atual inalterado quando ambos true', () => {
        expect(adjustGAOnPVCrossing(8, 20, true, true)).toBe(8);
        expect(adjustGAOnPVCrossing(3, 20, true, true)).toBe(3);
      });
    });

    describe('arredondamento', () => {
      it('usa roundDown para calcular metade', () => {
        // 15 / 2 = 7.5 → roundDown = 7
        expect(adjustGAOnPVCrossing(10, 15, false, true)).toBe(7);
        expect(adjustGAOnPVCrossing(5, 15, true, false)).toBe(7);
      });
    });
  });
});

// ═══════════════════════════════════════════════════
// Dado de Vulnerabilidade
// ═══════════════════════════════════════════════════

describe('Dado de Vulnerabilidade', () => {
  describe('stepDownVulnerabilityDie', () => {
    it('d20 → d12', () => {
      expect(stepDownVulnerabilityDie('d20')).toBe('d12');
    });

    it('d12 → d10', () => {
      expect(stepDownVulnerabilityDie('d12')).toBe('d10');
    });

    it('d10 → d8', () => {
      expect(stepDownVulnerabilityDie('d10')).toBe('d8');
    });

    it('d8 → d6', () => {
      expect(stepDownVulnerabilityDie('d8')).toBe('d6');
    });

    it('d6 → d4', () => {
      expect(stepDownVulnerabilityDie('d6')).toBe('d4');
    });

    it('d4 permanece d4 (mínimo)', () => {
      expect(stepDownVulnerabilityDie('d4')).toBe('d4');
    });
  });

  describe('resetVulnerabilityDie', () => {
    it('retorna d20 (valor inicial)', () => {
      const result = resetVulnerabilityDie();
      expect(result).toBe('d20');
    });
  });
});

// ═══════════════════════════════════════════════════
// Pool de Ataque
// ═══════════════════════════════════════════════════

describe('Pool de Ataque', () => {
  describe('rollAttackPool', () => {
    it('conta sucessos (resultados ≥ 6)', () => {
      // Testar com um pool conhecido
      const result = rollAttackPool({
        diceCount: 5,
        dieSize: 'd6',
        isPenaltyRoll: false,
        formula: '5d6',
        attribute: 'corpo' as AttributeName,
        skillName: 'luta' as SkillName,
        useName: 'Atacar',
      });

      expect(result.rolls).toHaveLength(5);
      expect(result.rawSuccesses).toBeGreaterThanOrEqual(0);
      expect(result.cancellations).toBeGreaterThanOrEqual(0);
      expect(result.netSuccesses).toBeGreaterThanOrEqual(0);
      // netSuccesses = rawSuccesses - cancellations, mínimo 0
      expect(result.netSuccesses).toBe(
        Math.max(0, result.rawSuccesses - result.cancellations)
      );
    });

    it('resultado 1 cancela um sucesso', () => {
      // We can't control random rolls, but we can verify the formula
      const result = rollAttackPool({
        diceCount: 100,
        dieSize: 'd6',
        isPenaltyRoll: false,
        formula: '100d6',
        attribute: 'corpo' as AttributeName,
        skillName: 'luta' as SkillName,
        useName: 'Atacar',
      });

      // With 100 dice, we should statistically get both 1s and 6s
      const ones = result.rolls.filter((r) => r === 1).length;
      const sixes = result.rolls.filter((r) => r >= 6).length;

      expect(result.rawSuccesses).toBe(sixes);
      expect(result.cancellations).toBe(ones);
    });

    it('pool com 0 dados usa penalidade (2d take lowest)', () => {
      const pool = {
        diceCount: 0,
        dieSize: 'd6' as const,
        isPenaltyRoll: true,
        formula: '2d6 (menor)',
        attribute: 'corpo' as AttributeName,
        skillName: 'luta' as SkillName,
        useName: 'Atacar',
      };

      const result = rollAttackPool(pool);
      // Penalty roll should still produce valid results
      expect(result.netSuccesses).toBeGreaterThanOrEqual(0);
    });

    it('máximo 8 dados por teste', () => {
      // This is a constraint on calculateAttackPool, not rollAttackPool
      // But verify that results are valid
      const result = rollAttackPool({
        diceCount: 8,
        dieSize: 'd8',
        isPenaltyRoll: false,
        formula: '8d8',
        attribute: 'corpo' as AttributeName,
        skillName: 'luta' as SkillName,
        useName: 'Atacar',
      });

      expect(result.rolls).toHaveLength(8);
    });
  });

  describe('formatPoolResult', () => {
    it('formata resultado com sucesso', () => {
      const result = formatPoolResult({
        rolls: [6, 3, 6, 1, 5],
        rawSuccesses: 2,
        cancellations: 1,
        netSuccesses: 1,
        dieSize: 'd6',
        isPenaltyRoll: false,
      });

      expect(result).toContain('1✶');
    });

    it('formata resultado com zero sucessos', () => {
      const result = formatPoolResult({
        rolls: [2, 3, 4, 5],
        rawSuccesses: 0,
        cancellations: 0,
        netSuccesses: 0,
        dieSize: 'd6',
        isPenaltyRoll: false,
      });

      expect(result).toContain('0✶');
    });
  });

  describe('calculateDamage', () => {
    it('calcula dano somando dados', () => {
      const result = calculateDamage({
        baseDamageRoll: { quantity: 2, type: 'd6', modifier: 3 },
      });

      expect(result.totalDamage).toBeGreaterThanOrEqual(5); // 2×1+3 = 5 min
      expect(result.totalDamage).toBeLessThanOrEqual(15); // 2×6+3 = 15 max
      expect(result.rolls).toHaveLength(2);
    });

    it('dano mínimo com 0 modificador', () => {
      const result = calculateDamage({
        baseDamageRoll: { quantity: 1, type: 'd6', modifier: 0 },
      });

      expect(result.totalDamage).toBeGreaterThanOrEqual(1);
      expect(result.totalDamage).toBeLessThanOrEqual(6);
    });
  });
});

// ═══════════════════════════════════════════════════
// Condições Automáticas
// ═══════════════════════════════════════════════════

import {
  shouldConditionBeActive,
  getConditionsByCategory,
  CONDITIONS,
  CONDITION_MAP,
  CONDITIONS_BY_CATEGORY,
  getStackableConditions,
} from '@/constants/conditions';

describe('Condições', () => {
  describe('shouldConditionBeActive', () => {
    it('Avariado quando GA ≤ GA_max/2', () => {
      expect(
        shouldConditionBeActive('avariado', {
          gaCurrent: 7,
          gaMax: 15,
          pvCurrent: 5,
          pvMax: 5,
          ppCurrent: 2,
        })
      ).toBe(true);
    });

    it('Avariado exatamente na metade (7 de 15 → floor(15/2)=7)', () => {
      expect(
        shouldConditionBeActive('avariado', {
          gaCurrent: 7,
          gaMax: 15,
          pvCurrent: 5,
          pvMax: 5,
          ppCurrent: 2,
        })
      ).toBe(true);
    });

    it('não Avariado quando GA > GA_max/2', () => {
      expect(
        shouldConditionBeActive('avariado', {
          gaCurrent: 8,
          gaMax: 15,
          pvCurrent: 5,
          pvMax: 5,
          ppCurrent: 2,
        })
      ).toBe(false);
    });

    it('Machucado quando PV < PV_max', () => {
      expect(
        shouldConditionBeActive('machucado', {
          gaCurrent: 0,
          gaMax: 15,
          pvCurrent: 4,
          pvMax: 5,
          ppCurrent: 2,
        })
      ).toBe(true);
    });

    it('não Machucado quando PV = PV_max', () => {
      expect(
        shouldConditionBeActive('machucado', {
          gaCurrent: 0,
          gaMax: 15,
          pvCurrent: 5,
          pvMax: 5,
          ppCurrent: 2,
        })
      ).toBe(false);
    });

    it('Esgotado quando PP = 0', () => {
      expect(
        shouldConditionBeActive('esgotado', {
          gaCurrent: 15,
          gaMax: 15,
          pvCurrent: 5,
          pvMax: 5,
          ppCurrent: 0,
        })
      ).toBe(true);
    });

    it('não Esgotado quando PP > 0', () => {
      expect(
        shouldConditionBeActive('esgotado', {
          gaCurrent: 15,
          gaMax: 15,
          pvCurrent: 5,
          pvMax: 5,
          ppCurrent: 1,
        })
      ).toBe(false);
    });

    it('retorna false para condições sem auto-trigger', () => {
      expect(
        shouldConditionBeActive('cego', {
          gaCurrent: 0,
          gaMax: 15,
          pvCurrent: 0,
          pvMax: 5,
          ppCurrent: 0,
        })
      ).toBe(false);
    });
  });

  describe('categorias de condições', () => {
    it('4 categorias: corporal, mental, sensorial, espiritual', () => {
      expect(Object.keys(CONDITIONS_BY_CATEGORY)).toHaveLength(4);
      expect(CONDITIONS_BY_CATEGORY.corporal.length).toBeGreaterThan(0);
      expect(CONDITIONS_BY_CATEGORY.mental.length).toBeGreaterThan(0);
      expect(CONDITIONS_BY_CATEGORY.sensorial.length).toBeGreaterThan(0);
      expect(CONDITIONS_BY_CATEGORY.espiritual.length).toBeGreaterThan(0);
    });

    it('corporais inclui Abatido, Agarrado, Avariado, Machucado, Morrendo', () => {
      const corpIds = CONDITIONS_BY_CATEGORY.corporal.map((c) => c.id);
      expect(corpIds).toContain('abatido');
      expect(corpIds).toContain('agarrado');
      expect(corpIds).toContain('avariado');
      expect(corpIds).toContain('machucado');
      expect(corpIds).toContain('morrendo');
    });

    it('espirituais inclui Desconexo, Dissonante, Esgotado, Manipulado', () => {
      const espIds = CONDITIONS_BY_CATEGORY.espiritual.map((c) => c.id);
      expect(espIds).toContain('desconexo');
      expect(espIds).toContain('dissonante');
      expect(espIds).toContain('esgotado');
      expect(espIds).toContain('manipulado');
    });

    it('mentais inclui Abalado, Amedrontado, Incapacitado', () => {
      const menIds = CONDITIONS_BY_CATEGORY.mental.map((c) => c.id);
      expect(menIds).toContain('abalado');
      expect(menIds).toContain('amedrontado');
      expect(menIds).toContain('incapacitado');
    });

    it('sensoriais inclui Atordoado, Cego, Vulnerável', () => {
      const senIds = CONDITIONS_BY_CATEGORY.sensorial.map((c) => c.id);
      expect(senIds).toContain('atordoado');
      expect(senIds).toContain('cego');
      expect(senIds).toContain('vulneravel');
    });

    it('todas as condições pertencem a uma categoria', () => {
      const allCategorized = [
        ...CONDITIONS_BY_CATEGORY.corporal,
        ...CONDITIONS_BY_CATEGORY.mental,
        ...CONDITIONS_BY_CATEGORY.sensorial,
        ...CONDITIONS_BY_CATEGORY.espiritual,
      ];
      expect(allCategorized.length).toBe(CONDITIONS.length);
    });
  });

  describe('condições empilháveis', () => {
    it('Abalado é empilhável até 5', () => {
      const abalado = CONDITION_MAP['abalado'];
      expect(abalado.stackable).toBe(true);
      expect(abalado.maxStacks).toBe(5);
    });

    it('Dissonante é empilhável até 3', () => {
      const dissonante = CONDITION_MAP['dissonante'];
      expect(dissonante.stackable).toBe(true);
      expect(dissonante.maxStacks).toBe(3);
    });

    it('Exausto é empilhável até 3', () => {
      const exausto = CONDITION_MAP['exausto'];
      expect(exausto.stackable).toBe(true);
      expect(exausto.maxStacks).toBe(3);
    });

    it('condições simples não são empilháveis', () => {
      const cego = CONDITION_MAP['cego'];
      expect(cego.stackable).toBeUndefined();
    });
  });

  describe('condições implicadas', () => {
    it('Morrendo implica Caído e Incapacitado', () => {
      const morrendo = CONDITION_MAP['morrendo'];
      expect(morrendo.impliedConditions).toContain('caido');
      expect(morrendo.impliedConditions).toContain('incapacitado');
    });

    it('Manipulado implica Enfeitiçado', () => {
      const manipulado = CONDITION_MAP['manipulado'];
      expect(manipulado.impliedConditions).toContain('enfeiticado');
    });

    it('Inconsciente implica Incapacitado', () => {
      const inconsciente = CONDITION_MAP['inconsciente'];
      expect(inconsciente.impliedConditions).toContain('incapacitado');
    });
  });

  describe('penalidades de dados', () => {
    it('Esgotado: -1d em Corpo e Instinto', () => {
      const esgotado = CONDITION_MAP['esgotado'];
      expect(esgotado.dicePenalty?.targets).toContain('corpo');
      expect(esgotado.dicePenalty?.targets).toContain('instinto');
      expect(esgotado.dicePenalty?.modifier).toBe(-1);
    });

    it('Dissonante: -1d em Instinto e Essência (escala)', () => {
      const dissonante = CONDITION_MAP['dissonante'];
      expect(dissonante.dicePenalty?.targets).toContain('instinto');
      expect(dissonante.dicePenalty?.targets).toContain('essencia');
      expect(dissonante.dicePenalty?.scalesWithStacks).toBe(true);
    });

    it('Perturbado: -1d em Influência e Mente', () => {
      const perturbado = CONDITION_MAP['perturbado'];
      expect(perturbado.dicePenalty?.targets).toContain('influencia');
      expect(perturbado.dicePenalty?.targets).toContain('mente');
    });
  });
});

// ═══════════════════════════════════════════════════
// Parâmetros por Tamanho
// ═══════════════════════════════════════════════════

import {
  getGuardModifierForSize,
  getSkillDiceModifierForSize,
  getCombatManeuverModifier,
  getTrackingModifier,
  getCarryingCapacityModifier,
} from '@/constants/creatureSizes';

describe('Parâmetros por Tamanho', () => {
  describe('modificador de Guarda por tamanho', () => {
    it('Minúsculo: +3 GA', () => {
      expect(getGuardModifierForSize('minusculo')).toBe(3);
    });

    it('Pequeno: +2 GA', () => {
      expect(getGuardModifierForSize('pequeno')).toBe(2);
    });

    it('Médio: 0 GA', () => {
      expect(getGuardModifierForSize('medio')).toBe(0);
    });

    it('Grande: -2 GA', () => {
      expect(getGuardModifierForSize('grande')).toBe(-2);
    });

    it('Enorme-1: -3 GA', () => {
      expect(getGuardModifierForSize('enorme-1')).toBe(-3);
    });

    it('Colossal-1: -6 GA', () => {
      expect(getGuardModifierForSize('colossal-1')).toBe(-6);
    });
  });

  describe('modificadores de habilidade em dados', () => {
    it('Minúsculo: +2d Acrobacia, -2d Atletismo', () => {
      expect(getSkillDiceModifierForSize('minusculo', 'acrobacia')).toBe(2);
      expect(getSkillDiceModifierForSize('minusculo', 'atletismo')).toBe(-2);
    });

    it('Pequeno: +1d Furtividade, -1d Tenacidade', () => {
      expect(getSkillDiceModifierForSize('pequeno', 'furtividade')).toBe(1);
      expect(getSkillDiceModifierForSize('pequeno', 'tenacidade')).toBe(-1);
    });

    it('Médio: 0 em todas', () => {
      expect(getSkillDiceModifierForSize('medio', 'acrobacia')).toBe(0);
      expect(getSkillDiceModifierForSize('medio', 'atletismo')).toBe(0);
      expect(getSkillDiceModifierForSize('medio', 'furtividade')).toBe(0);
      expect(getSkillDiceModifierForSize('medio', 'reflexo')).toBe(0);
      expect(getSkillDiceModifierForSize('medio', 'tenacidade')).toBe(0);
    });

    it('Grande: -1d Acrobacia, +1d Atletismo', () => {
      expect(getSkillDiceModifierForSize('grande', 'acrobacia')).toBe(-1);
      expect(getSkillDiceModifierForSize('grande', 'atletismo')).toBe(1);
    });

    it('Colossal-3: -3d Reflexo, +3d Tenacidade', () => {
      expect(getSkillDiceModifierForSize('colossal-3', 'reflexo')).toBe(-3);
      expect(getSkillDiceModifierForSize('colossal-3', 'tenacidade')).toBe(3);
    });
  });

  describe('manobras de combate e rastreio', () => {
    it('Minúsculo: -2d manobras, -2d rastreio', () => {
      expect(getCombatManeuverModifier('minusculo')).toBe(-2);
      expect(getTrackingModifier('minusculo')).toBe(-2);
    });

    it('Grande: +1d manobras, +1d rastreio', () => {
      expect(getCombatManeuverModifier('grande')).toBe(1);
      expect(getTrackingModifier('grande')).toBe(1);
    });

    it('Colossal-1: +3d manobras, +3d rastreio', () => {
      expect(getCombatManeuverModifier('colossal-1')).toBe(3);
      expect(getTrackingModifier('colossal-1')).toBe(3);
    });
  });

  describe('capacidade de carga', () => {
    it('Minúsculo: -5 espaços', () => {
      expect(getCarryingCapacityModifier('minusculo')).toBe(-5);
    });

    it('Médio: 0 espaços', () => {
      expect(getCarryingCapacityModifier('medio')).toBe(0);
    });

    it('Colossal-1: +10 espaços', () => {
      expect(getCarryingCapacityModifier('colossal-1')).toBe(10);
    });
  });
});

// ═══════════════════════════════════════════════════
// Economia de Ações
// ═══════════════════════════════════════════════════

import {
  COMBAT_ACTIONS,
  ALL_COMBAT_ACTIONS,
  formatActionCost,
  COST_TYPE_SYMBOLS,
} from '@/constants/combatActions';

describe('Economia de Ações', () => {
  describe('tipos de turno', () => {
    it('ações de combate existem em 3 categorias', () => {
      expect(COMBAT_ACTIONS.acoes.length).toBeGreaterThan(0);
      expect(COMBAT_ACTIONS.reacoes.length).toBeGreaterThan(0);
      expect(COMBAT_ACTIONS.livres.length).toBeGreaterThan(0);
    });

    it('total de ações cadastradas', () => {
      expect(ALL_COMBAT_ACTIONS.length).toBe(
        COMBAT_ACTIONS.acoes.length +
          COMBAT_ACTIONS.reacoes.length +
          COMBAT_ACTIONS.livres.length
      );
    });
  });

  describe('símbolos de custo', () => {
    it('usa ▶ para ação', () => {
      expect(COST_TYPE_SYMBOLS.acao).toBe('▶');
    });

    it('usa ↩ para reação', () => {
      expect(COST_TYPE_SYMBOLS.reacao).toBe('↩');
    });

    it('usa ∆ para livre', () => {
      expect(COST_TYPE_SYMBOLS.livre).toBe('∆');
    });
  });

  describe('formatActionCost', () => {
    it('formata custo de ação (1▶)', () => {
      const result = formatActionCost({
        name: 'Atacar',
        costType: 'acao',
        costAmount: 1,
        variableCost: false,
        description: 'Atacar',
      });
      expect(result).toContain('▶');
    });

    it('formata custo de reação (1↩)', () => {
      const result = formatActionCost({
        name: 'Reação',
        costType: 'reacao',
        costAmount: 1,
        variableCost: false,
        description: 'Reação',
      });
      expect(result).toContain('↩');
    });
  });
});

// ═══════════════════════════════════════════════════
// Recuperação em Descanso
// ═══════════════════════════════════════════════════

describe('Recuperação em Descanso', () => {
  describe('calculateRestGARecovery', () => {
    it('deve retornar um valor numérico válido', () => {
      const recovery = calculateRestGARecovery(15, 1);
      expect(typeof recovery).toBe('number');
      expect(recovery).toBeGreaterThanOrEqual(0);
    });
  });
});
