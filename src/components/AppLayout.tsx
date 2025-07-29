'use client';

import * as React from 'react';
import {
  Book,
  CheckSquare,
  LayoutDashboard,
  MessageCircle,
  Repeat,
  Settings,
  Timer,
} from 'lucide-react';
import { AnimeNavBar } from './AnimeNavBar';
import { usePathname } from 'next/navigation';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const menuItems = [
    { name: 'Dashboard', url: '/', icon: LayoutDashboard },
    { name: 'Task Manager', url: '/tasks', icon: CheckSquare },
    { name: 'AI Therapy', url: '/therapy', icon: MessageCircle },
    { name: 'Journal', url: '/journal', icon: Book },
    { name: 'Habit Tracker', url: '/habits', icon: Repeat },
    { name: 'Focus Timer', url: '/timer', icon: Timer },
    { name: 'Settings', url: '/settings', icon: Settings },
  ];

  return (
    <div className="relative min-h-screen w-full">
      <AnimeNavBar items={menuItems} />
      <main className="ml-28 p-6 pt-16">{children}</main>
    </div>
  );
}