'use client';

import * as React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function HabitTracker() {
  const [habits, setHabits] = React.useState<any[]>([]);
  const [newHabitName, setNewHabitName] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    // Mock adding habit
    setHabits([...habits, { id: crypto.randomUUID(), name: newHabitName, streak: 0, completions: {} }]);
    setNewHabitName('');
    setIsDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-3xl font-bold tracking-tight">Habit Tracker</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 size-4" /> Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new habit</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="habit-name" className="text-right">
                  Habit
                </Label>
                <Input
                  id="habit-name"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Meditate for 10 minutes"
                  className="col-span-3"
                  onKeyDown={(e) => { if (e.key === 'Enter') addHabit() }}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                 <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={addHabit}>Save Habit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {habits.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {habits.map(habit => (
            <Card key={habit.id}>
              <CardHeader>
                <CardTitle>{habit.name}</CardTitle>
                <CardDescription>Streak: {habit.streak} days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Track your progress here.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-20">
            <CardContent className="text-center">
                <h3 className="text-xl font-semibold">No habits yet!</h3>
                <p className="text-muted-foreground mt-2">Click "Add Habit" to start tracking your goals.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
