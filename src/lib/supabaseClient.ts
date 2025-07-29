import { createClient } from '@supabase/supabase-js'
import type { Task, Habit, JournalEntry } from '@/types';

// Using hardcoded values as a workaround for environment variable loading issues.
const supabaseUrl = 'https://gxjaanbqbfwwrcweugsz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4amFhbmJxYmZ3d3Jjd2V1Z3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTc2NDYsImV4cCI6MjA2OTM5MzY0Nn0.bTUAPXOCstIuxPxUcH92N6QRDwH8wf1RuLFefudeyUk'

if (!supabaseUrl || !supabaseAnonKey) {
    // This check is kept in case the hardcoded values are removed later.
    throw new Error('Supabase URL and anon key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define table-specific CRUD functions here to keep components clean

// Tasks
export const getTasks = async (): Promise<Task[]> => {
    console.log("Fetching mock tasks");
    return Promise.resolve([]);
};

export const addTask = async (task: Omit<Task, 'id' | 'created_at'>): Promise<Task> => {
     const newTask = { ...task, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    console.log("Adding mock task", newTask);
    return Promise.resolve(newTask);
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    console.log("Updating mock task", id, updates);
    return Promise.resolve({ id, title: 'Updated Task', notes: '', dueDate: '', priority: 'Medium', status: 'Today', isCompleted: false, subtasks: [], ...updates });
};

export const deleteTask = async (id: string): Promise<void> => {
    console.log("Deleting mock task", id);
    return Promise.resolve();
};

// Habits
export const getHabits = async (): Promise<Habit[]> => {
    console.log("Fetching mock habits");
    return Promise.resolve([]);
};

export const addHabit = async (habit: Omit<Habit, 'id' | 'created_at'>): Promise<Habit> => {
    const newHabit = { ...habit, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    console.log("Adding mock habit", newHabit);
    return Promise.resolve(newHabit);
};

export const updateHabit = async (id: string, updates: Partial<Habit>): Promise<Habit> => {
    console.log("Updating mock habit", id, updates);
    return Promise.resolve({ id, name: 'Updated Habit', streak: 0, completions: {}, ...updates });
};

export const deleteHabit = async (id: string): Promise<void> => {
    console.log("Deleting mock habit", id);
    return Promise.resolve();
};

// Journal Entries
export const getJournalEntries = async (): Promise<JournalEntry[]> => {
    console.log("Fetching mock journal entries");
    return Promise.resolve([]);
};

export const addJournalEntry = async (entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    console.log("Adding mock journal entry", newEntry);
    return Promise.resolve(newEntry as JournalEntry);
};
