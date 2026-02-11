'use client';

import AppLayout from '@/components/layout/AppLayout';
import SystemPresentation from '@/components/shared/SystemPresentation';

/**
 * Página inicial — Apresentação do Sistema
 *
 * Landing page com contextualização do universo do Tabuleiro do Caos RPG,
 * pilares do sistema e resumo das mecânicas.
 *
 * A lista de fichas está disponível em /characters.
 */
export default function HomePage() {
  return (
    <AppLayout maxWidth="lg">
      <SystemPresentation />
    </AppLayout>
  );
}
