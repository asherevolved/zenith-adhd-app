'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Book,
  CheckSquare,
  LayoutDashboard,
  MessageCircle,
  Mic,
  Repeat,
  Settings,
  Timer,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { MindfulMeLogo } from './icons/Logo';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { parseVoiceCommand } from '@/ai/flows/voice-command-parser';
import { AnimeNavBar } from './ui/anime-navbar';
import { useIsMobile } from '@/hooks/use-mobile';

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

  return (
    <SidebarProvider>
      {!isMobile && <AnimeNavBar items={animeNavItems} defaultActive="Dashboard" />}
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <MindfulMeLogo className="size-8" />
            <h1 className="text-2xl font-headline font-semibold">Mindful Me</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleVoiceCommand}>
            <Mic />
            <span className="group-data-[collapsible=icon]:hidden">Voice Assistant</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b bg-background/50 backdrop-blur-sm px-4 md:h-14">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-xl font-headline font-medium md:text-2xl">
            {menuItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
