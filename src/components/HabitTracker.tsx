import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Search, Settings, Home, BarChart2, CheckCircle, X, ChevronLeft, Trash2 } from 'lucide-react';

// Constants
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

// Types
type Habit = {
  id: string;
  name: string;
  icon: string;
  target: number;
  unit: string;
  currentValue: number;
  streak: number;
  color: string;
  history: { date: string; value: number }[];
};

type User = {
  name: string;
  avatar: string;
  joinDate: string;
  streakDays: number;
  totalCompletions: number;
  level: number;
};

type AnalyticsData = {
  sleep: { date: string; hours: number }[];
  water: { date: string; glasses: number }[];
  exercise: { date: string; minutes: number }[];
  steps: { date: string; count: number }[];
  overall: { date: string; percentage: number }[];
};

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

type Reminder = {
  id: string;
  habitId: string;
  time: string;
  active: boolean;
};

type Theme = 'indigo' | 'emerald' | 'amber' | 'rose';

// Mock Data
const initialUser: User = {
  name: 'Alex Morgan',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  joinDate: '2025-01-15',
  streakDays: 28,
  totalCompletions: 257,
  level: 8,
};

const initialHabits: Habit[] = [
  {
    id: '1',
    name: 'Sleep',
    icon: '😴',
    target: 8,
    unit: 'hours',
    currentValue: 7.5,
    streak: 5,
    color: '#8884d8',
    history: [
      { date: '2025-04-26', value: 7.2 },
      { date: '2025-04-27', value: 6.8 },
      { date: '2025-04-28', value: 8.1 },
      { date: '2025-04-29', value: 7.5 },
      { date: '2025-04-30', value: 8.0 },
      { date: '2025-05-01', value: 7.5 },
      { date: '2025-05-02', value: 7.5 },
    ],
  },
  {
    id: '2',
    name: 'Water',
    icon: '💧',
    target: 8,
    unit: 'glasses',
    currentValue: 6,
    streak: 3,
    color: '#82ca9d',
    history: [
      { date: '2025-04-26', value: 5 },
      { date: '2025-04-27', value: 7 },
      { date: '2025-04-28', value: 8 },
      { date: '2025-04-29', value: 4 },
      { date: '2025-04-30', value: 6 },
      { date: '2025-05-01', value: 7 },
      { date: '2025-05-02', value: 6 },
    ],
  },
  {
    id: '3',
    name: 'Exercise',
    icon: '💪',
    target: 30,
    unit: 'minutes',
    currentValue: 20,
    streak: 0,
    color: '#ffc658',
    history: [
      { date: '2025-04-26', value: 25 },
      { date: '2025-04-27', value: 30 },
      { date: '2025-04-28', value: 0 },
      { date: '2025-04-29', value: 15 },
      { date: '2025-04-30', value: 30 },
      { date: '2025-05-01', value: 20 },
      { date: '2025-05-02', value: 20 },
    ],
  },
  {
    id: '4',
    name: 'Steps',
    icon: '👣',
    target: 10000,
    unit: 'steps',
    currentValue: 8234,
    streak: 12,
    color: '#ff8042',
    history: [
      { date: '2025-04-26', value: 9876 },
      { date: '2025-04-27', value: 7654 },
      { date: '2025-04-28', value: 12345 },
      { date: '2025-04-29', value: 8765 },
      { date: '2025-04-30', value: 10234 },
      { date: '2025-05-01', value: 9321 },
      { date: '2025-05-02', value: 8234 },
    ],
  },
  {
    id: '5',
    name: 'Meditation',
    icon: '🧘',
    target: 15,
    unit: 'minutes',
    currentValue: 10,
    streak: 2,
    color: '#8884d8',
    history: [
      { date: '2025-04-26', value: 10 },
      { date: '2025-04-27', value: 15 },
      { date: '2025-04-28', value: 15 },
      { date: '2025-04-29', value: 0 },
      { date: '2025-04-30', value: 10 },
      { date: '2025-05-01', value: 15 },
      { date: '2025-05-02', value: 10 },
    ],
  },
  {
    id: '6',
    name: 'Reading',
    icon: '📚',
    target: 30,
    unit: 'minutes',
    currentValue: 20,
    streak: 4,
    color: '#82ca9d',
    history: [
      { date: '2025-04-26', value: 30 },
      { date: '2025-04-27', value: 30 },
      { date: '2025-04-28', value: 30 },
      { date: '2025-04-29', value: 30 },
      { date: '2025-04-30', value: 20 },
      { date: '2025-05-01', value: 25 },
      { date: '2025-05-02', value: 20 },
    ],
  }
];

const initialAnalytics: AnalyticsData = {
  sleep: [
    { date: 'Monday', hours: 7.2 },
    { date: 'Tuesday', hours: 6.8 },
    { date: 'Wednesday', hours: 8.1 },
    { date: 'Thursday', hours: 7.5 },
    { date: 'Friday', hours: 8.0 },
    { date: 'Saturday', hours: 7.5 },
    { date: 'Sunday', hours: 7.8 },
  ],
  water: [
    { date: 'Monday', glasses: 5 },
    { date: 'Tuesday', glasses: 7 },
    { date: 'Wednesday', glasses: 8 },
    { date: 'Thursday', glasses: 4 },
    { date: 'Friday', glasses: 6 },
    { date: 'Saturday', glasses: 7 },
    { date: 'Sunday', glasses: 8 },
  ],
  exercise: [
    { date: 'Monday', minutes: 25 },
    { date: 'Tuesday', minutes: 30 },
    { date: 'Wednesday', minutes: 0 },
    { date: 'Thursday', minutes: 15 },
    { date: 'Friday', minutes: 30 },
    { date: 'Saturday', minutes: 20 },
    { date: 'Sunday', minutes: 20 },
  ],
  steps: [
    { date: 'Monday', count: 9876 },
    { date: 'Tuesday', count: 7654 },
    { date: 'Wednesday', count: 12345 },
    { date: 'Thursday', count: 8765 },
    { date: 'Friday', count: 10234 },
    { date: 'Saturday', count: 9321 },
    { date: 'Sunday', count: 11432 },
  ],
  overall: [
    { date: 'Monday', percentage: 75 },
    { date: 'Tuesday', percentage: 68 },
    { date: 'Wednesday', percentage: 92 },
    { date: 'Thursday', percentage: 78 },
    { date: 'Friday', percentage: 85 },
    { date: 'Saturday', percentage: 80 },
    { date: 'Sunday', percentage: 88 },
  ],
};

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Great progress!',
    message: "You've completed your sleep goal for 5 days in a row!",
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    title: 'Reminder',
    message: "Don't forget to log your water intake for today",
    time: '5 hours ago',
    read: true,
  },
  {
    id: '3',
    title: 'Achievement Unlocked',
    message: 'You reached level 8! Keep up the good work.',
    time: '1 day ago',
    read: true,
  },
];

const initialReminders: Reminder[] = [
  { id: '1', habitId: '1', time: '22:00', active: true },
  { id: '2', habitId: '2', time: '09:00', active: true },
  { id: '3', habitId: '2', time: '14:00', active: true },
  { id: '4', habitId: '4', time: '18:00', active: false },
];

export default function HabitTracker() {
  // State
  const [user, setUser] = useState<User>(initialUser);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [analytics, setAnalytics] = useState<AnalyticsData>(initialAnalytics);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'habits' | 'analytics' | 'settings'>('dashboard');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailNotifications, setEmailNotifications] = useState({
    dailyDigest: true,
    reminders: true
  });
  const [theme, setTheme] = useState<Theme>('indigo');
  const [tempTheme, setTempTheme] = useState<Theme>(theme);
  
  // Refs for click outside detection
  const notificationRef = useRef<HTMLDivElement>(null);
  const habitModalRef = useRef<HTMLDivElement>(null);
  const reminderModalRef = useRef<HTMLDivElement>(null);
  
  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current && 
        !notificationRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('#notification-button')
      ) {
        setShowNotifications(false);
      }
      
      if (
        habitModalRef.current && 
        !habitModalRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('#add-habit-button')
      ) {
        setShowAddHabit(false);
      }
      
      if (
        reminderModalRef.current && 
        !reminderModalRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('#reminder-button')
      ) {
        setShowReminderModal(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Search filter for habits
  const filteredHabits = habits.filter(habit => 
    habit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Add function to delete a reminder
  const deleteReminder = (id: string) => {
    setReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== id));
    
    // Add notification
    const deletedReminder = reminders.find(r => r.id === id);
    if (deletedReminder) {
      const habit = habits.find(h => h.id === deletedReminder.habitId);
      if (habit) {
        const newNotification: Notification = {
          id: String(Date.now()),
          title: 'Reminder deleted',
          message: `Reminder for ${habit.name} has been deleted`,
          time: 'just now',
          read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    }
  };
  
  // Update the updateHabitValue function to handle different units properly
  const updateHabitValue = (id: string, value: number) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => {
        if (habit.id === id) {
          // Get current date in YYYY-MM-DD format
          const today = new Date().toISOString().split('T')[0];
          
          // Check if target is met
          const targetMet = value >= habit.target;

          // Check if we already have a check-in for today
          const todayIndex = habit.history.findIndex(entry => entry.date === today);
          
          // Update streak
          let newStreak = habit.streak;
          if (targetMet) {
            newStreak += 1;
          } else {
            newStreak = 0;
          }
          
          // Add to history
          let newHistory = [...habit.history];
          if (todayIndex >= 0) {
            newHistory[todayIndex] = { date: today, value };
          } else {
            newHistory.push({ date: today, value });
          }
          // Keep only last 7 days
          if (newHistory.length > 7) {
            newHistory = newHistory.slice(newHistory.length - 7);
          }
          
          // Add notification for successful check-in
          const newNotification: Notification = {
            id: String(Date.now()),
            title: targetMet ? 'Goal completed!' : 'Progress updated',
            message: targetMet 
              ? `Congratulations! You've completed your ${habit.name} goal for today`
              : `You've updated your ${habit.name} progress to ${value} ${habit.unit}`,
            time: 'just now',
            read: false
          };
          setNotifications(prev => [newNotification, ...prev]);
          
          return {
            ...habit,
            currentValue: value,
            streak: newStreak,
            history: newHistory
          };
        }
        return habit;
      })
    );
  };
  
  // Update the addReminder function
  const addReminder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const time = formData.get('time') as string;
    
    if (selectedHabit && time) {
      const newReminder: Reminder = {
        id: String(Date.now()),
        habitId: selectedHabit.id,
        time,
        active: true
      };
      
      setReminders(prev => [...prev, newReminder]);
      setShowReminderModal(false);
      
      // Add notification
      const newNotification: Notification = {
        id: String(Date.now()),
        title: 'Reminder set',
        message: `You've set a reminder for ${selectedHabit.name} at ${time}`,
        time: 'just now',
        read: false
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };
  
  // Toggle reminder active state
  const toggleReminder = (id: string) => {
    setReminders(prevReminders =>
      prevReminders.map(reminder =>
        reminder.id === id ? { ...reminder, active: !reminder.active } : reminder
      )
    );
  };
  
  // Delete habit
  const deleteHabit = (id: string) => {
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
    
    // Remove associated reminders
    setReminders(prevReminders => prevReminders.filter(reminder => reminder.habitId !== id));
    
    // Close detail view if open
    if (selectedHabit && selectedHabit.id === id) {
      setSelectedHabit(null);
    }
    
    // Add notification
    const habit = habits.find(h => h.id === id);
    if (habit) {
      const newNotification: Notification = {
        id: String(Date.now()),
        title: 'Habit deleted',
        message: `You've deleted the habit: ${habit.name}`,
        time: 'just now',
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    }
  };
  
  // Calculate completion percentages
  const calculateCompletion = (habit: Habit) => {
    const percentage = (habit.currentValue / habit.target) * 100;
    return Math.min(100, Math.round(percentage));
  };
  
  const calculateOverallCompletion = () => {
    if (habits.length === 0) return 0;
    
    const totalPercentage = habits.reduce((sum, habit) => sum + calculateCompletion(habit), 0);
    return Math.round(totalPercentage / habits.length);
  };
  
  // Progress color based on completion
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const overallCompletionData = [
    { name: 'Completed', value: calculateOverallCompletion() },
    { name: 'Remaining', value: 100 - calculateOverallCompletion() }
  ];
  
  // Render Tabs
  const renderDashboard = () => (
    <div className="p-4 space-y-6">
      {/* Welcome Card */}
      <motion.div 
        className={`${tempTheme === 'indigo' ? 'bg-indigo-600' : 
                     tempTheme === 'emerald' ? 'bg-emerald-600' : 
                     tempTheme === 'amber' ? 'bg-amber-600' : 
                     'bg-rose-600'} text-white p-6 rounded-xl shadow-lg`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
            <p className="text-indigo-100">
              You're on a {user.streakDays} day streak. Keep it up!
            </p>
          </div>
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
            🔥
          </div>
        </div>
      </motion.div>
      
      {/* Daily Progress */}
      <motion.div 
        className="bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold mb-4">Today's Progress</h3>
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600">Overall Completion</span>
          <span className="font-bold">{calculateOverallCompletion()}%</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              theme === 'indigo' ? 'bg-indigo-600' : 
              theme === 'emerald' ? 'bg-emerald-600' : 
              theme === 'amber' ? 'bg-amber-600' : 
              'bg-rose-600'
            }`}
            style={{ width: `${calculateOverallCompletion()}%` }}
          ></div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const completion = calculateCompletion(habit);
            return (
              <motion.div 
                key={habit.id}
                className="bg-gray-50 p-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{habit.icon}</span>
                    <span className="font-medium">{habit.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{completion}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor(completion)}`}
                    style={{ width: `${completion}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex justify-between text-sm text-gray-500">
                  <span>Current: {habit.currentValue} {habit.unit}</span>
                  <span>Target: {habit.target} {habit.unit}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      
      {/* Weekly Overview */}
      <motion.div 
        className="bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold mb-4">Weekly Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={analytics.overall}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="percentage" 
                name="Daily Completion %" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <button 
          onClick={() => setActiveTab('habits')}
          className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center"
        >
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl mb-2">
            <CheckCircle size={24} />
          </div>
          <span className="font-medium">Check In</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('analytics')}
          className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center"
        >
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl mb-2">
            <BarChart2 size={24} />
          </div>
          <span className="font-medium">Analytics</span>
        </button>
        
        <button 
          id="reminder-button"
          onClick={() => setShowReminderModal(true)}
          className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center"
        >
          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl mb-2">
            <Bell size={24} />
          </div>
          <span className="font-medium">Reminders</span>
        </button>
        
        <button 
          id="add-habit-button"
          onClick={() => setShowAddHabit(true)}
          className={`px-4 py-2 ${
            theme === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' : 
            theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 
            theme === 'amber' ? 'bg-amber-600 hover:bg-amber-700' : 
            'bg-rose-600 hover:bg-rose-700'
          } text-white rounded-full shadow-md flex items-center`}
        >
          <Plus size={20} className="mr-1" />
          Add New Habit
        </button>
      </motion.div>
    </div>
  );
  
  const renderHabits = () => (
    <div className="p-4 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search habits..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {selectedHabit ? (
        /* Habit Detail View */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="flex justify-between items-center p-4 border-b">
            <button 
              onClick={() => setSelectedHabit(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-bold">{selectedHabit.icon} {selectedHabit.name}</h2>
            <button 
              onClick={() => deleteHabit(selectedHabit.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={24} />
            </button>
          </div>
          
          {renderHabitDetail(selectedHabit)}
        </motion.div>
      ) : (
        /* Habits List View */
        <div className="space-y-4">
          {filteredHabits.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <p className="text-gray-500">No habits found. Add a new habit to get started!</p>
              <button 
                onClick={() => setShowAddHabit(true)}
                className={`mt-4 px-4 py-2 ${
                  theme === 'indigo' ? 'bg-indigo-600 text-white' : 
                  theme === 'emerald' ? 'bg-emerald-600 text-white' : 
                  theme === 'amber' ? 'bg-amber-600 text-white' : 
                  'bg-rose-600 text-white'
                } rounded-lg hover:bg-opacity-90`}
              >
                Add New Habit
              </button>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {filteredHabits.map((habit) => {
                const completion = calculateCompletion(habit);
                const today = new Date().toISOString().split('T')[0];
                const todayEntry = habit.history.find(entry => entry.date === today);
                const isCompleted = todayEntry && todayEntry.value >= habit.target;
                
                return (
                  <motion.div 
                    key={habit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-4 rounded-xl shadow-md cursor-pointer"
                    onClick={() => setSelectedHabit(habit)}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">{habit.icon}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{habit.name}</h3>
                          <p className="text-gray-500 text-sm">{habit.target} {habit.unit} daily</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">{completion}%</span>
                        <div className="flex items-center text-sm">
                          <span className="text-orange-500">🔥</span>
                          <span className="ml-1">{habit.streak} days</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full ${getProgressColor(completion)}`}
                        style={{ width: `${completion}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Today: {habit.currentValue} {habit.unit}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{calculateCompletion(habit)}%</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCompleted) {
                              const newNotification: Notification = {
                                id: String(Date.now()),
                                title: 'Daily goal completed',
                                message: `You've already completed your ${habit.name} goal for today`,
                                time: 'just now',
                                read: false
                              };
                              setNotifications(prev => [newNotification, ...prev]);
                              return;
                            }
                            updateHabitValue(habit.id, habit.currentValue + (habit.unit === 'steps' ? 1000 : 1));
                          }}
                          className={`px-3 py-1 rounded-lg flex items-center ${
                            isCompleted 
                              ? 'bg-green-100 text-green-600 cursor-not-allowed' 
                              : `${theme === 'indigo' ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 
                                 theme === 'emerald' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 
                                 theme === 'amber' ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 
                                 'bg-rose-100 text-rose-600 hover:bg-rose-200'}`
                          }`}
                          disabled={isCompleted}
                        >
                          {isCompleted ? 'Completed' : 'Check In'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <button 
              id="add-habit-button"
              onClick={() => setShowAddHabit(true)}
              className={`px-4 py-2 ${
                theme === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' : 
                theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                theme === 'amber' ? 'bg-amber-600 hover:bg-amber-700' : 
                'bg-rose-600 hover:bg-rose-700'
              } text-white rounded-full shadow-md flex items-center`}
            >
              <Plus size={20} className="mr-1" />
              Add New Habit
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
  
  const renderHabitDetail = (habit: Habit) => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600 mb-2">Today's progress</p>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className={`h-full rounded-full ${getProgressColor(calculateCompletion(habit))}`} 
              style={{ width: `${calculateCompletion(habit)}%` }}
            ></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Current: {habit.currentValue} {habit.unit}</span>
            <span className="text-sm font-semibold">{calculateCompletion(habit)}%</span>
          </div>
        </div>
        
        <div>
          <p className="text-gray-600 mb-1">Current streak</p>
          <p className="text-2xl font-bold flex items-center">
            {habit.streak} days
            <span className="text-xl ml-2">🔥</span>
          </p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Target</p>
          <p className="text-2xl font-bold">{habit.target} {habit.unit}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">Weekly trend</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={habit.history}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { weekday: 'short' });
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} ${habit.unit}`, habit.name]}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={habit.color} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-gray-600 mb-3">Update today's value</p>
        <div className="flex items-center">
          <button 
            onClick={() => {
              const newValue = Math.max(0, habit.currentValue - (habit.unit === 'steps' ? 1000 : 1));
              updateHabitValue(habit.id, newValue);
            }}
            className={`h-10 w-10 rounded-full ${
              theme === 'indigo' ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 
              theme === 'emerald' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 
              theme === 'amber' ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 
              'bg-rose-100 text-rose-600 hover:bg-rose-200'
            } flex items-center justify-center text-xl`}
          >
            -
          </button>
          <div className="flex-1 mx-4">
            <input 
              type="range" 
              min="0" 
              max={habit.unit === 'steps' ? "20000" : "24"}
              step={habit.unit === 'steps' ? "100" : "0.1"}
              value={habit.currentValue}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                updateHabitValue(habit.id, newValue);
              }}
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${
                theme === 'indigo' ? 'accent-indigo-600' : 
                theme === 'emerald' ? 'accent-emerald-600' : 
                theme === 'amber' ? 'accent-amber-600' : 
                'accent-rose-600'
              }`}
            />
          </div>
          <button 
            onClick={() => {
              const newValue = habit.currentValue + (habit.unit === 'steps' ? 1000 : 1);
              updateHabitValue(habit.id, newValue);
            }}
            className={`h-10 w-10 rounded-full ${
              theme === 'indigo' ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 
              theme === 'emerald' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 
              theme === 'amber' ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 
              'bg-rose-100 text-rose-600 hover:bg-rose-200'
            } flex items-center justify-center text-xl`}
          >
            +
          </button>
        </div>
        <p className="text-center mt-2 text-2xl font-bold">
          {habit.currentValue} <span className="text-gray-500 text-base font-normal">{habit.unit}</span>
        </p>
      </div>
      
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Reminders</h3>
        <div className="space-y-2">
          {reminders
            .filter(reminder => reminder.habitId === habit.id)
            .map(reminder => (
              <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>{reminder.time}</span>
                <div className="flex items-center space-x-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={reminder.active} 
                      onChange={() => toggleReminder(reminder.id)}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none ${
                      theme === 'indigo' ? 'peer-focus:ring-4 peer-focus:ring-indigo-300' : 
                      theme === 'emerald' ? 'peer-focus:ring-4 peer-focus:ring-emerald-300' : 
                      theme === 'amber' ? 'peer-focus:ring-4 peer-focus:ring-amber-300' : 
                      'peer-focus:ring-4 peer-focus:ring-rose-300'
                    } rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      theme === 'indigo' ? 'peer-checked:bg-indigo-600' : 
                      theme === 'emerald' ? 'peer-checked:bg-emerald-600' : 
                      theme === 'amber' ? 'peer-checked:bg-amber-600' : 
                      'peer-checked:bg-rose-600'
                    }`}></div>
                  </label>
                  <button 
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          <button 
            id="reminder-button"
            onClick={() => setShowReminderModal(true)}
            className="w-full p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 flex items-center justify-center"
          >
            <Plus size={20} className="mr-1" />
            Add Reminder
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderAnalytics = () => (
    <div className="p-4 space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          className="bg-white p-5 rounded-xl shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-gray-500 mb-1">Completion Rate</h3>
          <p className="text-3xl font-bold">{calculateOverallCompletion()}%</p>
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                theme === 'indigo' ? 'bg-indigo-600' : 
                theme === 'emerald' ? 'bg-emerald-600' : 
                theme === 'amber' ? 'bg-amber-600' : 
                'bg-rose-600'
              }`}
              style={{ width: `${calculateOverallCompletion()}%` }}
            ></div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white p-5 rounded-xl shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-gray-500 mb-1">Current Streak</h3>
          <p className="text-3xl font-bold flex items-center">
            {user.streakDays} days
            <span className="text-2xl ml-2">🔥</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">Best: 45 days</p>
        </motion.div>
        
        <motion.div 
          className="bg-white p-5 rounded-xl shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-gray-500 mb-1">Total Habits</h3>
          <p className="text-3xl font-bold">{habits.length}</p>
          <p className="text-sm text-gray-500 mt-2">Active: {habits.length}</p>
        </motion.div>
        
        <motion.div 
          className="bg-white p-5 rounded-xl shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h3 className="text-gray-500 mb-1">Total Check-ins</h3>
          <p className="text-3xl font-bold">
            {habits.reduce((total: number, habit: Habit) => total + habit.history.length, 0)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This week: {habits.reduce((total: number, habit: Habit) => {
              const today = new Date();
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
              return total + habit.history.filter(entry => new Date(entry.date) >= weekAgo).length;
            }, 0)}
          </p>
        </motion.div>
      </div>
      
      {/* Overall Progress */}
      <motion.div 
        className="bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics.overall}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  name="Overall Completion" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallCompletionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={false}
                >
                  <Cell key="cell-0" fill="#8884d8" />
                  <Cell key="cell-1" fill="#f1f5f9" />
                </Pie>
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-2xl font-bold"
                >
                  {calculateOverallCompletion()}%
                </text>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
      
      {/* Individual Habit Stats */}
      <motion.div 
        className="bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold mb-4">Habit Breakdown</h3>
        <div className="space-y-6">
          {/* Sleep */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium flex items-center">
                <span className="text-xl mr-2">😴</span> Sleep
              </h4>
              <span className="text-sm text-gray-500">Target: 8 hours</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.sleep}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} hours`} />
                  <Bar dataKey="hours" name="Sleep Duration" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Water */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium flex items-center">
                <span className="text-xl mr-2">💧</span> Water
              </h4>
              <span className="text-sm text-gray-500">Target: 8 glasses</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.water}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} glasses`} />
                  <Bar dataKey="glasses" name="Water Intake" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
  
  const renderSettings = () => (
    <div className="p-4 space-y-6">
      {/* Profile Card */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          <div className="flex items-center">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-16 h-16 rounded-full border-2 border-indigo-500 mr-4"
            />
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-500">Member since {new Date(user.joinDate).toLocaleDateString()}</p>
              <div className="mt-1 flex items-center">
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  Level {user.level}
                </span>
                <span className="ml-2 text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full flex items-center">
                  <span className="mr-1">🔥</span> {user.streakDays} days
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Account Settings */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Display Name</label>
              <input 
                type="text" 
                value={user.name}
                onChange={(e) => setUser(prev => ({...prev, name: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Email Notifications</label>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer mr-4">
                  <input 
                    type="checkbox" 
                    checked={emailNotifications.dailyDigest}
                    onChange={() => setEmailNotifications(prev => ({...prev, dailyDigest: !prev.dailyDigest}))}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none ${
                    theme === 'indigo' ? 'peer-focus:ring-4 peer-focus:ring-indigo-300' : 
                    theme === 'emerald' ? 'peer-focus:ring-4 peer-focus:ring-emerald-300' : 
                    theme === 'amber' ? 'peer-focus:ring-4 peer-focus:ring-amber-300' : 
                    'peer-focus:ring-4 peer-focus:ring-rose-300'
                  } rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    theme === 'indigo' ? 'peer-checked:bg-indigo-600' : 
                    theme === 'emerald' ? 'peer-checked:bg-emerald-600' : 
                    theme === 'amber' ? 'peer-checked:bg-amber-600' : 
                    'peer-checked:bg-rose-600'
                  }`}></div>
                  <span className="ml-2">Daily Digest</span>
                </label>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailNotifications.reminders}
                    onChange={() => setEmailNotifications(prev => ({...prev, reminders: !prev.reminders}))}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none ${
                    theme === 'indigo' ? 'peer-focus:ring-4 peer-focus:ring-indigo-300' : 
                    theme === 'emerald' ? 'peer-focus:ring-4 peer-focus:ring-emerald-300' : 
                    theme === 'amber' ? 'peer-focus:ring-4 peer-focus:ring-amber-300' : 
                    'peer-focus:ring-4 peer-focus:ring-rose-300'
                  } rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                    theme === 'indigo' ? 'peer-checked:bg-indigo-600' : 
                    theme === 'emerald' ? 'peer-checked:bg-emerald-600' : 
                    theme === 'amber' ? 'peer-checked:bg-amber-600' : 
                    'peer-checked:bg-rose-600'
                  }`}></div>
                  <span className="ml-2">Reminders</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Theme</label>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setTempTheme('indigo')}
                  className={`w-8 h-8 rounded-full border-2 ${tempTheme === 'indigo' ? 'border-indigo-300' : 'border-transparent'}`}
                >
                  <div className="w-full h-full bg-indigo-600 rounded-full"></div>
                </button>
                <button 
                  onClick={() => setTempTheme('emerald')}
                  className={`w-8 h-8 rounded-full border-2 ${tempTheme === 'emerald' ? 'border-emerald-300' : 'border-transparent'}`}
                >
                  <div className="w-full h-full bg-emerald-600 rounded-full"></div>
                </button>
                <button 
                  onClick={() => setTempTheme('amber')}
                  className={`w-8 h-8 rounded-full border-2 ${tempTheme === 'amber' ? 'border-amber-300' : 'border-transparent'}`}
                >
                  <div className="w-full h-full bg-amber-600 rounded-full"></div>
                </button>
                <button 
                  onClick={() => setTempTheme('rose')}
                  className={`w-8 h-8 rounded-full border-2 ${tempTheme === 'rose' ? 'border-rose-300' : 'border-transparent'}`}
                >
                  <div className="w-full h-full bg-rose-600 rounded-full"></div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={() => {
                setTheme(tempTheme);
                const newNotification: Notification = {
                  id: String(Date.now()),
                  title: 'Settings saved',
                  message: 'Your account settings have been updated successfully',
                  time: 'just now',
                  read: false
                };
                setNotifications(prev => [newNotification, ...prev]);
              }}
              className={`px-4 py-2 ${
                theme === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' : 
                theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                theme === 'amber' ? 'bg-amber-600 hover:bg-amber-700' : 
                'bg-rose-600 hover:bg-rose-700'
              } text-white rounded-lg`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Reminders */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Reminders</h3>
            <button 
              id="reminder-button"
              onClick={() => setShowReminderModal(true)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-2">
            {reminders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reminders set</p>
            ) : (
              reminders.map(reminder => {
                const habit = habits.find(h => h.id === reminder.habitId);
                return (
                  <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{habit?.icon}</span>
                      <div>
                        <p className="font-medium">{habit?.name}</p>
                        <p className="text-gray-500 text-sm">{reminder.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer mr-2">
                        <input 
                          type="checkbox" 
                          checked={reminder.active} 
                          onChange={() => toggleReminder(reminder.id)}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none ${
                          tempTheme === 'indigo' ? 'peer-focus:ring-4 peer-focus:ring-indigo-300' : 
                          tempTheme === 'emerald' ? 'peer-focus:ring-4 peer-focus:ring-emerald-300' : 
                          tempTheme === 'amber' ? 'peer-focus:ring-4 peer-focus:ring-amber-300' : 
                          'peer-focus:ring-4 peer-focus:ring-rose-300'
                        } rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                          tempTheme === 'indigo' ? 'peer-checked:bg-indigo-600' : 
                          tempTheme === 'emerald' ? 'peer-checked:bg-emerald-600' : 
                          tempTheme === 'amber' ? 'peer-checked:bg-amber-600' : 
                          'peer-checked:bg-rose-600'
                        }`}></div>
                      </label>
                      <button 
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Data Management */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          <div className="space-y-4">
            <button 
              onClick={exportData}
              className="w-full p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export Data
            </button>
            
            <button 
              onClick={deleteAccount}
              className="w-full p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
  
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const addNewHabit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newHabit: Habit = {
      id: String(Date.now()),
      name: formData.get('name') as string,
      icon: formData.get('icon') as string,
      target: Number(formData.get('target')),
      unit: formData.get('unit') as string,
      currentValue: 0,
      streak: 0,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      history: []
    };
    
    setHabits(prev => [...prev, newHabit]);
    setShowAddHabit(false);
    
    // Add notification
    const newNotification: Notification = {
      id: String(Date.now()),
      title: 'New habit added',
      message: `You've added a new habit: ${newHabit.name}`,
      time: 'just now',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const exportData = () => {
    const data = {
      user,
      habits,
      analytics,
      reminders
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habit-tracker-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Add notification
    const newNotification: Notification = {
      id: String(Date.now()),
      title: 'Data exported',
      message: 'Your habit tracker data has been exported successfully',
      time: 'just now',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const deleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, this would make an API call to delete the account
      // For now, we'll just reset the state
      setUser(initialUser);
      setHabits(initialHabits);
      setAnalytics(initialAnalytics);
      setReminders(initialReminders);
      setNotifications([]);
      
      // Add notification
      const newNotification: Notification = {
        id: String(Date.now()),
        title: 'Account deleted',
        message: 'Your account has been deleted successfully',
        time: 'just now',
        read: false
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className={`text-xl font-bold ${
              tempTheme === 'indigo' ? 'text-indigo-600' : 
              tempTheme === 'emerald' ? 'text-emerald-600' : 
              tempTheme === 'amber' ? 'text-amber-600' : 
              'text-rose-600'
            }`}>HabitTracker</h1>
            <div className="flex items-center space-x-4">
              <button 
                id="notification-button"
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 text-gray-600 ${
                  tempTheme === 'indigo' ? 'hover:text-indigo-600' : 
                  tempTheme === 'emerald' ? 'hover:text-emerald-600' : 
                  tempTheme === 'amber' ? 'hover:text-amber-600' : 
                  'hover:text-rose-600'
                } focus:outline-none`}
              >
                <Bell size={24} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="h-8 w-8 rounded-full cursor-pointer"
                onClick={() => setActiveTab('settings')}
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'habits' && renderHabits()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'settings' && renderSettings()}
        </AnimatePresence>
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center py-3 px-6 ${
                activeTab === 'dashboard' ? 
                (tempTheme === 'indigo' ? 'text-indigo-600' : 
                 tempTheme === 'emerald' ? 'text-emerald-600' : 
                 tempTheme === 'amber' ? 'text-amber-600' : 
                 'text-rose-600') : 
                'text-gray-500'
              }`}
            >
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button 
              onClick={() => setActiveTab('habits')}
              className={`flex flex-col items-center py-3 px-6 ${activeTab === 'habits' ? 'text-indigo-600' : 'text-gray-500'}`}
            >
              <CheckCircle size={24} />
              <span className="text-xs mt-1">Habits</span>
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center py-3 px-6 ${activeTab === 'analytics' ? 'text-indigo-600' : 'text-gray-500'}`}
            >
              <BarChart2 size={24} />
              <span className="text-xs mt-1">Analytics</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center py-3 px-6 ${activeTab === 'settings' ? 'text-indigo-600' : 'text-gray-500'}`}
            >
              <Settings size={24} />
              <span className="text-xs mt-1">Settings</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            ref={notificationRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-4 w-80 bg-white rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Notifications</h3>
                <button 
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                  className={`text-sm ${
                    tempTheme === 'indigo' ? 'text-indigo-600 hover:text-indigo-800' : 
                    tempTheme === 'emerald' ? 'text-emerald-600 hover:text-emerald-800' : 
                    tempTheme === 'amber' ? 'text-amber-600 hover:text-amber-800' : 
                    'text-rose-600 hover:text-rose-800'
                  }`}
                >
                  Mark all as read
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No notifications</p>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                      !notification.read ? 
                      (theme === 'indigo' ? 'bg-indigo-50' : 
                       theme === 'emerald' ? 'bg-emerald-50' : 
                       theme === 'amber' ? 'bg-amber-50' : 
                       'bg-rose-50') : 
                      ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            {!notification.read && (
                              <span className={`h-2 w-2 ${
                                theme === 'indigo' ? 'bg-indigo-600' : 
                                theme === 'emerald' ? 'bg-emerald-600' : 
                                theme === 'amber' ? 'bg-amber-600' : 
                                'bg-rose-600'
                              } rounded-full`}></span>
                            )}
                          </div>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className={`text-xs px-2 py-1 rounded ${
                                theme === 'indigo' ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 
                                theme === 'emerald' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 
                                theme === 'amber' ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 
                                'bg-rose-100 text-rose-600 hover:bg-rose-200'
                              }`}
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              ref={habitModalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold">Add New Habit</h2>
                <button 
                  onClick={() => setShowAddHabit(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={addNewHabit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Habit Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      placeholder="e.g., Meditation"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1">Icon</label>
                    <input 
                      type="text" 
                      name="icon"
                      required
                      placeholder="e.g., 🧘"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Target</label>
                      <input 
                        type="number" 
                        name="target"
                        required
                        min="1"
                        placeholder="e.g., 20"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1">Unit</label>
                      <input 
                        type="text" 
                        name="unit"
                        required
                        placeholder="e.g., minutes"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setShowAddHabit(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg mr-2 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add Habit
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add Reminder Modal */}
      <AnimatePresence>
        {showReminderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              ref={reminderModalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold">Add Reminder for {selectedHabit?.name}</h2>
                <button 
                  onClick={() => setShowReminderModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={addReminder} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Time</label>
                    <input 
                      type="time" 
                      name="time"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setShowReminderModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg mr-2 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add Reminder
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}