/**
 * Character Migration - v1 → v2
 *
 * Migra fichas do schema v1 (atributos antigos) para o schema v2 (atributos novos).
 *
 * Regras de migração:
 * - constituicao → corpo (valor mantido)
 * - forca → merge: se forca > constituicao, usar forca como corpo; senão, manter constituicao como corpo
 * - presenca → essencia (valor mantido)
 * - instinto = 1 (valor padrão, novo atributo)
 * - agilidade, influencia, mente → sem mudança
 * - Adicionar schemaVersion: 2
 *
 * Também migra habilidades, ofícios, origens e linhagens que referenciam atributos antigos.
 */

import type { Character } from '@/types/character';
import type { Attributes, AttributeName } from '@/types/attributes';
import type { Skills, Skill, SkillName } from '@/types/skills';
import { SKILL_LIST, SKILL_KEY_ATTRIBUTES } from '@/types/skills';

/** Versão atual do schema */
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Mapeamento de nomes de atributos antigos para novos
 */
const ATTRIBUTE_NAME_MAP: Record<string, AttributeName> = {
  forca: 'corpo',
  constituicao: 'corpo',
  presenca: 'essencia',
  agilidade: 'agilidade',
  influencia: 'influencia',
  mente: 'mente',
  corpo: 'corpo',
  essencia: 'essencia',
  instinto: 'instinto',
};

/**
 * Verifica se um personagem precisa de migração.
 * Aceita qualquer tipo de objeto para flexibilidade com Character tipado e JSON importado.
 */
export function needsMigration(character: unknown): boolean {
  const c = character as { schemaVersion?: number };
  return !c.schemaVersion || c.schemaVersion < CURRENT_SCHEMA_VERSION;
}

/**
 * Garante que os campos de combate v0.0.2 existam no personagem.
 * Chamar APÓS a migração principal, como safety net para personagens
 * que ficaram em estado intermediário durante o desenvolvimento.
 *
 * Campos garantidos:
 * - combat.guard (GA)
 * - combat.vitality (PV)
 * - combat.vulnerabilityDie
 * - combat.actionEconomy
 */
export function ensureCombatFields(character: Character): Character {
  const combat = character.combat;
  if (!combat) return character;

  let updated = false;
  const patched = { ...combat };

  // Garantir guard (GA)
  if (!patched.guard || typeof patched.guard !== 'object') {
    const gaMax = (patched.hp as { max?: number } | undefined)?.max ?? 15;
    const gaCurrent =
      (patched.hp as { current?: number } | undefined)?.current ?? gaMax;
    patched.guard = { current: Math.min(gaCurrent, gaMax), max: gaMax };
    updated = true;
  }

  // Garantir vitality (PV)
  if (!patched.vitality || typeof patched.vitality !== 'object') {
    const pvMax = Math.floor(patched.guard.max / 3);
    patched.vitality = { current: pvMax, max: pvMax };
    updated = true;
  }

  // Garantir vulnerabilityDie
  if (!patched.vulnerabilityDie) {
    patched.vulnerabilityDie = { currentDie: 'd20', isActive: false };
    updated = true;
  }

  // Garantir actionEconomy (completo, com actions array válido)
  if (!patched.actionEconomy || !Array.isArray(patched.actionEconomy.actions)) {
    const existing = patched.actionEconomy ?? {};
    const turnType =
      'turnType' in existing &&
      (existing.turnType === 'rapido' || existing.turnType === 'lento')
        ? existing.turnType
        : 'rapido';
    const actionCount = turnType === 'lento' ? 3 : 2;
    patched.actionEconomy = {
      turnType,
      actions: Array.from({ length: actionCount }, () => true),
      reaction:
        'reaction' in existing && typeof existing.reaction === 'boolean'
          ? existing.reaction
          : true,
      extraActions:
        'extraActions' in existing && Array.isArray(existing.extraActions)
          ? existing.extraActions
          : [],
    };
    updated = true;
  }

  if (!updated) return character;
  return { ...character, combat: patched as typeof combat };
}

/**
 * Migra o nome de um atributo antigo para o novo
 */
export function migrateAttributeName(oldName: string): AttributeName {
  return ATTRIBUTE_NAME_MAP[oldName] ?? (oldName as AttributeName);
}

/**
 * Migra atributos v1 para v2
 *
 * @param oldAttributes - Atributos no formato antigo (pode conter constituicao, forca, presenca)
 * @returns Atributos no formato v2
 */
export function migrateAttributes(
  oldAttributes: Record<string, number>
): Attributes {
  const agilidade = oldAttributes.agilidade ?? 1;
  const influencia = oldAttributes.influencia ?? 1;
  const mente = oldAttributes.mente ?? 1;

  // Corpo = max(constituicao, forca) — merge de dois atributos
  const constituicao = oldAttributes.constituicao ?? oldAttributes.corpo ?? 1;
  const forca = oldAttributes.forca ?? 0;
  const corpo = oldAttributes.corpo ?? Math.max(constituicao, forca);

  // Essência = presenca (ou essencia se já migrado)
  const essencia = oldAttributes.essencia ?? oldAttributes.presenca ?? 1;

  // Instinto = valor padrão 1 (novo atributo)
  const instinto = oldAttributes.instinto ?? 1;

  return {
    agilidade: clampAttribute(agilidade),
    corpo: clampAttribute(corpo),
    influencia: clampAttribute(influencia),
    mente: clampAttribute(mente),
    essencia: clampAttribute(essencia),
    instinto: clampAttribute(instinto),
  };
}

/**
 * Garante que o valor do atributo está dentro dos limites válidos (0-6)
 */
function clampAttribute(value: number): number {
  if (typeof value !== 'number' || isNaN(value)) return 1;
  return Math.max(0, Math.min(6, Math.floor(value)));
}

/**
 * Migra habilidades que referenciam atributos antigos e adiciona novas skills
 *
 * Garante que todas as skills da SKILL_LIST estejam presentes.
 * Novas skills (sintonia, tenacidade) são adicionadas como 'leigo'.
 */
function migrateSkills(
  skills: Record<string, unknown>
): Record<string, unknown> {
  if (!skills || typeof skills !== 'object') skills = {};

  const migrated: Record<string, unknown> = {};

  // Primeiro, garantir que todas as skills da lista existam (padrão: leigo)
  SKILL_LIST.forEach((skillName: SkillName) => {
    const keyAttribute = SKILL_KEY_ATTRIBUTES[skillName];
    migrated[skillName] = {
      name: skillName,
      keyAttribute: keyAttribute === 'especial' ? 'mente' : keyAttribute,
      proficiencyLevel: 'leigo',
      isSignature: false,
      modifiers: [],
    };
  });

  // Depois, sobrescrever com skills existentes (migradas)
  for (const [skillName, skill] of Object.entries(skills)) {
    if (skill && typeof skill === 'object') {
      const s = skill as Record<string, unknown>;
      const keyAttribute = s.keyAttribute as string;

      migrated[skillName] = {
        ...s,
        keyAttribute: keyAttribute
          ? migrateAttributeName(keyAttribute)
          : s.keyAttribute,
        // Migra usos customizados
        customUses: Array.isArray(s.customUses)
          ? s.customUses.map((use: Record<string, unknown>) => ({
              ...use,
              keyAttribute: use.keyAttribute
                ? migrateAttributeName(use.keyAttribute as string)
                : use.keyAttribute,
            }))
          : s.customUses,
      };
    }
  }

  return migrated;
}

/**
 * Migra ofícios que referenciam atributos antigos
 */
function migrateCrafts(crafts: unknown[]): unknown[] {
  if (!Array.isArray(crafts)) return [];

  return crafts.map((craft) => {
    if (craft && typeof craft === 'object') {
      const c = craft as Record<string, unknown>;
      return {
        ...c,
        attributeKey: c.attributeKey
          ? migrateAttributeName(c.attributeKey as string)
          : c.attributeKey,
      };
    }
    return craft;
  });
}

/**
 * Migra origem que referencia atributos antigos
 */
function migrateOrigin(origin: unknown): unknown {
  if (!origin || typeof origin !== 'object') return origin;

  const o = origin as Record<string, unknown>;
  if (Array.isArray(o.attributeModifiers)) {
    return {
      ...o,
      attributeModifiers: o.attributeModifiers.map(
        (mod: Record<string, unknown>) => ({
          ...mod,
          attribute: mod.attribute
            ? migrateAttributeName(mod.attribute as string)
            : mod.attribute,
        })
      ),
    };
  }

  return origin;
}

/**
 * Migra linhagem que referencia atributos antigos
 */
function migrateLineage(lineage: unknown): unknown {
  if (!lineage || typeof lineage !== 'object') return lineage;

  const l = lineage as Record<string, unknown>;
  if (Array.isArray(l.attributeModifiers)) {
    return {
      ...l,
      attributeModifiers: l.attributeModifiers.map(
        (mod: Record<string, unknown>) => ({
          ...mod,
          attribute: mod.attribute
            ? migrateAttributeName(mod.attribute as string)
            : mod.attribute,
        })
      ),
    };
  }

  return lineage;
}

/**
 * Migra dados de combate para v0.0.2
 *
 * Mudanças:
 * - HP → GA (Guarda) + PV (Vitalidade)
 * - Defesa fixa → removida (teste ativo)
 * - Economia de ações: Maior/Menor → Turno Rápido/Lento
 * - Dado de vulnerabilidade adicionado
 * - Iniciativa removida (turno voluntário)
 * - Sintonia adicionada aos saving throws
 * - Ataques: criticalRange/criticalDamage/attackBonus → actionCost/attackDiceModifier
 */
function migrateCombat(combat: unknown): unknown {
  if (!combat || typeof combat !== 'object') return combat;

  const c = combat as Record<string, unknown>;
  const migrated: Record<string, unknown> = { ...c };

  // Migrate HP → GA + PV
  if (c.hp && typeof c.hp === 'object' && !c.guard) {
    const hp = c.hp as { current?: number; max?: number; temporary?: number };
    const gaMax = hp.max ?? 15;
    const gaCurrent = Math.min(hp.current ?? gaMax, gaMax);
    const pvMax = Math.floor(gaMax / 3);

    migrated.guard = { current: gaCurrent, max: gaMax };
    migrated.vitality = { current: pvMax, max: pvMax };
  }

  // Migrate action economy
  if (c.actionEconomy && typeof c.actionEconomy === 'object') {
    const ae = c.actionEconomy as Record<string, unknown>;
    if ('majorAction' in ae) {
      migrated.actionEconomy = {
        turnType: 'rapido',
        actions: [true, true],
        reaction: true,
        extraActions: Array.isArray(ae.extraActions) ? ae.extraActions : [],
      };
    }
  }

  // Add vulnerability die if missing
  if (!c.vulnerabilityDie) {
    migrated.vulnerabilityDie = {
      currentDie: 'd20',
      isActive: false,
    };
  }

  // Migrate saving throws (add sintonia if missing, update modifier → diceModifier)
  if (Array.isArray(c.savingThrows)) {
    const sts = c.savingThrows as Record<string, unknown>[];
    const hasSintonia = sts.some((st) => st.type === 'sintonia');
    const migratedSTs = sts.map((st) => {
      const result: Record<string, unknown> = { ...st };
      if ('modifier' in result && !('diceModifier' in result)) {
        result.diceModifier = result.modifier ?? 0;
        delete result.modifier;
      }
      return result;
    });
    if (!hasSintonia) {
      migratedSTs.push({
        type: 'sintonia',
        skill: 'sintonia',
        diceModifier: 0,
      });
    }
    migrated.savingThrows = migratedSTs;
  }

  // Migrate attacks (old fields → new fields)
  if (Array.isArray(c.attacks)) {
    migrated.attacks = (c.attacks as Record<string, unknown>[]).map(
      (attack) => {
        const a: Record<string, unknown> = { ...attack };
        if ('actionType' in a && !('actionCost' in a)) {
          const actionTypeMap: Record<string, number> = {
            maior: 1,
            menor: 1,
            '2-menores': 2,
            livre: 0,
            reacao: 0,
            'reacao-defensiva': 0,
          };
          a.actionCost = actionTypeMap[a.actionType as string] ?? 1;
        }
        if ('attackBonus' in a && !('attackDiceModifier' in a)) {
          a.attackDiceModifier = 0;
        }
        return a;
      }
    );
  }

  // Migrate penalties (add sintonia if missing)
  const penalties = c.penalties as Record<string, unknown> | undefined;
  if (penalties && typeof penalties === 'object') {
    const savingThrowPenalties = penalties.savingThrowPenalties as
      | Record<string, number>
      | undefined;
    if (savingThrowPenalties && !('sintonia' in savingThrowPenalties)) {
      migrated.penalties = {
        ...penalties,
        savingThrowPenalties: {
          ...savingThrowPenalties,
          sintonia: 0,
        },
      };
    }
  }

  return migrated;
}

/**
 * Migra dados de conjuração que referenciam atributos antigos
 */
function migrateSpellcasting(spellcasting: unknown): unknown {
  if (!spellcasting || typeof spellcasting !== 'object') return spellcasting;

  const sc = spellcasting as Record<string, unknown>;
  if (Array.isArray(sc.spellcastingAbilities)) {
    return {
      ...sc,
      spellcastingAbilities: sc.spellcastingAbilities.map(
        (ability: Record<string, unknown>) => ({
          ...ability,
          attribute: ability.attribute
            ? migrateAttributeName(ability.attribute as string)
            : ability.attribute,
        })
      ),
    };
  }

  return spellcasting;
}

/**
 * Migra um personagem completo do schema v1 para v2
 *
 * Aceita tanto Character tipado quanto Record genérico (para importação de JSON).
 *
 * @param oldCharacter - Personagem no formato antigo (qualquer versão)
 * @returns Personagem migrado para v2
 */
export function migrateCharacterV1toV2(oldCharacter: Character): Character;
export function migrateCharacterV1toV2(
  oldCharacter: Record<string, unknown>
): Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateCharacterV1toV2(oldCharacter: any): any {
  // Se já está na versão atual, retorna sem mudanças
  if (!needsMigration(oldCharacter)) {
    return oldCharacter;
  }

  const migrated: Record<string, unknown> = {
    ...oldCharacter,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };

  // Migra atributos
  if (oldCharacter.attributes && typeof oldCharacter.attributes === 'object') {
    migrated.attributes = migrateAttributes(
      oldCharacter.attributes as Record<string, number>
    );
  }

  // Migra habilidades
  if (oldCharacter.skills && typeof oldCharacter.skills === 'object') {
    migrated.skills = migrateSkills(
      oldCharacter.skills as Record<string, unknown>
    );
  }

  // Migra ofícios
  if (Array.isArray(oldCharacter.crafts)) {
    migrated.crafts = migrateCrafts(oldCharacter.crafts as unknown[]);
  }

  // Migra origem
  if (oldCharacter.origin) {
    migrated.origin = migrateOrigin(oldCharacter.origin);
  }

  // Migra linhagem
  if (oldCharacter.lineage) {
    migrated.lineage = migrateLineage(oldCharacter.lineage);
  }

  // Migra combate
  if (oldCharacter.combat) {
    migrated.combat = migrateCombat(oldCharacter.combat);
  }

  // Migra conjuração
  if (oldCharacter.spellcasting) {
    migrated.spellcasting = migrateSpellcasting(oldCharacter.spellcasting);
  }

  return migrated;
}

/**
 * Migra uma lista de personagens, retornando informações sobre as migrações realizadas
 *
 * @param characters - Lista de personagens
 * @returns Objeto com personagens migrados e lista de nomes migrados
 */
export function migrateCharacters(characters: Record<string, unknown>[]): {
  migrated: Record<string, unknown>[];
  migratedNames: string[];
} {
  const migratedNames: string[] = [];
  const migrated = characters.map((char) => {
    if (needsMigration(char)) {
      migratedNames.push((char.name as string) || 'Sem nome');
      return migrateCharacterV1toV2(char);
    }
    return char;
  });

  return { migrated, migratedNames };
}
