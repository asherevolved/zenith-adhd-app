export type Subtask = {
  id: string;
  title: string;
  isCompleted: boolean;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  notes?: string;
  dueDate: string;
  priority: 'Urgent' | 'Medium' | 'Low';
  status: 'Today' | 'Upcoming' | 'Someday';
  isCompleted: boolean;
  subtasks: Subtask[];
  reminder?: number; // minutes
  created_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  streak: number;
  completions: Record<string, boolean>; // e.g., { '2024-10-27': true }
  created_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export type Profile = {
  id: string;
  updated_at?: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
}

export type ChatMessage = {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export type UserSettings = {
  id: string;
  updated_at?: string;
  default_timer_mode: '25/5' | '50/10' | 'Custom';
  gemini_voice: 'Calm' | 'Friendly' | 'Mentor';
  journal_retention: '7' | '30' | 'Forever';
  enable_motion: boolean;
};
