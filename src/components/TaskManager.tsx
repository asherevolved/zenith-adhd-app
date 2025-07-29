'use client';

import * as React from 'react';
import { PlusCircle, MoreVertical, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { Task } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { format } from 'date-fns';

const priorityColors = {
  Urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

function TaskCard({ task, onToggle, onDelete }: { task: Task, onToggle: (id: string) => void, onDelete: (id: string) => void }) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm transition-all hover:bg-card">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
            <Checkbox checked={task.isCompleted} onCheckedChange={() => onToggle(task.id)} className="size-5" />
            <CardTitle className={`text-base font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 shrink-0">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}
            <DropdownMenuItem onClick={() => onToggle(task.id)}>
              {task.isCompleted ? 'Mark as Not Done' : 'Mark as Done'}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-400" onClick={() => onDelete(task.id)}>
                <Trash2 className="mr-2 size-4" />
                Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground pl-8">
          <span>Due: {task.dueDate}</span>
          <Badge variant="outline" className={priorityColors[task.priority]}>{task.priority}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function TaskManager() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [newTaskNotes, setNewTaskNotes] = React.useState('');
  const [newTaskPriority, setNewTaskPriority] = React.useState<Task['priority']>('Medium');
  const [newTaskStatus, setNewTaskStatus] = React.useState<Task['status']>('Today');

  React.useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('mindful-me-tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Failed to load tasks from localStorage", error);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem('mindful-me-tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error);
    }
  }, [tasks]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      notes: newTaskNotes,
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      priority: newTaskPriority,
      status: newTaskStatus,
      isCompleted: false,
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskNotes('');
    setNewTaskPriority('Medium');
    setNewTaskStatus('Today');
    setIsDialogOpen(false);
  }

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };
  
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  }

  const filteredTasks = (status: Task['status']) => tasks.filter(task => {
     if (status === 'Today') {
        const today = format(new Date(), 'yyyy-MM-dd');
        return task.status === 'Today' || task.dueDate === today;
     }
     return task.status === status;
  });

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="today" className="flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="someday">Someday</TabsTrigger>
          </TabsList>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  <Input id="title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="e.g. Call therapist" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notes</Label>
                  <Textarea id="notes" value={newTaskNotes} onChange={(e) => setNewTaskNotes(e.target.value)} placeholder="Add details..." className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">Priority</Label>
                   <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as Task['priority'])}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                   <Select value={newTaskStatus} onValueChange={(v) => setNewTaskStatus(v as Task['status'])}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Today">Today</SelectItem>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Someday">Someday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={addTask}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-4 flex-1">
          <TabsContent value="today" className="space-y-4">
            {filteredTasks('Today').map(task => <TaskCard key={task.id} task={task} onToggle={toggleTaskCompletion} onDelete={deleteTask} />)}
            {filteredTasks('Today').length === 0 && <p className="text-center text-muted-foreground pt-10">No tasks for today. Great job!</p>}
          </TabsContent>
          <TabsContent value="upcoming" className="space-y-4">
            {filteredTasks('Upcoming').map(task => <TaskCard key={task.id} task={task} onToggle={toggleTaskCompletion} onDelete={deleteTask} />)}
            {filteredTasks('Upcoming').length === 0 && <p className="text-center text-muted-foreground pt-10">No upcoming tasks.</p>}
          </TabsContent>
          <TabsContent value="someday" className="space-y-4">
            {filteredTasks('Someday').map(task => <TaskCard key={task.id} task={task} onToggle={toggleTaskCompletion} onDelete={deleteTask} />)}
            {filteredTasks('Someday').length === 0 && <p className="text-center text-muted-foreground pt-10">No tasks for someday.</p>}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
