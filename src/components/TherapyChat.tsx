
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerDownLeft, Mic, User, Bot } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { therapyChat, type TherapyChatInput } from '@/ai/flows/therapy-chat';
import { Skeleton } from './ui/skeleton';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import type { ChatMessage } from '@/types';

export function TherapyChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(true);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const { user } = useAppContext();

  React.useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) return;
      setIsLoadingHistory(true);
      const { data, error } = await supabase
        .from('therapy_chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching chat history:', error);
      } else {
        setMessages(data);
      }
      setIsLoadingHistory(false);
    };

    if(user) {
      fetchChatHistory();
    }
  }, [user]);

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
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessageContent = input;
    setInput('');

    // Optimistically add user message to UI
    const optimisticUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: user.id,
      role: 'user',
      content: userMessageContent,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticUserMessage]);
    setIsLoading(true);

    try {
       // Save user message to DB
      const { error: userError } = await supabase.from('therapy_chat_messages').insert({
          user_id: user.id,
          role: 'user',
          content: userMessageContent,
      });
      if (userError) throw userError;
      
      const chatHistory = messages.slice(-5);
      const chatInput: TherapyChatInput = { 
        message: userMessageContent, 
        chatHistory: chatHistory.map(m => ({role: m.role, content: m.content}))
      };

      const result = await therapyChat(chatInput);
      const assistantMessageContent = result.response;
      
      // Save assistant message to DB
      const { data: assistantData, error: assistantError } = await supabase.from('therapy_chat_messages').insert({
          user_id: user.id,
          role: 'assistant',
          content: assistantMessageContent,
      }).select().single();

      if (assistantError) throw assistantError;

      // Update the user message list with the response from the database
      setMessages(prev => [...prev.filter(m => m.id !== optimisticUserMessage.id), assistantData]);


    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        user_id: user.id,
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now.",
        created_at: new Date().toISOString(),
      };
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
    <div className="flex h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex-col">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-6 p-4">
        <AnimatePresence initial={false}>
          {isLoadingHistory ? (
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
                    <p className="text-xs text-muted-foreground">Loading history...</p>
                </div>
            </motion.div>
          ) : (
            messages.map((message) => (
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
          {isLoading && (
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
                    <Skeleton className="h-4 w-10 animate-pulse" />
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
          placeholder="Type your message or use the microphone..."
          className="h-12 border-0 bg-transparent pr-24 focus-visible:ring-0"
          disabled={isLoading || isLoadingHistory}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button variant="ghost" size="icon" disabled={isLoading || isLoadingHistory}>
            <Mic className="size-5" />
          </Button>
          <Button size="icon" onClick={handleSendMessage} disabled={isLoading || isLoadingHistory || !input.trim()}>
            <CornerDownLeft className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
