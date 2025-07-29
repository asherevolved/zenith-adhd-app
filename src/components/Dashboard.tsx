'use client';

import * as React from 'react';
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
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart } from 'recharts';
import { addDays, format, startOfWeek } from 'date-fns';
import type { Task, Habit } from '@/types';
import { CheckCircle2, TrendingUp, Trophy } from 'lucide-react';

const chartConfig = {
  tasks: { label: 'Tasks', color: 'hsl(var(--chart-1))' },
  habits: { label: 'Habits', color: 'hsl(var(--chart-2))' },
  completed: { label: 'Completed', color: 'hsl(var(--chart-1))' },
  pending: { label: 'Pending', color: 'hsl(var(--chart-5))' },
};

export function Dashboard() {
  const [taskData, setTaskData] = React.useState<{ completed: number, pending: number }>({ completed: 0, pending: 0 });
  const [weeklyActivity, setWeeklyActivity] = React.useState<{ day: string; tasks: number; habits: number; }[]>([]);
  const [totalHabits, setTotalHabits] = React.useState(0);
  const [longestStreak, setLongestStreak] = React.useState(0);

  React.useEffect(() => {
    // This code runs only on the client
    const loadData = () => {
      // Load Tasks
      const storedTasks = localStorage.getItem('mindful-me-tasks');
      const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
      const completedTasks = tasks.filter(t => t.isCompleted).length;
      const pendingTasks = tasks.length - completedTasks;
      setTaskData({ completed: completedTasks, pending: pendingTasks });

      // Load Habits
      const storedHabits = localStorage.getItem('mindful-me-habits');
      const habits: Habit[] = storedHabits ? JSON.parse(storedHabits) : [];
      setTotalHabits(habits.length);
      const maxStreak = habits.reduce((max, h) => h.streak > max ? h.streak : max, 0);
      setLongestStreak(maxStreak);

      // Process Weekly Activity
      const weekStartsOn = 1; // Monday
      const weekStart = startOfWeek(new Date(), { weekStartsOn });
      const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
      
      const activity = days.map(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const tasksCompleted = tasks.filter(t => t.isCompleted && t.dueDate === dateKey).length;
        const habitsCompleted = habits.filter(h => h.completions[dateKey]).length;
        return {
          day: format(day, 'E'),
          tasks: tasksCompleted,
          habits: habitsCompleted
        };
      });
      setWeeklyActivity(activity);
    };

    loadData();
  }, []);

  const taskCompletionChartData = [
    { status: 'Completed', value: taskData.completed, fill: 'hsl(var(--chart-1))' },
    { status: 'Pending', value: taskData.pending, fill: 'hsl(var(--chart-5))' },
  ];
  
  const overallProgress = (taskData.completed / (taskData.completed + taskData.pending) * 100) || 0;

  return (
    <div className="grid gap-6">
      <div className="space-y-1.5">
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Your Progress Dashboard
        </h2>
        <p className="text-muted-foreground">
          You've completed {Math.round(overallProgress)}% of your tasks. Keep up the great work!
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskData.completed}</div>
            <p className="text-xs text-muted-foreground">out of {taskData.completed + taskData.pending} total tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracked Habits</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHabits}</div>
            <p className="text-xs text-muted-foreground">Keep building those routines</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Habit Streak</CardTitle>
            <Trophy className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{longestStreak} days</div>
            <p className="text-xs text-muted-foreground">Incredible consistency!</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Task Completion Status</CardTitle>
            <CardDescription>A breakdown of your current tasks.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="status" hideLabel />}
                />
                <Pie data={taskCompletionChartData} dataKey="value" nameKey="status" innerRadius={60} />
                <ChartLegend
                  content={<ChartLegendContent nameKey="status" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Tasks vs. Habits Completed This Week</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={weeklyActivity}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="tasks" fill="hsl(var(--chart-1))" radius={4} />
                <Bar dataKey="habits" fill="hsl(var(--chart-2))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
