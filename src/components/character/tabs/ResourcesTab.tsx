'use client';

import React, { useCallback, useState } from 'react';
import {
  Box,
  Stack,
  Divider,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import TranslateIcon from '@mui/icons-material/Translate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import HotelIcon from '@mui/icons-material/Hotel';
import {
  ProficienciesList,
  LanguagesList,
  RestCalculator,
  ResourceTracker,
} from '@/components/character/resources';
import { ProficiencyPurchasePanel } from '@/components/character/ProficiencyPurchasePanel';
import { ComplementaryTraits, CompleteTraits } from '../traits';
import type {
  Character,
  Proficiencies,
  LanguageName,
  SkillName,
  ComplementaryTrait,
  CompleteTrait,
} from '@/types';
import type { ResourceDie } from '@/types/resources';
import type { ProficiencyPurchaseRecord } from '@/constants/proficiencyPurchases';
import { PURCHASABLE_PROFICIENCIES } from '@/constants/proficiencyPurchases';
import { SKILL_LABELS } from '@/constants/skills';
import { LANGUAGE_LABELS } from '@/constants/languages';
import { calculateTraitBalance } from '@/types/traits';

export interface ResourcesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

/**
 * Aba de Recursos
 *
 * Exibe e gerencia recursos do personagem:
 * - Proficiências (armas, armaduras, ferramentas, outros)
 * - Idiomas conhecidos
 * - Particularidades (características complementares e completas)
 * - Calculadora de descanso (recuperação de GA/PP)
 *
 * Memoizado para evitar re-renders desnecessários.
 */
export const ResourcesTab = React.memo(function ResourcesTab({
  character,
  onUpdate,
}: ResourcesTabProps) {
  const [purchasesExpanded, setPurchasesExpanded] = useState(false);
  const [languagesExpanded, setLanguagesExpanded] = useState(false);
  const [particularitiessExpanded, setParticularitiesExpanded] =
    useState(false);
  const [restExpanded, setRestExpanded] = useState(false);
  const handleProficienciesUpdate = useCallback(
    (proficiencies: Proficiencies) => {
      onUpdate({ proficiencies });
    },
    [onUpdate]
  );

  const handleLanguagesUpdate = useCallback(
    (languages: LanguageName[]) => {
      onUpdate({ languages });
    },
    [onUpdate]
  );

  const handleExtraLanguagesModifierUpdate = useCallback(
    (extraLanguagesModifier: number) => {
      onUpdate({ extraLanguagesModifier });
    },
    [onUpdate]
  );

  const handleResourcesUpdate = useCallback(
    (resources: ResourceDie[]) => {
      onUpdate({ resources });
    },
    [onUpdate]
  );

  const handleProficiencyPurchasesUpdate = useCallback(
    (proficiencyPurchases: ProficiencyPurchaseRecord[]) => {
      // Map purchase categories to proficiency categories
      const categoryMap: Record<string, keyof Proficiencies | null> = {
        weapon: 'weapons',
        armor: 'armor',
        tool: 'tools',
        skill: 'other',
        language: null, // Languages have their own array
      };

      // Build list of purchased proficiency names per category
      const purchasedByCategory: Record<string, string[]> = {
        weapons: [],
        armor: [],
        tools: [],
        other: [],
      };

      const activePurchases = proficiencyPurchases.filter((p) => !p.refunded);
      for (const purchase of activePurchases) {
        const prof = PURCHASABLE_PROFICIENCIES.find(
          (p) => p.id === purchase.proficiencyId
        );
        if (!prof) continue;
        const profKey = categoryMap[prof.category];
        if (!profKey) continue; // skip languages
        const displayName = purchase.specificName
          ? `${purchase.name} (${purchase.specificName})`
          : purchase.name;
        purchasedByCategory[profKey].push(displayName);
      }

      // Merge purchased proficiencies into existing proficiencies
      // (only add if not already present)
      const currentProfs = character.proficiencies;
      const updatedProfs: Proficiencies = {
        weapons: [
          ...currentProfs.weapons.filter(
            (w) => !purchasedByCategory.weapons.includes(w)
          ),
          ...purchasedByCategory.weapons.filter(
            (w) => !currentProfs.weapons.includes(w)
          ),
        ],
        armor: [
          ...currentProfs.armor.filter(
            (a) => !purchasedByCategory.armor.includes(a)
          ),
          ...purchasedByCategory.armor.filter(
            (a) => !currentProfs.armor.includes(a)
          ),
        ],
        tools: [
          ...currentProfs.tools.filter(
            (t) => !purchasedByCategory.tools.includes(t)
          ),
          ...purchasedByCategory.tools.filter(
            (t) => !currentProfs.tools.includes(t)
          ),
        ],
        other: [
          ...currentProfs.other.filter(
            (o) => !purchasedByCategory.other.includes(o)
          ),
          ...purchasedByCategory.other.filter(
            (o) => !currentProfs.other.includes(o)
          ),
        ],
      };

      onUpdate({ proficiencyPurchases, proficiencies: updatedProfs });

      // ── Side effects: upgrade skills and add languages from purchases ──

      // Reverse lookup maps: display label → key
      const skillLabelToKey = Object.fromEntries(
        Object.entries(SKILL_LABELS).map(([k, v]) => [v, k as SkillName])
      );
      const languageLabelToKey = Object.fromEntries(
        Object.entries(LANGUAGE_LABELS).map(([k, v]) => [v, k as LanguageName])
      );

      // Track skill and language upgrades from active purchases
      const skillUpgrades: SkillName[] = [];
      const languageAdditions: LanguageName[] = [];

      for (const purchase of activePurchases) {
        const prof = PURCHASABLE_PROFICIENCIES.find(
          (p) => p.id === purchase.proficiencyId
        );
        if (!prof || !purchase.specificName) continue;

        if (prof.category === 'skill') {
          const skillKey = skillLabelToKey[purchase.specificName];
          if (skillKey) skillUpgrades.push(skillKey);
        } else if (prof.category === 'language') {
          const langKey = languageLabelToKey[purchase.specificName];
          if (langKey) languageAdditions.push(langKey);
        }
      }

      // Build partial update for skill upgrades + bonus slots and languages
      const additionalUpdates: Partial<Character> = {};

      if (skillUpgrades.length > 0) {
        const updatedSkills = { ...character.skills };
        for (const skillName of skillUpgrades) {
          if (updatedSkills[skillName]?.proficiencyLevel === 'leigo') {
            updatedSkills[skillName] = {
              ...updatedSkills[skillName],
              proficiencyLevel: 'adepto',
            };
          }
        }
        additionalUpdates.skills = updatedSkills;
        // +1 in "Bônus de Poderes/Arquétipos/Classes" per skill purchase
        additionalUpdates.skillProficiencyBonusSlots =
          (character.skillProficiencyBonusSlots ?? 0) + skillUpgrades.length;
      }

      if (languageAdditions.length > 0) {
        const currentLanguages = character.languages ?? [];
        const newLanguages = [
          ...currentLanguages,
          ...languageAdditions.filter((l) => !currentLanguages.includes(l)),
        ];
        additionalUpdates.languages = newLanguages;
        // +1 in extra languages modifier per language purchase
        additionalUpdates.extraLanguagesModifier =
          (character.extraLanguagesModifier ?? 0) + languageAdditions.length;
      }

      if (Object.keys(additionalUpdates).length > 0) {
        onUpdate(additionalUpdates);
      }
    },
    [
      onUpdate,
      character.proficiencies,
      character.skills,
      character.languages,
      character.skillProficiencyBonusSlots,
      character.extraLanguagesModifier,
    ]
  );

  const handleUpdateNegativeTraits = useCallback(
    (negativeTraits: ComplementaryTrait[]) => {
      const balance = calculateTraitBalance(
        negativeTraits,
        character.particularities.positiveTraits
      );
      onUpdate({
        particularities: {
          ...character.particularities,
          negativeTraits,
          balance,
        },
      });
    },
    [character.particularities, onUpdate]
  );

  const handleUpdatePositiveTraits = useCallback(
    (positiveTraits: ComplementaryTrait[]) => {
      const balance = calculateTraitBalance(
        character.particularities.negativeTraits,
        positiveTraits
      );
      onUpdate({
        particularities: {
          ...character.particularities,
          positiveTraits,
          balance,
        },
      });
    },
    [character.particularities, onUpdate]
  );

  const handleUpdateCompleteTraits = useCallback(
    (completeTraits: CompleteTrait[]) => {
      onUpdate({
        particularities: {
          ...character.particularities,
          completeTraits,
        },
      });
    },
    [character.particularities, onUpdate]
  );

  const handleApplyRecovery = useCallback(
    (gaRecovery: number, ppRecovery: number) => {
      // v0.0.2: Recuperação aplica a GA (Guarda), não mais HP
      const guard = character.combat.guard;
      const newGuardCurrent = guard
        ? Math.min(guard.current + gaRecovery, guard.max)
        : 0;
      const newCurrentPP = Math.min(
        character.combat.pp.current + ppRecovery,
        character.combat.pp.max
      );

      onUpdate({
        combat: {
          ...character.combat,
          ...(guard && {
            guard: {
              ...guard,
              current: newGuardCurrent,
            },
          }),
          pp: {
            ...character.combat.pp,
            current: newCurrentPP,
          },
        },
      });
    },
    [character, onUpdate]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={4}>
        {/* Dados de Recurso (Água, Comida, Tochas, etc.) */}
        <Box id="section-resource-dice">
          <ResourceTracker
            resources={character.resources ?? []}
            onUpdateResources={handleResourcesUpdate}
          />
        </Box>

        <Divider />

        {/* Proficiências */}
        <Box id="section-proficiencies">
          <ProficienciesList
            proficiencies={character.proficiencies}
            onUpdate={handleProficienciesUpdate}
          />
        </Box>

        <Divider />

        {/* Compra de Proficiências */}
        <Card
          variant="outlined"
          id="section-proficiency-purchases"
          sx={{
            borderColor: 'primary.main',
            borderWidth: 1,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                mb: purchasesExpanded ? 2 : 0,
              }}
              onClick={() => setPurchasesExpanded(!purchasesExpanded)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddShoppingCartIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Compra de Proficiências
                </Typography>
              </Box>
              <IconButton
                size="small"
                sx={{
                  transform: purchasesExpanded
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
                aria-label={purchasesExpanded ? 'Recolher' : 'Expandir'}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>

            <Collapse in={purchasesExpanded}>
              <ProficiencyPurchasePanel
                character={character}
                onPurchasesChange={handleProficiencyPurchasesUpdate}
              />
            </Collapse>
          </CardContent>
        </Card>

        {/* Idiomas */}
        <Card
          variant="outlined"
          id="section-languages"
          sx={{
            borderColor: 'primary.main',
            borderWidth: 1,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                mb: languagesExpanded ? 2 : 0,
              }}
              onClick={() => setLanguagesExpanded(!languagesExpanded)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TranslateIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Idiomas
                </Typography>
              </Box>
              <IconButton
                size="small"
                sx={{
                  transform: languagesExpanded
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
                aria-label={languagesExpanded ? 'Recolher' : 'Expandir'}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>

            <Collapse in={languagesExpanded}>
              <LanguagesList
                languages={character.languages}
                menteValue={character.attributes.mente}
                lineageLanguages={character.lineage?.languages || []}
                extraLanguagesModifier={character.extraLanguagesModifier}
                onUpdate={handleLanguagesUpdate}
                onUpdateModifier={handleExtraLanguagesModifierUpdate}
              />
            </Collapse>
          </CardContent>
        </Card>

        <Divider />

        {/* Particularidades */}
        <Card
          variant="outlined"
          id="section-particularities"
          sx={{
            borderColor: 'primary.main',
            borderWidth: 1,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                mb: particularitiessExpanded ? 2 : 0,
              }}
              onClick={() =>
                setParticularitiesExpanded(!particularitiessExpanded)
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Particularidades
                </Typography>
              </Box>
              <IconButton
                size="small"
                sx={{
                  transform: particularitiessExpanded
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
                aria-label={particularitiessExpanded ? 'Recolher' : 'Expandir'}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>

            <Collapse in={particularitiessExpanded}>
              <Stack spacing={4}>
                {/* Características Complementares */}
                <Box>
                  <ComplementaryTraits
                    negativeTraits={character.particularities.negativeTraits}
                    positiveTraits={character.particularities.positiveTraits}
                    onUpdateNegative={handleUpdateNegativeTraits}
                    onUpdatePositive={handleUpdatePositiveTraits}
                  />
                </Box>

                <Divider />

                {/* Características Completas */}
                <Box>
                  <CompleteTraits
                    traits={character.particularities.completeTraits}
                    onUpdate={handleUpdateCompleteTraits}
                  />
                </Box>
              </Stack>
            </Collapse>
          </CardContent>
        </Card>

        <Divider />

        {/* Calculadora de Descanso */}
        <Card
          variant="outlined"
          id="section-rest"
          sx={{
            borderColor: 'primary.main',
            borderWidth: 1,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                mb: restExpanded ? 2 : 0,
              }}
              onClick={() => setRestExpanded(!restExpanded)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HotelIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Descanso
                </Typography>
              </Box>
              <IconButton
                size="small"
                sx={{
                  transform: restExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
                aria-label={restExpanded ? 'Recolher' : 'Expandir'}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>

            <Collapse in={restExpanded}>
              <RestCalculator
                character={character}
                onApplyRecovery={handleApplyRecovery}
              />
            </Collapse>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
});
