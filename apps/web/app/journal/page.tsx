"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JournalCard from '../components/JournalCard';
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const JournalPage: React.FC = () => {
  const router = useRouter();
  const isAuthenticated = useAuth();
  const [entries, setEntries] = useState<{
    _id: string;
    date: string;
    trimester: string;
    todos: string[];
    completedTodos: boolean[];
    notes: string;
    imageUrls: string[];
    createdAt: string;
  }[]>([]);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await getJournalEntries();
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Optimistic update
      setEntries(prev => prev.filter(e => e._id !== id));
      await deleteJournalEntry(id);
    } catch (error) {
      console.error('Failed to delete entry:', error);
      // Revert on error
      fetchEntries();
    }
  };

  const handleEdit = async (id: string, data: any) => {
    try {
      // Optimistic update
      setEntries(prev => prev.map(e => 
        e._id === id ? { ...e, ...data } : e
      ));
      await updateJournalEntry(id, data);
    } catch (error) {
      console.error('Failed to update entry:', error);
      // Revert on error
      fetchEntries();
    }
  };

  const handleToggleTodo = async (id: string, completedTodos: boolean[]) => {
    try {
      const entry = entries.find(e => e._id === id);
      if (entry) {
        await updateJournalEntry(id, { 
          date: entry.date, 
          trimester: entry.trimester, 
          todos: entry.todos, 
          notes: entry.notes, 
          completedTodos 
        });
        // Update only the specific entry without full re-fetch
        setEntries(prev => prev.map(e => 
          e._id === id ? { ...e, completedTodos } : e
        ));
      }
    } catch (error) {
      console.error('Failed to update todo status:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center flex-1">My Journal</h1>
        <button 
          onClick={() => router.push('/journalform')}
          className="px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: '#D7656A' }}
        >
          + Create Journal
        </button>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((item) => (
          <JournalCard
            key={item._id}
            id={item._id}
            date={item.date}
            trimester={item.trimester}
            todos={item.todos}
            completedTodos={item.completedTodos || new Array(item.todos.length).fill(false)}
            notes={item.notes}
            imageUrls={item.imageUrls}
            createdAt={item.createdAt}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onToggleTodo={handleToggleTodo}
          />
        ))}
      </div>
    </div>
  );
};

export default JournalPage;