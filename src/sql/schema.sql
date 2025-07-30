-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    due_date DATE NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('Urgent', 'Medium', 'Low')),
    status TEXT NOT NULL CHECK (status IN ('Today', 'Upcoming', 'Someday')),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    reminder INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own tasks" ON tasks FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create habits table
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    streak INT NOT NULL DEFAULT 0,
    completions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own habits" ON habits FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create journal_entries table
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own journal entries" ON journal_entries FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create profiles table to store public user data
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,

  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to create a public profile for each new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create therapy_chat_messages table
CREATE TABLE therapy_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE therapy_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own chat messages" ON therapy_chat_messages FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    
-- Create user_settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ,
    default_timer_mode TEXT DEFAULT '25/5' CHECK (default_timer_mode IN ('25/5', '50/10', 'Custom')),
    gemini_voice TEXT DEFAULT 'Friendly' CHECK (gemini_voice IN ('Calm', 'Friendly', 'Mentor')),
    journal_retention TEXT DEFAULT '30' CHECK (journal_retention IN ('7', '30', 'Forever')),
    enable_motion BOOLEAN DEFAULT TRUE
);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own settings" ON user_settings FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
    
-- Function to create user_settings for each new user
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_settings();
