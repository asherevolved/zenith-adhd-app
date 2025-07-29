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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { MindfulMeLogo } from './icons/Logo';
import { Sidebar } from './Sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

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

  const pathname = usePathname();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                   <MindfulMeLogo className="size-8" />
                   <span className="text-2xl font-headline font-semibold">Mindful Me</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-2 text-lg font-medium">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 rounded-xl px-3 py-2 transition-all ${pathname === item.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto">
                 <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleVoiceCommand}>
                    <Mic />
                    <span>Voice Assistant</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
