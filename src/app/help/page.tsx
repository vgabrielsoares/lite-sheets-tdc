import { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { HelpPage } from '@/components/help';

export const metadata: Metadata = {
  title: 'Central de Ajuda | Lite Sheets TDC',
  description:
    'Documentação completa do Lite Sheets TDC. FAQ, atalhos de teclado, guia de exportação/importação e sistema de rolagem.',
};

/**
 * Página de Ajuda e Documentação
 *
 * Fornece documentação completa do sistema, incluindo:
 * - FAQ (Perguntas Frequentes)
 * - Atalhos de Teclado
 * - Guia de Exportação/Importação
 * - Sistema de Rolagem de Dados
 */
export default function HelpRoute() {
  return (
    <AppLayout maxWidth="lg">
      <HelpPage />
    </AppLayout>
  );
}
