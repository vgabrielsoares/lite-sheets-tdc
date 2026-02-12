/**
 * Testes para attackCalculations.ts
 *
 * Testa cálculos de ataque, críticos, raspão e dano
 */

import {
  calculateAttackOutcome,
  calculateAttackDamage,
  formatAttackOutcome,
  getAttackOutcomeColor,
  calculateAttackRoll,
} from '../attackCalculations';
import type { CriticalDamageConfig } from '../attackCalculations';
import type { Character, Skill } from '@/types';

// Helper para criar um personagem mockado simples
const createMockCharacter = (
  level: number,
  attributeValue: number,
  skillName: string,
  skillConfig: Partial<Skill>
): Character => {
  const fullSkill: Skill = {
    name: skillName as any,
    keyAttribute: 'corpo',
    proficiencyLevel: 'versado',
    isSignature: false,
    modifiers: [],
    ...skillConfig,
  };

  return {
    id: 'test-id',
    name: 'Test Character',
    level,
    attributes: {
      agilidade: attributeValue,
      corpo: attributeValue,
      influencia: attributeValue,
      mente: attributeValue,
      essencia: attributeValue,
      instinto: attributeValue,
    },
    skills: {
      [skillName]: fullSkill,
    } as any,
    signatureSkill: skillName as any,
    skillProficiencyBonusSlots: 0,
    pv: { max: 15, current: 15, temporary: 0 },
    pp: { max: 2, current: 2, temporary: 0 },
    defense: { base: 15, bonus: 0, notes: '' },
    movement: { walking: 6, bonus: 0, notes: '' },
    senses: {
      sight: { range: 'Normal', notes: '' },
      hearing: { range: 'Normal', notes: '' },
      other: [],
    },
    size: 'medium',
    proficiencies: { weapons: ['Armas Simples'], armor: [], tools: [] },
    languages: ['Comum'],
    extraLanguagesModifier: 0,
    luck: 'normal',
    crafts: [],
    inventory: {
      currency: { cobre: 0, prata: 0, ouro: 10, platina: 0 },
      items: [],
      carryCapacity: { current: 0, max: 0 },
    },
    traits: {
      lineage: undefined,
      origin: undefined,
      archetype: undefined,
      personalityTraits: '',
      ideals: '',
      bonds: '',
      flaws: '',
    },
    archetypes: [],
    classes: [],
    combat: {
      attacks: [],
      conditions: [],
      hp: { max: 15, current: 15, temporary: 0 },
      pp: { max: 2, current: 2, temporary: 0 },
      state: 'normal',
      dyingState: { isDying: false, currentRounds: 0, maxRounds: 3 },
      actionEconomy: {
        majorAction: true,
        minorAction1: true,
        minorAction2: true,
        reaction: true,
        defensiveReaction: true,
      },
      defense: {
        base: 15,
        armorBonus: 0,
        shieldBonus: 0,
        otherBonuses: [],
        total: 15,
      },
      ppLimit: { base: 2, modifiers: [], total: 2 },
      savingThrows: [],
      resistances: {
        damageReduction: [],
        damageResistances: [],
        damageImmunities: [],
        damageVulnerabilities: [],
        conditionImmunities: [],
      },
      initiative: { modifier: 0 },
      penalties: {
        defensePenalty: 0,
        savingThrowPenalties: {
          determinacao: 0,
          reflexo: 0,
          sintonia: 0,
          tenacidade: 0,
          vigor: 0,
        },
      },
    } as any,
    spells: {
      knownSpells: [],
      preparedSpells: [],
    },
    notes: {
      appearance: '',
      backstory: '',
      allies: '',
      organizations: '',
      other: '',
    },
    particularities: {
      personalityTraits: [],
      ideals: [],
      bonds: [],
      flaws: [],
    },
    physicalDescription: {
      age: 0,
      height: 0,
      weight: 0,
      eyes: '',
      skin: '',
      hair: '',
    },
    definers: {
      pronouns: '',
      sexualOrientation: '',
      birthplace: '',
      currentResidence: '',
    },
    levelProgression: [],
    experience: { current: 0, required: 1000, toNextLevel: 1000 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  } as unknown as Character;
};

describe('attackCalculations', () => {
  describe('calculateAttackOutcome', () => {
    it('deve identificar acerto normal', () => {
      const result = calculateAttackOutcome(18, 15, 15, 20);

      expect(result.outcome).toBe('hit');
      expect(result.isCritical).toBe(false);
      expect(result.isTrueCritical).toBe(false);
      expect(result.isGraze).toBe(false);
      expect(result.margin).toBe(3); // 18 - 15
    });

    it('deve identificar raspão (ataque = defesa)', () => {
      const result = calculateAttackOutcome(15, 14, 15, 20);

      expect(result.outcome).toBe('graze');
      expect(result.isGraze).toBe(true);
      expect(result.margin).toBe(0); // 15 - 15
    });

    it('deve identificar erro', () => {
      const result = calculateAttackOutcome(10, 8, 15, 20);

      expect(result.outcome).toBe('miss');
      expect(result.isCritical).toBe(false);
      expect(result.margin).toBe(-5); // 10 - 15
    });

    it('deve identificar crítico (natural >= margem)', () => {
      const result = calculateAttackOutcome(18, 20, 15, 20);

      expect(result.isCritical).toBe(true);
      expect(result.outcome).toBe('critical');
      expect(result.margin).toBe(3); // 18 - 15 (< 5, então não é true-critical)
    });

    it('deve identificar crítico verdadeiro (crítico E supera defesa +5)', () => {
      const result = calculateAttackOutcome(25, 20, 15, 20);

      expect(result.isCritical).toBe(true);
      expect(result.isTrueCritical).toBe(true);
      expect(result.outcome).toBe('true-critical');
      expect(result.margin).toBe(10); // 25 - 15, margem >= 5
    });

    it('deve respeitar margem de crítico customizada', () => {
      const result = calculateAttackOutcome(18, 18, 15, 18); // Margem de crítico 18

      expect(result.isCritical).toBe(true);
      expect(result.outcome).toBe('critical'); // Margem 3 (< 5)
    });

    it('natural 20 sempre acerta', () => {
      const result = calculateAttackOutcome(5, 20, 15, 20); // Roll < defesa mas nat 20

      expect(result.outcome).not.toBe('miss');
      expect(result.isCritical).toBe(true);
    });
  });

  describe('calculateAttackDamage', () => {
    it('deve calcular dano normal sem crítico', () => {
      const config: CriticalDamageConfig = {
        baseDamageRoll: { quantity: 2, type: 'd6', modifier: 3 },
        criticalDamageRoll: { quantity: 1, type: 'd6', modifier: 0 },
        isCritical: false,
        isTrueCritical: false,
        isGraze: false,
      };

      const result = calculateAttackDamage(config);

      expect(result.totalDamage).toBeGreaterThanOrEqual(5); // 2 + 3 mínimo
      expect(result.totalDamage).toBeLessThanOrEqual(15); // 12 + 3 máximo
      expect(result.baseDamageMaximized).toBeUndefined();
      expect(result.trueCriticalDamage).toBeUndefined();
      expect(result.breakdown).toBeTruthy();
    });

    it('deve maximizar dano base em crítico', () => {
      const config: CriticalDamageConfig = {
        baseDamageRoll: { quantity: 2, type: 'd6', modifier: 3 },
        criticalDamageRoll: { quantity: 1, type: 'd6', modifier: 0 },
        isCritical: true,
        isTrueCritical: false,
        isGraze: false,
      };

      const result = calculateAttackDamage(config);

      expect(result.baseDamageMaximized).toBe(12); // 2d6 maximizado
      expect(result.totalDamage).toBeGreaterThanOrEqual(15); // 12 + 3
      expect(result.breakdown).toContain('Crítico');
    });

    it('deve adicionar dados extras em crítico verdadeiro', () => {
      const config: CriticalDamageConfig = {
        baseDamageRoll: { quantity: 2, type: 'd6', modifier: 3 },
        criticalDamageRoll: { quantity: 2, type: 'd6', modifier: 0 },
        isCritical: true,
        isTrueCritical: true,
        isGraze: false,
      };

      const result = calculateAttackDamage(config);

      expect(result.baseDamageMaximized).toBe(12);
      expect(result.trueCriticalDamage).toBeGreaterThanOrEqual(2); // 2d6 mínimo
      expect(result.trueCriticalDamage).toBeLessThanOrEqual(12); // 2d6 máximo
      expect(result.totalDamage).toBeGreaterThanOrEqual(17); // 12 + 2 + 3
    });

    it('deve aplicar metade do dano em raspão', () => {
      const config: CriticalDamageConfig = {
        baseDamageRoll: { quantity: 2, type: 'd6', modifier: 4 },
        criticalDamageRoll: { quantity: 1, type: 'd6', modifier: 0 },
        isCritical: false,
        isTrueCritical: false,
        isGraze: true,
      };

      const result = calculateAttackDamage(config);

      // Dano deve ser metade (arredondado para baixo)
      expect(result.totalDamage).toBeLessThanOrEqual(8); // (12 + 4) / 2 = 8 máximo
      expect(result.totalDamage).toBeGreaterThanOrEqual(1); // Mínimo 1
      expect(result.breakdown).toContain('Raspão');
    });

    it('deve calcular dano mínimo 0 após processamento', () => {
      const config: CriticalDamageConfig = {
        baseDamageRoll: { quantity: 1, type: 'd4', modifier: 0 },
        criticalDamageRoll: { quantity: 0, type: 'd6', modifier: 0 },
        isCritical: false,
        isTrueCritical: false,
        isGraze: true,
      };

      const result = calculateAttackDamage(config);

      expect(result.totalDamage).toBeGreaterThanOrEqual(0); // Nunca negativo
    });
  });

  describe('formatAttackOutcome', () => {
    it('deve formatar resultado de ataque corretamente', () => {
      expect(formatAttackOutcome({ outcome: 'miss' } as any)).toBe('ERROU');
      expect(formatAttackOutcome({ outcome: 'graze' } as any)).toBe(
        'ATAQUE DE RASPÃO'
      );
      expect(formatAttackOutcome({ outcome: 'hit' } as any)).toBe('ACERTOU');
      expect(formatAttackOutcome({ outcome: 'critical' } as any)).toBe(
        'CRÍTICO!'
      );
      expect(formatAttackOutcome({ outcome: 'true-critical' } as any)).toBe(
        'CRÍTICO VERDADEIRO!!'
      );
    });
  });

  describe('getAttackOutcomeColor', () => {
    it('deve retornar cores semânticas corretas', () => {
      expect(getAttackOutcomeColor('miss')).toBe('error');
      expect(getAttackOutcomeColor('graze')).toBe('info');
      expect(getAttackOutcomeColor('hit')).toBe('success');
      expect(getAttackOutcomeColor('critical')).toBe('warning');
      expect(getAttackOutcomeColor('true-critical')).toBe('warning');
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com margem de crítico 1 (sempre crítico em natural >= 1)', () => {
      const result = calculateAttackOutcome(20, 15, 15, 1);

      expect(result.isCritical).toBe(true);
    });

    it('deve calcular dano 0 em caso extremo de raspão', () => {
      const config: CriticalDamageConfig = {
        baseDamageRoll: { quantity: 1, type: 'd2', modifier: 0 },
        criticalDamageRoll: { quantity: 0, type: 'd6', modifier: 0 },
        isCritical: false,
        isTrueCritical: false,
        isGraze: true,
      };

      const result = calculateAttackDamage(config);

      // 1d2 max = 2, /2 = 1
      expect(result.totalDamage).toBeGreaterThanOrEqual(0);
      expect(result.totalDamage).toBeLessThanOrEqual(1);
    });

    it('deve maximizar corretamente dados diferentes (d4, d8, d10, d12)', () => {
      const testCases = [
        { type: 'd4' as const, max: 4 },
        { type: 'd8' as const, max: 8 },
        { type: 'd10' as const, max: 10 },
        { type: 'd12' as const, max: 12 },
      ];

      testCases.forEach(({ type, max }) => {
        const config: CriticalDamageConfig = {
          baseDamageRoll: { quantity: 1, type, modifier: 0 },
          criticalDamageRoll: { quantity: 0, type: 'd6', modifier: 0 },
          isCritical: true,
          isTrueCritical: false,
          isGraze: false,
        };

        const result = calculateAttackDamage(config);

        expect(result.baseDamageMaximized).toBe(max);
        expect(result.totalDamage).toBe(max);
      });
    });
  });

  describe('calculateAttackRoll', () => {
    it('deve calcular modificador de ataque sem bônus de assinatura', () => {
      const character = createMockCharacter(5, 3, 'Combate Desarmado', {
        keyAttribute: 'corpo',
        proficiencyLevel: 'versado',
        isSignature: false,
      });

      const result = calculateAttackRoll(
        character,
        'Combate Desarmado' as any,
        undefined,
        0
      );

      // Versado = atributo * 2 = 3 * 2 = 6
      expect(result.modifier).toBe(6);
    });

    it('deve aplicar bônus de habilidade de assinatura para habilidade não-combate', () => {
      const character = createMockCharacter(5, 3, 'atletismo', {
        keyAttribute: 'corpo',
        proficiencyLevel: 'versado',
        isSignature: true,
      });

      const result = calculateAttackRoll(character, 'atletismo', undefined, 0);

      // Versado = atributo * 2 = 3 * 2 = 6
      // Bônus assinatura (v0.2) = Math.min(3, ceil(5/5)) = 1
      // Total = 6 + 1 = 7
      expect(result.modifier).toBe(7);
    });

    it('deve aplicar bônus de assinatura para habilidade de combate (v0.2: sem distinção)', () => {
      const character = createMockCharacter(6, 4, 'luta', {
        keyAttribute: 'corpo',
        proficiencyLevel: 'adepto',
        isSignature: true,
      });

      const result = calculateAttackRoll(character, 'luta', undefined, 0);

      // Adepto = atributo * 1 = 4 * 1 = 4
      // Bônus assinatura (v0.2) = Math.min(3, ceil(6/5)) = 2
      // Total = 4 + 2 = 6
      expect(result.modifier).toBe(6);
    });

    it('deve aplicar bônus mínimo de +1d para assinatura em nível baixo', () => {
      const character = createMockCharacter(2, 2, 'acerto', {
        keyAttribute: 'corpo',
        proficiencyLevel: 'versado',
        isSignature: true,
      });

      const result = calculateAttackRoll(character, 'acerto', undefined, 0);

      // Versado = atributo * 2 = 2 * 2 = 4
      // Bônus assinatura (v0.2) = Math.min(3, ceil(2/5)) = 1
      // Total = 4 + 1 = 5
      expect(result.modifier).toBe(5);
    });

    it('deve calcular modificador 0 para habilidade leiga', () => {
      const character = createMockCharacter(10, 5, 'determinacao', {
        keyAttribute: 'corpo',
        proficiencyLevel: 'leigo',
        isSignature: false,
      });

      const result = calculateAttackRoll(
        character,
        'determinacao',
        undefined,
        0
      );

      // Leigo = atributo * 0 = 5 * 0 = 0
      expect(result.modifier).toBe(0);
    });

    it('deve aplicar bônus de assinatura mesmo para habilidade leiga', () => {
      const character = createMockCharacter(10, 5, 'luta', {
        keyAttribute: 'corpo',
        proficiencyLevel: 'leigo',
        isSignature: true, // Assinatura ativa com proficiência leiga
      });

      const result = calculateAttackRoll(character, 'luta', undefined, 0);

      // Leigo = atributo * 0 = 5 * 0 = 0
      // Bônus assinatura (v0.2) = Math.min(3, ceil(10/5)) = 2
      // Total = 0 + 2 = 2
      expect(result.modifier).toBe(2);
    });

    it('deve incluir fórmula formatada no resultado', () => {
      const character = createMockCharacter(6, 3, 'luta', {
        keyAttribute: 'corpo',
        proficiencyLevel: 'versado',
        isSignature: true,
      });

      const result = calculateAttackRoll(character, 'luta', undefined, 0);

      // Versado = 3 * 2 = 6
      // Bônus assinatura (combate) = floor(6 / 3) = 2
      // Total = 6 + 2 = 8
      expect(result.modifier).toBe(8);
      expect(result.formula).toContain('3d20'); // Atributo = 3, então 3d20
      expect(result.formula).toContain('+8');
    });
  });
});
