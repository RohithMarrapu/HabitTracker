import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabase';
import type { Habit, CreateHabitInput, UpdateHabitInput } from '../types/habit';
import { toast } from 'react-hot-toast';

export function useHabits() {
  const queryClient = useQueryClient();

  const { data: habits, isLoading, error } = useQuery<Habit[], Error>(
    'habits',
    async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  );

  const createHabit = useMutation(
    async (input: CreateHabitInput) => {
      const { data, error } = await supabase
        .from('habits')
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('habits');
        toast.success('Habit created successfully');
      },
      onError: (error: Error) => {
        toast.error(`Failed to create habit: ${error.message}`);
      },
    }
  );

  const updateHabit = useMutation(
    async (input: UpdateHabitInput) => {
      const { data, error } = await supabase
        .from('habits')
        .update(input)
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('habits');
        toast.success('Habit updated successfully');
      },
      onError: (error: Error) => {
        toast.error(`Failed to update habit: ${error.message}`);
      },
    }
  );

  const deleteHabit = useMutation(
    async (id: string) => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('habits');
        toast.success('Habit deleted successfully');
      },
      onError: (error: Error) => {
        toast.error(`Failed to delete habit: ${error.message}`);
      },
    }
  );

  return {
    habits,
    isLoading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
  };
}