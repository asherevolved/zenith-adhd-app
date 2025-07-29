'use client';

import * as React from 'react';
import { PlusCircle, Flame, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { getDay, startOfWeek, addDays, format } from 'date-fns';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Habit } from '@/types';

const DayIndicator = ({ active }: { active: boolean }) => (
  <div className={`size-5 rounded-full ${active ? 'bg-primary' : 'bg-muted/50'}`} />
);

const HabitCalendar = () => {
    const weekStartsOn = 1; // Monday
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn });
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  
    return (
      <div className="flex justify-between">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">{format(day, 'E')}</span>
            <DayIndicator active={Math.random() > 0.5} />
          </div>
        ))}
      </div>
    );
  };
  

export function HabitTracker() {
  const [habits, setHabits] = React.useState<Omit<Habit, 'frequency' | 'completions'>[]>([]);
  const [newHabitName, setNewHabitName] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit = {
      id: crypto.randomUUID(),
      name: newHabitName,
      streak: 0,
    };
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setIsDialogOpen(false);
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
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
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                      <CardTitle>{habit.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-amber-400 mt-1">
                          <Flame className="size-4" /> {habit.streak} day streak
                      </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox className="size-6" />
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem className="text-red-400" onClick={() => deleteHabit(habit.id)}>
                            <Trash2 className="mr-2 size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                  <HabitCalendar />
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
