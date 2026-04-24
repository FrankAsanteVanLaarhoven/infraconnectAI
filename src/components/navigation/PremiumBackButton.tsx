import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumBackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function PremiumBackButton({ href = '/dashboard', label = 'Return to Dashboard', className = '' }: PremiumBackButtonProps) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-2 ${className}`}>
      <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-800 bg-black group-hover:border-zinc-500 transition-colors">
        <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
      </div>
      <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
        {label}
      </span>
    </Link>
  );
}
