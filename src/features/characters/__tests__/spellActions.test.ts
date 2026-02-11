/**
 * Testes para ações de conjuração/feitiços
 *
 * Cobre:
 * - toggleCaster (ativar, desativar, estado persistido)
 * - setCastingSkill
 * - spendSpellPoints (subtrai PF e PP simultaneamente)
 * - bloqueio com PP = 0 e PP insuficiente
 * - generateSpellPoints (Canalizar Mana)
 * - resetSpellPoints (início de combate)
 * - castSpell (custos por círculo, 1º Círculo edge case)
 */

import charactersReducer, {
  toggleCaster,
  setCastingSkill,
  spendSpellPoints,
  generateSpellPoints,
  resetSpellPoints,
  castSpell,
  setCharacters,
} from '../charactersSlice';
import type { Character } from '@/types';
import { SPELL_CIRCLE_PF_COST } from '@/constants/spells';
import type { SpellCircle } from '@/constants/spells';

// Mock do characterService
jest.mock('@/services/characterService', () => ({
  characterService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// ─── Helpers ──────────────────────────────────────────────────

/** Cria um personagem conjurador para testes */
function createCasterCharacter(overrides?: Partial<Character>): Character {
  return {
    id: 'caster-1',
    schemaVersion: 2,
    name: 'Gandalf',
    playerName: 'Test',
    level: 5,
    experience: { current: 0, toNextLevel: 1000 },
    concept: 'Mago',
    attributes: {
      agilidade: 1,
      corpo: 1,
      influencia: 2,
      mente: 3,
      essencia: 3,
      instinto: 1,
    },
    skills: {} as any,
    signatureSkill: 'arcano',
    skillProficiencyBonusSlots: 0,
    archetypes: [],
    classes: [],
    proficiencies: {
      weapons: ['armas-simples'],
      armor: [],
      tools: [],
      other: [],
    },
    proficiencyPurchases: [],
    languages: ['comum'],
    extraLanguagesModifier: 0,
    combat: {
      hp: { current: 15, max: 15, temporary: 0 },
      pp: { current: 10, max: 10, temporary: 0 },
    } as any,
    movement: {
      speeds: {
        andando: { base: 6, bonus: 0 },
        voando: { base: 0, bonus: 0 },
        escalando: { base: 0, bonus: 0 },
        escavando: { base: 0, bonus: 0 },
        nadando: { base: 0, bonus: 0 },
      },
      modifiers: 0,
    },
    senses: {
      vision: 'normal',
      keenSenses: [],
      perceptionModifiers: { visao: 0, olfato: 0, audicao: 0 },
    },
    size: 'medio',
    luck: {
      level: 1,
      value: 1,
      diceModifier: 0,
      numericModifier: 0,
    },
    crafts: [],
    resources: [],
    specialAbilities: [],
    inventory: {
      items: [],
      carryingCapacity: {
        base: 20,
        sizeModifier: 0,
        otherModifiers: 0,
        modifiers: 0,
        total: 20,
        currentWeight: 0,
        encumbranceState: 'normal',
        pushLimit: 40,
        liftLimit: 10,
      },
      currency: {
        physical: { cobre: 0, ouro: 10, platina: 0 },
        bank: { cobre: 0, ouro: 0, platina: 0 },
      },
    },
    spellcasting: {
      isCaster: true,
      castingSkill: 'arcano',
      spellPoints: { current: 5, max: 10 },
      knownSpells: [],
      maxKnownSpells: 3,
      knownSpellsModifiers: 0,
      spellcastingAbilities: [],
      masteredMatrices: [],
    },
    particularities: {
      negativeTraits: [],
      positiveTraits: [],
      completeTraits: [],
      balance: 0,
    },
    physicalDescription: {},
    definers: {
      flaws: [],
      fears: [],
      ideals: [],
      traits: [],
      goals: [],
      allies: [],
      organizations: [],
    },
    levelProgression: [],
    levelHistory: [],
    notes: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  } as Character;
}

/** Cria estado Redux com um personagem */
function stateWithCharacter(char: Character) {
  const state = charactersReducer(undefined, { type: 'unknown' });
  return charactersReducer(state, setCharacters([char]));
}

// ─── Tests ────────────────────────────────────────────────────

describe('Spell Actions (Fase 6)', () => {
  // ─── toggleCaster ───────────────────────────────────────────

  describe('toggleCaster', () => {
    it('deve ativar o modo conjurador', () => {
      const char = createCasterCharacter({
        spellcasting: {
          isCaster: false,
          spellPoints: { current: 0, max: 0 },
          knownSpells: [],
          maxKnownSpells: 0,
          knownSpellsModifiers: 0,
          spellcastingAbilities: [],
          masteredMatrices: [],
        },
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        toggleCaster({ characterId: char.id, isCaster: true })
      );

      expect(result.entities[char.id]?.spellcasting?.isCaster).toBe(true);
    });

    it('deve desativar o modo conjurador e limpar castingSkill', () => {
      const char = createCasterCharacter();
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        toggleCaster({ characterId: char.id, isCaster: false })
      );

      expect(result.entities[char.id]?.spellcasting?.isCaster).toBe(false);
      expect(
        result.entities[char.id]?.spellcasting?.castingSkill
      ).toBeUndefined();
    });

    it('deve resetar PF current para 0 ao ativar', () => {
      const char = createCasterCharacter({
        spellcasting: {
          isCaster: false,
          spellPoints: { current: 3, max: 5 },
          knownSpells: [],
          maxKnownSpells: 0,
          knownSpellsModifiers: 0,
          spellcastingAbilities: [],
          masteredMatrices: [],
        },
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        toggleCaster({ characterId: char.id, isCaster: true })
      );

      expect(result.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        0
      );
    });

    it('deve setar PF max para 0 ao desativar', () => {
      const char = createCasterCharacter();
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        toggleCaster({ characterId: char.id, isCaster: false })
      );

      expect(result.entities[char.id]?.spellcasting?.spellPoints.max).toBe(0);
    });

    it('deve preservar PF max ao ativar', () => {
      const char = createCasterCharacter({
        spellcasting: {
          isCaster: false,
          spellPoints: { current: 0, max: 8 },
          knownSpells: [],
          maxKnownSpells: 0,
          knownSpellsModifiers: 0,
          spellcastingAbilities: [],
          masteredMatrices: [],
        },
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        toggleCaster({ characterId: char.id, isCaster: true })
      );

      expect(result.entities[char.id]?.spellcasting?.spellPoints.max).toBe(8);
    });

    it('deve atualizar updatedAt', () => {
      const char = createCasterCharacter();
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        toggleCaster({ characterId: char.id, isCaster: false })
      );

      expect(result.entities[char.id]?.updatedAt).not.toBe(char.updatedAt);
    });

    it('deve setar erro para personagem inexistente', () => {
      const char = createCasterCharacter();
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        toggleCaster({ characterId: 'nao-existe', isCaster: true })
      );

      expect(result.error).toContain('não encontrado');
    });
  });

  // ─── setCastingSkill ────────────────────────────────────────

  describe('setCastingSkill', () => {
    it('deve definir a habilidade de conjuração', () => {
      const char = createCasterCharacter();
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        setCastingSkill({ characterId: char.id, castingSkill: 'natureza' })
      );

      expect(result.entities[char.id]?.spellcasting?.castingSkill).toBe(
        'natureza'
      );
    });

    it('deve trocar entre habilidades', () => {
      const char = createCasterCharacter();
      const state = stateWithCharacter(char);

      let result = charactersReducer(
        state,
        setCastingSkill({ characterId: char.id, castingSkill: 'religiao' })
      );
      result = charactersReducer(
        result,
        setCastingSkill({ characterId: char.id, castingSkill: 'natureza' })
      );

      expect(result.entities[char.id]?.spellcasting?.castingSkill).toBe(
        'natureza'
      );
    });

    it('deve setar erro para personagem sem spellcasting', () => {
      const char = createCasterCharacter({ spellcasting: undefined as any });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        setCastingSkill({ characterId: char.id, castingSkill: 'arcano' })
      );

      expect(result.error).toBeTruthy();
    });
  });

  // ─── spendSpellPoints ───────────────────────────────────────

  describe('spendSpellPoints', () => {
    it('deve subtrair PF e PP simultaneamente', () => {
      const char = createCasterCharacter();
      // PP: 10, PF: 5
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        spendSpellPoints({ characterId: char.id, amount: 3 })
      );

      expect(result.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        2
      ); // 5 - 3
      expect(result.entities[char.id]?.combat.pp.current).toBe(7); // 10 - 3
    });

    it('deve bloquear com PP = 0', () => {
      const char = createCasterCharacter({
        combat: {
          ...createCasterCharacter().combat,
          pp: { current: 0, max: 10, temporary: 0 },
        } as any,
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        spendSpellPoints({ characterId: char.id, amount: 1 })
      );

      expect(result.error).toContain('0 PP');
      // PF não deve ter mudado
      expect(result.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        5
      );
    });

    it('deve bloquear com PP insuficiente', () => {
      const char = createCasterCharacter({
        combat: {
          ...createCasterCharacter().combat,
          pp: { current: 2, max: 10, temporary: 0 },
        } as any,
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        spendSpellPoints({ characterId: char.id, amount: 5 })
      );

      expect(result.error).toContain('PP insuficiente');
    });

    it('deve bloquear com PF insuficiente', () => {
      const char = createCasterCharacter({
        spellcasting: {
          ...createCasterCharacter().spellcasting!,
          spellPoints: { current: 1, max: 10 },
        },
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        spendSpellPoints({ characterId: char.id, amount: 3 })
      );

      expect(result.error).toContain('PF insuficiente');
    });

    it('não deve permitir PF ou PP negativos', () => {
      const char = createCasterCharacter({
        spellcasting: {
          ...createCasterCharacter().spellcasting!,
          spellPoints: { current: 3, max: 10 },
        },
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        spendSpellPoints({ characterId: char.id, amount: 3 })
      );

      expect(
        result.entities[char.id]?.spellcasting?.spellPoints.current
      ).toBeGreaterThanOrEqual(0);
      expect(
        result.entities[char.id]?.combat.pp.current
      ).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── generateSpellPoints ────────────────────────────────────

  describe('generateSpellPoints', () => {
    it('deve gerar PF sem gastar PP', () => {
      const char = createCasterCharacter({
        spellcasting: {
          ...createCasterCharacter().spellcasting!,
          spellPoints: { current: 2, max: 10 },
        },
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        generateSpellPoints({ characterId: char.id, amount: 3 })
      );

      expect(result.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        5
      ); // 2 + 3
      expect(result.entities[char.id]?.combat.pp.current).toBe(10); // inalterado
    });

    it('deve respeitar PF max como teto', () => {
      const char = createCasterCharacter({
        spellcasting: {
          ...createCasterCharacter().spellcasting!,
          spellPoints: { current: 8, max: 10 },
        },
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        generateSpellPoints({ characterId: char.id, amount: 5 })
      );

      expect(result.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        10
      ); // capped at max
    });

    it('Canalizar Mana ▶ = 1 PF', () => {
      const char = createCasterCharacter({
        spellcasting: {
          ...createCasterCharacter().spellcasting!,
          spellPoints: { current: 0, max: 10 },
        },
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        generateSpellPoints({ characterId: char.id, amount: 1 })
      );

      expect(result.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        1
      );
    });

    it('Canalizar Mana ▶▶ = 2 PF', () => {
      const char = createCasterCharacter({
        spellcasting: {
          ...createCasterCharacter().spellcasting!,
          spellPoints: { current: 0, max: 10 },
        },
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        generateSpellPoints({ characterId: char.id, amount: 2 })
      );

      expect(result.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        2
      );
    });

    it('Canalizar Mana ▶▶▶ = 4 PF', () => {
      const char = createCasterCharacter({
        spellcasting: {
          ...createCasterCharacter().spellcasting!,
          spellPoints: { current: 0, max: 10 },
        },
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        generateSpellPoints({ characterId: char.id, amount: 4 })
      );

      expect(result.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        4
      );
    });
  });

  // ─── resetSpellPoints ───────────────────────────────────────

  describe('resetSpellPoints', () => {
    it('deve resetar PF para 0 (início de combate)', () => {
      const char = createCasterCharacter({
        spellcasting: {
          ...createCasterCharacter().spellcasting!,
          spellPoints: { current: 7, max: 10 },
        },
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        resetSpellPoints({ characterId: char.id })
      );

      expect(result.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        0
      );
    });

    it('deve manter PF max inalterado', () => {
      const char = createCasterCharacter({
        spellcasting: {
          ...createCasterCharacter().spellcasting!,
          spellPoints: { current: 7, max: 10 },
        },
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        resetSpellPoints({ characterId: char.id })
      );

      expect(result.entities[char.id]?.spellcasting?.spellPoints.max).toBe(10);
    });

    it('não deve afetar PP ao resetar PF', () => {
      const char = createCasterCharacter();
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        resetSpellPoints({ characterId: char.id })
      );

      expect(result.entities[char.id]?.combat.pp.current).toBe(10);
    });
  });

  // ─── castSpell ──────────────────────────────────────────────

  describe('castSpell', () => {
    it('1º Círculo: custo 0 PF, não gasta PF nem PP', () => {
      const char = createCasterCharacter();
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        castSpell({ characterId: char.id, circle: 1 })
      );

      // 1st circle is 0 PF cost — no PF or PP subtracted
      expect(result.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        5
      );
      expect(result.entities[char.id]?.combat.pp.current).toBe(10);
      expect(result.error).toBeNull();
    });

    it('1º Círculo deve bloquear com PP = 0', () => {
      const char = createCasterCharacter({
        combat: {
          ...createCasterCharacter().combat,
          pp: { current: 0, max: 10, temporary: 0 },
        } as any,
      });
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        castSpell({ characterId: char.id, circle: 1 })
      );

      expect(result.error).toContain('0 PP');
    });

    it('2º Círculo: custo 1 PF e 1 PP', () => {
      const char = createCasterCharacter();
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        castSpell({ characterId: char.id, circle: 2 })
      );

      expect(result.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        4
      ); // 5 - 1
      expect(result.entities[char.id]?.combat.pp.current).toBe(9); // 10 - 1
    });

    it('3º Círculo: custo 3 PF e 3 PP', () => {
      const char = createCasterCharacter();
      const state = stateWithCharacter(char);

      const result = charactersReducer(
        state,
        castSpell({ characterId: char.id, circle: 3 })
      );

      expect(result.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        2
      ); // 5 - 3
      expect(result.entities[char.id]?.combat.pp.current).toBe(7); // 10 - 3
    });

    // Testes para todos os 8 círculos
    it.each([
      [1, 0],
      [2, 1],
      [3, 3],
      [4, 5],
      [5, 7],
      [6, 9],
      [7, 15],
      [8, 20],
    ] as [SpellCircle, number][])(
      '%iº Círculo deve custar %i PF',
      (circle, expectedCost) => {
        const char = createCasterCharacter({
          combat: {
            ...createCasterCharacter().combat,
            pp: { current: 25, max: 25, temporary: 0 },
          } as any,
          spellcasting: {
            ...createCasterCharacter().spellcasting!,
            spellPoints: { current: 25, max: 25 },
          },
        });
        const state = stateWithCharacter(char);

        const result = charactersReducer(
          state,
          castSpell({ characterId: char.id, circle })
        );

        expect(result.error).toBeNull();
        if (expectedCost > 0) {
          expect(
            result.entities[char.id]?.spellcasting?.spellPoints.current
          ).toBe(25 - expectedCost);
          expect(result.entities[char.id]?.combat.pp.current).toBe(
            25 - expectedCost
          );
        } else {
          // 1st circle: no cost
          expect(
            result.entities[char.id]?.spellcasting?.spellPoints.current
          ).toBe(25);
          expect(result.entities[char.id]?.combat.pp.current).toBe(25);
        }
      }
    );

    it('deve bloquear com PF insuficiente para o círculo', () => {
      const char = createCasterCharacter({
        spellcasting: {
          ...createCasterCharacter().spellcasting!,
          spellPoints: { current: 2, max: 10 },
        },
      });
      const state = stateWithCharacter(char);

      // 3rd circle costs 3 PF, but char has only 2
      const result = charactersReducer(
        state,
        castSpell({ characterId: char.id, circle: 3 })
      );

      expect(result.error).toContain('PF insuficiente');
      expect(result.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        2
      ); // inalterado
    });

    it('deve bloquear com PP insuficiente para o círculo', () => {
      const char = createCasterCharacter({
        combat: {
          ...createCasterCharacter().combat,
          pp: { current: 2, max: 10, temporary: 0 },
        } as any,
        spellcasting: {
          ...createCasterCharacter().spellcasting!,
          spellPoints: { current: 10, max: 10 },
        },
      });
      const state = stateWithCharacter(char);

      // 3rd circle costs 3 PP, but char has only 2
      const result = charactersReducer(
        state,
        castSpell({ characterId: char.id, circle: 3 })
      );

      expect(result.error).toContain('PP insuficiente');
    });

    it('custo por círculo deve corresponder a SPELL_CIRCLE_PF_COST', () => {
      // Smoke test: verify the costs table is consistent
      expect(SPELL_CIRCLE_PF_COST[1]).toBe(0);
      expect(SPELL_CIRCLE_PF_COST[2]).toBe(1);
      expect(SPELL_CIRCLE_PF_COST[3]).toBe(3);
      expect(SPELL_CIRCLE_PF_COST[4]).toBe(5);
      expect(SPELL_CIRCLE_PF_COST[5]).toBe(7);
      expect(SPELL_CIRCLE_PF_COST[6]).toBe(9);
      expect(SPELL_CIRCLE_PF_COST[7]).toBe(15);
      expect(SPELL_CIRCLE_PF_COST[8]).toBe(20);
    });
  });

  // ─── Cenários compostos ─────────────────────────────────────

  describe('Cenários compostos', () => {
    it('cast → generate → cast (fluxo completo)', () => {
      const char = createCasterCharacter({
        spellcasting: {
          ...createCasterCharacter().spellcasting!,
          spellPoints: { current: 3, max: 10 },
        },
      });
      let state = stateWithCharacter(char);

      // Cast 2nd circle (1 PF + 1 PP)
      state = charactersReducer(
        state,
        castSpell({ characterId: char.id, circle: 2 })
      );
      expect(state.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        2
      );
      expect(state.entities[char.id]?.combat.pp.current).toBe(9);

      // Generate 4 PF via Canalizar Mana (▶▶▶)
      state = charactersReducer(
        state,
        generateSpellPoints({ characterId: char.id, amount: 4 })
      );
      expect(state.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        6
      );
      expect(state.entities[char.id]?.combat.pp.current).toBe(9); // PP inalterado

      // Cast 4th circle (5 PF + 5 PP)
      state = charactersReducer(
        state,
        castSpell({ characterId: char.id, circle: 4 })
      );
      expect(state.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        1
      ); // 6 - 5
      expect(state.entities[char.id]?.combat.pp.current).toBe(4); // 9 - 5
    });

    it('resetSpellPoints → generateSpellPoints (início de combate)', () => {
      const char = createCasterCharacter({
        spellcasting: {
          ...createCasterCharacter().spellcasting!,
          spellPoints: { current: 7, max: 10 },
        },
      });
      let state = stateWithCharacter(char);

      // Reset (início de combate)
      state = charactersReducer(
        state,
        resetSpellPoints({ characterId: char.id })
      );
      expect(state.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        0
      );

      // Generate 2 PF (▶▶)
      state = charactersReducer(
        state,
        generateSpellPoints({ characterId: char.id, amount: 2 })
      );
      expect(state.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        2
      );
    });

    it('toggleCaster off → on deve resetar PF current para 0', () => {
      const char = createCasterCharacter();
      let state = stateWithCharacter(char);

      // Desativar
      state = charactersReducer(
        state,
        toggleCaster({ characterId: char.id, isCaster: false })
      );
      expect(state.entities[char.id]?.spellcasting?.isCaster).toBe(false);

      // Reativar
      state = charactersReducer(
        state,
        toggleCaster({ characterId: char.id, isCaster: true })
      );
      expect(state.entities[char.id]?.spellcasting?.isCaster).toBe(true);
      expect(state.entities[char.id]?.spellcasting?.spellPoints.current).toBe(
        0
      );
    });
  });
});
