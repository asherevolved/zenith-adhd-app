-- Create the 'tasks' table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    "dueDate" DATE NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('Urgent', 'Medium', 'Low')),
    status TEXT NOT NULL CHECK (status IN ('Today', 'Upcoming', 'Someday')),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    subtasks JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Enable Row Level Security for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own tasks
CREATE POLICY "Users can manage their own tasks"
ON public.tasks
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- Create the 'habits' table
CREATE TABLE public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    name TEXT NOT NULL,
    streak INTEGER NOT NULL DEFAULT 0,
    completions JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Enable Row Level Security for habits
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own habits
CREATE POLICY "Users can manage their own habits"
ON public.habits
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- Create the 'journal_entries' table
CREATE TABLE public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    content TEXT NOT NULL
);

-- Enable Row Level Security for journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own journal entries
CREATE POLICY "Users can manage their own journal entries"
ON public.journal_entries
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
