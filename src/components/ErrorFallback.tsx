import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <pre className="text-sm bg-gray-100 p-4 rounded mb-4 overflow-auto">
          {error.message}
        </pre>
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}