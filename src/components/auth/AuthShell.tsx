'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

interface AuthShellProps {
  /** Card content */
  children: ReactNode;
  /** Optional left-panel content (split layout). When provided, renders a 2-col layout. */
  sidePanel?: ReactNode;
  /** Eyebrow above the card title */
  eyebrow?: string;
  /** Page title (e.g. "Espace Agence", "Mot de passe oublié") */
  title?: string;
  /** Subtitle shown under the title */
  subtitle?: string;
  /** Back link href (defaults to `/login`) */
  backHref?: string;
  /** Back link label */
  backLabel?: string;
}

/**
 * AuthShell — unified premium auth layout.
 *
 * - Light premium background with subtle brand-blue mesh and grid.
 * - Centered glass card with brand logo at top.
 * - Optional split layout with a sidePanel (used by /admin/connexion and /agence/connexion).
 *
 * Color palette harmonized with brand logo:
 *   - Background: #FBFCFE → #F4F7FB (almost-white with blue tint)
 *   - Card: white glass with steel-blue border #1E4B7A/15
 *   - Text: #0F1B2E primary, #5B7088 muted
 *   - Accent: #1E4B7A → #487AA8 (steel blue), #10B981 emerald (for success)
 */
export default function AuthShell({
  children,
  sidePanel,
  eyebrow,
  title,
  subtitle,
  backHref = '/login',
  backLabel = 'Retour à la connexion',
}: AuthShellProps) {
  // Split layout (with side panel) — used by login variants
  if (sidePanel) {
    return (
      <div className="min-h-screen flex bg-[#FBFCFE]">
        {/* LEFT — Side panel (premium dark brand blue) */}
        <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0F2D52] via-[#1E4B7A] to-[#245B8F]">
          {/* Aurora blobs */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-40 blur-3xl animate-pulse"
            style={{ background: 'radial-gradient(circle, rgba(72, 122, 168, 0.6), transparent 70%)' }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full opacity-30 blur-3xl animate-pulse"
            style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4), transparent 70%)', animationDelay: '1.5s' }}
          />
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-grid opacity-[0.04]" />
          {/* Side panel content */}
          <div className="relative z-10 h-full flex flex-col p-10 xl:p-14">{sidePanel}</div>
        </aside>

        {/* RIGHT — Form panel */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 relative">
          {/* Subtle decorative blobs */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(72, 122, 168, 0.4), transparent 70%)' }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent 70%)' }}
          />

          <div className="w-full max-w-md relative z-10">
            {/* Logo (mobile shows at top, desktop inline) */}
            <Link href="/" className="flex justify-center mb-8 lg:hidden">
              <Image
                src="/brand/logo.png"
                alt="QRTrans"
                width={180}
                height={53}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Eyebrow + title */}
            {(eyebrow || title || subtitle) && (
              <div className="mb-8 text-center lg:text-left">
                {eyebrow && (
                  <p className="font-display text-xs uppercase tracking-[0.3em] text-[#1E4B7A] mb-3">
                    {eyebrow}
                  </p>
                )}
                {title && (
                  <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F1B2E] tracking-tight leading-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-3 text-base text-[#5B7088] leading-relaxed">{subtitle}</p>
                )}
              </div>
            )}

            {/* Card */}
            <div className="glass-light-strong rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#1E4B7A]/8">
              {children}
            </div>

            {/* Back link */}
            <div className="mt-6 text-center">
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#5B7088] hover:text-[#1E4B7A] transition-colors link-underline"
              >
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Centered layout (no side panel) — used by /forgot-password, /reset-password, /verify-email
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#FBFCFE]">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-grid-light opacity-[0.5]" />
      {/* Aurora blobs */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(72, 122, 168, 0.4), transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent 70%)' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-8">
          <Image
            src="/brand/logo.png"
            alt="QRTrans"
            width={200}
            height={59}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Eyebrow + title */}
        {(eyebrow || title || subtitle) && (
          <div className="mb-8 text-center">
            {eyebrow && (
              <p className="font-display text-xs uppercase tracking-[0.3em] text-[#1E4B7A] mb-3">
                {eyebrow}
              </p>
            )}
            {title && (
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F1B2E] tracking-tight leading-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-3 text-sm text-[#5B7088] leading-relaxed">{subtitle}</p>
            )}
          </div>
        )}

        {/* Card */}
        <div className="glass-light-strong rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#1E4B7A]/8">
          {children}
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5B7088] hover:text-[#1E4B7A] transition-colors link-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
