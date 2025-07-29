'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeItem = items.find((item) => item.url === pathname) || items[0];
  const activeTab = activeItem.name;

  if (!mounted) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
      <div className="fixed top-1/2 -translate-y-1/2 left-5 z-[9999]">
        <div className="flex justify-start pt-6">
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
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              const isHovered = hoveredTab === item.name;

              return (
                <Link
                  key={item.name}
                  href={item.url}
                  onMouseEnter={() => setHoveredTab(item.name)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={cn(
                    'relative cursor-pointer text-sm font-semibold p-3 rounded-full transition-all duration-300',
                    'text-white/70 hover:text-white',
                    isActive && 'text-white'
                  )}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full -z-10 overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0.3, 0.5, 0.3],
                        scale: [1, 1.03, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <div className="absolute inset-0 bg-primary/25 rounded-full blur-md" />
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                      <div className="absolute inset-0 bg-primary/15 rounded-full blur-2xl" />
                      <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />

                      <div
                        className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0"
                        style={{
                          animation: 'shine 3s ease-in-out infinite',
                        }}
                      />
                    </motion.div>
                  )}

                  <motion.span
                    className="relative z-10"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon size={18} strokeWidth={2.5} />
                  </motion.span>

                  <AnimatePresence>
                    {isHovered && !isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 bg-white/10 rounded-full -z-10"
                      />
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </div>
    </>
  );
}