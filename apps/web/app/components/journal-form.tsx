"use client";

import React, { useState } from "react";

interface JournalFormProps {
  onSubmit: (entry: string, mood: string, editId?: string) => void;
}

const JournalForm: React.FC<JournalFormProps> = ({ onSubmit }) => {
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(entry, mood, editId || undefined);
    setEntry("");
    setMood("");
    setEditId(null);
  };

  return (
    <section className="bg-pink-100 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-4">My Journal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="entry" className="block text-sm font-medium text-gray-700">
            Entry date, how do you feel today...
          </label>
          <textarea
            id="entry"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            placeholder="Write your thoughts here..."
          />
        </div>
        <div>
          <label htmlFor="mood" className="block text-sm font-medium text-gray-700">
            Mood
          </label>
          <select
            id="mood"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Mood</option>
            <option value="happy">Happy</option>
            <option value="sad">Sad</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600"
          >
            {editId ? "Update" : "Post"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default JournalForm;
