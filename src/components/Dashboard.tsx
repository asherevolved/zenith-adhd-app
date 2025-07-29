'use client';

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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart } from 'recharts';

const chartConfig = {
  tasks: { label: 'Tasks', color: 'hsl(var(--chart-1))' },
  habits: { label: 'Habits', color: 'hsl(var(--chart-2))' },
  mood: { label: 'Mood', color: 'hsl(var(--chart-3))' },
  focus: { label: 'Focus', color: 'hsl(var(--chart-4))' },
  completed: { label: 'Completed', color: 'hsl(var(--chart-1))' },
  pending: { label: 'Pending', color: 'hsl(var(--chart-5))' },
};

const taskCompletionData = [
  { status: 'Completed', value: 85, fill: 'hsl(var(--chart-1))' },
  { status: 'Pending', value: 15, fill: 'hsl(var(--chart-5))' },
];

const moodTrendData = [
  { date: 'Mon', mood: 4 },
  { date: 'Tue', mood: 3 },
  { date: 'Wed', mood: 5 },
  { date: 'Thu', mood: 4 },
  { date: 'Fri', mood: 6 },
  { date: 'Sat', mood: 5 },
  { date: 'Sun', mood: 7 },
];

const weeklyActivityData = [
  { day: 'Mon', tasks: 5, habits: 3 },
  { day: 'Tue', tasks: 7, habits: 4 },
  { day: 'Wed', tasks: 4, habits: 3 },
  { day: 'Thu', tasks: 6, habits: 5 },
  { day: 'Fri', tasks: 8, habits: 4 },
  { day: 'Sat', tasks: 3, habits: 2 },
  { day: 'Sun', tasks: 5, habits: 3 },
];

export function Dashboard() {
  return (
    <div className="grid gap-6">
      <div className="space-y-1.5">
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Weekly Analytics Dashboard
        </h2>
        <p className="text-muted-foreground">
          You completed 85% of your goals this week! 🎉
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>This week's task progress</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="status" hideLabel />}
                />
                <Pie data={taskCompletionData} dataKey="value" nameKey="status" />
                <ChartLegend
                  content={<ChartLegendContent nameKey="status" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mood Trends</CardTitle>
            <CardDescription>Your mood ratings over the week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={moodTrendData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis hide={true} domain={[0, 10]} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="mood"
                  type="monotone"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={4}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>Focus Timer Usage</CardTitle>
            <CardDescription>Total focus minutes this week: 240</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[250px] items-center justify-center">
              <div className="relative size-48">
                <svg className="size-full" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-muted" strokeWidth="2"></circle>
                  <g className="origin-center -rotate-90 transform">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-primary" strokeWidth="2" strokeDasharray="100" strokeDashoffset="25"></circle>
                  </g>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-primary">75%</span>
                  <span className="text-sm text-muted-foreground">Goal Met</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Tasks vs. Habits Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={weeklyActivityData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
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
