'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppFloat() {
  return (
    <Link
      href="https://wa.me/221784858226?text=Bonjour%20QRTrans%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20vos%20services"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#25D366] to-[#1a9e49] shadow-xl shadow-green-500/30 group-hover:scale-110 transition-transform">
        <MessageCircle className="w-6 h-6 text-white" />
      </span>
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#060B1F] text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
        Discuter avec nous
      </span>
    </Link>
  );
}
