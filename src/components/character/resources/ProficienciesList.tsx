'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  TextField,
  Button,
  Collapse,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import BuildIcon from '@mui/icons-material/Build';
import StarIcon from '@mui/icons-material/Star';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import type { Proficiencies } from '@/types';

export interface ProficienciesListProps {
  proficiencies: Proficiencies;
  onUpdate: (proficiencies: Proficiencies) => void;
}

/**
 * Componente para exibir e gerenciar proficiências do personagem
 * Organizado por categorias: Armas, Armaduras, Ferramentas, Outros
 */
export function ProficienciesList({
  proficiencies,
  onUpdate,
}: ProficienciesListProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [newItems, setNewItems] = useState<Record<string, string>>({
    weapons: '',
    armor: '',
    tools: '',
    other: '',
  });

  const categories = [
    {
      key: 'weapons' as const,
      label: 'Armas',
      icon: SecurityIcon,
      color: 'primary' as const,
    },
    {
      key: 'armor' as const,
      label: 'Armaduras',
      icon: ShieldIcon,
      color: 'secondary' as const,
    },
    {
      key: 'tools' as const,
      label: 'Ferramentas',
      icon: BuildIcon,
      color: 'success' as const,
    },
    {
      key: 'other' as const,
      label: 'Outros',
      icon: StarIcon,
      color: 'info' as const,
    },
  ];

  const handleToggleCategory = (categoryKey: string) => {
    setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey);
  };

  const handleAddItem = (category: keyof Proficiencies) => {
    const trimmedValue = newItems[category].trim();
    if (!trimmedValue) return;

    const updatedProficiencies = {
      ...proficiencies,
      [category]: [...proficiencies[category], trimmedValue],
    };

    onUpdate(updatedProficiencies);
    setNewItems({ ...newItems, [category]: '' });
  };

  const handleRemoveItem = (category: keyof Proficiencies, index: number) => {
    const updatedProficiencies = {
      ...proficiencies,
      [category]: proficiencies[category].filter((_, i) => i !== index),
    };

    onUpdate(updatedProficiencies);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    category: keyof Proficiencies
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem(category);
    }
  };

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <MenuBookIcon /> Proficiências
      </Typography>

      <Stack spacing={2}>
        {categories.map((category) => {
          const items = proficiencies[category.key];
          const isExpanded = expandedCategory === category.key;

          return (
            <Card key={category.key} variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleToggleCategory(category.key)}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontWeight: 'bold',
                    }}
                  >
                    <category.icon /> {category.label} ({items.length})
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </Box>

                <Collapse in={isExpanded}>
                  <Box sx={{ mt: 2 }}>
                    {/* Lista de itens */}
                    {items.length === 0 ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: 'italic', mb: 2 }}
                      >
                        Nenhuma proficiência de {category.label.toLowerCase()}{' '}
                        registrada.
                      </Typography>
                    ) : (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}
                      >
                        {items.map((item, index) => (
                          <Chip
                            key={`${category.key}-${index}`}
                            label={item}
                            color={category.color}
                            variant="outlined"
                            onDelete={() =>
                              handleRemoveItem(category.key, index)
                            }
                            deleteIcon={<DeleteIcon />}
                          />
                        ))}
                      </Stack>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Adicionar novo item */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1,
                        alignItems: { xs: 'stretch', sm: 'center' },
                      }}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        placeholder={`Adicionar nova proficiência de ${category.label.toLowerCase()}...`}
                        value={newItems[category.key]}
                        onChange={(e) =>
                          setNewItems({
                            ...newItems,
                            [category.key]: e.target.value,
                          })
                        }
                        onKeyPress={(e) => handleKeyPress(e, category.key)}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        color={category.color}
                        startIcon={<AddIcon />}
                        onClick={() => handleAddItem(category.key)}
                        disabled={!newItems[category.key].trim()}
                        sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                      >
                        Adicionar
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
