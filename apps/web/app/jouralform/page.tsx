"use client";

import React, { useState } from "react";
import JournalForm from "../components/journal-form";
import { createJournalEntry } from "../lib/api";

const JournalFormPage: React.FC = () => {
  const [entries, setEntries] = useState<{ id: string; entry: string; mood: string }[]>([]);

  // Function to handle form submission
  const handleJournalSubmit = async (entry: string, mood: string, editId?: string) => {
    try {
      const newEntry = await createJournalEntry(entry, mood);
      setEntries((prev) => [...prev, newEntry]);
    } catch (error) {
      console.error("Failed to save journal:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">My Journal</h1>
      {/* ✅ Pass the onSubmit prop */}
      <JournalForm onSubmit={handleJournalSubmit} />

      <section className="mt-6 space-y-4">
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center">No entries yet. Write your first one!</p>
        ) : (
          entries.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-md shadow">
              <p className="text-gray-800">{item.entry}</p>
              <p className="text-sm text-gray-500">Mood: {item.mood}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default JournalFormPage;
