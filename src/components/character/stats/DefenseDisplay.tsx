/**
 * DefenseDisplay Component
 *
 * Displays the character's Defense value with automatic calculation
 * Formula: 15 + Agilidade + armor bonus (limited by Agility) + other bonuses
 *
 * According to RPG rules:
 * - Base defense: 15
 * - Agility bonus: Full Agilidade attribute value
 * - Armor bonus: Limited by armor's max Agility bonus
 * - Other bonuses: From spells, abilities, etc.
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Tooltip,
  IconButton,
  TextField,
  Button,
  List,
  ListItem,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ShieldIcon from '@mui/icons-material/Shield';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { calculateDefense } from '@/utils/calculations';
import { EditableNumber } from '@/components/shared';
import type { Modifier } from '@/types';

interface DefenseDisplayProps {
  /** Current Agilidade (Agility) attribute value */
  agilidade: number;
  /** Armor bonus (already limited by armor's max Agility if applicable) */
  armorBonus?: number;
  /** Maximum Agility bonus allowed by armor (0 = no armor, undefined = no limit) */
  maxAgilityBonus?: number;
  /** Other bonuses from spells, abilities, etc. */
  otherBonuses?: Modifier[];
  /** Callback when armor bonus changes */
  onArmorBonusChange?: (value: number) => void;
  /** Callback when max agility bonus changes */
  onMaxAgilityBonusChange?: (value: number | undefined) => void;
  /** Callback when other bonuses change */
  onOtherBonusesChange?: (bonuses: Modifier[]) => void;
  /** Whether the component is in edit mode */
  editable?: boolean;
  /** Callback to open a sidebar for detailed editing */
  onOpenDetails?: () => void;
}

export const DefenseDisplay: React.FC<DefenseDisplayProps> = ({
  agilidade,
  armorBonus = 0,
  maxAgilityBonus,
  otherBonuses = [],
  onArmorBonusChange,
  onMaxAgilityBonusChange,
  onOtherBonusesChange,
  editable = true,
  onOpenDetails,
}) => {
  // Calculate the effective agility bonus (limited by armor if applicable)
  const effectiveAgilityBonus =
    maxAgilityBonus !== undefined
      ? Math.min(agilidade, maxAgilityBonus)
      : agilidade;

  // Calculate total from other bonuses
  const otherBonusesTotal = otherBonuses.reduce(
    (sum, modifier) => sum + modifier.value,
    0
  );

  // Calculate total defense
  const totalDefense =
    15 + effectiveAgilityBonus + armorBonus + otherBonusesTotal;

  // Build tooltip text
  const tooltipText = `
Cálculo de Defesa:
• Base: 15
• Agilidade: ${agilidade}${maxAgilityBonus !== undefined ? ` (limitado a ${maxAgilityBonus} pela armadura)` : ''}
• Bônus de Armadura: ${armorBonus > 0 ? `+${armorBonus}` : armorBonus}
• Outros Bônus: ${otherBonusesTotal > 0 ? `+${otherBonusesTotal}` : otherBonusesTotal}
━━━━━━━━━━━━━━━━━
Total: ${totalDefense}
  `.trim();

  const handleAddBonus = () => {
    if (onOtherBonusesChange) {
      onOtherBonusesChange([
        ...otherBonuses,
        {
          name: 'Novo Bônus',
          value: 1,
          type: 'bonus',
        },
      ]);
    }
  };

  const handleRemoveBonus = (index: number) => {
    if (onOtherBonusesChange) {
      onOtherBonusesChange(otherBonuses.filter((_, i) => i !== index));
    }
  };

  const handleUpdateBonus = (index: number, updates: Partial<Modifier>) => {
    if (onOtherBonusesChange) {
      onOtherBonusesChange(
        otherBonuses.map((bonus, i) =>
          i === index ? { ...bonus, ...updates } : bonus
        )
      );
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        minWidth: 200,
        border: onOpenDetails ? 1 : 0,
        borderColor: onOpenDetails ? 'primary.main' : 'transparent',
        cursor: onOpenDetails ? 'pointer' : 'default',
      }}
      onClick={onOpenDetails}
    >
      {/* Header */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}
      >
        <ShieldIcon color="primary" />
        <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
          Defesa
        </Typography>
        <Tooltip title={tooltipText} arrow>
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ width: '100%' }} />

      {/* Total Defense Value */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2,
        }}
      >
        <Typography
          variant="h3"
          component="div"
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          {totalDefense}
        </Typography>
      </Box>

      <Divider sx={{ width: '100%' }} />

      {/* Breakdown */}
      <Box
        sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        {/* Base Defense */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Base:
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            15
          </Typography>
        </Box>

        {/* Agility */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Agilidade:
          </Typography>
          <Typography
            variant="body2"
            fontWeight="medium"
            color={
              effectiveAgilityBonus < agilidade ? 'warning.main' : 'inherit'
            }
          >
            {effectiveAgilityBonus > 0 ? '+' : ''}
            {effectiveAgilityBonus}
            {maxAgilityBonus !== undefined &&
              effectiveAgilityBonus < agilidade && (
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 0.5 }}
                >
                  (máx {maxAgilityBonus})
                </Typography>
              )}
          </Typography>
        </Box>

        {/* Armor Bonus */}
        {editable ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Bônus de Armadura:
            </Typography>
            <EditableNumber
              value={armorBonus}
              onChange={onArmorBonusChange || (() => {})}
              min={0}
              max={20}
              showSign
              variant="body2"
              autoSave
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Bônus de Armadura:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {armorBonus > 0 ? '+' : ''}
              {armorBonus}
            </Typography>
          </Box>
        )}

        {/* Max Agility Bonus (armor limitation) */}
        {editable && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Limite de Agilidade:
            </Typography>
            <TextField
              type="number"
              value={maxAgilityBonus ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                if (onMaxAgilityBonusChange) {
                  onMaxAgilityBonusChange(
                    val === '' ? undefined : parseInt(val, 10)
                  );
                }
              }}
              size="small"
              sx={{ width: 80 }}
              inputProps={{
                min: 0,
                max: 10,
                style: { textAlign: 'right' },
              }}
              placeholder="Sem limite"
            />
          </Box>
        )}

        {/* Other Bonuses */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Outros Bônus:
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {otherBonusesTotal > 0 ? '+' : ''}
            {otherBonusesTotal}
          </Typography>
        </Box>

        {/* List of Other Bonuses (editable) */}
        {editable && otherBonuses.length > 0 && (
          <List dense sx={{ width: '100%', p: 0 }}>
            {otherBonuses.map((bonus, index) => (
              <ListItem
                key={index}
                sx={{
                  px: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <TextField
                  value={bonus.name}
                  onChange={(e) =>
                    handleUpdateBonus(index, { name: e.target.value })
                  }
                  size="small"
                  sx={{ flexGrow: 1, minWidth: 100 }}
                  placeholder="Nome do bônus"
                />
                <EditableNumber
                  value={bonus.value}
                  onChange={(value) => handleUpdateBonus(index, { value })}
                  min={-10}
                  max={20}
                  showSign
                  variant="body2"
                  autoSave
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveBonus(index)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}

        {/* Add Bonus Button */}
        {editable && (
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddBonus}
            size="small"
            fullWidth
            variant="outlined"
          >
            Adicionar Bônus
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default DefenseDisplay;
