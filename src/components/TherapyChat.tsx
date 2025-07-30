
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerDownLeft, Mic, User, Bot } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { useAppContext } from '@/context/AppContext';
import type { ChatMessage } from '@/types';

export function TherapyChat() {
  const { therapyMessages, sendTherapyMessage, isLoadingTherapyHistory } = useAppContext();
  const [input, setInput] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to bottom when new messages are added
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }, 100);
  }, [therapyMessages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setIsSending(true);
    const messageContent = input;
    setInput('');
    
    await sendTherapyMessage(messageContent);
    setIsSending(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const isLoading = isLoadingTherapyHistory || isSending;

  return (
    <div className="flex h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex-col">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-6 p-4">
        <AnimatePresence initial={false}>
          {isLoadingTherapyHistory ? (
             <motion.div 
                className="flex items-start gap-3 justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
             >
                <Avatar className="size-8">
                    <AvatarFallback><Bot className="size-4" /></AvatarFallback>
                </Avatar>
                <div className="max-w-xs rounded-2xl p-3 text-sm md:max-w-md rounded-bl-none bg-card space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </motion.div>
          ) : (
            therapyMessages.map((message) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="size-8">
                    <AvatarFallback><Bot className="size-4" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs rounded-2xl p-3 text-sm md:max-w-md ${
                    message.role === 'user'
                      ? 'rounded-br-none bg-primary text-primary-foreground'
                      : 'rounded-bl-none bg-card'
                  }`}
                >
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <Avatar className="size-8">
                    <AvatarFallback><User className="size-4" /></AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))
          )}
          {isSending && (
             <motion.div 
                key="loading"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-3 justify-start"
             >
                <Avatar className="size-8">
                    <AvatarFallback><Bot className="size-4" /></AvatarFallback>
                </Avatar>
                <div className="max-w-xs rounded-2xl p-3 text-sm md:max-w-md rounded-bl-none bg-card space-y-2">
                    <div className="flex items-center gap-1.5">
                        <motion.div className="size-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0s' }} />
                        <motion.div className="size-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <motion.div className="size-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </ScrollArea>
      <div className="relative mt-4 rounded-lg border bg-card/50">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="h-12 border-0 bg-transparent pr-24 focus-visible:ring-0"
          disabled={isLoading}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled={isLoading}>
            <Mic className="size-5" />
          </Button>
          <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
            <CornerDownLeft className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
