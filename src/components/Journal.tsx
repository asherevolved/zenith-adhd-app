'use client';

import * as React from 'react';
import { Sparkles, Loader2, BookCheck, MessageSquareQuote, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { journalReframer, type JournalReframerOutput } from '@/ai/flows/journal-reframer';
import { motion, AnimatePresence } from 'framer-motion';

export function Journal() {
  const [journalEntry, setJournalEntry] = React.useState('');
  const [reframed, setReframed] = React.useState<JournalReframerOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleReframe = async () => {
    if (!journalEntry.trim()) return;
    setIsLoading(true);
    setReframed(null);
    try {
      const result = await journalReframer({ journalEntry });
      setReframed(result);
    } catch (error) {
      console.error("Failed to reframe journal entry", error);
      // You could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="new_entry" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="new_entry">New Entry</TabsTrigger>
        <TabsTrigger value="positive_reminders">Positive Reminders</TabsTrigger>
      </TabsList>
      <TabsContent value="new_entry">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>How are you feeling today?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write down your thoughts and feelings..."
                className="min-h-[300px] text-base"
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
              />
              <Button onClick={handleReframe} disabled={isLoading || !journalEntry.trim()} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                AI Reframe
              </Button>
            </CardContent>
          </Card>
          
          <AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="min-h-[440px] flex items-center justify-center bg-card/50 backdrop-blur-sm">
                  <div className="text-center text-muted-foreground">
                    <Bot className="mx-auto h-12 w-12 animate-pulse" />
                    <p className="mt-4">Our AI is analyzing your thoughts...</p>
                  </div>
                </Card>
              </motion.div>
            )}
            {reframed && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="min-h-[440px]">
                  <CardHeader>
                    <CardTitle>Your Reframed Thoughts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                      <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2"><MessageSquareQuote className="size-4 text-primary" /> What happened?</h3>
                        <p className="text-muted-foreground p-3 bg-background/50 rounded-md">{reframed.step1}</p>
                      </div>
                      <div className="space-y-2">
                         <h3 className="font-semibold flex items-center gap-2"><BookCheck className="size-4 text-primary" /> What would you say to a friend?</h3>
                         <p className="text-muted-foreground p-3 bg-background/50 rounded-md">{reframed.step2}</p>
                      </div>
                       <div className="space-y-2">
                         <h3 className="font-semibold flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Reframed version</h3>
                         <p className="text-muted-foreground p-3 bg-background/50 rounded-md">{reframed.reframedVersion}</p>
                      </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TabsContent>
      <TabsContent value="positive_reminders">
         <Card>
          <CardHeader>
            <CardTitle>Your Positive Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Your saved reframed thoughts will appear here.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
