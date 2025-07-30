
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type LucideIcon, LogOut } from 'lucide-react';
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

interface BottomNavBarProps {
  items: NavItem[];
  onLogout: () => void;
}

export function BottomNavBar({ items, onLogout }: BottomNavBarProps) {
  const pathname = usePathname();
  const activeItem = items.find((item) => item.url === pathname);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-50"
    >
      <div className="flex items-center justify-around bg-black/50 border border-white/10 backdrop-blur-lg p-2 rounded-2xl shadow-lg">
        <TooltipProvider>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem?.name === item.name;
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.url}
                    className={cn(
                      'relative flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-lg transition-all duration-300',
                      'text-white/70 hover:text-white',
                      isActive && 'text-white'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-item-mobile"
                        className="absolute inset-0 bg-primary/20 rounded-lg -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                    <Icon size={20} strokeWidth={2} />
                    <span className="text-[10px] font-medium">{item.name}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onLogout}
                className="flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                <LogOut size={20} />
                <span className="text-[10px] font-medium">Logout</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
}
