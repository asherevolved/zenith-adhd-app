'use client';

import * as React from 'react';
import { PlusCircle, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { Task } from '@/types';

const initialTasks: Task[] = [
  { id: '1', title: 'Call therapist for appointment', dueDate: '2024-10-28', priority: 'Urgent', status: 'Today', isCompleted: false },
  { id: '2', title: 'Finish Q3 report', dueDate: '2024-10-29', priority: 'Medium', status: 'Today', isCompleted: false },
  { id: '3', title: 'Pick up prescription', dueDate: '2024-10-27', priority: 'Low', status: 'Today', isCompleted: true },
  { id: '4', title: 'Plan winter vacation', dueDate: '2024-11-15', priority: 'Medium', status: 'Upcoming', isCompleted: false },
  { id: '5', title: 'Organize office space', dueDate: 'N/A', priority: 'Low', status: 'Someday', isCompleted: false },
];

const priorityColors = {
  Urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm transition-all hover:bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-base font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Mark as Done</DropdownMenuItem>
            <DropdownMenuItem className="text-red-400">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>Due: {task.dueDate}</span>
          <Badge variant="outline" className={priorityColors[task.priority]}>{task.priority}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function TaskManager() {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);

  const filteredTasks = (status: Task['status']) => tasks.filter(task => task.status === status);

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="today" className="flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="someday">Someday</TabsTrigger>
          </TabsList>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 size-4" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input id="title" placeholder="e.g. Call therapist" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notes</Label>
                  <Textarea id="notes" placeholder="Add details..." className="col-span-3" />
                </div>
                {/* Add more fields like due date, priority etc. */}
              </div>
              <DialogFooter>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-4 flex-1">
          <TabsContent value="today" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks('Today').map(task => <TaskCard key={task.id} task={task} />)}
          </TabsContent>
          <TabsContent value="upcoming" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks('Upcoming').map(task => <TaskCard key={task.id} task={task} />)}
          </TabsContent>
          <TabsContent value="someday" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks('Someday').map(task => <TaskCard key={task.id} task={task} />)}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
