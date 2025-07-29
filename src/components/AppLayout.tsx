'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Book,
  CheckSquare,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Mic,
  Repeat,
  Settings,
  Timer,
} from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { parseVoiceCommand } from '@/ai/flows/voice-command-parser';
import { AnimeNavBar } from './ui/anime-navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { MindfulMeLogo } from './icons/Logo';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleVoiceCommand = async () => {
    toast({
      title: 'Listening...',
      description: 'Please state your command.',
    });

    // This is a mock implementation of voice command for scaffolding
    setTimeout(async () => {
      try {
        const command = "Add task: call therapist tomorrow";
        const result = await parseVoiceCommand({ command });
        toast({
          title: 'Voice Command Processed',
          description: `Intent: ${result.intent}, Parameters: ${JSON.stringify(result.parameters)}`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error processing command',
          description: 'Could not understand the voice command.',
        });
      }
    }, 2000);
  };


  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tasks', label: 'Task Manager', icon: CheckSquare },
    { href: '/therapy', label: 'AI Therapy', icon: MessageCircle },
    { href: '/journal', label: 'Journal', icon: Book },
    { href: '/habits', label: 'Habit Tracker', icon: Repeat },
    { href: '/timer', label: 'Focus Timer', icon: Timer },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const animeNavItems = menuItems.map(item => ({ name: item.label, url: item.href, icon: item.icon }))
  const activeLabel = menuItems.find((item) => item.href === pathname)?.label || 'Dashboard';

  return (
    <div className="relative min-h-screen w-full">
      <AnimeNavBar items={animeNavItems} defaultActive={activeLabel} />
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-4 left-4 z-[10000]">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                 <MindfulMeLogo className="size-8" />
                 <span className="text-2xl font-headline font-semibold">Mindful Me</span>
              </SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <nav className="grid items-start gap-2 px-4 text-sm font-medium">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${pathname === item.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="absolute bottom-4 w-[calc(100%-2rem)]">
               <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleVoiceCommand}>
                  <Mic />
                  <span>Voice Assistant</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
      <main className="flex-1 overflow-y-auto p-4 pt-8 md:p-6 md:pt-24">
        {children}
      </main>
    </div>
  );
}
