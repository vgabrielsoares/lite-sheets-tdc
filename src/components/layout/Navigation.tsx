/**
 * Navigation Component
 *
 * Menu de navegação da aplicação, com suporte para layout horizontal (desktop)
 * e drawer (mobile).
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material';

/**
 * Item de navegação
 */
interface NavItem {
  /** Rótulo exibido */
  label: string;
  /** Caminho da rota */
  path: string;
  /** Ícone do item */
  icon: React.ReactNode;
}

/**
 * Lista de itens de navegação
 */
const navItems: NavItem[] = [
  {
    label: 'Início',
    path: '/',
    icon: <HomeIcon />,
  },
  {
    label: 'Minhas Fichas',
    path: '/',
    icon: <PersonIcon />,
  },
  {
    label: 'Nova Ficha',
    path: '/characters/new',
    icon: <AddIcon />,
  },
];

/**
 * Props do Navigation
 */
interface NavigationProps {
  /** Variante do menu */
  variant: 'horizontal' | 'drawer';
  /** Se o drawer está aberto (apenas para variant='drawer') */
  open?: boolean;
  /** Callback ao fechar drawer (apenas para variant='drawer') */
  onClose?: () => void;
}

/**
 * Componente de navegação
 *
 * Renderiza menu de navegação em dois formatos:
 * - Horizontal: Botões inline para desktop
 * - Drawer: Menu lateral para mobile
 *
 * @example
 * ```tsx
 * // Navegação horizontal (desktop)
 * <Navigation variant="horizontal" />
 *
 * // Drawer mobile
 * <Navigation
 *   variant="drawer"
 *   open={mobileMenuOpen}
 *   onClose={() => setMobileMenuOpen(false)}
 * />
 * ```
 */
export default function Navigation({
  variant,
  open = false,
  onClose,
}: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Navega para rota e fecha drawer se mobile
   */
  const handleNavigate = (path: string) => {
    router.push(path);
    if (variant === 'drawer' && onClose) {
      onClose();
    }
  };

  /**
   * Verifica se rota está ativa
   */
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // Renderização horizontal (desktop)
  if (variant === 'horizontal') {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {navItems.map((item) => (
          <Button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            startIcon={item.icon}
            sx={{
              color: isActive(item.path) ? 'primary.main' : 'text.primary',
              fontWeight: isActive(item.path) ? 600 : 400,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>
    );
  }

  // Renderização drawer (mobile)
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 7 }}>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={isActive(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                    borderLeft: '4px solid',
                    borderLeftColor: 'primary.main',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path)
                      ? 'primary.main'
                      : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
