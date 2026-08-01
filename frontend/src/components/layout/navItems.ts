import {
  LayoutDashboard,
  PackageSearch,
  Users,
  Boxes,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/rmas', label: 'RMAs', icon: PackageSearch },
  { to: '/customers', label: 'Clientes', icon: Users },
  { to: '/products', label: 'Produtos', icon: Boxes },
  { to: '/users', label: 'Usuários', icon: ShieldCheck, adminOnly: true },
];
