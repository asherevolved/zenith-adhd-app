
'use client';

import * as React from 'react';
import { Save, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';

export function Journal() {
  const { journalEntries, addJournalEntry } = useAppContext();
  const [newEntryContent, setNewEntryContent] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSaveJournal = async () => {
    if (!newEntryContent.trim()) {
       toast({
        title: 'Empty Entry',
        description: 'You cannot save an empty journal entry.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    await addJournalEntry(newEntryContent);
    setIsLoading(false);
    toast({
      title: 'Journal Saved',
      description: 'Your entry has been successfully saved.',
    });
    setNewEntryContent(''); // Clear textarea after saving
  };

  return (
    <Tabs defaultValue="new_entry" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="new_entry">New Entry</TabsTrigger>
        <TabsTrigger value="saved_entries">Saved Entries ({journalEntries.length})</TabsTrigger>
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
              value={newEntryContent}
              onChange={(e) => setNewEntryContent(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleSaveJournal} disabled={!newEntryContent.trim() || isLoading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Entry'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="saved_entries">
        <div className="space-y-6">
          {journalEntries.length > 0 ? (
            journalEntries.map(entry => (
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
