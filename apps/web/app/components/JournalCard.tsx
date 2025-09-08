"use client";

import React from 'react';

interface JournalCardProps {
  id: string;
  entry: string;
  mood: string;
  date: string;
  onEdit: (id: string, entry: string, mood: string) => void;
  onDelete: (id: string) => void;
}

const JournalCard: React.FC<JournalCardProps> = ({ id, entry, mood, date, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4 w-full max-w-lg h-80">
      <img src="https://via.placeholder.com/400x200" alt="Journal Placeholder" className="w-full h-40 object-cover rounded-t-lg mb-4" />
      <p className="text-gray-700 text-lg mb-2">{entry}</p>
      <p className="text-sm text-gray-500">Mood: {mood}</p>
      <p className="text-sm text-gray-500">Date: {date}</p>
      <div className="mt-4 flex space-x-3">
        <button
          onClick={() => onEdit(id, entry, mood)}
          className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(id)}
          className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default JournalCard;