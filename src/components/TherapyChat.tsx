'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { CornerDownLeft, Mic, User, Bot } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { therapyChat, type TherapyChatInput } from '@/ai/flows/therapy-chat';
import { Skeleton } from './ui/skeleton';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function TherapyChat() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollAreaRef = React.useRef<React.ElementRef<'div'>>(null);

  React.useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.slice(-5); // Last 5 messages for context
      const chatInput: TherapyChatInput = { message: input, chatHistory: chatHistory.map(m => ({role: m.role, content: m.content})) };
      const result = await therapyChat(chatInput);
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-6 p-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
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
          ))}
          {isLoading && (
             <div className="flex items-start gap-3 justify-start">
                <Avatar className="size-8">
                    <AvatarFallback><Bot className="size-4" /></AvatarFallback>
                </Avatar>
                <div className="max-w-xs rounded-2xl p-3 text-sm md:max-w-md rounded-bl-none bg-card space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="relative mt-4 rounded-lg border bg-card/50">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message or use the microphone..."
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
