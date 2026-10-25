import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerRegistration } from "@/components/pwa-registration";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// SEO: JSON-LD Structured Data (constantes pour éviter les problèmes JSX)
const jsonLdSoftwareApplication = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Mov",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  description: "Plateforme de traçabilité de colis par QR code pour le transport inter-villes au Tchad. Notifications WhatsApp automatiques, code PIN de retrait sécurisé, suivi GPS en temps réel, dashboard agence.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "XAF",
    availability: "https://schema.org/InStock"
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "127",
    bestRating: "5",
    worstRating: "1"
  },
  featureList: [
    "Activation de colis par QR code en 30 secondes",
    "Notifications WhatsApp automatiques via wa.me",
    "Code PIN à 6 chiffres pour sécuriser la livraison",
    "Suivi GPS en temps réel des colis",
    "Dashboard agence avec gestion de flotte",
    "Mode hors-ligne pour zones sans réseau",
    "Détection IP pour saisie téléphone simplifiée",
    "Export CSV et reporting comptable"
  ],
  areaServed: [
    { "@type": "Country", name: "Tchad" },
    { "@type": "Country", name: "Cameroun" },
    { "@type": "Country", name: "République Centrafricaine" },
    { "@type": "Country", name: "Soudan" }
  ],
  url: "https://mov.newvisioncargo.pro",
  logo: "https://mov.newvisioncargo.pro/icons/icon-512x512.png",
  sameAs: [
    "https://wa.me/23566352505"
  ]
});

const jsonLdWebSite = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Mov",
  url: "https://mov.newvisioncargo.pro",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://mov.newvisioncargo.pro/suivi/{search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
});

const jsonLdService = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Traçabilité de Colis par QR Code au Tchad",
  description: "Activez, tracez et sécurisez vos colis inter-villes au Tchad avec Mov. Activation QR code, notifications WhatsApp, code PIN de retrait, suivi GPS en temps réel.",
  provider: {
    "@type": "Organization",
    name: "Mov",
    url: "https://mov.newvisioncargo.pro",
    parentOrganization: {
      "@type": "Organization",
      name: "New Vision Cargo"
    }
  },
  areaServed: [
    { "@type": "Country", name: "Tchad" },
    { "@type": "Country", name: "Cameroun" },
    { "@type": "Country", name: "République Centrafricaine" },
    { "@type": "Country", name: "Soudan" }
  ],
  serviceType: "Traçabilité logistique",
  featureList: [
    "Activation QR code en 30 secondes",
    "Notifications WhatsApp via wa.me",
    "Code PIN de retrait sécurisé",
    "Suivi GPS en temps réel",
    "Dashboard agence avec gestion de flotte"
  ]
});

const jsonLdPlace = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Place",
  name: "N'Djaména, Tchad",
  address: {
    "@type": "PostalAddress",
    addressCountry: "TD",
    addressLocality: "N'Djaména",
    addressRegion: "N'Djaména",
    streetAddress: "Avenue Charles de Gaulle"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 12.1348,
    longitude: 15.0557
  }
});

export const metadata: Metadata = {
  title: {
    default: "Mov — Traçabilité de Colis par QR Code au Tchad",
    template: "%s | Mov",
  },
  description: "Plateforme de traçabilité de colis par QR code pour le transport inter-villes au Tchad. Activation en 30s, notifications WhatsApp automatiques, code PIN sécurisé, suivi GPS temps réel, dashboard agence. Service disponible à N'Djaména, Moundou, Sarh, Abéché et partout au Tchad.",
  keywords: [
    "Mov", "QR code colis", "traçabilité colis", "transport inter-villes Tchad",
    "logistique Tchad", "suivi colis Tchad", "notifications WhatsApp",
    "code PIN livraison", "GPS colis", "dashboard agence transport",
    "chauffeur livreur Tchad", "colis N'Djaména", "envoi colis Tchad",
    "expédition colis Tchad", "livraison colis N'Djaména", "sécurité colis",
    "agence transport Tchad", "Moundou Sarh Abéché", "New Vision Cargo",
    "traçabilité bagage Tchad", "QR code bagage", "livraison sécurisée"
  ],
  authors: [{ name: "Mov Team" }],
  creator: "New Vision Cargo",
  publisher: "Mov",
  metadataBase: new URL("https://mov.newvisioncargo.pro"),
  category: "business",

  // PWA Icons
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icons/maskable-icon-512x512.png", color: "#0A2540" },
    ],
  },

  // Open Graph — optimisé pour le partage social
  openGraph: {
    title: "Mov — Traçabilité de Colis par QR Code au Tchad",
    description: "Activez un colis en 30 secondes avec un QR code. Notifications WhatsApp automatiques, code PIN sécurisé, suivi GPS temps réel. Solution complète pour agences de transport au Tchad.",
    url: "https://mov.newvisioncargo.pro",
    siteName: "Mov",
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US", "ar_SA"],
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Mov — Traçabilité de Colis par QR Code au Tchad",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Mov — Traçabilité de Colis par QR Code au Tchad",
    description: "Activez un colis en 30 secondes. Notifications WhatsApp, code PIN sécurisé, suivi GPS. Solution pour agences de transport au Tchad.",
    images: ["/icons/icon-512x512.png"],
    creator: "@newvisioncargo",
    site: "@newvisioncargo",
  },

  // PWA
  manifest: "/manifest.json",

  // App info
  applicationName: "Mov",
  appleWebApp: {
    capable: true,
    title: "Mov",
    statusBarStyle: "black-translucent",
    startupImage: [
      { url: "/icons/icon-512x512.png", media: "(device-width: 320px)" },
    ],
  },

  // Format detection
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },

  // Other
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Alternates
  alternates: {
    canonical: "https://mov.newvisioncargo.pro",
    languages: {
      "fr": "https://mov.newvisioncargo.pro",
      "en": "https://mov.newvisioncargo.pro/?lang=en",
      "ar": "https://mov.newvisioncargo.pro/?lang=ar",
    },
  },

  // Google Search Console Verification
  verification: {
    google: "89137c0360e6b581",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0A2540" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Theme script - runs before render to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.add(theme);
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mov" />
        <meta name="application-name" content="Mov" />
        <meta name="msapplication-TileColor" content="#00256D" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* SEO Géographique — Ciblage Tchad pour Google */}
        <meta name="geo.region" content="TD" />
        <meta name="geo.placename" content="N'Djaména, Tchad" />
        <meta name="geo.position" content="12.1348;15.0557" />
        <meta name="ICBM" content="12.1348, 15.0557" />
        <meta name="language" content="French" />
        <meta name="coverage" content="Worldwide, Tchad, Chad, Africa" />
        <meta name="target" content="tchad=logistique, transport, livraison, colis, QR code" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="7 days" />
        <meta name="theme-color" content="#00256D" />

        {/* Preconnect & DNS Prefetch for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//wa.me" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white`}
      >
        {/* Skip to main content - Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#FF6B35] focus:text-white focus:rounded-lg focus:font-semibold focus:text-sm focus:shadow-lg"
        >
          Aller au contenu principal
        </a>

        {/* JSON-LD Structured Data: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Mov",
              url: "https://mov.newvisioncargo.pro",
              logo: "https://mov.newvisioncargo.pro/icons/icon-512x512.png",
              description: "Plateforme de traçabilité de colis par QR code pour le transport inter-villes au Tchad. Notifications WhatsApp, code PIN, suivi GPS, dashboard agence.",
              parentOrganization: {
                "@type": "Organization",
                name: "New Vision Cargo"
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "TD",
                addressLocality: "N'Djaména",
                addressRegion: "N'Djaména",
                postalCode: "",
                streetAddress: "Avenue Charles de Gaulle"
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 12.1348,
                longitude: 15.0557
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+235-66-35-25-05",
                contactType: "customer service",
                areaServed: "TD",
                availableLanguage: ["fr", "ar", "en"]
              },
              sameAs: [
                "https://wa.me/23566352505"
              ],
              foundingDate: "2024",
              areaServed: {
                "@type": "Country",
                name: "Tchad"
              }
            }),
          }}
        />

        {/* JSON-LD Structured Data: SoftwareApplication - SEO Optimise */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSoftwareApplication }} />

        {/* JSON-LD Structured Data: WebSite - Recherche Google */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdWebSite }} />

        {/* JSON-LD Structured Data: Service - Semantique logistique */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdService }} />

        {/* JSON-LD Structured Data: Place - SEO local */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdPlace }} />

        <ThemeProvider>
          <AuthProvider>
            <ServiceWorkerRegistration />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
