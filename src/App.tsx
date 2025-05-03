import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import HabitTracker from './components/HabitTracker';
import ErrorFallback from './components/ErrorFallback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="min-h-screen bg-gray-100">
          <HabitTracker />
          <Toaster position="top-right" />
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;