'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Book,
  CheckSquare,
  LayoutDashboard,
  MessageCircle,
  Repeat,
  Settings,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MindfulMeLogo } from './icons/Logo';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Task Manager', icon: CheckSquare },
  { href: '/therapy', label: 'AI Therapy', icon: MessageCircle },
  { href: '/journal', label: 'Journal', icon: Book },
  { href: '/habits', label: 'Habit Tracker', icon: Repeat },
  { href: '/timer', label: 'Focus Timer', icon: Timer },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-sidebar md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
            <MindfulMeLogo className="h-6 w-6" />
            <span>Mindful Me</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === item.href ? 'bg-accent text-primary' : 'text-sidebar-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
