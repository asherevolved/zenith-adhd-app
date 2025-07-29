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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Line, LineChart } from 'recharts';
import { addDays, format, startOfWeek, subDays } from 'date-fns';
import type { Task, Habit } from '@/types';
import { CheckCircle2, Flame, Sparkles, Target, Trophy } from 'lucide-react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

const chartConfig = {
  tasks: { label: 'Tasks', color: 'hsl(var(--chart-2))' },
  habits: { label: 'Habits', color: 'hsl(var(--chart-3))' },
  completed: { label: 'Completed', color: 'hsl(var(--chart-1))' },
  pending: { label: 'Pending', color: 'hsl(var(--chart-5))' },
  progress: { label: 'Progress', color: 'hsl(var(--chart-1))' },
};

export function Dashboard() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [weeklyActivity, setWeeklyActivity] = React.useState<{ day: string; tasks: number; habits: number; }[]>([]);
  const [dailyProgress, setDailyProgress] = React.useState<{ date: string, progress: number }[]>([]);

  React.useEffect(() => {
    // This code runs only on the client
    const loadData = () => {
      // Load Tasks
      const storedTasks = localStorage.getItem('mindful-me-tasks');
      const loadedTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
      setTasks(loadedTasks);

      // Load Habits
      const storedHabits = localStorage.getItem('mindful-me-habits');
      const loadedHabits: Habit[] = storedHabits ? JSON.parse(storedHabits) : [];
      setHabits(loadedHabits);

      // Process Weekly Activity
      const weekStartsOn = 1; // Monday
      const weekStart = startOfWeek(new Date(), { weekStartsOn });
      const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
      
      const activity = days.map(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const tasksCompletedOnDay = loadedTasks.filter(t => t.isCompleted && t.dueDate === dateKey).length;
        const habitsCompletedOnDay = loadedHabits.filter(h => h.completions[dateKey]).length;
        return {
          day: format(day, 'E'),
          tasks: tasksCompletedOnDay,
          habits: habitsCompletedOnDay
        };
      });
      setWeeklyActivity(activity);

      // Process Daily Progress for the last 7 days
      const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i)).reverse();
      const progressData = last7Days.map(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const totalTasks = loadedTasks.filter(t => t.dueDate === dateKey).length;
        const completedTasks = loadedTasks.filter(t => t.isCompleted && t.dueDate === dateKey).length;
        const totalHabits = loadedHabits.length;
        const completedHabits = loadedHabits.filter(h => h.completions[dateKey]).length;
        const dailyCompletion = (totalTasks + totalHabits) > 0 ? ((completedTasks + completedHabits) / (totalTasks + totalHabits)) * 100 : 0;
        return {
          date: format(day, 'MMM d'),
          progress: Math.round(dailyCompletion),
        };
      });
      setDailyProgress(progressData);
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const pendingTasks = tasks.length - completedTasks;
  const overallProgress = (tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0);
  
  const longestStreak = habits.reduce((max, h) => h.streak > max ? h.streak : max, 0);

  const taskCompletionChartData = [
    { status: 'Completed', value: completedTasks, fill: 'hsl(var(--chart-1))' },
    { status: 'Pending', value: pendingTasks, fill: 'hsl(var(--chart-5))' },
  ];

  const tasksForToday = tasks.filter(t => !t.isCompleted && t.dueDate === format(new Date(), 'yyyy-MM-dd'));
  const habitsForToday = habits.filter(h => !h.completions[format(new Date(), 'yyyy-MM-dd')]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Your Progress Dashboard</CardTitle>
          <CardDescription>
            You've completed {Math.round(overallProgress)}% of your tasks. Keep up the great work!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-2" />
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">out of {tasks.length} total tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracked Habits</CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{habits.length}</div>
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
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Sparkles className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">badges unlocked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
           <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Overall completion for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={dailyProgress} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                 <CartesianGrid vertical={false} />
                 <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                 <YAxis unit="%" />
                 <ChartTooltip content={<ChartTooltipContent />} />
                 <ChartLegend content={<ChartLegendContent />} />
                 <Line type="monotone" dataKey="progress" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={true} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Look</CardTitle>
            <CardDescription>What's on your plate for today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                  <h4 className="text-sm font-medium mb-2">Pending Tasks</h4>
                  {tasksForToday.length > 0 ? (
                    <div className="space-y-2">
                      {tasksForToday.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/50">
                          <span>{task.title}</span>
                          <Badge variant="outline" className={task.priority === 'Urgent' ? 'border-red-500/50 text-red-400' : 'border-yellow-500/50 text-yellow-400'}>{task.priority}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-muted-foreground">No pending tasks for today!</p>}
              </div>
               <div>
                  <h4 className="text-sm font-medium mb-2">Pending Habits</h4>
                   {habitsForToday.length > 0 ? (
                    <div className="space-y-2">
                       {habitsForToday.slice(0, 3).map(habit => (
                        <div key={habit.id} className="flex items-center gap-2 text-xs p-2 rounded-md bg-muted/50">
                          <Flame className="size-3 text-amber-400" />
                          <span>{habit.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-muted-foreground">All habits completed!</p>}
              </div>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
         <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Tasks vs. Habits Completed This Week</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
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
                <Bar dataKey="tasks" fill="hsl(var(--chart-2))" radius={4} />
                <Bar dataKey="habits" fill="hsl(var(--chart-3))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>A breakdown of your current tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pl-2">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="status" hideLabel />}
                />
                <Pie data={taskCompletionChartData} dataKey="value" nameKey="status" innerRadius={60} outerRadius={80} />
                <ChartLegend
                  content={<ChartLegendContent nameKey="status" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
