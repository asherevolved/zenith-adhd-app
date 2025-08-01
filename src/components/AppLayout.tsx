
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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, user } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', url: '/', icon: LayoutDashboard },
    { name: 'Tasks', url: '/tasks', icon: CheckSquare },
    { name: 'Therapy', url: '/therapy', icon: MessageCircle },
    { name: 'Journal', url: '/journal', icon: Book },
    { name: 'Habits', url: '/habits', icon: Repeat },
    { name: 'Timer', url: '/timer', icon: Timer },
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

  // If we are on an auth page, just render the children without the layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  // While the auth state is loading, or if the user is not authenticated yet,
  // we render the layout shell with a loading indicator.
  // The redirect for unauthenticated users will happen in the background.
  const showLoading = isAuthenticated === undefined || isAuthenticated === false;

  return (
    <div className="relative min-h-screen w-full">
      <AnimeNavBar items={menuItems} />
      {user && (
        <div className="fixed bottom-5 left-5 z-[9999]">
          <button
            onClick={logout}
            className="flex items-center justify-center p-3 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
      <main className="ml-20 md:ml-24 p-4 md:p-6 pt-8">
        {showLoading ? (
          <div className="flex items-center justify-center h-full">
            <div>Loading...</div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
