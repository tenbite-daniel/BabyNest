"use client";

import React, { useState, useEffect } from 'react';
import JournalCard from '../components/JournalCard';
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '../lib/api';

const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<{ _id: string; entry: string; mood: string; date: string }[]>([]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await getJournalEntries();
      setEntries(data.map((item: any) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString(),
      })));
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    }
  };

  const handleCreateOrUpdate = async (entry: string, mood: string, editId?: string) => {
    try {
      if (editId) {
        await updateJournalEntry(editId, entry, mood);
      } else {
        await createJournalEntry(entry, mood);
      }
      fetchEntries();
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJournalEntry(id);
      fetchEntries();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleEdit = (id: string, entry: string, mood: string) => {
    handleCreateOrUpdate(entry, mood, id);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">My Journal</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((item) => (
          <JournalCard
            key={item._id}
            id={item._id}
            entry={item.entry}
            mood={item.mood}
            date={item.date}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default JournalPage;