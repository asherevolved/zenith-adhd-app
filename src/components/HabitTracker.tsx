'use client';

import * as React from 'react';
import { PlusCircle, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { getDay, startOfWeek, addDays, format } from 'date-fns';

const initialHabits = [
  { id: '1', name: 'Drink 8 glasses of water', streak: 12 },
  { id: '2', name: 'Meditate for 10 minutes', streak: 5 },
  { id: '3', name: 'Read for 30 minutes', streak: 28 },
];

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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-3xl font-bold tracking-tight">Habit Tracker</h2>
        <Button>
          <PlusCircle className="mr-2 size-4" /> Add Habit
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initialHabits.map(habit => (
          <Card key={habit.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                    <CardTitle>{habit.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-amber-400 mt-1">
                        <Flame className="size-4" /> {habit.streak} day streak
                    </CardDescription>
                </div>
                <Checkbox className="size-6" />
              </div>
            </CardHeader>
            <CardContent>
                <HabitCalendar />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
