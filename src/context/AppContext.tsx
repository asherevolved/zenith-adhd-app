'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Task, Habit, JournalEntry, UserSettings, Profile, ChatMessage } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { therapyChat, type TherapyChatInput } from '@/ai/flows/therapy-chat';

interface AppContextType {
  // Auth state
  isAuthenticated: boolean | undefined;
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
  therapyMessages: ChatMessage[];
  isLoadingSettings: boolean;
  isLoadingTherapyHistory: boolean;
  addTask: (task: Omit<Task, 'id' | 'isCompleted' | 'created_at' | 'user_id' | 'is_completed'>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string, isCompleted: boolean) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string, isCompleted: boolean) => void;
  addHabit: (name: string) => void;
  toggleHabit: (habitId: string, date: string) => void;
  deleteHabit: (habitId: string) => void;
  addJournalEntry: (content: string) => void;
  deleteJournalEntry: (id: string) => void;
  updateSettings: (newSettings: UserSettings) => Promise<void>;
  sendTherapyMessage: (message: string) => Promise<void>;
  subscribeToPushNotifications: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper function to convert a VAPID public key to a Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [therapyMessages, setTherapyMessages] = useState<ChatMessage[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingTherapyHistory, setIsLoadingTherapyHistory] = useState(true);
  
  const subscribeToPushNotifications = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !user) {
      console.warn('Push notifications are not supported in this browser or user is not logged in.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Already subscribed, maybe just ensure it's on our server
        await supabase.from('push_subscriptions').upsert({
          user_id: user.id,
          subscription_payload: subscription.toJSON(),
        }, { onConflict: 'endpoint' });
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VAPID public key is not defined.');
        return;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Save subscription to the database
      const { error } = await supabase.from('push_subscriptions').insert({
        user_id: user.id,
        subscription_payload: subscription.toJSON(),
      });
      if (error) {
        console.error('Error saving push subscription:', error);
        // Don't leave user subscribed if we can't save it
        await subscription.unsubscribe();
      } else {
        console.log('User subscribed to push notifications.');
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          // Check notification permission and subscribe if granted and user is logged in
          if (Notification.permission === 'granted' && user) {
            subscribeToPushNotifications();
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, [subscribeToPushNotifications, user]);


  const loadUserData = useCallback(async (userId: string) => {
    setIsLoadingSettings(true);
    setIsLoadingTherapyHistory(true);

    try {
      const [
        tasksRes,
        habitsRes,
        journalRes,
        settingsRes,
        profileRes,
        therapyRes
      ] = await Promise.all([
        supabase.from('tasks').select('*, is_completed').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('journal_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('user_settings').select('*').eq('id', userId).single(),
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('therapy_chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      ]);
      
      if (tasksRes.error) throw new Error(`Tasks: ${tasksRes.error.message}`);
      setTasks((tasksRes.data || []).map(t => ({...t, isCompleted: t.is_completed})));
      
      if (habitsRes.error) throw new Error(`Habits: ${habitsRes.error.message}`);
      setHabits(habitsRes.data || []);
      
      if (journalRes.error) throw new Error(`Journal: ${journalRes.error.message}`);
      setJournalEntries(journalRes.data || []);
      
      if (settingsRes.error && settingsRes.error.code !== 'PGRST116') {
        // Ignore "single row not found" for new users
      } else {
        setSettings(settingsRes.data || null);
      }
      
      if (profileRes.error && profileRes.error.code !== 'PGRST116') {
         // Ignore "single row not found" for new users
      } else {
        setProfile(profileRes.data || null);
      }

      if (therapyRes.error) throw new Error(`Therapy: ${therapyRes.error.message}`);
      setTherapyMessages(therapyRes.data || []);

    } catch (error: any) {
        console.error("Failed to load user data from Supabase", error.message);
        toast({ title: 'Error Loading Data', description: 'Could not load your data. Some features might be unavailable.', variant: 'destructive' });
    } finally {
      setIsLoadingSettings(false);
      setIsLoadingTherapyHistory(false);
    }
  }, [toast]);


  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
        if (currentUser) {
          await loadUserData(currentUser.id);
          // When user logs in, ensure we have push subscription if permission is granted
          if (Notification.permission === 'granted') {
             subscribeToPushNotifications();
          }
        } else {
          setTasks([]);
          setHabits([]);
          setJournalEntries([]);
          setSettings(null);
          setProfile(null);
          setTherapyMessages([]);
          setIsLoadingSettings(false);
          setIsLoadingTherapyHistory(false);
        }
      }
    );

    // Initial check
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
        if (currentUser) {
          await loadUserData(currentUser.id);
        } else {
           setIsAuthenticated(false);
           setIsLoadingSettings(false);
           setIsLoadingTherapyHistory(false);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
        setIsAuthenticated(false);
        setIsLoadingSettings(false);
        setIsLoadingTherapyHistory(false);
      }
    };
    checkUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadUserData, subscribeToPushNotifications]);


  const login = async (email: string, pass: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      console.error('Login error:', error.message);
      return false;
    }
    return true;
  };

  const signup = async (email: string, pass: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password: pass,
      options: {
        data: {
          email_confirm: false,
        }
      }
    });
     if (error) {
      console.error('Signup error:', error.message);
      return false;
    }
    // The trigger will create the profile and settings row
    return !!data.user;
  };

  const logout = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        // Remove from DB
        await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
        // Unsubscribe from push service
        await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications.');
      }
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };
  
  const addTask = async (task: Omit<Task, 'id' | 'isCompleted' | 'created_at' | 'user_id' | 'is_completed'>) => {
    if (!user) return;
    const newTask = {
      ...task,
      user_id: user.id,
      is_completed: false,
    };
    const { data, error } = await supabase.from('tasks').insert(newTask).select('*, is_completed').single();
    if (error) {
      toast({ title: 'Error adding task', description: error.message, variant: 'destructive' });
    } else if (data) {
      setTasks(prev => [{ ...data, isCompleted: data.is_completed }, ...prev]);
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
        .update({ is_completed: isCompleted, subtasks: newSubtasks })
        .eq('id', id)
        .select('*, is_completed')
        .single();
    
    if (error) {
        toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
    } else if (data) {
        setTasks(tasks.map(t => t.id === id ? { ...data, isCompleted: data.is_completed } : t));
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
        .update({ subtasks: updatedSubtasks, is_completed: allSubtasksCompleted })
        .eq('id', taskId)
        .select('*, is_completed')
        .single();

    if (error) {
        toast({ title: 'Error updating subtask', description: error.message, variant: 'destructive' });
    } else if(data) {
        setTasks(tasks.map(t => t.id === taskId ? { ...data, isCompleted: data.is_completed } : t));
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
        setHabits(prev => [data, ...prev]);
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
    
    if (!completions[new Date().toISOString().slice(0,10)]) {
      tempDate = new Date(tempDate.setDate(tempDate.getDate() - 1));
    }

    while (completions[tempDate.toISOString().slice(0,10)]) {
      currentStreak++;
      tempDate = new Date(tempDate.setDate(tempDate.getDate() - 1));
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
    const { data, error } = await supabase.from('journal_entries').insert({ content, user_id: user.id }).select().single();
     if(error) {
        toast({ title: 'Error adding journal entry', description: error.message, variant: 'destructive' });
     } else if (data) {
        setJournalEntries(prev => [data, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
     }
  };

  const deleteJournalEntry = async (id: string) => {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting journal entry', description: error.message, variant: 'destructive' });
    } else {
      setJournalEntries(journalEntries.filter(entry => entry.id !== id));
      toast({ title: "Journal Entry Deleted" });
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

  const sendTherapyMessage = async (messageContent: string) => {
    if (!user) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: user.id,
      role: 'user',
      content: messageContent,
      created_at: new Date().toISOString(),
    };

    setTherapyMessages(prev => [...prev, userMessage]);

    try {
      // Don't wait for this to complete to improve latency
      supabase.from('therapy_chat_messages').insert({
        user_id: user.id,
        role: 'user',
        content: messageContent,
      }).then(({ error }) => {
        if(error) console.error("Error saving user message", error);
      });

      const chatHistoryForAi = [...therapyMessages, userMessage].slice(-10);

      const chatInput: TherapyChatInput = {
        message: messageContent,
        chatHistory: chatHistoryForAi.map(m => ({ role: m.role, content: m.content }))
      };

      const result = await therapyChat(chatInput);
      const assistantMessageContent = result.response;

      const { data: assistantData, error: assistantError } = await supabase.from('therapy_chat_messages').insert({
        user_id: user.id,
        role: 'assistant',
        content: assistantMessageContent,
      }).select().single();

      if (assistantError) throw assistantError;
      
      setTherapyMessages(prev => [...prev, assistantData]);
    } catch (error) {
      console.error("Error sending therapy message:", error);
      setTherapyMessages(prev => prev.filter(m => m.id !== userMessage.id)); // remove optimistic message on failure
      toast({ title: "An error occurred", description: "Could not send message. Please try again.", variant: 'destructive' });
    }
  }

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
    therapyMessages,
    isLoadingSettings,
    isLoadingTherapyHistory,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    addHabit,
    toggleHabit,
    deleteHabit,
    addJournalEntry,
    deleteJournalEntry,
    updateSettings,
    sendTherapyMessage,
    subscribeToPushNotifications,
  };
  
  if (isAuthenticated === undefined) {
    // This prevents a flash of un-styled content or a blank screen on initial load
    return null;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
