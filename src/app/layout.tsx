import type { Metadata, Viewport } from 'next';
import './globals.css';
import ReduxProvider from '@/store/Provider';
import CharacterLoader from '@/store/CharacterLoader';
import ThemeProviderWrapper from '@/components/layout/ThemeProviderWrapper';
import { NotificationProvider } from '@/components/shared';

export const metadata: Metadata = {
  title: {
    default: 'Lite Sheets TDC',
    template: '%s | Lite Sheets TDC',
  },
  description:
    'Sistema de gerenciamento de fichas de personagem para Tabuleiro do Caos RPG. Offline-first, responsivo e instalável como PWA.',
  applicationName: 'Lite Sheets TDC',
  authors: [{ name: 'Victor Gabriel Soares' }],
  generator: 'Next.js',
  keywords: [
    'RPG',
    'Tabuleiro do Caos',
    'ficha de personagem',
    'character sheet',
    'PWA',
    'offline',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lite Sheets TDC',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Lite Sheets TDC',
    title: 'Lite Sheets TDC',
    description:
      'Sistema de gerenciamento de fichas para Tabuleiro do Caos RPG',
    locale: 'pt_BR',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ReduxProvider>
          <CharacterLoader>
            <ThemeProviderWrapper>
              <NotificationProvider />
              {children}
            </ThemeProviderWrapper>
          </CharacterLoader>
        </ReduxProvider>
      </body>
    </html>
  );
}
