
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, MoreVertical, Trash2, X, Bell } from 'lucide-react';
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
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

const priorityColors = {
  Urgent: 'border-red-500/50 text-red-400',
  Medium: 'border-yellow-500/50 text-yellow-400',
  Low: 'border-green-500/50 text-green-400',
};

const taskVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
    },
  }),
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: 0.2,
    }
  }
};


function TaskItem({ task, index }: { task: Task, index: number }) {
  const { toggleTaskCompletion, deleteTask, toggleSubtaskCompletion } = useAppContext();
  const completedSubtasks = task.subtasks.filter(st => st.isCompleted).length;
  const progress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : (task.isCompleted ? 100 : 0);

  return (
    <motion.div 
      className="bg-transparent transition-all p-4 rounded-lg border-b border-border/20"
      variants={taskVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 pt-1">
          <Checkbox 
            id={`task-${task.id}`} 
            checked={task.isCompleted} 
            onCheckedChange={(checked) => toggleTaskCompletion(task.id, !!checked)} 
            className="size-5" 
          />
          <div className="grid gap-0.5">
            <label 
              htmlFor={`task-${task.id}`} 
              className={`text-base font-medium cursor-pointer ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}
            >
              {task.title}
            </label>
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Due: {format(new Date(task.due_date), 'PPP')}</span>
                {task.reminder && !task.isCompleted && (
                    <span className="flex items-center gap-1"><Bell className="size-3" /> {task.reminder} min before</span>
                )}
            </div>
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
              <DropdownMenuItem onClick={() => toggleTaskCompletion(task.id, !task.isCompleted)}>
                {task.isCompleted ? 'Mark as Not Done' : 'Mark as Done'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400" onClick={() => deleteTask(task.id)}>
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="pl-8 mt-4 space-y-3">
          <div className="space-y-2">
            {task.subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center gap-3">
                <Checkbox
                  id={`subtask-${subtask.id}`}
                  checked={subtask.isCompleted}
                  onCheckedChange={(checked) => toggleSubtaskCompletion(task.id, subtask.id, !!checked)}
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
    </motion.div>
  );
}

export function TaskManager() {
  const { tasks, addTask } = useAppContext();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [notificationPermission, setNotificationPermission] = React.useState('default');
  
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [newTaskNotes, setNewTaskNotes] = React.useState('');
  const [newTaskPriority, setNewTaskPriority] = React.useState<Task['priority']>('Medium');
  const [newTaskStatus, setNewTaskStatus] = React.useState<Task['status']>('Today');
  const [subtasks, setSubtasks] = React.useState<Partial<Subtask>[]>([{ title: '' }]);
  const [newReminder, setNewReminder] = React.useState('');

  React.useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === 'granted') {
          toast({ title: 'Notifications enabled!', description: 'You will now receive task reminders.' });
        } else {
          toast({ title: 'Notifications blocked', description: 'To receive reminders, enable notifications in your browser settings.', variant: 'destructive' });
        }
      });
    }
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

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    const finalSubtasks = subtasks
        .filter(st => st.title && st.title.trim() !== '')
        .map(st => ({
            id: crypto.randomUUID(),
            title: st.title!,
            isCompleted: false
        }));

    const reminderValue = newReminder ? parseInt(newReminder, 10) : undefined;
    if (reminderValue && notificationPermission !== 'granted') {
       toast({ title: 'Enable Notifications', description: 'Please allow notifications to set a reminder.', variant: 'destructive' });
       return;
    }

    const newTask: Omit<Task, 'id' | 'isCompleted' | 'created_at' | 'user_id' | 'is_completed'> = {
      title: newTaskTitle,
      notes: newTaskNotes,
      due_date: format(new Date(), 'yyyy-MM-dd'),
      priority: newTaskPriority,
      status: newTaskStatus,
      subtasks: finalSubtasks,
      reminder: reminderValue,
    };

    addTask(newTask);
    resetForm();
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

  const filteredTasks = (status: Task['status']) => tasks.filter(task => {
     if (status === 'Today') {
        const today = format(new Date(), 'yyyy-MM-dd');
        return !task.isCompleted && (task.status === 'Today' || task.due_date === today);
     }
      if (status === 'Completed') {
         return task.isCompleted;
     }
     return !task.isCompleted && task.status === status;
  }).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="flex h-full flex-col">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label htmlFor="reminder">Reminder (minutes before due)</Label>
                   <Input 
                    id="reminder"
                    type="number"
                    value={newReminder}
                    onChange={(e) => setNewReminder(e.target.value)}
                    placeholder="e.g. 15"
                    className="mt-1"
                    disabled={notificationPermission === 'denied'}
                   />
                   {notificationPermission === 'denied' && (
                     <p className="text-xs text-red-400 mt-1">Notifications are blocked by your browser.</p>
                   )}
                     {notificationPermission === 'default' && (
                        <Button variant="link" size="sm" className="px-0" onClick={requestNotificationPermission}>Enable Notifications</Button>
                    )}
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
              <Button onClick={handleAddTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <Tabs defaultValue="today" className="flex flex-1 flex-col mt-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="someday">Someday</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
        <div className="mt-4 flex-1 space-y-2">
            <TabsContent value="today" className="space-y-0 m-0">
                <AnimatePresence>
                  {filteredTasks('Today').map((task, i) => <TaskItem key={task.id} task={task} index={i} />)}
                </AnimatePresence>
              {filteredTasks('Today').length === 0 && <p className="text-center text-muted-foreground pt-10">No tasks for today. Great job!</p>}
            </TabsContent>
            <TabsContent value="upcoming" className="space-y-0 m-0">
                <AnimatePresence>
                  {filteredTasks('Upcoming').map((task, i) => <TaskItem key={task.id} task={task} index={i} />)}
                </AnimatePresence>
              {filteredTasks('Upcoming').length === 0 && <p className="text-center text-muted-foreground pt-10">No upcoming tasks.</p>}
            </TabsContent>
            <TabsContent value="someday" className="space-y-0 m-0">
                <AnimatePresence>
                  {filteredTasks('Someday').map((task, i) => <TaskItem key={task.id} task={task} index={i} />)}
                </AnimatePresence>
              {filteredTasks('Someday').length === 0 && <p className="text-center text-muted-foreground pt-10">No tasks for someday.</p>}
            </TabsContent>
            <TabsContent value="completed" className="space-y-0 m-0">
                <AnimatePresence>
                  {filteredTasks('Completed').map((task, i) => <TaskItem key={task.id} task={task} index={i} />)}
                </AnimatePresence>
              {filteredTasks('Completed').length === 0 && <p className="text-center text-muted-foreground pt-10">No tasks completed yet.</p>}
            </TabsContent>
        </div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
