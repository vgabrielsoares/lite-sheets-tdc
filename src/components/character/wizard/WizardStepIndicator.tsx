/**
 * WizardStepIndicator - Indicador visual de progresso do wizard
 *
 * Exibe uma barra de progresso com os passos do wizard, permitindo
 * visualização rápida do progresso e navegação para passos já visitados.
 */

'use client';

import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person as PersonIcon,
  Home as HomeIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  Build as BuildIcon,
  Backpack as BackpackIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { WizardStep, WIZARD_STEPS, WIZARD_STEP_INFO } from '@/types/wizard';

/**
 * Mapeamento de ícones para cada passo
 */
const STEP_ICONS: Record<WizardStep, React.ReactNode> = {
  concept: <PersonIcon />,
  origin: <HomeIcon />,
  lineage: <AutoAwesomeIcon />,
  attributes: <TrendingUpIcon />,
  archetype: <CategoryIcon />,
  skills: <BuildIcon />,
  equipment: <BackpackIcon />,
  proficiencies: <ShieldIcon />,
  review: <CheckCircleIcon />,
};

interface WizardStepIndicatorProps {
  /** Passo atual */
  currentStep: WizardStep;
  /** Passos já visitados*/
  visitedSteps: WizardStep[];
  /** Callback ao clicar em um passo */
  onStepClick?: (step: WizardStep) => void;
  /** Se a navegação por clique está habilitada */
  enableNavigation?: boolean;
}

/**
 * Componente de indicador de passos do wizard
 */
export function WizardStepIndicator({
  currentStep,
  visitedSteps,
  onStepClick,
  enableNavigation = true,
}: WizardStepIndicatorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const currentIndex = WIZARD_STEPS.indexOf(currentStep);

  const handleStepClick = (step: WizardStep) => {
    if (!enableNavigation || !visitedSteps.includes(step)) return;
    onStepClick?.(step);
  };

  // Versão simplificada para mobile/tablet
  if (isMobile) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 2,
          px: 1,
        }}
      >
        {/* Ícone do passo atual */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {STEP_ICONS[currentStep]}
        </Box>

        {/* Info do passo */}
        <Box sx={{ textAlign: 'left', flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Passo {currentIndex + 1} de {WIZARD_STEPS.length}
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {WIZARD_STEP_INFO[currentStep].title}
          </Typography>
          {!isSmall && (
            <Typography variant="body2" color="text.secondary">
              {WIZARD_STEP_INFO[currentStep].description}
            </Typography>
          )}
        </Box>

        {/* Indicador visual de progresso */}
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
          }}
        >
          {WIZARD_STEPS.map((step, index) => (
            <Tooltip key={step} title={WIZARD_STEP_INFO[step].title} arrow>
              <Box
                onClick={() => handleStepClick(step)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor:
                    index === currentIndex
                      ? 'primary.main'
                      : visitedSteps.includes(step)
                        ? 'primary.light'
                        : 'grey.300',
                  cursor:
                    enableNavigation && visitedSteps.includes(step)
                      ? 'pointer'
                      : 'default',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover':
                    enableNavigation && visitedSteps.includes(step)
                      ? {
                          transform: 'scale(1.3)',
                          bgcolor: 'primary.main',
                        }
                      : {},
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>
    );
  }

  // Versão completa para desktop
  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <Stepper activeStep={currentIndex} alternativeLabel>
        {WIZARD_STEPS.map((step, index) => {
          const stepInfo = WIZARD_STEP_INFO[step];
          const isVisited = visitedSteps.includes(step);
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          const stepContent = (
            <StepLabel
              icon={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: isCurrent
                      ? 'primary.main'
                      : isCompleted
                        ? 'success.main'
                        : isVisited
                          ? 'primary.light'
                          : 'grey.300',
                    color: isCurrent || isCompleted ? 'white' : 'grey.600',
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {STEP_ICONS[step]}
                </Box>
              }
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: '0.75rem',
                  mt: 1,
                  color: isCurrent ? 'primary.main' : 'text.secondary',
                  fontWeight: isCurrent ? 600 : 400,
                },
              }}
            >
              {stepInfo.title}
            </StepLabel>
          );

          // Se navegação habilitada e passo visitado, usar StepButton
          if (enableNavigation && isVisited) {
            return (
              <Step key={step} completed={isCompleted}>
                <Tooltip title={stepInfo.description} arrow>
                  <StepButton onClick={() => handleStepClick(step)}>
                    {stepContent}
                  </StepButton>
                </Tooltip>
              </Step>
            );
          }

          return (
            <Step key={step} completed={isCompleted}>
              <Tooltip title={stepInfo.description} arrow>
                {stepContent}
              </Tooltip>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}

export default WizardStepIndicator;
