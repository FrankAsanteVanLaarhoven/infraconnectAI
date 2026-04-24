'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) return <div className="w-9 h-9" />;

  const current = resolvedTheme ?? 'dark';

  return (
    <button
      onClick={() => {
        if (current === 'dark') setTheme('light');
        else if (current === 'light') /* cycle to system */ setTheme('system');
        else setTheme('dark');
      }}
      className="relative flex items-center justify-center w-10 h-10 rounded-sm transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground/20 glass-subtle border border-border/10 shadow-sm"
      title={`Current theme: ${current}. Click to change.`}
      aria-label="Toggle theme"
    >
      {current === 'dark' ? (
        <Moon className="w-4 h-4 text-slate-300" />
      ) : current === 'light' ? (
        <Sun className="w-4 h-4 text-orange-400" />
      ) : (
        <Monitor className="w-4 h-4 text-blue-400" />
      )}
    </button>
  );
}
