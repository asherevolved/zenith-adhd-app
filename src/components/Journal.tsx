'use client';

import * as React from 'react';
import { Sparkles, Loader2, BookCheck, MessageSquareQuote, Bot, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { journalReframer, type JournalReframerOutput } from '@/ai/flows/journal-reframer';
import type { JournalEntry } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function Journal() {
  const [journalEntry, setJournalEntry] = React.useState('');
  const [reframed, setReframed] = React.useState<JournalReframerOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [savedEntries, setSavedEntries] = React.useState<JournalEntry[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('mindful-me-journal-entries');
      if (storedEntries) {
        setSavedEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error('Failed to load journal entries from localStorage', error);
    }
  }, []);

  const handleReframe = async () => {
    if (!journalEntry.trim()) return;
    setIsLoading(true);
    setReframed(null);
    try {
      const result = await journalReframer({ journalEntry });
      setReframed(result);
    } catch (error) {
      console.error('Failed to reframe journal entry', error);
      toast({
        title: 'Error',
        description: 'Could not reframe the journal entry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJournal = () => {
    if (!reframed || !journalEntry) return;

    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      originalEntry: journalEntry,
      reframed: reframed,
      createdAt: new Date().toISOString(),
    };

    const updatedEntries = [newEntry, ...savedEntries];
    setSavedEntries(updatedEntries);

    try {
      localStorage.setItem('mindful-me-journal-entries', JSON.stringify(updatedEntries));
      toast({
        title: 'Journal Saved',
        description: 'Your reframed thoughts have been saved.',
      });
    } catch (error) {
      console.error('Failed to save journal entry to localStorage', error);
      toast({
        title: 'Error',
        description: 'Could not save the journal entry.',
        variant: 'destructive',
      });
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
                      <Button onClick={handleSaveJournal} className="w-full mt-4">
                        <Save className="mr-2 size-4" /> Save Journal
                      </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TabsContent>
      <TabsContent value="positive_reminders">
        <div className="space-y-6">
          {savedEntries.length > 0 ? (
            savedEntries.map(entry => (
              <Card key={entry.id}>
                <CardHeader>
                  <CardTitle className="text-lg">Journal Entry</CardTitle>
                  <CardDescription>
                    {format(new Date(entry.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Your Original Thought</h3>
                    <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
                      {entry.originalEntry}
                    </blockquote>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">AI Reframed Perspective</h3>
                    <div className="space-y-2 text-sm">
                        <h4 className="font-medium flex items-center gap-2"><MessageSquareQuote className="size-4 text-primary" /> What happened?</h4>
                        <p className="text-muted-foreground p-3 bg-background/50 rounded-md">{entry.reframed.step1}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                         <h4 className="font-medium flex items-center gap-2"><BookCheck className="size-4 text-primary" /> What would you say to a friend?</h4>
                         <p className="text-muted-foreground p-3 bg-background/50 rounded-md">{entry.reframed.step2}</p>
                    </div>
                     <div className="space-y-2 text-sm">
                         <h4 className="font-medium flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Reframed version</h4>
                         <p className="text-muted-foreground p-3 bg-background/50 rounded-md">{entry.reframed.reframedVersion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
             <Card>
              <CardContent className="py-20 text-center">
                <h3 className="text-xl font-semibold">No saved reminders yet.</h3>
                <p className="text-muted-foreground mt-2">Reframe a journal entry and save it to see it here.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
