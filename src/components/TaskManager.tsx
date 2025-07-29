'use client';

import * as React from 'react';
import { PlusCircle, MoreVertical, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { Task, Subtask } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getTasks, addTask as addTaskToSupabase, updateTask, deleteTask as deleteTaskFromSupabase } from '@/lib/supabaseClient';

const priorityColors = {
  Urgent: 'border-red-500/50 text-red-400',
  Medium: 'border-yellow-500/50 text-yellow-400',
  Low: 'border-green-500/50 text-green-400',
};

function TaskItem({ task, onToggle, onDelete, onSubtaskToggle }: { task: Task, onToggle: (id: string, isCompleted: boolean) => void, onDelete: (id: string) => void, onSubtaskToggle: (taskId: string, subtaskId: string, isCompleted: boolean) => void }) {
  const completedSubtasks = task.subtasks.filter(st => st.isCompleted).length;
  const progress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : (task.isCompleted ? 100 : 0);

  return (
    <div className="bg-transparent transition-all p-4 rounded-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Checkbox checked={task.isCompleted} onCheckedChange={(checked) => onToggle(task.id, !!checked)} className="size-5" />
          <div className={`text-base font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className={priorityColors[task.priority]}>{task.priority}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onToggle(task.id, !task.isCompleted)}>
                {task.isCompleted ? 'Mark as Not Done' : 'Mark as Done'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400" onClick={() => onDelete(task.id)}>
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p className="text-xs text-muted-foreground pt-1 pl-8">Due: {task.dueDate}</p>
      
      {task.subtasks.length > 0 && (
        <div className="pl-8 mt-4 space-y-3">
          <div className="space-y-2">
            {task.subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center gap-3">
                <Checkbox
                  id={`subtask-${subtask.id}`}
                  checked={subtask.isCompleted}
                  onCheckedChange={(checked) => onSubtaskToggle(task.id, subtask.id, !!checked)}
                  className="size-4"
                />
                <Label htmlFor={`subtask-${subtask.id}`} className={`text-sm ${subtask.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {subtask.title}
                </Label>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-2" />
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function TaskManager() {
  const { toast } = useToast();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [newTaskNotes, setNewTaskNotes] = React.useState('');
  const [newTaskPriority, setNewTaskPriority] = React.useState<Task['priority']>('Medium');
  const [newTaskStatus, setNewTaskStatus] = React.useState<Task['status']>('Today');
  const [subtasks, setSubtasks] = React.useState<Partial<Subtask>[]>([{ title: '' }]);
  const [newReminder, setNewReminder] = React.useState('');

  React.useEffect(() => {
    fetchTasks();
  }, []);
  
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const tasksFromSupabase = await getTasks();
      setTasks(tasksFromSupabase);
    } catch (error) {
      console.error("Failed to load tasks from Supabase", error);
      toast({ variant: 'destructive', title: 'Error fetching tasks.' });
    } finally {
      setIsLoading(false);
    }
  };


  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({ variant: 'destructive', title: 'This browser does not support desktop notification' });
      return false;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast({ variant: 'destructive', title: 'Notification permission denied!' });
      return false;
    }
    return true;
  };

  const scheduleNotification = (task: Task) => {
    if (!task.reminder || task.reminder <= 0) return;

    const reminderTime = new Date(new Date().getTime() + task.reminder * 60000);
    
    setTimeout(() => {
        new Notification('Mindful Me Reminder', {
            body: `It's time for your task: ${task.title}`,
            icon: '/logo.svg'
        });
    }, reminderTime.getTime() - new Date().getTime());

    toast({ title: "Reminder set!", description: `You will be notified for "${task.title}" in ${task.reminder} minutes.` });
  };
  
  const resetForm = () => {
    setNewTaskTitle('');
    setNewTaskNotes('');
    setNewTaskPriority('Medium');
    setNewTaskStatus('Today');
    setSubtasks([{ title: '' }]);
    setNewReminder('');
    setIsDialogOpen(false);
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    const reminderMinutes = parseInt(newReminder, 10);
    if (reminderMinutes > 0) {
        const permissionGranted = await requestNotificationPermission();
        if (!permissionGranted) return;
    }
    
    const finalSubtasks = subtasks
        .filter(st => st.title && st.title.trim() !== '')
        .map(st => ({
            id: crypto.randomUUID(),
            title: st.title!,
            isCompleted: false
        }));

    const newTaskData = {
      title: newTaskTitle,
      notes: newTaskNotes,
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      priority: newTaskPriority,
      status: newTaskStatus,
      isCompleted: false,
      subtasks: finalSubtasks,
      reminder: reminderMinutes > 0 ? reminderMinutes : undefined,
    };

    try {
        const newTask = await addTaskToSupabase(newTaskData);
        setTasks([newTask, ...tasks]);
        if (newTask.reminder) {
            scheduleNotification(newTask);
        }
        resetForm();
    } catch(error) {
        console.error("Failed to add task", error);
        toast({ variant: 'destructive', title: 'Failed to add task.' });
    }
  }
  
  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index].title = value;
    setSubtasks(newSubtasks);
  };

  const addSubtaskInput = () => {
    setSubtasks([...subtasks, { title: '' }]);
  };

  const removeSubtaskInput = (index: number) => {
    const newSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(newSubtasks);
  };

  const toggleTaskCompletion = async (id: string, isCompleted: boolean) => {
    try {
        await updateTask(id, { isCompleted });
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, isCompleted } : task
        ));
    } catch(error) {
        console.error("Failed to update task", error);
        toast({ variant: 'destructive', title: 'Failed to update task.' });
    }
  };

  const toggleSubtaskCompletion = async (taskId: string, subtaskId: string, isCompleted: boolean) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
    
    const updatedSubtasks = taskToUpdate.subtasks.map(st => 
        st.id === subtaskId ? { ...st, isCompleted } : st
    );
    const allSubtasksCompleted = updatedSubtasks.every(st => st.isCompleted);
    
    try {
        await updateTask(taskId, { subtasks: updatedSubtasks, isCompleted: allSubtasksCompleted });
        setTasks(tasks.map(t => t.id === taskId ? { ...t, subtasks: updatedSubtasks, isCompleted: allSubtasksCompleted } : t));
    } catch(error) {
        console.error("Failed to update subtask", error);
        toast({ variant: 'destructive', title: 'Failed to update subtask.' });
    }
  };
  
  const deleteTask = async (id: string) => {
      try {
        await deleteTaskFromSupabase(id);
        setTasks(tasks.filter(task => task.id !== id));
      } catch(error) {
        console.error("Failed to delete task", error);
        toast({ variant: 'destructive', title: 'Failed to delete task.' });
      }
  }

  const filteredTasks = (status: Task['status']) => tasks.filter(task => {
     if (status === 'Today') {
        const today = format(new Date(), 'yyyy-MM-dd');
        return !task.isCompleted && (task.status === 'Today' || task.dueDate === today);
     }
      if (status === 'Completed') {
         return task.isCompleted;
     }
     return !task.isCompleted && task.status === status;
  });
  
  if (isLoading) {
    return <div className="text-center text-muted-foreground pt-10">Loading tasks...</div>
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Task Manager</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 size-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create a new task</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="e.g. Call therapist" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={newTaskNotes} onChange={(e) => setNewTaskNotes(e.target.value)} placeholder="Add details..." className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                       <Label htmlFor="priority">Priority</Label>
                       <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as Task['priority'])}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={newTaskStatus} onValueChange={(v) => setNewTaskStatus(v as Task['status'])}>
                        <SelectTrigger className="mt-1">
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
                 <div>
                  <Label htmlFor="reminder">Reminder (in minutes)</Label>
                   <Input 
                    id="reminder"
                    type="number"
                    value={newReminder}
                    onChange={(e) => setNewReminder(e.target.value)}
                    placeholder="e.g. 15"
                    className="mt-1"
                   />
                </div>
              </div>
              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <Label>Subtasks</Label>
                  <div className="mt-1 space-y-2 max-h-48 overflow-y-auto pr-2">
                     {subtasks.map((subtask, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={subtask.title}
                          onChange={(e) => handleSubtaskChange(index, e.target.value)}
                          placeholder={`Subtask ${index + 1}`}
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeSubtaskInput(index)} disabled={subtasks.length === 1}>
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="link" size="sm" onClick={addSubtaskInput} className="mt-1 px-0">
                    <PlusCircle className="mr-2 size-4" /> Add Subtask
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost" onClick={resetForm}>Cancel</Button></DialogClose>
              <Button onClick={addTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="today" className="flex flex-1 flex-col mt-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="someday">Someday</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <div className="mt-4 flex-1 space-y-4">
          <TabsContent value="today" className="space-y-4 m-0">
            {filteredTasks('Today').map(task => <TaskItem key={task.id} task={task} onToggle={toggleTaskCompletion} onDelete={deleteTask} onSubtaskToggle={toggleSubtaskCompletion} />)}
            {filteredTasks('Today').length === 0 && <p className="text-center text-muted-foreground pt-10">No tasks for today. Great job!</p>}
          </TabsContent>
          <TabsContent value="upcoming" className="space-y-4 m-0">
            {filteredTasks('Upcoming').map(task => <TaskItem key={task.id} task={task} onToggle={toggleTaskCompletion} onDelete={deleteTask} onSubtaskToggle={toggleSubtaskCompletion} />)}
            {filteredTasks('Upcoming').length === 0 && <p className="text-center text-muted-foreground pt-10">No upcoming tasks.</p>}
          </TabsContent>
          <TabsContent value="someday" className="space-y-4 m-0">
            {filteredTasks('Someday').map(task => <TaskItem key={task.id} task={task} onToggle={toggleTaskCompletion} onDelete={deleteTask} onSubtaskToggle={toggleSubtaskCompletion} />)}
            {filteredTasks('Someday').length === 0 && <p className="text-center text-muted-foreground pt-10">No tasks for someday.</p>}
          </TabsContent>
          <TabsContent value="completed" className="space-y-4 m-0">
            {filteredTasks('Completed').map(task => <TaskItem key={task.id} task={task} onToggle={toggleTaskCompletion} onDelete={deleteTask} onSubtaskToggle={toggleSubtaskCompletion} />)}
            {filteredTasks('Completed').length === 0 && <p className="text-center text-muted-foreground pt-10">No tasks completed yet.</p>}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
