'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Luggage, MessageCircle, CheckCircle, AlertTriangle,
  User, BarChart3, ShoppingCart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardShell, { NavCategory, NavItem } from '@/components/dashboard/DashboardShell';

// Demo agency data - used as fallback
export const DEMO_AGENCY = {
  id: 'demo-agency-1',
  name: 'FRANCINE MAKELA',
  slug: 'diop',
  email: 'contact@francine-makela.com',
  phone: '+221 77 123 45 67',
  address: 'Dakar, Sénégal'
};

// Agency Context for sharing agency data across pages
interface AgencyContextType {
  agencyId: string;
  agencyName: string;
  agencyData: typeof DEMO_AGENCY | null;
  userName: string;
  userEmail: string;
}

export const AgencyContext = createContext<AgencyContextType>({
  agencyId: DEMO_AGENCY.id,
  agencyName: DEMO_AGENCY.name,
  agencyData: null,
  userName: '',
  userEmail: ''
});

export const useAgency = () => useContext(AgencyContext);

export default function AgencyRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { user, loading, logout, isAgency } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect if not authenticated or not agency
  useEffect(() => {
    if (loading) return;
    if (pathname === '/agence/connexion') return;
    if (!user) {
      router.replace('/agence/connexion');
      return;
    }
    if (!isAgency) {
      router.replace('/admin/tableau-de-bord');
    }
  }, [user, loading, isAgency, router, pathname]);

  // Fetch unread messages count
  useEffect(() => {
    if (!user || !isAgency || pathname === '/agence/connexion') return;
    const fetchUnreadCount = async () => {
      try {
        const currentAgencyId = user?.agencyId || user?.agency?.id;
        const res = await fetch(`/api/agency/messages?agencyId=${currentAgencyId}&count=true`);
        const data = await res.json();
        if (data.unreadCount !== undefined) {
          setUnreadMessages(data.unreadCount);
        }
      } catch { /* noop */ }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, isAgency, pathname]);

  const handleLogout = async () => {
    await logout();
    router.replace('/agence/connexion');
  };

  // Get agency data
  const agencyId = user?.agencyId || user?.agency?.id || '';
  const agencyName = user?.agency?.name || user?.name || DEMO_AGENCY.name;
  const agencySlug = user?.agency?.slug || DEMO_AGENCY.slug;
  const agencyData = user?.agency ? {
    id: user.agency.id,
    name: user.agency.name,
    slug: user.agency.slug,
    email: user.agency.email || DEMO_AGENCY.email,
    phone: user.agency.phone || DEMO_AGENCY.phone,
    address: user.agency.address || DEMO_AGENCY.address
  } : null;

  // Don't wrap login page with sidebar
  if (pathname === '/agence/connexion') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--dash-bg)]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--dash-brand)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--dash-muted)]">Vérification...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAgency) {
    return null;
  }

  // Navigation menu items
  const navItems: NavItem[] = [
    { label: 'Tableau de bord', href: '/agence/tableau-de-bord', icon: Home },
    { label: 'Colis', href: '/agence/baggages', icon: Luggage },
    { label: 'Assistance', href: '/agence/assistance', icon: MessageCircle, badge: unreadMessages },
    { label: 'Colis Livrés', href: '/agence/trouvailles', icon: CheckCircle },
    { label: 'Perdus', href: '/agence/perdus', icon: AlertTriangle },
    { label: 'Rapports', href: '/agence/rapports', icon: BarChart3 },
    { label: 'Profil', href: '/agence/profil', icon: User },
  ];

  const navCategories: NavCategory[] = [
    { category: 'Principal', items: navItems },
  ];

  // Quick action: Commander des QR
  const quickAction = (
    <button
      onClick={() => window.dispatchEvent(new Event('openCommandModal'))}
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--dash-brand-soft)] text-[var(--dash-brand)] hover:bg-[var(--dash-sidebar-hover)] transition-colors"
    >
      <ShoppingCart className="w-3.5 h-3.5" />
      Commander QR
    </button>
  );

  return (
    <AgencyContext.Provider
      value={{
        agencyId,
        agencyName,
        agencyData,
        userName: user?.name || user?.email || '',
        userEmail: user?.email || '',
      }}
    >
      <DashboardShell
        navCategories={navCategories}
        logoSubtitle="Espace Agence"
        userName={user.name || user.email || 'Agence'}
        userRole="Agence partenaire"
        agencySlug={agencySlug}
        quickAction={quickAction}
        onLogout={handleLogout}
        searchPlaceholder="Rechercher un colis..."
      >
        {children}
      </DashboardShell>
    </AgencyContext.Provider>
  );
}
