'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from '@/components/ui/chart';
import { CheckCircle2, Target, Trophy, Sparkles, BookOpen } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { eachDayOfInterval, startOfWeek, endOfWeek, format, isSameDay } from 'date-fns';

const chartConfig = {
  tasks: {
    label: "Tasks",
    color: "hsl(var(--chart-1))",
  },
  habits: {
    label: "Habits",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function Dashboard() {
  const { tasks, habits } = useAppContext();

  const tasksCompleted = tasks.filter(t => t.isCompleted).length;
  const activeHabits = habits.length;
  
  const longestHabitStreak = React.useMemo(() => {
    return habits.reduce((maxStreak, habit) => {
      return Math.max(maxStreak, habit.streak);
    }, 0);
  }, [habits]);

  const weeklyProgress = React.useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysOfWeek.map(day => {
      const formattedDay = format(day, 'yyyy-MM-dd');
      const tasksDone = tasks.filter(t => t.isCompleted && t.dueDate === formattedDay).length;
      const habitsDone = habits.filter(h => h.completions[formattedDay]).length;
      return {
        day: format(day, 'E'),
        tasks: tasksDone,
        habits: habitsDone,
      };
    });
  }, [tasks, habits]);

  // A simple way to calculate "badges" or achievements
  const badgesUnlocked = Math.floor(tasksCompleted / 5) + Math.floor(longestHabitStreak / 7);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Dashboard</CardTitle>
          <CardDescription>
            Welcome back! Here's a real-time snapshot of your progress.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksCompleted}</div>
            <p className="text-xs text-muted-foreground">Across all time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeHabits}</div>
            <p className="text-xs text-muted-foreground">Currently tracking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Habit Streak</CardTitle>
            <Trophy className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{longestHabitStreak}</div>
            <p className="text-xs text-muted-foreground">day streak</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Sparkles className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badgesUnlocked}</div>
            <p className="text-xs text-muted-foreground">badges unlocked</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 gap-6">
        <Card>
           <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Tasks and habits completed this week.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProgress} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="tasks" fill="var(--color-tasks)" radius={4} />
                  <Bar dataKey="habits" fill="var(--color-habits)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
