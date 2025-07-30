'use client';

import * as React from 'react';
import { PlusCircle, Flame, Check, MoreVertical, Trash2 } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';

export function HabitTracker() {
  const { habits, addHabit, toggleHabit, deleteHabit } = useAppContext();
  const [newHabitName, setNewHabitName] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    addHabit(newHabitName);
    setNewHabitName('');
    setIsDialogOpen(false);
  };
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

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
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddHabit() }}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                 <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddHabit}>Save Habit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {habits.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {habits.map(habit => (
            <Card key={habit.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-orange-400">
                      <Flame className="size-5" />
                      <span className="font-bold">{habit.streak}</span>
                    </div>
                    <span>{habit.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 shrink-0">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="text-red-400" onClick={() => deleteHabit(habit.id)}>
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardTitle>
                <CardDescription>Track your progress for the week.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-around items-center pt-2">
                 {daysOfWeek.map(day => {
                   const dayStr = format(day, 'yyyy-MM-dd');
                   const isCompleted = habit.completions[dayStr];
                   return (
                     <div key={dayStr} className="flex flex-col items-center gap-2">
                       <span className="text-xs text-muted-foreground">{format(day, 'E')}</span>
                       <Button
                         variant={isCompleted ? 'default' : 'outline'}
                         size="icon"
                         className={`size-10 rounded-full ${dayStr === today ? 'border-primary' : ''}`}
                         onClick={() => toggleHabit(habit.id, dayStr)}
                       >
                         <Check className={`size-5 ${isCompleted ? '' : 'text-transparent'}`} />
                       </Button>
                     </div>
                   );
                 })}
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
