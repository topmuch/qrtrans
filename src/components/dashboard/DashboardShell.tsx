'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu, X, Sun, Moon, Bell, Search, ChevronLeft,
  LogOut, Settings, ExternalLink,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/admin/NotificationBell';

export interface NavItem {
  label: string;
  href: string;
  icon: typeof Menu;
  badge?: number | string;
}

export interface NavCategory {
  category: string;
  items: NavItem[];
}

interface DashboardShellProps {
  children: React.ReactNode;
  /** Sidebar navigation grouped by category */
  navCategories: NavCategory[];
  /** Logo subtitle (e.g. "Administration" or "Espace Agence") */
  logoSubtitle: string;
  /** User display name */
  userName: string;
  /** User role label */
  userRole: string;
  /** Optional: agency slug for public page link */
  agencySlug?: string;
  /** Optional: quick action button in header (e.g. "Commander QR") */
  quickAction?: React.ReactNode;
  /** Logout handler */
  onLogout: () => void;
  /** Search placeholder */
  searchPlaceholder?: string;
}

export default function DashboardShell({
  children,
  navCategories,
  logoSubtitle,
  userName,
  userRole,
  agencySlug,
  quickAction,
  onLogout,
  searchPlaceholder = 'Rechercher...',
}: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Load sidebar preference
  useEffect(() => {
    const saved = localStorage.getItem('dash-sidebar-collapsed');
    if (saved === 'true') setSidebarCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('dash-sidebar-collapsed', String(next));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to colis page with search query
      router.push(`/admin/voyageurs?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-60';

  return (
    <div className="min-h-screen flex bg-[var(--dash-bg)]">
      {/* ─── Desktop Sidebar ─── */}
      <aside
        className={`hidden lg:flex flex-col ${sidebarWidth} transition-all duration-300 ease-in-out bg-[var(--dash-sidebar-bg)] border-r border-[var(--dash-sidebar-border)] fixed inset-y-0 left-0 z-40`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-2.5 h-16 border-b border-[var(--dash-sidebar-border)] ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'}`}>
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <Image
              src="/brand/logo.png"
              alt="QRTrans"
              width={sidebarCollapsed ? 32 : 120}
              height={sidebarCollapsed ? 32 : 36}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 scrollbar-premium">
          {navCategories.map((cat) => (
            <div key={cat.category}>
              {!sidebarCollapsed && (
                <p className="dash-nav-category">{cat.category}</p>
              )}
              {cat.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`dash-nav-item ${isActive ? 'active' : ''} ${sidebarCollapsed ? 'justify-center' : ''}`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[var(--dash-sidebar-active-accent)]' : ''}`} />
                    {!sidebarCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!sidebarCollapsed && item.badge !== undefined && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[var(--dash-emerald)] text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom: collapse toggle + logout */}
        <div className="border-t border-[var(--dash-sidebar-border)] p-2 space-y-1">
          <button
            onClick={toggleSidebar}
            className="dash-nav-item w-full justify-center"
            title={sidebarCollapsed ? 'Agrandir' : 'Réduire'}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span className="flex-1 text-left">Réduire</span>}
          </button>
          <button
            onClick={onLogout}
            className="dash-nav-item w-full justify-center text-red-300 hover:bg-red-500/20"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="flex-1 text-left">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ─── Mobile Sidebar Overlay ─── */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative w-64 bg-[var(--dash-sidebar-bg)] border-r border-[var(--dash-sidebar-border)] flex flex-col">
            <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--dash-sidebar-border)]">
              <Image src="/brand/logo.png" alt="QRTrans" width={100} height={30} className="h-6 w-auto" />
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--dash-sidebar-hover)]">
                <X className="w-5 h-5 text-[var(--dash-sidebar-text)]" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2 px-2">
              {navCategories.map((cat) => (
                <div key={cat.category}>
                  <p className="dash-nav-category">{cat.category}</p>
                  {cat.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`dash-nav-item ${isActive ? 'active' : ''}`}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[var(--dash-emerald)] text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className="border-t border-[var(--dash-sidebar-border)] p-2">
              <button onClick={onLogout} className="dash-nav-item w-full text-red-300">
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className={`flex-1 flex flex-col min-w-0 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'} transition-all duration-300`}>
        {/* ─── Header ─── */}
        <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 lg:px-6 bg-[var(--dash-header-bg)] border-b border-[var(--dash-header-border)]">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--dash-sidebar-hover)]"
          >
            <Menu className="w-5 h-5 text-[var(--dash-ink)]" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="dash-search">
              <Search className="w-4 h-4 text-[var(--dash-muted)] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1"
              />
            </div>
          </form>

          {/* Quick action */}
          {quickAction}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--dash-sidebar-hover)] transition-colors"
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-[var(--dash-ink)]" />
            ) : (
              <Sun className="w-5 h-5 text-[var(--dash-ink)]" />
            )}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Agency public page link */}
          {agencySlug && (
            <Link
              href={`/agency/${agencySlug}`}
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--dash-muted)] hover:text-[var(--dash-ink)] hover:bg-[var(--dash-sidebar-hover)] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Page publique
            </Link>
          )}

          {/* User avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[var(--dash-border)]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--dash-brand)] to-[var(--dash-brand-2)] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-semibold text-[var(--dash-ink)] truncate max-w-[120px]">{userName}</p>
              <p className="text-xs text-[var(--dash-muted)] truncate max-w-[120px]">{userRole}</p>
            </div>
          </div>
        </header>

        {/* ─── Page content ─── */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
