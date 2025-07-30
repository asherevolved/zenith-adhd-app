
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export function Journal() {
  const { journalEntries, addJournalEntry } = useAppContext();
  const [newEntryContent, setNewEntryContent] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  
  // Sort entries once
  const sortedEntries = React.useMemo(() => {
    return [...journalEntries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [journalEntries]);


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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs defaultValue="new_entry" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new_entry">New Entry</TabsTrigger>
          <TabsTrigger value="saved_entries">Saved Entries ({journalEntries.length})</TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <TabsContent value="new_entry" asChild>
            <motion.div
              key="new-entry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
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
            </motion.div>
          </TabsContent>
          <TabsContent value="saved_entries" asChild>
            <motion.div
              key="saved-entries"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {sortedEntries.length > 0 ? (
                <AnimatePresence>
                  {sortedEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      variants={itemVariants}
                      layout
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="size-5 text-primary" /> Journal Entry</CardTitle>
                          <CardDescription>
                            {format(new Date(entry.created_at), "MMMM d, yyyy 'at' h:mm a")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">{entry.content}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                 <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                 >
                   <Card>
                    <CardContent className="py-20 text-center">
                      <h3 className="text-xl font-semibold">No saved entries yet.</h3>
                      <p className="text-muted-foreground mt-2">Write a new journal entry and save it to see it here.</p>
                    </CardContent>
                  </Card>
                 </motion.div>
              )}
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}
