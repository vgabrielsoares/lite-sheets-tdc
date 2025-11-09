/**
 * Configuração de geração estática para rotas dinâmicas de personagem
 *
 * Como esta é uma aplicação client-side com dados locais (IndexedDB),
 * precisamos gerar pelo menos um path estático para o build funcionar.
 * Em runtime, o client-side routing do Next.js tratará qualquer ID.
 */

export function generateStaticParams() {
  // Gera um path placeholder para permitir o build estático
  // Em runtime, qualquer ID funcionará com client-side routing
  return [{ id: '_placeholder' }];
}

export default function CharacterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
