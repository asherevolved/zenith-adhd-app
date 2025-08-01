
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
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
import { CheckCircle2, Target, Trophy, Sparkles, BookHeart, PieChart, Star } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { eachDayOfInterval, startOfWeek, endOfWeek, format } from 'date-fns';
import { Skeleton } from './ui/skeleton';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};


export function Dashboard() {
  const { tasks, habits, profile, journalEntries, isLoadingSettings } = useAppContext();

  // Robust check to ensure all data is loaded before proceeding
  const isDataReady = !isLoadingSettings && !!tasks && !!habits && !!profile && !!journalEntries;

  const tasksCompleted = isDataReady ? tasks.filter(t => t.isCompleted).length : 0;
  const totalTasks = isDataReady ? tasks.length : 0;
  const taskCompletionRate = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;
  
  const activeHabits = isDataReady ? habits.length : 0;
  
  const longestHabitStreak = React.useMemo(() => {
    if (!isDataReady || !habits || habits.length === 0) return 0;
    return habits.reduce((maxStreak, habit) => {
      return Math.max(maxStreak, habit.streak);
    }, 0);
  }, [habits, isDataReady]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const habitsCompletedToday = isDataReady ? habits.filter(h => h.completions[todayStr]).length : 0;

  const weeklyProgress = React.useMemo(() => {
    if (!isDataReady) return [];
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysOfWeek.map(day => {
      const formattedDay = format(day, 'yyyy-MM-dd');
      const tasksDone = tasks.filter(t => t.isCompleted && t.due_date === formattedDay).length;
      const habitsDone = habits.filter(h => h.completions[formattedDay]).length;
      return {
        day: format(day, 'E'),
        tasks: tasksDone,
        habits: habitsDone,
      };
    });
  }, [tasks, habits, isDataReady]);

  const badgesUnlocked = isDataReady ? Math.floor(tasksCompleted / 5) + Math.floor(longestHabitStreak / 7) : 0;
  const journalEntryCount = isDataReady ? journalEntries.length : 0;

  if (!isDataReady) {
     return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
            </CardTitle>
            <CardDescription>
              Here's a real-time snapshot of your progress.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
      
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
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
        </motion.div>
        <motion.div variants={itemVariants}>
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
        </motion.div>
        <motion.div variants={itemVariants}>
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
        </motion.div>
         <motion.div variants={itemVariants}>
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
        </motion.div>
        <motion.div variants={itemVariants}>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
              <BookHeart className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{journalEntryCount}</div>
              <p className="text-xs text-muted-foreground">total entries</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
              <PieChart className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskCompletionRate}%</div>
              <p className="text-xs text-muted-foreground">overall completion rate</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Habits Done Today</CardTitle>
              <Star className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{habitsCompletedToday}</div>
              <p className="text-xs text-muted-foreground">of {activeHabits} habits</p>
            </CardContent>
          </Card>
        </motion.div>
         <motion.div variants={itemVariants}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
                <Target className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">N/A</div>
                <p className="text-xs text-muted-foreground">coming soon</p>
                </CardContent>
            </Card>
        </motion.div>
      </motion.div>

       <motion.div className="grid grid-cols-1 gap-6" variants={itemVariants}>
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
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    cursor={{fill: "hsl(var(--accent))"}}
                  />
                  <Bar dataKey="tasks" fill="var(--color-tasks)" radius={4} />
                  <Bar dataKey="habits" fill="var(--color-habits)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
