/**
 * Testes de validação dos metadados de habilidades
 * Garante que os metadados estão corretos conforme a tabela oficial das Regras Básicas
 */

import { SKILL_METADATA, COMBAT_SKILLS } from '../skills';

describe('Metadados de Habilidades - Validação contra Regras Básicas', () => {
  describe('Habilidades de Combate', () => {
    it('deve ter exatamente 10 habilidades de combate', () => {
      expect(COMBAT_SKILLS).toHaveLength(10);
    });

    it('deve marcar Acerto como habilidade de combate', () => {
      expect(SKILL_METADATA.acerto.isCombatSkill).toBe(true);
    });

    it('deve marcar Arcano como habilidade de combate', () => {
      expect(SKILL_METADATA.arcano.isCombatSkill).toBe(true);
    });

    it('deve marcar Determinação como habilidade de combate', () => {
      expect(SKILL_METADATA.determinacao.isCombatSkill).toBe(true);
    });

    it('deve marcar Iniciativa como habilidade de combate', () => {
      expect(SKILL_METADATA.iniciativa.isCombatSkill).toBe(true);
    });

    it('deve marcar Luta como habilidade de combate', () => {
      expect(SKILL_METADATA.luta.isCombatSkill).toBe(true);
    });

    it('deve marcar Natureza como habilidade de combate', () => {
      expect(SKILL_METADATA.natureza.isCombatSkill).toBe(true);
    });

    it('deve marcar Reflexo como habilidade de combate', () => {
      expect(SKILL_METADATA.reflexo.isCombatSkill).toBe(true);
    });

    it('deve marcar Religião como habilidade de combate', () => {
      expect(SKILL_METADATA.religiao.isCombatSkill).toBe(true);
    });

    it('deve marcar Tenacidade como habilidade de combate', () => {
      expect(SKILL_METADATA.tenacidade.isCombatSkill).toBe(true);
    });

    it('deve marcar Vigor como habilidade de combate', () => {
      expect(SKILL_METADATA.vigor.isCombatSkill).toBe(true);
    });

    it('deve incluir todas as 10 habilidades corretas no array COMBAT_SKILLS', () => {
      const expectedCombatSkills = [
        'acerto',
        'arcano',
        'determinacao',
        'iniciativa',
        'luta',
        'natureza',
        'reflexo',
        'religiao',
        'tenacidade',
        'vigor',
      ];
      expect(COMBAT_SKILLS.sort()).toEqual(expectedCombatSkills.sort());
    });
  });

  describe('Habilidades com Carga', () => {
    it('deve marcar Acrobacia com penalidade de carga', () => {
      expect(SKILL_METADATA.acrobacia.hasCargaPenalty).toBe(true);
    });

    it('deve marcar Atletismo com penalidade de carga', () => {
      expect(SKILL_METADATA.atletismo.hasCargaPenalty).toBe(true);
    });

    it('deve marcar Condução com penalidade de carga', () => {
      expect(SKILL_METADATA.conducao.hasCargaPenalty).toBe(true);
    });

    it('deve marcar Destreza com penalidade de carga', () => {
      expect(SKILL_METADATA.destreza.hasCargaPenalty).toBe(true);
    });

    it('deve marcar Furtividade com penalidade de carga', () => {
      expect(SKILL_METADATA.furtividade.hasCargaPenalty).toBe(true);
    });

    it('deve marcar Iniciativa com penalidade de carga', () => {
      expect(SKILL_METADATA.iniciativa.hasCargaPenalty).toBe(true);
    });

    it('deve marcar Performance com penalidade de carga', () => {
      expect(SKILL_METADATA.performance.hasCargaPenalty).toBe(true);
    });

    it('deve marcar Reflexo com penalidade de carga', () => {
      expect(SKILL_METADATA.reflexo.hasCargaPenalty).toBe(true);
    });

    it('não deve marcar Acerto com penalidade de carga', () => {
      expect(SKILL_METADATA.acerto.hasCargaPenalty).toBe(false);
    });
  });

  describe('Habilidades com Instrumento', () => {
    it('deve marcar Condução como requer instrumento', () => {
      expect(SKILL_METADATA.conducao.requiresInstrument).toBe(true);
    });

    it('deve marcar Destreza como requer instrumento', () => {
      expect(SKILL_METADATA.destreza.requiresInstrument).toBe(true);
    });

    it('deve marcar Enganação como requer instrumento', () => {
      expect(SKILL_METADATA.enganacao.requiresInstrument).toBe(true);
    });

    it('deve marcar Medicina como requer instrumento', () => {
      expect(SKILL_METADATA.medicina.requiresInstrument).toBe(true);
    });

    it('deve marcar Ofício como requer instrumento', () => {
      expect(SKILL_METADATA.oficio.requiresInstrument).toBe(true);
    });

    it('não deve marcar Acerto como requer instrumento', () => {
      expect(SKILL_METADATA.acerto.requiresInstrument).toBe(false);
    });

    it('não deve marcar Adestramento como requer instrumento', () => {
      expect(SKILL_METADATA.adestramento.requiresInstrument).toBe(false);
    });

    it('não deve marcar Arcano como requer instrumento', () => {
      expect(SKILL_METADATA.arcano.requiresInstrument).toBe(false);
    });

    it('não deve marcar Arte como requer instrumento', () => {
      expect(SKILL_METADATA.arte.requiresInstrument).toBe(false);
    });
  });

  describe('Habilidades com Proficiência', () => {
    it('deve marcar Adestramento como requer proficiência', () => {
      expect(SKILL_METADATA.adestramento.requiresProficiency).toBe(true);
    });

    it('deve marcar Arcano como requer proficiência', () => {
      expect(SKILL_METADATA.arcano.requiresProficiency).toBe(true);
    });

    it('deve marcar Arte como requer proficiência', () => {
      expect(SKILL_METADATA.arte.requiresProficiency).toBe(true);
    });

    it('deve marcar Condução como requer proficiência', () => {
      expect(SKILL_METADATA.conducao.requiresProficiency).toBe(true);
    });

    it('deve marcar Destreza como requer proficiência', () => {
      expect(SKILL_METADATA.destreza.requiresProficiency).toBe(true);
    });

    it('deve marcar Estratégia como requer proficiência', () => {
      expect(SKILL_METADATA.estrategia.requiresProficiency).toBe(true);
    });

    it('deve marcar Instrução como requer proficiência', () => {
      expect(SKILL_METADATA.instrucao.requiresProficiency).toBe(true);
    });

    it('deve marcar Medicina como requer proficiência', () => {
      expect(SKILL_METADATA.medicina.requiresProficiency).toBe(true);
    });

    it('deve marcar Rastreamento como requer proficiência', () => {
      expect(SKILL_METADATA.rastreamento.requiresProficiency).toBe(true);
    });

    it('deve marcar Religião como requer proficiência', () => {
      expect(SKILL_METADATA.religiao.requiresProficiency).toBe(true);
    });

    it('não deve marcar Acerto como requer proficiência', () => {
      expect(SKILL_METADATA.acerto.requiresProficiency).toBe(false);
    });

    it('não deve marcar Tenacidade como requer proficiência', () => {
      expect(SKILL_METADATA.tenacidade.requiresProficiency).toBe(false);
    });

    it('não deve marcar Vigor como requer proficiência', () => {
      expect(SKILL_METADATA.vigor.requiresProficiency).toBe(false);
    });
  });

  describe('Validação de Atributos-chave', () => {
    it('Acerto deve usar Agilidade', () => {
      expect(SKILL_METADATA.acerto.keyAttribute).toBe('agilidade');
    });

    it('Determinação deve usar Mente', () => {
      expect(SKILL_METADATA.determinacao.keyAttribute).toBe('mente');
    });

    it('Luta deve usar Força', () => {
      expect(SKILL_METADATA.luta.keyAttribute).toBe('forca');
    });

    it('Natureza deve usar Presença', () => {
      expect(SKILL_METADATA.natureza.keyAttribute).toBe('presenca');
    });

    it('Religião deve usar Presença', () => {
      expect(SKILL_METADATA.religiao.keyAttribute).toBe('presenca');
    });

    it('Ofício deve usar Especial', () => {
      expect(SKILL_METADATA.oficio.keyAttribute).toBe('especial');
    });

    it('Sorte deve usar Especial', () => {
      expect(SKILL_METADATA.sorte.keyAttribute).toBe('especial');
    });
  });
});
