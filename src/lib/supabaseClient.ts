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
export const getTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Task[];
};

export const addTask = async (task: Omit<Task, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('tasks').insert([task]).select();
    if (error) throw error;
    return data[0] as Task;
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0] as Task;
};

export const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
};

// Habits
export const getHabits = async () => {
    const { data, error } = await supabase.from('habits').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Habit[];
};

export const addHabit = async (habit: Omit<Habit, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('habits').insert([habit]).select();
    if (error) throw error;
    return data[0] as Habit;
};

export const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const { data, error } = await supabase.from('habits').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0] as Habit;
};

export const deleteHabit = async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) throw error;
};

// Journal Entries
export const getJournalEntries = async () => {
    const { data, error } = await supabase.from('journal_entries').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data as JournalEntry[];
};

export const addJournalEntry = async (entry: Omit<JournalEntry, 'id'>) => {
    const { data, error } = await supabase.from('journal_entries').insert([entry]).select();
    if (error) throw error;
    return data[0] as JournalEntry;
};
