'use client';

import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import type { Character } from '@/types';

/**
 * Props do CharacterCard
 */
interface CharacterCardProps {
  /** Personagem a ser exibido */
  character: Character;
  /** Callback ao clicar no card */
  onClick?: (characterId: string) => void;
}

/**
 * Card de personagem para exibição em lista
 *
 * Exibe informações básicas do personagem:
 * - Nome do personagem
 * - Nome do jogador (se preenchido)
 * - Nível
 * - Linhagem (se preenchida)
 * - Origem (se preenchida)
 * - PV atual/máximo
 * - PP atual/máximo
 *
 * Seguindo requisitos do MVP 1:
 * - Informações básicas conforme especificado em mvp-um.md
 * - Clicável para navegação
 * - Responsivo
 */
export default function CharacterCard({
  character,
  onClick,
}: CharacterCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(character.id);
    }
  };

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: 6,
            }
          : {},
      }}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      aria-label={`Ficha do personagem ${character.name || 'Sem nome'}`}
    >
      <CardContent
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {/* Nome do Personagem */}
        <Typography
          variant="h6"
          component="h2"
          noWrap
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
          }}
        >
          {character.name || 'Sem nome'}
        </Typography>

        {/* Nome do Jogador (opcional) */}
        {character.playerName && (
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ mt: -1 }}
          >
            Jogador: {character.playerName}
          </Typography>
        )}

        {/* Chips: Nível, Linhagem, Origem */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Nível (sempre exibido) */}
          <Chip
            label={`Nível ${character.level}`}
            size="small"
            color="primary"
            variant="outlined"
          />

          {/* Linhagem (se preenchida) */}
          {character.lineage?.name && (
            <Chip
              label={character.lineage.name}
              size="small"
              variant="outlined"
              color="secondary"
            />
          )}

          {/* Origem (se preenchida) */}
          {character.origin?.name && (
            <Chip
              label={character.origin.name}
              size="small"
              variant="outlined"
              color="info"
            />
          )}
        </Box>

        {/* PV e PP */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mt: 'auto',
            pt: 1,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <Box component="span" sx={{ fontWeight: 600, color: 'error.main' }}>
              PV:
            </Box>{' '}
            {character.combat.hp.current}/{character.combat.hp.max}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <Box
              component="span"
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              PP:
            </Box>{' '}
            {character.combat.pp.current}/{character.combat.pp.max}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
