'use client';

import * as React from 'react';
import { Save, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { JournalEntry } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getJournalEntries, addJournalEntry } from '@/lib/supabaseClient';

export function Journal() {
  const [journalEntry, setJournalEntry] = React.useState('');
  const [savedEntries, setSavedEntries] = React.useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const entries = await getJournalEntries();
      setSavedEntries(entries);
    } catch (error) {
      console.error('Failed to load journal entries from Supabase', error);
      toast({
        title: 'Error',
        description: 'Could not load journal entries.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJournal = async () => {
    if (!journalEntry.trim()) {
       toast({
        title: 'Empty Entry',
        description: 'You cannot save an empty journal entry.',
        variant: 'destructive',
      });
      return;
    }

    const newEntryData = {
      content: journalEntry,
      createdAt: new Date().toISOString(),
    };

    try {
      const newEntry = await addJournalEntry(newEntryData);
      setSavedEntries([newEntry, ...savedEntries]);
      toast({
        title: 'Journal Saved',
        description: 'Your entry has been successfully saved.',
      });
      setJournalEntry(''); // Clear textarea after saving
    } catch (error) {
      console.error('Failed to save journal entry to Supabase', error);
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
        <TabsTrigger value="saved_entries">Saved Entries</TabsTrigger>
      </TabsList>
      <TabsContent value="new_entry">
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
            <CardDescription>Write down your thoughts and feelings. They will be saved to your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Start writing..."
              className="min-h-[400px] text-base"
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
            />
            <Button onClick={handleSaveJournal} disabled={!journalEntry.trim()} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Entry
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="saved_entries">
        <div className="space-y-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground pt-10">Loading entries...</p>
          ) : savedEntries.length > 0 ? (
            savedEntries.map(entry => (
              <Card key={entry.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="size-5 text-primary" /> Journal Entry</CardTitle>
                  <CardDescription>
                    {format(new Date(entry.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{entry.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
             <Card>
              <CardContent className="py-20 text-center">
                <h3 className="text-xl font-semibold">No saved entries yet.</h3>
                <p className="text-muted-foreground mt-2">Write a new journal entry and save it to see it here.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
