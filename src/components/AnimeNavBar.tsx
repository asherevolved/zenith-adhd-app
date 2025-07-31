
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function AnimeNavBar({ items, className }: NavBarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-1/2 -translate-y-1/2 left-5 z-50">
      <motion.div
        className={cn(
          'flex flex-col items-center gap-3 bg-black/50 border border-white/10 backdrop-blur-lg py-2 px-2 rounded-3xl shadow-lg relative',
          className
        )}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        <TooltipProvider>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.url === '/' ? pathname === item.url : pathname.startsWith(item.url);

            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.url}
                    className={cn(
                      'relative cursor-pointer text-sm font-semibold p-3 rounded-full transition-all duration-300',
                      'text-white/70 hover:text-white',
                      isActive && 'text-white bg-primary/20'
                    )}
                  >
                    <motion.span
                      className="relative z-10"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon size={18} strokeWidth={2.5} />
                    </motion.span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </motion.div>
    </div>
  );
}
