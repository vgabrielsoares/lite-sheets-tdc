import type { Metadata, Viewport } from 'next';
import './globals.css';
import ReduxProvider from '@/store/Provider';
import ThemeProviderWrapper from '@/components/layout/ThemeProviderWrapper';

export const metadata: Metadata = {
  title: 'Lite Sheets TDC',
  description: 'Sistema de gerenciamento de fichas para Tabuleiro do Caos RPG',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ReduxProvider>
          <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}
