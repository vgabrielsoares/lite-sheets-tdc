/**
 * Testes unitários para characterFactory
 *
 * Testa a criação de personagens com valores padrão de nível 1
 * conforme regras do Tabuleiro do Caos RPG
 */

// Mock do uuid antes de importar o characterFactory
let mockUuidCounter = 0;
jest.mock('uuid', () => ({
  v4: jest.fn(() => `test-uuid-${mockUuidCounter++}`),
}));

import { createDefaultCharacter } from '../characterFactory';
import { SKILL_LIST } from '@/types/skills';
import type { Character } from '@/types/character';

describe('characterFactory', () => {
  describe('createDefaultCharacter', () => {
    let character: Character;

    beforeEach(() => {
      character = createDefaultCharacter({
        name: 'Test Character',
        playerName: 'Test Player',
      });
    });

    describe('Informações Básicas', () => {
      it('deve criar personagem com nome fornecido', () => {
        expect(character.name).toBe('Test Character');
      });

      it('deve incluir nome do jogador quando fornecido', () => {
        expect(character.playerName).toBe('Test Player');
      });

      it('deve criar personagem sem nome do jogador quando omitido', () => {
        const charWithoutPlayer = createDefaultCharacter({
          name: 'Solo Character',
        });
        expect(charWithoutPlayer.playerName).toBeUndefined();
      });

      it('deve incluir conceito quando fornecido', () => {
        const charWithConcept = createDefaultCharacter({
          name: 'Character',
          concept: 'Um guerreiro destemido',
        });
        expect(charWithConcept.concept).toBe('Um guerreiro destemido');
      });

      it('deve criar ID único (UUID v4)', () => {
        expect(character.id).toBeDefined();
        expect(typeof character.id).toBe('string');
        expect(character.id.length).toBeGreaterThan(0);
      });

      it('deve criar IDs únicos para diferentes personagens', () => {
        const char1 = createDefaultCharacter({ name: 'Char1' });
        const char2 = createDefaultCharacter({ name: 'Char2' });
        expect(char1.id).not.toBe(char2.id);
      });
    });

    describe('Timestamps', () => {
      it('deve adicionar timestamp de criação', () => {
        expect(character.createdAt).toBeDefined();
        expect(typeof character.createdAt).toBe('string');
      });

      it('deve adicionar timestamp de atualização', () => {
        expect(character.updatedAt).toBeDefined();
        expect(typeof character.updatedAt).toBe('string');
      });

      it('createdAt e updatedAt devem ser iguais na criação', () => {
        expect(character.createdAt).toBe(character.updatedAt);
      });
    });

    describe('Nível e Experiência', () => {
      it('deve começar no nível 1', () => {
        expect(character.level).toBe(1);
      });

      it('deve começar com 0 XP', () => {
        expect(character.experience.current).toBe(0);
      });

      it('deve ter XP para próximo nível definido', () => {
        expect(character.experience.toNextLevel).toBe(50);
      });
    });

    describe('Atributos', () => {
      it('deve ter todos os 6 atributos', () => {
        expect(character.attributes).toHaveProperty('agilidade');
        expect(character.attributes).toHaveProperty('constituicao');
        expect(character.attributes).toHaveProperty('forca');
        expect(character.attributes).toHaveProperty('influencia');
        expect(character.attributes).toHaveProperty('mente');
        expect(character.attributes).toHaveProperty('presenca');
      });

      it('deve ter todos os atributos começando em 1', () => {
        expect(character.attributes.agilidade).toBe(1);
        expect(character.attributes.constituicao).toBe(1);
        expect(character.attributes.forca).toBe(1);
        expect(character.attributes.influencia).toBe(1);
        expect(character.attributes.mente).toBe(1);
        expect(character.attributes.presenca).toBe(1);
      });
    });

    describe('Pontos de Vida (PV)', () => {
      it('deve ter 15 PV máximo', () => {
        expect(character.combat.hp.max).toBe(15);
      });

      it('deve ter 15 PV atual (cheio)', () => {
        expect(character.combat.hp.current).toBe(15);
      });

      it('deve ter 0 PV temporário', () => {
        expect(character.combat.hp.temporary).toBe(0);
      });
    });

    describe('Pontos de Poder (PP)', () => {
      it('deve ter 2 PP máximo', () => {
        expect(character.combat.pp.max).toBe(2);
      });

      it('deve ter 2 PP atual (cheio)', () => {
        expect(character.combat.pp.current).toBe(2);
      });

      it('deve ter 0 PP temporário', () => {
        expect(character.combat.pp.temporary).toBe(0);
      });
    });

    describe('Habilidades (Skills)', () => {
      it('deve ter todas as 33 habilidades do sistema', () => {
        const skillKeys = Object.keys(character.skills);
        expect(skillKeys).toHaveLength(SKILL_LIST.length);
        expect(skillKeys).toHaveLength(33);
      });

      it('deve ter todas as habilidades listadas no SKILL_LIST', () => {
        SKILL_LIST.forEach((skillName) => {
          expect(character.skills[skillName]).toBeDefined();
        });
      });

      it('deve ter todas as habilidades começando como Leigo', () => {
        Object.values(character.skills).forEach((skill) => {
          expect(skill.proficiencyLevel).toBe('leigo');
        });
      });

      it('deve ter atributo-chave definido para cada habilidade', () => {
        Object.values(character.skills).forEach((skill) => {
          expect(skill.keyAttribute).toBeDefined();
          expect(typeof skill.keyAttribute).toBe('string');
        });
      });

      it('nenhuma habilidade deve ser de assinatura inicialmente', () => {
        Object.values(character.skills).forEach((skill) => {
          expect(skill.isSignature).toBe(false);
        });
      });

      it('deve ter modificadores vazios para todas as habilidades', () => {
        Object.values(character.skills).forEach((skill) => {
          expect(skill.modifiers).toEqual([]);
        });
      });
    });

    describe('Proficiências', () => {
      it('deve ter proficiência com Armas Simples', () => {
        expect(character.proficiencies.weapons).toContain('Armas Simples');
      });

      it('deve começar sem proficiências com armaduras', () => {
        expect(character.proficiencies.armor).toEqual([]);
      });

      it('deve começar sem proficiências com ferramentas', () => {
        expect(character.proficiencies.tools).toEqual([]);
      });

      it('deve começar sem outras proficiências', () => {
        expect(character.proficiencies.other).toEqual([]);
      });
    });

    describe('Idiomas', () => {
      it('deve conhecer o idioma Comum por padrão', () => {
        expect(character.languages).toContain('comum');
      });

      it('deve ter apenas 1 idioma inicialmente (Comum)', () => {
        expect(character.languages).toHaveLength(1);
      });
    });

    describe('Inventário', () => {
      it('deve ter 3 itens iniciais (Mochila, Cartão, moedas implícitas)', () => {
        expect(character.inventory.items).toHaveLength(2); // Mochila e Cartão
      });

      it('deve ter Mochila no inventário', () => {
        const backpack = character.inventory.items.find(
          (item) => item.name === 'Mochila'
        );
        expect(backpack).toBeDefined();
        expect(backpack?.quantity).toBe(1);
        expect(backpack?.weight).toBeNull(); // Mochila não tem peso
      });

      it('deve ter Cartão do Banco no inventário', () => {
        const card = character.inventory.items.find(
          (item) => item.name === 'Cartão do Banco'
        );
        expect(card).toBeDefined();
        expect(card?.quantity).toBe(1);
        expect(card?.weight).toBeNull(); // Cartão não tem peso
      });

      it('cada item deve ter ID único', () => {
        const ids = character.inventory.items.map((item) => item.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });

      describe('Moedas', () => {
        it('deve ter 0 moedas físicas (dinheiro começa no banco)', () => {
          expect(character.inventory.currency.physical.cobre).toBe(0);
          expect(character.inventory.currency.physical.ouro).toBe(0);
          expect(character.inventory.currency.physical.platina).toBe(0);
        });

        it('deve ter 10 PO$ (ouro) no banco (Cartão do Banco)', () => {
          expect(character.inventory.currency.bank.ouro).toBe(10);
        });

        it('deve ter 0 de cobre e platina no banco', () => {
          expect(character.inventory.currency.bank.cobre).toBe(0);
          expect(character.inventory.currency.bank.platina).toBe(0);
        });
      });

      describe('Capacidade de Carga', () => {
        it('deve ter capacidade base de 10 (5 + Força(1) * 5)', () => {
          expect(character.inventory.carryingCapacity.base).toBe(10);
        });

        it('deve ter peso atual de 0', () => {
          expect(character.inventory.carryingCapacity.currentWeight).toBe(0);
        });

        it('deve ter limite de empurrar igual ao dobro da capacidade', () => {
          expect(character.inventory.carryingCapacity.pushLimit).toBe(20);
        });

        it('deve ter limite de levantar igual à metade da capacidade', () => {
          expect(character.inventory.carryingCapacity.liftLimit).toBe(5);
        });

        it('deve começar com estado de carga normal', () => {
          expect(character.inventory.carryingCapacity.encumbranceState).toBe(
            'normal'
          );
        });
      });
    });

    describe('Combate', () => {
      it('deve ter estado normal', () => {
        expect(character.combat.state).toBe('normal');
      });

      it('deve não estar morrendo', () => {
        expect(character.combat.dyingState.isDying).toBe(false);
      });

      it('deve ter rodadas máximas de morte = 3 (2 + Constituição(1))', () => {
        expect(character.combat.dyingState.maxRounds).toBe(3);
      });

      it('deve ter todas as ações disponíveis', () => {
        expect(character.combat.actionEconomy.majorAction).toBe(true);
        expect(character.combat.actionEconomy.minorAction1).toBe(true);
        expect(character.combat.actionEconomy.minorAction2).toBe(true);
        expect(character.combat.actionEconomy.reaction).toBe(true);
        expect(character.combat.actionEconomy.defensiveReaction).toBe(true);
        expect(character.combat.actionEconomy.extraActions).toEqual([]);
      });

      it('deve ter defesa base de 15', () => {
        expect(character.combat.defense.base).toBe(15);
      });

      it('deve ter defesa total de 16 (15 + Agilidade(1))', () => {
        expect(character.combat.defense.total).toBe(16);
      });

      it('deve ter limite de PP por rodada = 2 (Nível(1) + Presença(1))', () => {
        expect(character.combat.ppLimit.total).toBe(2);
      });

      it('deve ter os 4 testes de resistência', () => {
        expect(character.combat.savingThrows).toHaveLength(4);
        const types = character.combat.savingThrows.map((st) => st.type);
        expect(types).toContain('determinacao');
        expect(types).toContain('reflexo');
        expect(types).toContain('tenacidade');
        expect(types).toContain('vigor');
      });

      it('deve não ter ataques inicialmente', () => {
        expect(character.combat.attacks).toEqual([]);
      });

      it('deve não ter condições ativas', () => {
        expect(character.combat.conditions).toEqual([]);
      });
    });

    describe('Deslocamento', () => {
      it('deve ter deslocamento andando padrão de 5', () => {
        expect(character.movement.speeds.andando.base).toBe(5);
        expect(character.movement.speeds.andando.bonus).toBe(0);
      });

      it('deve ter outros deslocamentos em 0', () => {
        expect(character.movement.speeds.voando.base).toBe(0);
        expect(character.movement.speeds.escalando.base).toBe(0);
        expect(character.movement.speeds.escavando.base).toBe(0);
        expect(character.movement.speeds.nadando.base).toBe(0);
      });
    });

    describe('Sentidos', () => {
      it('deve ter visão normal', () => {
        expect(character.senses.vision).toBe('normal');
      });

      it('deve não ter sentidos aguçados', () => {
        expect(character.senses.keenSenses).toEqual([]);
      });

      it('deve ter modificadores de percepção em 0', () => {
        expect(character.senses.perceptionModifiers.visao).toBe(0);
        expect(character.senses.perceptionModifiers.olfato).toBe(0);
        expect(character.senses.perceptionModifiers.audicao).toBe(0);
      });
    });

    describe('Tamanho', () => {
      it('deve ter tamanho médio por padrão', () => {
        expect(character.size).toBe('medio');
      });
    });

    describe('Sorte e Ofícios', () => {
      it('deve começar com nível de sorte 0', () => {
        expect(character.luck.level).toBe(0);
        expect(character.luck.value).toBe(0);
      });

      it('deve começar sem ofícios', () => {
        expect(character.crafts).toEqual([]);
      });
    });

    describe('Arquétipos e Classes', () => {
      it('deve começar sem arquétipos', () => {
        expect(character.archetypes).toEqual([]);
      });

      it('deve começar sem classes', () => {
        expect(character.classes).toEqual([]);
      });
    });

    describe('Origem e Linhagem', () => {
      it('deve começar sem origem definida', () => {
        expect(character.origin).toBeUndefined();
      });

      it('deve começar sem linhagem definida', () => {
        expect(character.lineage).toBeUndefined();
      });
    });

    describe('Feitiços', () => {
      it('deve começar sem dados de conjuração', () => {
        expect(character.spellcasting).toBeUndefined();
      });
    });

    describe('Particularidades', () => {
      it('deve começar sem características negativas', () => {
        expect(character.particularities.negativeTraits).toEqual([]);
      });

      it('deve começar sem características positivas', () => {
        expect(character.particularities.positiveTraits).toEqual([]);
      });

      it('deve começar sem características completas', () => {
        expect(character.particularities.completeTraits).toEqual([]);
      });

      it('deve ter balanço de 0', () => {
        expect(character.particularities.balance).toBe(0);
      });
    });

    describe('Descrição Física', () => {
      it('deve ter descrição física vazia', () => {
        expect(character.physicalDescription.skin).toBeUndefined();
        expect(character.physicalDescription.eyes).toBeUndefined();
        expect(character.physicalDescription.hair).toBeUndefined();
        expect(character.physicalDescription.other).toBeUndefined();
      });
    });

    describe('Definidores do Personagem', () => {
      it('deve ter todos os definidores vazios', () => {
        expect(character.definers.flaws).toEqual([]);
        expect(character.definers.fears).toEqual([]);
        expect(character.definers.ideals).toEqual([]);
        expect(character.definers.traits).toEqual([]);
        expect(character.definers.goals).toEqual([]);
        expect(character.definers.allies).toEqual([]);
        expect(character.definers.organizations).toEqual([]);
      });
    });

    describe('História e Outros Campos', () => {
      it('deve ter campos opcionais vazios', () => {
        expect(character.gender).toBeUndefined();
        expect(character.alignment).toBeUndefined();
        expect(character.faith).toBeUndefined();
        expect(character.backstory).toBeUndefined();
      });
    });

    describe('Progressão de Níveis', () => {
      it('deve ter progressão de 15 níveis', () => {
        expect(character.levelProgression).toHaveLength(15);
      });

      it('apenas nível 1 deve estar alcançado', () => {
        character.levelProgression.forEach((prog, index) => {
          if (index === 0) {
            expect(prog.achieved).toBe(true);
            expect(prog.level).toBe(1);
          } else {
            expect(prog.achieved).toBe(false);
          }
        });
      });

      it('níveis devem estar em ordem crescente', () => {
        character.levelProgression.forEach((prog, index) => {
          expect(prog.level).toBe(index + 1);
        });
      });
    });

    describe('Anotações', () => {
      it('deve começar sem anotações', () => {
        expect(character.notes).toEqual([]);
      });
    });

    describe('Habilidade de Assinatura', () => {
      it('deve ter uma habilidade de assinatura padrão', () => {
        expect(character.signatureSkill).toBeDefined();
        expect(typeof character.signatureSkill).toBe('string');
      });

      it('habilidade de assinatura padrão deve ser uma habilidade válida', () => {
        expect(SKILL_LIST).toContain(character.signatureSkill);
      });
    });

    describe('Integração e Consistência', () => {
      it('deve criar um objeto Character válido e completo', () => {
        expect(character).toBeDefined();
        expect(typeof character).toBe('object');
      });

      it('deve ter todas as propriedades obrigatórias', () => {
        // Propriedades essenciais
        expect(character.id).toBeDefined();
        expect(character.name).toBeDefined();
        expect(character.level).toBeDefined();
        expect(character.attributes).toBeDefined();
        expect(character.skills).toBeDefined();
        expect(character.combat).toBeDefined();
        expect(character.inventory).toBeDefined();
        expect(character.languages).toBeDefined();
        expect(character.proficiencies).toBeDefined();
      });

      it('deve ser serializável em JSON', () => {
        expect(() => JSON.stringify(character)).not.toThrow();
      });

      it('deve ser desserializável de JSON', () => {
        const json = JSON.stringify(character);
        expect(() => JSON.parse(json)).not.toThrow();
        const parsed = JSON.parse(json);
        expect(parsed.name).toBe(character.name);
      });
    });

    describe('Valores Padrão Conforme Regras do RPG', () => {
      it('deve seguir regra: PV base = 15', () => {
        expect(character.combat.hp.max).toBe(15);
      });

      it('deve seguir regra: PP base = 2', () => {
        expect(character.combat.pp.max).toBe(2);
      });

      it('deve seguir regra: Todos atributos = 1 (média humanoide)', () => {
        Object.values(character.attributes).forEach((attr) => {
          expect(attr).toBe(1);
        });
      });

      it('deve seguir regra: Proficiência padrão = Armas Simples', () => {
        expect(character.proficiencies.weapons).toContain('Armas Simples');
      });

      it('deve seguir regra: Idioma padrão = Comum', () => {
        expect(character.languages).toContain('comum');
      });

      it('deve seguir regra: Inventário inicial (Mochila, Cartão, 10 PO$)', () => {
        const hasBackpack = character.inventory.items.some(
          (item) => item.name === 'Mochila'
        );
        const hasCard = character.inventory.items.some(
          (item) => item.name === 'Cartão do Banco'
        );
        // 10 PO$ no banco (já que temos Cartão do Banco)
        const hasGold = character.inventory.currency.bank.ouro === 10;

        expect(hasBackpack).toBe(true);
        expect(hasCard).toBe(true);
        expect(hasGold).toBe(true);
      });

      it('deve seguir regra: Defesa = 15 + Agilidade', () => {
        const expectedDefense = 15 + character.attributes.agilidade;
        expect(character.combat.defense.total).toBe(expectedDefense);
      });

      it('deve seguir regra: Capacidade de carga = 5 + (Força * 5)', () => {
        const expectedCapacity = 5 + character.attributes.forca * 5;
        expect(character.inventory.carryingCapacity.base).toBe(
          expectedCapacity
        );
      });

      it('deve seguir regra: Deslocamento padrão andando = 5', () => {
        expect(character.movement.speeds.andando.base).toBe(5);
      });

      it('deve seguir regra: Todas habilidades começam em Leigo (x0)', () => {
        Object.values(character.skills).forEach((skill) => {
          expect(skill.proficiencyLevel).toBe('leigo');
        });
      });
    });
  });
});
