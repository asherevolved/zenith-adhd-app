
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Task, Habit, JournalEntry, UserSettings, Profile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface AppContextType {
  // Auth state
  isAuthenticated: boolean;
  user: User | null;
  profile: Profile | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  // App state
  tasks: Task[];
  habits: Habit[];
  journalEntries: JournalEntry[];
  settings: UserSettings | null;
  isLoadingSettings: boolean;
  addTask: (task: Omit<Task, 'id' | 'isCompleted' | 'created_at' | 'user_id'>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string, isCompleted: boolean) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string, isCompleted: boolean) => void;
  addHabit: (name: string) => void;
  toggleHabit: (habitId: string, date: string) => void;
  deleteHabit: (habitId: string) => void;
  addJournalEntry: (content: string) => void;
  updateSettings: (newSettings: UserSettings) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
        if (currentUser) {
          await loadUserData(currentUser.id);
        } else {
          // Clear data on logout
          setTasks([]);
          setHabits([]);
          setJournalEntries([]);
          setSettings(null);
          setProfile(null);
        }
      }
    );

    // Initial check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await loadUserData(session.user.id);
      }
      setIsMounted(true);
    };
    checkUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string) => {
    setIsLoadingSettings(true);
    try {
      const [tasksData, habitsData, journalData, settingsData, profileData] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('journal_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('user_settings').select('*').eq('id', userId).single(),
        supabase.from('profiles').select('*').eq('id', userId).single(),
      ]);

      if (tasksData.error) throw tasksData.error;
      if (habitsData.error) throw habitsData.error;
      if (journalData.error) throw journalData.error;
      if (settingsData.error) throw settingsData.error;
      if (profileData.error) throw profileData.error;

      setTasks(tasksData.data || []);
      setHabits(habitsData.data || []);
      setJournalEntries(journalData.data || []);
      setSettings(settingsData.data || null);
      setProfile(profileData.data || null);

    } catch (error: any) {
      console.error("Failed to load user data from Supabase", error);
      toast({ title: 'Error', description: 'Could not load your data.', variant: 'destructive' });
    } finally {
      setIsLoadingSettings(false);
    }
  }

  const login = async (email: string, pass: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      console.error('Login error:', error.message);
      return false;
    }
    return true;
  };

  const signup = async (email: string, pass: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({ email, password: pass });
     if (error) {
      console.error('Signup error:', error.message);
      return false;
    }
    // The trigger will create the profile and settings row
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };
  
  const addTask = async (task: Omit<Task, 'id' | 'isCompleted' | 'created_at' | 'user_id'>) => {
    if (!user) return;
    const newTask: Omit<Task, 'id' | 'created_at'> = {
      ...task,
      user_id: user.id,
      isCompleted: false,
    };
    const { data, error } = await supabase.from('tasks').insert(newTask).select().single();
    if (error) {
      toast({ title: 'Error adding task', description: error.message, variant: 'destructive' });
    } else if (data) {
      setTasks(prev => [data, ...prev]);
      toast({ title: "Task Added", description: "Your new task has been added."})
    }
  };
  
  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
        toast({ title: 'Error deleting task', description: error.message, variant: 'destructive' });
    } else {
        setTasks(tasks.filter(task => task.id !== id));
        toast({ title: "Task Deleted" });
    }
  };
  
  const toggleTaskCompletion = async (id: string, isCompleted: boolean) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newSubtasks = task.subtasks.map(st => ({...st, isCompleted }));

    const { data, error } = await supabase
        .from('tasks')
        .update({ isCompleted, subtasks: newSubtasks })
        .eq('id', id)
        .select()
        .single();
    
    if (error) {
        toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
    } else if (data) {
        setTasks(tasks.map(t => t.id === id ? data : t));
    }
  };
  
  const toggleSubtaskCompletion = async (taskId: string, subtaskId: string, isCompleted: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map(st => 
        st.id === subtaskId ? { ...st, isCompleted } : st
    );
    const allSubtasksCompleted = updatedSubtasks.every(st => st.isCompleted);

    const { data, error } = await supabase
        .from('tasks')
        .update({ subtasks: updatedSubtasks, isCompleted: allSubtasksCompleted })
        .eq('id', taskId)
        .select()
        .single();

    if (error) {
        toast({ title: 'Error updating subtask', description: error.message, variant: 'destructive' });
    } else if(data) {
        setTasks(tasks.map(t => t.id === taskId ? data : t));
    }
  };
  
  const addHabit = async (name: string) => {
    if (!user) return;
    const newHabit: Omit<Habit, 'id' | 'created_at'> = {
      name,
      user_id: user.id,
      streak: 0,
      completions: {},
    };
    const { data, error } = await supabase.from('habits').insert(newHabit).select().single();

    if (error) {
        toast({ title: 'Error adding habit', description: error.message, variant: 'destructive' });
    } else if (data) {
        setHabits(prev => [...prev, data]);
        toast({ title: 'Habit Added', description: `You are now tracking "${name}".`})
    }
  };

  const deleteHabit = async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) {
        toast({ title: 'Error deleting habit', description: error.message, variant: 'destructive' });
    } else {
        setHabits(habits.filter(habit => habit.id !== id));
        toast({ title: "Habit Deleted" });
    }
  }

  const calculateStreak = (completions: Record<string, boolean>): number => {
    let currentStreak = 0;
    let tempDate = new Date();
    
    if (!completions[format(tempDate, 'yyyy-MM-dd')]) {
      tempDate = subDays(tempDate, 1);
    }

    while (completions[format(tempDate, 'yyyy-MM-dd')]) {
      currentStreak++;
      tempDate = subDays(tempDate, 1);
    }

    return currentStreak;
  }
  
  const toggleHabit = async (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const newCompletions = { ...habit.completions };
    if (newCompletions[date]) {
      delete newCompletions[date];
    } else {
      newCompletions[date] = true;
    }
    const newStreak = calculateStreak(newCompletions);

    const { data, error } = await supabase
        .from('habits')
        .update({ completions: newCompletions, streak: newStreak })
        .eq('id', habitId)
        .select()
        .single();
    
    if (error) {
        toast({ title: 'Error updating habit', description: error.message, variant: 'destructive' });
    } else if (data) {
        setHabits(habits.map(h => h.id === habitId ? data : h));
    }
  };
  
  const addJournalEntry = async (content: string) => {
    if (!user) return;
    const newEntry: Omit<JournalEntry, 'id' | 'created_at' | 'user_id'> = {
      content,
    };
     const { data, error } = await supabase.from('journal_entries').insert({ ...newEntry, user_id: user.id }).select().single();
     if(error) {
        toast({ title: 'Error adding journal entry', description: error.message, variant: 'destructive' });
     } else if (data) {
        setJournalEntries(prev => [data, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
     }
  };

  const updateSettings = async (newSettings: UserSettings) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        default_timer_mode: newSettings.default_timer_mode,
        gemini_voice: newSettings.gemini_voice,
        journal_retention: newSettings.journal_retention,
        enable_motion: newSettings.enable_motion,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    } else if (data) {
      setSettings(data);
    }
  };

  const value = {
    isAuthenticated,
    user,
    profile,
    login,
    signup,
    logout,
    tasks,
    habits,
    journalEntries,
    settings,
    isLoadingSettings,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    addHabit,
    toggleHabit,
    deleteHabit,
    addJournalEntry,
    updateSettings,
  };
  
  // Render children only when mounted to avoid hydration errors with auth state
  if (!isMounted) return null;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
