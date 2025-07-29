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
import { CheckCircle2, Target, Trophy, Sparkles } from 'lucide-react';

const mockData = {
  tasksCompleted: 12,
  habitsTracked: 4,
  habitStreak: 15,
  badgesUnlocked: 3,
  weeklyProgress: [
    { day: 'Mon', tasks: 2, habits: 1 },
    { day: 'Tue', tasks: 3, habits: 1 },
    { day: 'Wed', tasks: 1, habits: 1 },
    { day: 'Thu', tasks: 4, habits: 1 },
    { day: 'Fri', tasks: 2, habits: 0 },
    { day: 'Sat', tasks: 0, habits: 0 },
    { day: 'Sun', tasks: 0, habits: 0 },
  ],
};

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
  const [data, setData] = React.useState(mockData);

  // In a real app, you would fetch this data from an API
  // useEffect(() => {
  //   fetch('/api/dashboard-data').then(res => res.json()).then(setData);
  // }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Dashboard</CardTitle>
          <CardDescription>
            Welcome back! Here's a snapshot of your progress.
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
            <div className="text-2xl font-bold">{data.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habits Tracked</CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.habitsTracked}</div>
            <p className="text-xs text-muted-foreground">4 active habits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Habit Streak</CardTitle>
            <Trophy className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.habitStreak}</div>
            <p className="text-xs text-muted-foreground">day streak</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Sparkles className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.badgesUnlocked}</div>
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
                <BarChart data={data.weeklyProgress} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
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
