/**
 * CharacterCreationWizard - Componente principal do wizard de criação
 *
 * Container principal que organiza os passos do wizard, gerencia navegação
 * e renderiza o step atual baseado no estado.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  AlertTitle,
  Fade,
  Collapse,
  CircularProgress,
} from '@mui/material';
import { useCharacterWizard } from '@/hooks/useCharacterWizard';
import { WIZARD_STEP_INFO, WizardStep } from '@/types/wizard';
import { WizardStepIndicator } from './WizardStepIndicator';
import { WizardNavigation } from './WizardNavigation';

// Importação lazy dos steps (serão criados posteriormente)
import dynamic from 'next/dynamic';

// Placeholder para steps ainda não implementados
const StepPlaceholder = ({ stepName }: { stepName: string }) => (
  <Box
    sx={{
      py: 6,
      px: 3,
      textAlign: 'center',
      bgcolor: 'action.hover',
      borderRadius: 2,
    }}
  >
    <Typography variant="h6" color="text.secondary" gutterBottom>
      {stepName}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Este passo será implementado em breve.
    </Typography>
  </Box>
);

// Spinner de carregamento para os steps
const StepLoading = () => (
  <Box
    sx={{
      py: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Carregando...
    </Typography>
  </Box>
);

// Lazy load dos steps - será substituído pelos componentes reais
const ConceptStep = dynamic(
  () =>
    import('./steps/ConceptStep').catch(() => ({
      default: () => <StepPlaceholder stepName="Conceito" />,
    })),
  { ssr: false, loading: StepLoading }
);

const OriginStep = dynamic(
  () =>
    import('./steps/OriginStep').catch(() => ({
      default: () => <StepPlaceholder stepName="Origem" />,
    })),
  { ssr: false, loading: StepLoading }
);

const LineageStep = dynamic(
  () =>
    import('./steps/LineageStep').catch(() => ({
      default: () => <StepPlaceholder stepName="Linhagem" />,
    })),
  { ssr: false, loading: StepLoading }
);

const AttributeDistributionStep = dynamic(
  () =>
    import('./steps/AttributeDistributionStep').catch(() => ({
      default: () => <StepPlaceholder stepName="Atributos" />,
    })),
  { ssr: false, loading: StepLoading }
);

const ArchetypeStep = dynamic(
  () =>
    import('./steps/ArchetypeStep').catch(() => ({
      default: () => <StepPlaceholder stepName="Arquétipo" />,
    })),
  { ssr: false, loading: StepLoading }
);

const SkillsStep = dynamic(
  () =>
    import('./steps/SkillsStep').catch(() => ({
      default: () => <StepPlaceholder stepName="Habilidades" />,
    })),
  { ssr: false, loading: StepLoading }
);

const EquipmentStep = dynamic(
  () =>
    import('./steps/EquipmentStep').catch(() => ({
      default: () => <StepPlaceholder stepName="Equipamentos" />,
    })),
  { ssr: false, loading: StepLoading }
);

const ProficiencyPurchasesStep = dynamic(
  () =>
    import('./steps/ProficiencyPurchasesStep').catch(() => ({
      default: () => <StepPlaceholder stepName="Proficiências" />,
    })),
  { ssr: false, loading: StepLoading }
);

const ReviewStep = dynamic(
  () =>
    import('./steps/ReviewStep').catch(() => ({
      default: () => <StepPlaceholder stepName="Revisão" />,
    })),
  { ssr: false, loading: StepLoading }
);

/**
 * Props compartilhadas para todos os steps
 */
export interface WizardStepProps {
  /** Hook do wizard para acessar e modificar estado */
  wizard: ReturnType<typeof useCharacterWizard>;
}

/**
 * Componente principal do wizard de criação de personagem
 */
export function CharacterCreationWizard() {
  const wizard = useCharacterWizard();
  const stepRef = useRef<HTMLDivElement>(null);

  // Scroll para o topo quando mudar de step
  useEffect(() => {
    if (stepRef.current) {
      stepRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [wizard.currentStep]);

  // Handler para navegação por teclado (ESC para cancelar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !wizard.isLoading) {
        // Não fazer nada automaticamente - deixar para o dialog
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wizard.isLoading]);

  /**
   * Renderiza o step atual
   */
  const renderCurrentStep = () => {
    const stepProps: WizardStepProps = { wizard };

    switch (wizard.currentStep) {
      case 'concept':
        return <ConceptStep {...stepProps} />;
      case 'origin':
        return <OriginStep {...stepProps} />;
      case 'lineage':
        return <LineageStep {...stepProps} />;
      case 'attributes':
        return <AttributeDistributionStep {...stepProps} />;
      case 'archetype':
        return <ArchetypeStep {...stepProps} />;
      case 'skills':
        return <SkillsStep {...stepProps} />;
      case 'equipment':
        return <EquipmentStep {...stepProps} />;
      case 'proficiencies':
        return <ProficiencyPurchasesStep {...stepProps} />;
      case 'review':
        return <ReviewStep {...stepProps} />;
      default:
        return <StepPlaceholder stepName="Passo desconhecido" />;
    }
  };

  const currentStepInfo = WIZARD_STEP_INFO[wizard.currentStep];
  const validationErrors = wizard.getValidationErrors();
  const hasBlockingErrors = validationErrors.some(
    (e) => e.severity === 'error'
  );

  return (
    <Box
      ref={stepRef}
      sx={{
        maxWidth: 900,
        mx: 'auto',
        py: 3,
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Header com título */}
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 2, fontWeight: 600 }}
      >
        Criar Personagem
      </Typography>

      {/* Indicador de progresso restaurado */}
      <Collapse in={wizard.isRestored}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Progresso Restaurado</AlertTitle>
          Seu progresso anterior foi recuperado automaticamente. Continue de
          onde parou ou reinicie para começar do zero.
        </Alert>
      </Collapse>

      {/* Indicador de passos */}
      <Paper sx={{ mb: 3, p: { xs: 1, md: 2 } }}>
        <WizardStepIndicator
          currentStep={wizard.currentStep}
          visitedSteps={wizard.visitedSteps}
          onStepClick={wizard.goToStep}
          enableNavigation={true}
        />
      </Paper>

      {/* Área do step atual */}
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Título do step atual */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
            {currentStepInfo.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentStepInfo.description}
          </Typography>
        </Box>

        {/* Erro, se houver */}
        <Collapse in={!!wizard.error}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {wizard.error}
          </Alert>
        </Collapse>

        {/* Conteúdo do step */}
        <Fade in={true} timeout={300}>
          <Box>{renderCurrentStep()}</Box>
        </Fade>

        {/* Navegação */}
        <WizardNavigation
          isFirstStep={wizard.isFirstStep}
          isLastStep={wizard.isLastStep}
          isLoading={wizard.isLoading}
          canProceed={!hasBlockingErrors}
          onBack={wizard.goBack}
          onNext={wizard.goNext}
          onCommit={wizard.commitCharacter}
          onCancel={wizard.cancel}
          onReset={wizard.resetWizard}
          showResetButton={wizard.isRestored}
        />
      </Paper>
    </Box>
  );
}

export default CharacterCreationWizard;
