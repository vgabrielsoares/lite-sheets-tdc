'use client';

import './globals.css';
import ReduxProvider from '@/store/Provider';
import CharacterLoader from '@/store/CharacterLoader';
import ThemeProviderWrapper from '@/components/layout/ThemeProviderWrapper';
import { NotificationProvider } from '@/components/shared';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Lite Sheets TDC</title>
        <meta
          name="description"
          content="Sistema de gerenciamento de fichas de personagem para Tabuleiro do Caos RPG"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ReduxProvider>
          <CharacterLoader>
            <ThemeProviderWrapper>
              {children}
              <NotificationProvider />
            </ThemeProviderWrapper>
          </CharacterLoader>
        </ReduxProvider>
      </body>
    </html>
  );
}
