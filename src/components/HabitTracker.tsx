'use client';

import * as React from 'react';
import { PlusCircle, Flame, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { startOfWeek, addDays, format, isSameDay, subDays } from 'date-fns';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { getHabits, addHabit as addHabitToSupabase, updateHabit, deleteHabit as deleteHabitFromSupabase } from '@/lib/supabaseClient';


const DayIndicator = ({ date, isCompleted, onToggle, isTodayFlag }: { date: Date, isCompleted: boolean, onToggle: () => void, isTodayFlag: boolean }) => {
    const dayOfMonth = format(date, 'd');
    const dayOfWeek = format(date, 'E');

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onToggle}>
                        <span className="text-xs text-muted-foreground">{dayOfWeek}</span>
                        <div
                            className={`size-8 flex items-center justify-center rounded-full transition-all 
                            ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}
                            ${isTodayFlag ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                        >
                            {dayOfMonth}
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{format(date, 'MMMM d, yyyy')}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const HabitCalendar = ({ habit, onToggle }: { habit: Habit, onToggle: (date: Date) => void }) => {
    const weekStartsOn = 1; // Monday
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn });
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

    return (
        <div className="flex justify-between">
            {days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                return (
                    <DayIndicator
                        key={dateKey}
                        date={day}
                        isCompleted={!!habit.completions[dateKey]}
                        isTodayFlag={isSameDay(day, today)}
                        onToggle={() => onToggle(day)}
                    />
                );
            })}
        </div>
    );
};


export function HabitTracker() {
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newHabitName, setNewHabitName] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      const habitsFromSupabase = await getHabits();
      setHabits(habitsFromSupabase);
    } catch (error) {
      console.error("Failed to load habits", error);
      toast({ variant: 'destructive', title: 'Error fetching habits.' });
    } finally {
      setIsLoading(false);
    }
  };


  const calculateStreak = (completions: Record<string, boolean>): number => {
    let streak = 0;
    let currentDate = new Date();
    
    // If today's habit is not completed, start checking from yesterday
    if (!completions[format(currentDate, 'yyyy-MM-dd')]) {
        currentDate = subDays(currentDate, 1);
    }
  
    while (true) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      if (completions[dateKey]) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    const newHabitData = {
      name: newHabitName,
      streak: 0,
      completions: {},
    };
    try {
        const newHabit = await addHabitToSupabase(newHabitData);
        setHabits([...habits, newHabit]);
        setNewHabitName('');
        setIsDialogOpen(false);
    } catch (error) {
        console.error("Failed to add habit", error);
        toast({ variant: 'destructive', title: 'Failed to add habit.' });
    }
  };

  const deleteHabit = async (id: string) => {
    try {
        await deleteHabitFromSupabase(id);
        setHabits(habits.filter(habit => habit.id !== id));
    } catch (error) {
        console.error("Failed to delete habit", error);
        toast({ variant: 'destructive', title: 'Failed to delete habit.' });
    }
  };
  
  const toggleHabitCompletion = async (habitId: string, date: Date) => {
    const habitToUpdate = habits.find(h => h.id === habitId);
    if (!habitToUpdate) return;
    
    const dateKey = format(date, 'yyyy-MM-dd');
    const newCompletions = { ...habitToUpdate.completions, [dateKey]: !habitToUpdate.completions[dateKey] };
    const newStreak = calculateStreak(newCompletions);
    
    try {
        const updatedHabit = await updateHabit(habitId, { completions: newCompletions, streak: newStreak });
        setHabits(habits.map(h => h.id === habitId ? { ...h, ...updatedHabit } : h));
    } catch (error) {
        console.error("Failed to update habit", error);
        toast({ variant: 'destructive', title: 'Failed to update habit.' });
    }
  };

  const isHabitCompletedToday = (habit: Habit) => {
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    return !!habit.completions[todayKey];
  }
  
  if (isLoading) {
    return <div className="text-center text-muted-foreground pt-10">Loading habits...</div>
  }

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
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                      <CardTitle>{habit.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-amber-400 mt-1">
                          <Flame className="size-4" /> {habit.streak} day streak
                      </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox className="size-6" checked={isHabitCompletedToday(habit)} onCheckedChange={() => toggleHabitCompletion(habit.id, new Date())} />
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
                  <HabitCalendar habit={habit} onToggle={(date) => toggleHabitCompletion(habit.id, date)} />
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
