
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Task, Subtask, Habit, JournalEntry } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';

// Mock user type
type User = {
  email: string;
};

interface AppContextType {
  // Auth state
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => boolean;
  signup: (email: string, pass: string) => boolean;
  logout: () => void;
  // App state
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

// In a real app, this would be in a database
const MOCK_USERS = 'mock_users';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Load state from localStorage on mount
  useEffect(() => {
    try {
      // Auth state
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        loadUserData(parsedUser.email);
      }
    } catch (error) {
      console.error("Failed to parse auth state from localStorage", error);
    }
    setIsMounted(true);
  }, []);
  
  const getStorageKey = (key: string, email?: string) => {
    const userEmail = email || user?.email;
    if (!userEmail) return null;
    return `${userEmail}_${key}`;
  }

  const loadUserData = (email: string) => {
     try {
      const tasksKey = getStorageKey('tasks', email);
      const habitsKey = getStorageKey('habits', email);
      const journalKey = getStorageKey('journal', email);

      if (tasksKey) {
        const storedTasks = localStorage.getItem(tasksKey);
        if (storedTasks) setTasks(JSON.parse(storedTasks));
        else setTasks([]);
      }
      if (habitsKey) {
        const storedHabits = localStorage.getItem(habitsKey);
        if (storedHabits) setHabits(JSON.parse(storedHabits));
        else setHabits([]);
      }
      if (journalKey) {
        const storedJournal = localStorage.getItem(journalKey);
        if (storedJournal) setJournalEntries(JSON.parse(storedJournal));
        else setJournalEntries([]);
      }
    } catch (error) {
        console.error("Failed to load user data from localStorage", error);
        setTasks([]);
        setHabits([]);
        setJournalEntries([]);
    }
  }

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isMounted && isAuthenticated && user) {
      const tasksKey = getStorageKey('tasks');
      const habitsKey = getStorageKey('habits');
      const journalKey = getStorageKey('journal');

      if (tasksKey) localStorage.setItem(tasksKey, JSON.stringify(tasks));
      if (habitsKey) localStorage.setItem(habitsKey, JSON.stringify(habits));
      if (journalKey) localStorage.setItem(journalKey, JSON.stringify(journalEntries));
    }
  }, [tasks, habits, journalEntries, user, isAuthenticated, isMounted]);

  const login = (email: string, pass: string): boolean => {
    const users = JSON.parse(localStorage.getItem(MOCK_USERS) || '{}');
    if (users[email] && users[email] === pass) {
      const loggedInUser = { email };
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      setIsAuthenticated(true);
      loadUserData(email);
      return true;
    }
    return false;
  };

  const signup = (email: string, pass: string): boolean => {
    const users = JSON.parse(localStorage.getItem(MOCK_USERS) || '{}');
    if (users[email]) {
      return false; // User already exists
    }
    users[email] = pass;
    localStorage.setItem(MOCK_USERS, JSON.stringify(users));
    
    // Automatically log in after signup
    const loggedInUser = { email };
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setIsAuthenticated(true);
    loadUserData(email);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setIsAuthenticated(false);
    setTasks([]);
    setHabits([]);
    setJournalEntries([]);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };
  
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
    isAuthenticated,
    user,
    login,
    signup,
    logout,
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
