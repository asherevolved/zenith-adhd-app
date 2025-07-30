
'use client';

import * as React from 'react';
import {
  Book,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Repeat,
  Settings,
  Timer,
} from 'lucide-react';
import { AnimeNavBar } from './AnimeNavBar';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { BottomNavBar } from './BottomNavBar';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, user } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuItems = [
    { name: 'Dashboard', url: '/', icon: LayoutDashboard },
    { name: 'Task Manager', url: '/tasks', icon: CheckSquare },
    { name: 'AI Therapy', url: '/therapy', icon: MessageCircle },
    { name: 'Journal', url: '/journal', icon: Book },
    { name: 'Habit Tracker', url: '/habits', icon: Repeat },
    { name: 'Focus Timer', url: '/timer', icon: Timer },
    { name: 'Settings', url: '/settings', icon: Settings },
  ];

  const authRoutes = ['/login', '/signup'];
  const isAuthPage = authRoutes.includes(pathname);

  React.useEffect(() => {
    // Redirect to login if not authenticated and not on an auth page
    if (isAuthenticated === false && !isAuthPage) {
      router.push('/login');
    }
    // Redirect to home if authenticated and on an auth page
    if (isAuthenticated === true && isAuthPage) {
      router.push('/');
    }
  }, [isAuthenticated, isAuthPage, router]);

  // Don't render layout for auth pages, or if auth state is not yet determined/checked
  if (isAuthPage || isAuthenticated === undefined || !isMounted) {
    return <>{children}</>;
  }
  
  if (!isAuthenticated && !isAuthPage) {
    // Return null or a loader while redirecting
    return null;
  }

  if (!user && !isAuthPage) {
    return null; // Don't render if user is null and not on an auth page
  }

  return (
    <div className="relative min-h-screen w-full">
      {isMobile ? (
        <BottomNavBar items={menuItems} onLogout={logout} />
      ) : (
        <>
          <AnimeNavBar items={menuItems} />
          <div className="fixed bottom-5 left-5 z-[9999]">
            <button
              onClick={logout}
              className="flex items-center justify-center p-3 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </>
      )}
      <main className={isMobile ? "p-4 pb-24" : "ml-28 p-6 pt-16"}>
        {children}
      </main>
    </div>
  );
}
