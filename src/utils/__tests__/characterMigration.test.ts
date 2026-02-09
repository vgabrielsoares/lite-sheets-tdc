/**
 * Testes para o sistema de migração de personagens v1 → v2
 *
 * Cobre:
 * - needsMigration(): detecção de versão
 * - migrateAttributeName(): mapeamento de nomes de atributos
 * - migrateAttributes(): migração de valores + merge de forca/constituicao
 * - migrateCharacterV1toV2(): migração completa do personagem
 * - migrateCharacters(): migração em lote
 * - Edge cases: valores inválidos, personagens já migrados, dados parciais
 */

import {
  CURRENT_SCHEMA_VERSION,
  needsMigration,
  migrateAttributeName,
  migrateAttributes,
  migrateCharacterV1toV2,
  migrateCharacters,
} from '../characterMigration';

// ============================================================================
// needsMigration
// ============================================================================

describe('needsMigration', () => {
  it('retorna true para personagem sem schemaVersion', () => {
    expect(needsMigration({ name: 'Test' })).toBe(true);
  });

  it('retorna true para schemaVersion 1', () => {
    expect(needsMigration({ schemaVersion: 1 })).toBe(true);
  });

  it('retorna false para schemaVersion igual à atual', () => {
    expect(needsMigration({ schemaVersion: CURRENT_SCHEMA_VERSION })).toBe(
      false
    );
  });

  it('retorna false para schemaVersion maior que a atual', () => {
    expect(needsMigration({ schemaVersion: CURRENT_SCHEMA_VERSION + 1 })).toBe(
      false
    );
  });

  it('retorna true para schemaVersion 0', () => {
    expect(needsMigration({ schemaVersion: 0 })).toBe(true);
  });
});

// ============================================================================
// migrateAttributeName
// ============================================================================

describe('migrateAttributeName', () => {
  it('mapeia constituicao → corpo', () => {
    expect(migrateAttributeName('constituicao')).toBe('corpo');
  });

  it('mapeia forca → corpo', () => {
    expect(migrateAttributeName('forca')).toBe('corpo');
  });

  it('mapeia presenca → essencia', () => {
    expect(migrateAttributeName('presenca')).toBe('essencia');
  });

  it('mantém agilidade sem mudança', () => {
    expect(migrateAttributeName('agilidade')).toBe('agilidade');
  });

  it('mantém influencia sem mudança', () => {
    expect(migrateAttributeName('influencia')).toBe('influencia');
  });

  it('mantém mente sem mudança', () => {
    expect(migrateAttributeName('mente')).toBe('mente');
  });

  it('mantém corpo sem mudança (já novo)', () => {
    expect(migrateAttributeName('corpo')).toBe('corpo');
  });

  it('mantém essencia sem mudança (já novo)', () => {
    expect(migrateAttributeName('essencia')).toBe('essencia');
  });

  it('mantém instinto sem mudança (já novo)', () => {
    expect(migrateAttributeName('instinto')).toBe('instinto');
  });

  it('retorna nome original se não reconhecido', () => {
    expect(migrateAttributeName('desconhecido')).toBe('desconhecido');
  });
});

// ============================================================================
// migrateAttributes
// ============================================================================

describe('migrateAttributes', () => {
  it('migra atributos v1 básicos com padrões', () => {
    const old = {
      agilidade: 2,
      constituicao: 3,
      forca: 1,
      influencia: 2,
      mente: 4,
      presenca: 3,
    };

    const result = migrateAttributes(old);

    expect(result).toEqual({
      agilidade: 2,
      corpo: 3, // max(constituicao=3, forca=1) → 3
      influencia: 2,
      mente: 4,
      essencia: 3, // presenca → essencia
      instinto: 1, // novo, valor padrão
    });
  });

  it('usa forca quando maior que constituicao para corpo', () => {
    const old = {
      agilidade: 1,
      constituicao: 2,
      forca: 5,
      influencia: 1,
      mente: 1,
      presenca: 1,
    };

    const result = migrateAttributes(old);

    expect(result.corpo).toBe(5); // forca=5 > constituicao=2
  });

  it('usa constituicao quando maior que forca para corpo', () => {
    const old = {
      agilidade: 1,
      constituicao: 4,
      forca: 2,
      influencia: 1,
      mente: 1,
      presenca: 1,
    };

    const result = migrateAttributes(old);

    expect(result.corpo).toBe(4); // constituicao=4 > forca=2
  });

  it('usa constituicao quando forca ausente', () => {
    const old = {
      agilidade: 1,
      constituicao: 3,
      influencia: 1,
      mente: 1,
      presenca: 1,
    };

    const result = migrateAttributes(old);

    // Quando forca ausente (default 0), corpo = max(constituicao=3, 0) = 3
    // Mas corpo field doesn't exist, so corpo = max(constituicao, forca=0) = 3
    expect(result.corpo).toBe(3);
  });

  it('define instinto como 1 quando ausente', () => {
    const old = {
      agilidade: 2,
      constituicao: 3,
      forca: 1,
      influencia: 2,
      mente: 4,
      presenca: 3,
    };

    expect(migrateAttributes(old).instinto).toBe(1);
  });

  it('limita atributos a 0-6', () => {
    const old = {
      agilidade: -2,
      constituicao: 10,
      forca: 0,
      influencia: 7,
      mente: -1,
      presenca: 6,
    };

    const result = migrateAttributes(old);

    expect(result.agilidade).toBe(0); // clamp de -2
    expect(result.corpo).toBe(6); // clamp de 10
    expect(result.influencia).toBe(6); // clamp de 7
    expect(result.mente).toBe(0); // clamp de -1
    expect(result.essencia).toBe(6); // presenca=6, no clamp
  });

  it('arredonda valores decimais para baixo', () => {
    const old = {
      agilidade: 2.7,
      constituicao: 3.9,
      forca: 1.1,
      influencia: 2.5,
      mente: 4.8,
      presenca: 3.3,
    };

    const result = migrateAttributes(old);

    expect(result.agilidade).toBe(2);
    expect(result.corpo).toBe(3); // floor(max(3.9, 1.1)) = 3
    expect(result.influencia).toBe(2);
    expect(result.mente).toBe(4);
    expect(result.essencia).toBe(3);
  });

  it('trata NaN como 1 (padrão)', () => {
    const old = {
      agilidade: NaN,
      constituicao: NaN,
      forca: NaN,
      influencia: NaN,
      mente: NaN,
      presenca: NaN,
    };

    const result = migrateAttributes(old);

    expect(result.agilidade).toBe(1);
    expect(result.corpo).toBe(1);
    expect(result.influencia).toBe(1);
    expect(result.mente).toBe(1);
    expect(result.essencia).toBe(1);
    expect(result.instinto).toBe(1);
  });

  it('preserva atributos v2 se já presentes', () => {
    const already = {
      agilidade: 3,
      corpo: 4,
      influencia: 2,
      mente: 5,
      essencia: 2,
      instinto: 3,
    };

    const result = migrateAttributes(already);

    expect(result).toEqual({
      agilidade: 3,
      corpo: 4,
      influencia: 2,
      mente: 5,
      essencia: 2,
      instinto: 3,
    });
  });

  it('atributos ausentes recebem valor padrão 1', () => {
    const empty = {};

    const result = migrateAttributes(empty);

    expect(result.agilidade).toBe(1);
    expect(result.corpo).toBe(1);
    expect(result.influencia).toBe(1);
    expect(result.mente).toBe(1);
    expect(result.essencia).toBe(1);
    expect(result.instinto).toBe(1);
  });
});

// ============================================================================
// migrateCharacterV1toV2
// ============================================================================

describe('migrateCharacterV1toV2', () => {
  const v1Character: Record<string, unknown> = {
    id: 'char-v1',
    name: 'Guerreiro Antigo',
    level: 3,
    attributes: {
      agilidade: 2,
      constituicao: 3,
      forca: 4,
      influencia: 1,
      mente: 2,
      presenca: 3,
    },
    skills: {
      atletismo: {
        keyAttribute: 'forca',
        proficiency: 'adepto',
        customUses: [{ name: 'Escalar', keyAttribute: 'forca' }],
      },
      percepcao: {
        keyAttribute: 'presenca',
        proficiency: 'leigo',
      },
    },
    crafts: [
      { name: 'Ferraria', attributeKey: 'forca' },
      { name: 'Alquimia', attributeKey: 'presenca' },
    ],
    origin: {
      name: 'Soldado',
      attributeModifiers: [
        { attribute: 'forca', value: 1 },
        { attribute: 'constituicao', value: 1 },
      ],
    },
    lineage: {
      name: 'Humano',
      attributeModifiers: [{ attribute: 'presenca', value: 1 }],
    },
    combat: {
      penalties: {
        savingThrowPenalties: {
          determinacao: 0,
          reflexo: 0,
          tenacidade: 0,
          vigor: 0,
        },
      },
    },
    spellcasting: {
      spellcastingAbilities: [{ attribute: 'presenca', name: 'Magia Natural' }],
    },
  };

  it('adiciona schemaVersion 2', () => {
    const migrated = migrateCharacterV1toV2(v1Character);
    expect(migrated.schemaVersion).toBe(2);
  });

  it('migra atributos corretamente', () => {
    const migrated = migrateCharacterV1toV2(v1Character);
    const attrs = migrated.attributes as Record<string, number>;

    expect(attrs.agilidade).toBe(2);
    expect(attrs.corpo).toBe(4); // max(constituicao=3, forca=4) = 4
    expect(attrs.influencia).toBe(1);
    expect(attrs.mente).toBe(2);
    expect(attrs.essencia).toBe(3); // presenca → essencia
    expect(attrs.instinto).toBe(1); // novo
  });

  it('migra keyAttribute de habilidades', () => {
    const migrated = migrateCharacterV1toV2(v1Character);
    const skills = migrated.skills as Record<string, Record<string, unknown>>;

    expect(skills.atletismo.keyAttribute).toBe('corpo'); // forca → corpo
    expect(skills.percepcao.keyAttribute).toBe('essencia'); // presenca → essencia
  });

  it('migra customUses de habilidades', () => {
    const migrated = migrateCharacterV1toV2(v1Character);
    const skills = migrated.skills as Record<string, Record<string, unknown>>;
    const customUses = skills.atletismo.customUses as Array<
      Record<string, unknown>
    >;

    expect(customUses[0].keyAttribute).toBe('corpo'); // forca → corpo
  });

  it('migra ofícios', () => {
    const migrated = migrateCharacterV1toV2(v1Character);
    const crafts = migrated.crafts as Array<Record<string, unknown>>;

    expect(crafts[0].attributeKey).toBe('corpo'); // forca → corpo
    expect(crafts[1].attributeKey).toBe('essencia'); // presenca → essencia
  });

  it('migra atributos de origem', () => {
    const migrated = migrateCharacterV1toV2(v1Character);
    const origin = migrated.origin as Record<string, unknown>;
    const mods = origin.attributeModifiers as Array<Record<string, unknown>>;

    expect(mods[0].attribute).toBe('corpo'); // forca → corpo
    expect(mods[1].attribute).toBe('corpo'); // constituicao → corpo
  });

  it('migra atributos de linhagem', () => {
    const migrated = migrateCharacterV1toV2(v1Character);
    const lineage = migrated.lineage as Record<string, unknown>;
    const mods = lineage.attributeModifiers as Array<Record<string, unknown>>;

    expect(mods[0].attribute).toBe('essencia'); // presenca → essencia
  });

  it('adiciona sintonia aos savingThrowPenalties', () => {
    const migrated = migrateCharacterV1toV2(v1Character);
    const combat = migrated.combat as Record<string, unknown>;
    const penalties = combat.penalties as Record<string, unknown>;
    const stPenalties = penalties.savingThrowPenalties as Record<
      string,
      number
    >;

    expect(stPenalties.sintonia).toBe(0);
    expect(stPenalties.determinacao).toBe(0);
    expect(stPenalties.reflexo).toBe(0);
    expect(stPenalties.tenacidade).toBe(0);
    expect(stPenalties.vigor).toBe(0);
  });

  it('migra spellcastingAbilities', () => {
    const migrated = migrateCharacterV1toV2(v1Character);
    const sc = migrated.spellcasting as Record<string, unknown>;
    const abilities = sc.spellcastingAbilities as Array<
      Record<string, unknown>
    >;

    expect(abilities[0].attribute).toBe('essencia'); // presenca → essencia
  });

  it('retorna personagem sem mudanças se já na versão atual', () => {
    const v2Character = {
      ...v1Character,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };

    const migrated = migrateCharacterV1toV2(v2Character);

    // Deve retornar o mesmo objeto (sem mudanças)
    expect(migrated).toBe(v2Character);
  });

  it('preserva campos que não precisam de migração', () => {
    const migrated = migrateCharacterV1toV2(v1Character);

    expect(migrated.id).toBe('char-v1');
    expect(migrated.name).toBe('Guerreiro Antigo');
    expect(migrated.level).toBe(3);
  });

  it('lida com personagem sem skills', () => {
    const charNoSkills = {
      id: 'no-skills',
      name: 'Vazio',
      attributes: {
        constituicao: 2,
        forca: 1,
        presenca: 1,
        agilidade: 1,
        influencia: 1,
        mente: 1,
      },
    };
    const migrated = migrateCharacterV1toV2(charNoSkills);

    expect(migrated.schemaVersion).toBe(2);
    expect((migrated.attributes as Record<string, number>).corpo).toBe(2);
  });

  it('lida com personagem sem crafts', () => {
    const charNoCrafts = {
      id: 'no-crafts',
      name: 'Vazio',
      attributes: {
        agilidade: 1,
        corpo: 2,
        influencia: 1,
        mente: 1,
        essencia: 1,
        instinto: 1,
      },
    };
    const migrated = migrateCharacterV1toV2(charNoCrafts);

    expect(migrated.schemaVersion).toBe(2);
  });

  it('lida com personagem sem combat', () => {
    const charNoCombat = {
      id: 'no-combat',
      name: 'Vazio',
      attributes: {
        agilidade: 1,
        constituicao: 3,
        forca: 2,
        influencia: 1,
        mente: 1,
        presenca: 1,
      },
    };
    const migrated = migrateCharacterV1toV2(charNoCombat);

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.combat).toBeUndefined();
  });

  it('lida com personagem sem spellcasting', () => {
    const charNoSpells = {
      id: 'no-spells',
      name: 'Vazio',
      attributes: {
        agilidade: 1,
        constituicao: 1,
        forca: 1,
        influencia: 1,
        mente: 1,
        presenca: 1,
      },
    };
    const migrated = migrateCharacterV1toV2(charNoSpells);

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.spellcasting).toBeUndefined();
  });
});

// ============================================================================
// migrateCharacters (batch)
// ============================================================================

describe('migrateCharacters', () => {
  it('migra apenas personagens que precisam', () => {
    const characters = [
      {
        id: '1',
        name: 'Antigo',
        attributes: {
          constituicao: 2,
          forca: 1,
          presenca: 1,
          agilidade: 1,
          influencia: 1,
          mente: 1,
        },
      },
      {
        id: '2',
        name: 'Novo',
        schemaVersion: CURRENT_SCHEMA_VERSION,
        attributes: {
          agilidade: 1,
          corpo: 2,
          influencia: 1,
          mente: 1,
          essencia: 1,
          instinto: 1,
        },
      },
      {
        id: '3',
        name: 'Velho Também',
        schemaVersion: 1,
        attributes: {
          constituicao: 3,
          forca: 4,
          presenca: 2,
          agilidade: 2,
          influencia: 1,
          mente: 1,
        },
      },
    ];

    const result = migrateCharacters(characters);

    expect(result.migratedNames).toEqual(['Antigo', 'Velho Também']);
    expect(result.migrated).toHaveLength(3);

    // O primeiro e terceiro devem ter schemaVersion 2
    expect(result.migrated[0].schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(result.migrated[2].schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

    // O segundo não foi alterado (já na versão atual)
    expect(result.migrated[1]).toBe(characters[1]); // mesma referência
  });

  it('retorna lista vazia se nenhum personagem precisa de migração', () => {
    const characters = [
      { id: '1', name: 'OK', schemaVersion: CURRENT_SCHEMA_VERSION },
    ];

    const result = migrateCharacters(characters);

    expect(result.migratedNames).toEqual([]);
    expect(result.migrated).toHaveLength(1);
  });

  it('trata lista vazia', () => {
    const result = migrateCharacters([]);

    expect(result.migratedNames).toEqual([]);
    expect(result.migrated).toHaveLength(0);
  });

  it('usa "Sem nome" para personagens sem nome', () => {
    const characters = [
      {
        id: '1',
        attributes: {
          constituicao: 1,
          forca: 1,
          presenca: 1,
          agilidade: 1,
          influencia: 1,
          mente: 1,
        },
      },
    ];

    const result = migrateCharacters(characters);

    expect(result.migratedNames).toEqual(['Sem nome']);
  });
});

// ============================================================================
// CURRENT_SCHEMA_VERSION
// ============================================================================

describe('CURRENT_SCHEMA_VERSION', () => {
  it('é igual a 2', () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(2);
  });
});
