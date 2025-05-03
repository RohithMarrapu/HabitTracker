/*
  # Initial Habits Schema

  1. New Tables
    - `habits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `icon` (text)
      - `target` (numeric)
      - `unit` (text)
      - `current_value` (numeric)
      - `streak` (integer)
      - `color` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `habit_history`
      - `id` (uuid, primary key)
      - `habit_id` (uuid, references habits)
      - `value` (numeric)
      - `date` (date)
      - `created_at` (timestamptz)

    - `reminders`
      - `id` (uuid, primary key)
      - `habit_id` (uuid, references habits)
      - `time` (time)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create habits table
CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  target numeric NOT NULL,
  unit text NOT NULL,
  current_value numeric DEFAULT 0,
  streak integer DEFAULT 0,
  color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create habit_history table
CREATE TABLE habit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  value numeric NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create reminders table
CREATE TABLE reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  time time NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for habits
CREATE POLICY "Users can view their own habits"
  ON habits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits"
  ON habits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for habit_history
CREATE POLICY "Users can view their habits' history"
  ON habit_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_history.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create history for their habits"
  ON habit_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_history.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- Create policies for reminders
CREATE POLICY "Users can view their habits' reminders"
  ON reminders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = reminders.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their habits' reminders"
  ON reminders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = reminders.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX habits_user_id_idx ON habits(user_id);
CREATE INDEX habit_history_habit_id_idx ON habit_history(habit_id);
CREATE INDEX habit_history_date_idx ON habit_history(date);
CREATE INDEX reminders_habit_id_idx ON reminders(habit_id);

-- Create function to update habit updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();