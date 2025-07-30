'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Task, Subtask, Habit, JournalEntry } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays, format, subDays } from 'date-fns';

interface AppContextType {
  tasks: Task[];
  habits: Habit[];
  journalEntries: JournalEntry[];
  addTask: (task: Omit<Task, 'id' | 'isCompleted' | 'created_at'>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string, isCompleted: boolean) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string, isCompleted: boolean) => void;
  addHabit: (name: string) => void;
  toggleHabit: (habitId: string, date: string) => void;
  deleteHabit: (habitId: string) => void;
  addJournalEntry: (content: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) setTasks(JSON.parse(storedTasks));

      const storedHabits = localStorage.getItem('habits');
      if (storedHabits) setHabits(JSON.parse(storedHabits));

      const storedJournal = localStorage.getItem('journal');
      if (storedJournal) setJournalEntries(JSON.parse(storedJournal));
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
    }
    setIsMounted(true);
  }, []);
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('habits', JSON.stringify(habits));
      localStorage.setItem('journal', JSON.stringify(journalEntries));
    }
  }, [tasks, habits, journalEntries, isMounted]);
  
  const addTask = (task: Omit<Task, 'id' | 'isCompleted' | 'created_at'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      isCompleted: false,
      created_at: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };
  
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({ title: "Task Deleted" });
  };
  
  const toggleTaskCompletion = (id: string, isCompleted: boolean) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, isCompleted, subtasks: task.subtasks.map(st => ({ ...st, isCompleted })) } : task
    ));
  };
  
  const toggleSubtaskCompletion = (taskId: string, subtaskId: string, isCompleted: boolean) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(st => 
            st.id === subtaskId ? { ...st, isCompleted } : st
        );
        const allSubtasksCompleted = updatedSubtasks.every(st => st.isCompleted);
        return { ...t, subtasks: updatedSubtasks, isCompleted: allSubtasksCompleted };
      }
      return t;
    }));
  };
  
  const addHabit = (name: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      streak: 0,
      completions: {},
      created_at: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
    toast({ title: 'Habit Added', description: `You are now tracking "${name}".`})
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
    toast({ title: "Habit Deleted" });
  }

  const calculateStreak = (completions: Record<string, boolean>): number => {
    let streak = 0;
    const today = new Date();
    let currentDate = today;

    // Check today
    if (completions[format(currentDate, 'yyyy-MM-dd')]) {
        streak++;
        currentDate = subDays(currentDate, 1);
    } else {
        // if today is not completed, check if yesterday was. If so, streak is 0.
        // If not, maybe they just haven't done it today.
        const yesterday = subDays(today, 1);
        if(completions[format(yesterday, 'yyyy-MM-dd')]) {
            // They had a streak but missed today
        } else {
           // They didn't have a streak anyway
           currentDate = yesterday;
        }
    }

    while (completions[format(currentDate, 'yyyy-MM-dd')]) {
        streak++;
        currentDate = subDays(currentDate, 1);
    }
    
    // Final check for today's completion if streak was broken
    if (!completions[format(today, 'yyyy-MM-dd')]) {
        const yesterday = format(subDays(today, 1), 'yyyy-MM-dd');
        if (completions[yesterday]) {
            // streak was active until today
        } else {
            // no active streak
        }
    }
    
    // A simpler version:
    let currentStreak = 0;
    let tempDate = new Date();
    
    // If not completed today, start checking from yesterday
    if (!completions[format(tempDate, 'yyyy-MM-dd')]) {
      tempDate = subDays(tempDate, 1);
    }

    while (completions[format(tempDate, 'yyyy-MM-dd')]) {
      currentStreak++;
      tempDate = subDays(tempDate, 1);
    }

    return currentStreak;
  }
  
  const toggleHabit = (habitId: string, date: string) => {
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        const newCompletions = { ...h.completions };
        if (newCompletions[date]) {
          delete newCompletions[date];
        } else {
          newCompletions[date] = true;
        }
        const newStreak = calculateStreak(newCompletions);
        return { ...h, completions: newCompletions, streak: newStreak };
      }
      return h;
    }));
  };
  
  const addJournalEntry = (content: string) => {
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toISOString(),
    };
    setJournalEntries(prev => [newEntry, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const value = {
    tasks,
    habits,
    journalEntries,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    addHabit,
    toggleHabit,
    deleteHabit,
    addJournalEntry,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
