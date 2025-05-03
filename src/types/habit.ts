export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  target: number;
  unit: string;
  current_value: number;
  streak: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface HabitHistory {
  id: string;
  habit_id: string;
  value: number;
  date: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  habit_id: string;
  time: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateHabitInput {
  name: string;
  icon: string;
  target: number;
  unit: string;
  color: string;
}

export interface UpdateHabitInput {
  id: string;
  current_value?: number;
  target?: number;
  name?: string;
  icon?: string;
  unit?: string;
  color?: string;
}