import { createClient } from '@supabase/supabase-js'
import type { Task, Habit, JournalEntry } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tasks
export const getTasks = async (userId: string): Promise<Task[]> => {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const addTask = async (task: Omit<Task, 'id' | 'created_at'> & { user_id: string }): Promise<Task> => {
    const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteTask = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

// Habits
export const getHabits = async (userId: string): Promise<Habit[]> => {
    const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const addHabit = async (habit: Omit<Habit, 'id' | 'created_at'> & { user_id: string }): Promise<Habit> => {
    const { data, error } = await supabase
        .from('habits')
        .insert(habit)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateHabit = async (id: string, updates: Partial<Habit>): Promise<Habit> => {
    const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteHabit = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

// Journal Entries
export const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
    const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const addJournalEntry = async (entry: Omit<JournalEntry, 'id'> & { user_id: string }): Promise<JournalEntry> => {
    const { data, error } = await supabase
        .from('journal_entries')
        .insert(entry)
        .select()
        .single();
    if (error) throw error;
    return data;
};
