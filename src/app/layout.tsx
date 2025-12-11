'use client';

import './globals.css';
import ReduxProvider from '@/store/Provider';
import CharacterLoader from '@/store/CharacterLoader';
import ThemeProviderWrapper from '@/components/layout/ThemeProviderWrapper';
import {
  NotificationProvider,
  OnlineIndicator,
  InstallPrompt,
  BackupReminder,
} from '@/components/shared';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Lite Sheets - Tabuleiro do Caos RPG</title>
        <meta
          name="description"
          content="Sistema de gerenciamento de fichas de personagem para Tabuleiro do Caos RPG. Offline-first, responsivo e instalável."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="Lite Sheets TDC" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Lite Sheets" />
        <meta name="theme-color" content="#D4AF37" />
        <meta name="msapplication-TileColor" content="#1a1a1a" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icon-512x512.png"
        />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />

        {/* Splash Screens - iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* MS Tiles */}
        <meta name="msapplication-TileImage" content="/icon-144x144.png" />
      </head>
      <body>
        <ReduxProvider>
          <CharacterLoader>
            <ThemeProviderWrapper>
              {children}
              <NotificationProvider />
              <OnlineIndicator />
              <InstallPrompt />
              <BackupReminder />
            </ThemeProviderWrapper>
          </CharacterLoader>
        </ReduxProvider>
      </body>
    </html>
  );
}
