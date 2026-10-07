'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, QrCode, Layers,
  MessageSquare, Search, UserPlus, TrendingUp, Megaphone,
  BarChart3, Shield, Globe, Mail, Settings, Activity, Newspaper,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardShell, { NavCategory, NavItem } from '@/components/dashboard/DashboardShell';
import { PERMISSIONS, ROLES, Permission } from '@/lib/permissions';

// Types
interface MenuItemDef {
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
  badge?: number;
  isCategory?: boolean;
  permission?: Permission;
  roles?: string[];
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout, isSuperAdmin, isAdmin, isAgent, can } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  // Set mounted flag on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth guard
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/admin/connexion');
      return;
    }
    if (!isSuperAdmin && !isAdmin && !isAgent) {
      router.replace('/agence/tableau-de-bord');
      return;
    }
  }, [user, loading, isSuperAdmin, isAdmin, isAgent, router]);

  // Fetch unread messages count
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/messages/unread-count');
        if (res.ok) {
          const data = await res.json();
          setUnreadMessages(data.count || 0);
        }
      } catch { /* noop */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Skip layout for login page — use pathname from hook instead of window.location
  const isLoginPage = pathname === '/admin/connexion';

  // During SSR or before mount, show a neutral loading state to avoid hydration mismatch
  if (!mounted || loading || !user) {
    if (isLoginPage) {
      return <>{children}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--dash-bg)]">
        <div className="w-8 h-8 border-2 border-[var(--dash-brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If on login page after mount, skip the shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  const userRole = user.role || 'agent';
  const roleLabel = ROLES[userRole as keyof typeof ROLES] || userRole;

  // Build menu items with permissions
  const allMenuItems: MenuItemDef[] = [
    { label: 'Tableau de bord', icon: LayoutDashboard, href: '/admin/tableau-de-bord', permission: PERMISSIONS.VIEW_DASHBOARD },
    { label: 'GESTION', icon: LayoutDashboard, isCategory: true },
    { label: 'Utilisateurs', icon: Users, href: '/admin/utilisateurs', permission: PERMISSIONS.VIEW_USERS, roles: ['superadmin', 'admin'] },
    { label: 'Agences', icon: Building2, href: '/admin/agences', permission: PERMISSIONS.VIEW_AGENCIES, roles: ['superadmin', 'admin'] },
    { label: 'PRODUITS', icon: LayoutDashboard, isCategory: true },
    { label: 'Générer QR', icon: QrCode, href: '/admin/generer', permission: PERMISSIONS.GENERATE_QR },
    { label: 'Étiquettes', icon: Layers, href: '/admin/etiquettes', permission: PERMISSIONS.VIEW_BAGGAGES },
    { label: 'COLIS', icon: LayoutDashboard, isCategory: true },
    { label: 'Colis', icon: Users, href: '/admin/voyageurs', permission: PERMISSIONS.VIEW_BAGGAGES },
    { label: 'MESSAGES', icon: LayoutDashboard, isCategory: true },
    { label: 'Messages', icon: MessageSquare, href: '/admin/messages', badge: unreadMessages, permission: PERMISSIONS.VIEW_MESSAGES },
    { label: 'Colis Livrés', icon: Search, href: '/admin/trouvailles', permission: PERMISSIONS.VIEW_TROUVAILLES },
    { label: 'CRM', icon: UserPlus, href: '/admin/crm', permission: PERMISSIONS.VIEW_CRM, roles: ['superadmin', 'admin', 'agent'] },
    { label: 'ANALYSE', icon: LayoutDashboard, isCategory: true },
    { label: 'Marketing & Relances', icon: TrendingUp, href: '/admin/marketing', roles: ['superadmin'] },
    { label: 'Marketing & Publicités', icon: Megaphone, href: '/admin/publicites', roles: ['superadmin', 'admin'] },
    { label: 'Rapports', icon: BarChart3, href: '/admin/rapports', permission: PERMISSIONS.VIEW_REPORTS },
    { label: 'Blog', icon: Newspaper, href: '/admin/blog', permission: PERMISSIONS.VIEW_MESSAGES, roles: ['superadmin', 'admin'] },
    { label: 'SÉCURITÉ', icon: LayoutDashboard, isCategory: true, roles: ['superadmin', 'admin'] },
    { label: 'Sécurité & Audit', icon: Shield, href: '/admin/securite', permission: PERMISSIONS.VIEW_SETTINGS, roles: ['superadmin', 'admin'] },
    { label: 'MONITORING', icon: LayoutDashboard, isCategory: true, roles: ['superadmin'] },
    { label: 'Monitoring', icon: Activity, href: '/admin/monitoring', permission: PERMISSIONS.VIEW_MONITORING, roles: ['superadmin'] },
    { label: 'PARAMÈTRES', icon: LayoutDashboard, isCategory: true, permission: PERMISSIONS.VIEW_SETTINGS },
    { label: 'Paramètres', icon: Settings, href: '/admin/parametres', permission: PERMISSIONS.VIEW_SETTINGS },
    { label: 'Configuration Email', icon: Mail, href: '/admin/parametres?tab=email', permission: PERMISSIONS.MANAGE_SETTINGS, roles: ['superadmin', 'admin'] },
    { label: 'Clés et API', icon: Globe, href: '/admin/parametres/fonctionnalites', permission: PERMISSIONS.MANAGE_FEATURES, roles: ['superadmin', 'admin'] },
  ];

  // Filter menu items based on permissions
  const filteredItems = allMenuItems.filter(item => {
    if (item.isCategory) return true;
    if (item.permission && !can(item.permission)) return false;
    if (item.roles && item.roles.length > 0 && !item.roles.includes(userRole)) return false;
    return true;
  });

  // Group items into categories for the NavCategory structure
  const navCategories: NavCategory[] = [];
  let currentCategory: NavCategory | null = null;

  for (const item of filteredItems) {
    if (item.isCategory) {
      if (currentCategory && currentCategory.items.length > 0) {
        navCategories.push(currentCategory);
      }
      currentCategory = { category: item.label, items: [] };
    } else if (item.href) {
      // First non-category item without a preceding category goes to "Principal"
      if (!currentCategory) {
        currentCategory = { category: 'Principal', items: [] };
      }
      currentCategory.items.push({
        label: item.label,
        href: item.href,
        icon: item.icon,
        badge: item.badge,
      });
    }
  }
  if (currentCategory && currentCategory.items.length > 0) {
    navCategories.push(currentCategory);
  }

  const handleLogout = () => {
    logout();
    router.replace('/admin/connexion');
  };

  return (
    <DashboardShell
      navCategories={navCategories}
      logoSubtitle="Administration"
      userName={user.name || user.email || 'Admin'}
      userRole={roleLabel as string}
      onLogout={handleLogout}
      searchPlaceholder="Rechercher un colis, utilisateur..."
    >
      {children}
    </DashboardShell>
  );
}
