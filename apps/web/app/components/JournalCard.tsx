"use client";

import React, { useState } from 'react';

interface JournalUpdateData {
  date: string;
  trimester: string;
  todos: string[];
  notes: string;
  completedTodos?: boolean[];
}

interface JournalCardProps {
  id: string;
  date: string;
  trimester: string;
  todos: string[];
  completedTodos: boolean[];
  notes: string;
  imageUrls: string[];
  createdAt: string;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: JournalUpdateData) => void;
  onToggleTodo?: (id: string, completedTodos: boolean[]) => void;
}

const JournalCard: React.FC<JournalCardProps> = ({ 
  id, 
  date, 
  trimester, 
  todos, 
  completedTodos: initialCompletedTodos,
  notes, 
  imageUrls, 
  createdAt, 
  onDelete,
  onEdit,
  onToggleTodo
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ date, trimester, todos, notes });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [completedTodos, setCompletedTodos] = useState<boolean[]>(initialCompletedTodos);
  const [newTodo, setNewTodo] = useState('');

  const handleSave = () => {
    onEdit(id, editData);
    setIsEditing(false);
  };

  const nextImage = () => {
    if (imageUrls && imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
    }
  };

  const prevImage = () => {
    if (imageUrls && imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 w-full">
        <div className="space-y-3">
          <input
            type="date"
            value={editData.date}
            onChange={(e) => setEditData({...editData, date: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <select
            value={editData.trimester}
            onChange={(e) => setEditData({...editData, trimester: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="First Trimester">First Trimester</option>
            <option value="Second Trimester">Second Trimester</option>
            <option value="Third Trimester">Third Trimester</option>
          </select>
          <div>
            <label className="block text-sm font-medium mb-1">Todos:</label>
            {editData.todos.map((todo, index) => (
              <div key={index} className="flex gap-1 mb-1">
                <input
                  type="text"
                  value={todo}
                  onChange={(e) => {
                    const newTodos = [...editData.todos];
                    newTodos[index] = e.target.value;
                    setEditData({...editData, todos: newTodos});
                  }}
                  className="flex-1 p-1 border rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newTodos = editData.todos.filter((_, i) => i !== index);
                    setEditData({...editData, todos: newTodos});
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex gap-1 mt-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add new todo"
                className="flex-1 p-1 border rounded text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  if (newTodo.trim()) {
                    setEditData({...editData, todos: [...editData.todos, newTodo.trim()]});
                    setNewTodo('');
                  }
                }}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
              >
                +
              </button>
            </div>
          </div>
          <textarea
            value={editData.notes}
            onChange={(e) => setEditData({...editData, notes: e.target.value})}
            className="w-full p-2 border rounded h-20"
            placeholder="Notes..."
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Save</button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-3 py-1 rounded text-sm">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 w-full">
      {imageUrls && imageUrls.length > 0 && (
        <div className="mb-4 relative">
          <img 
            src={imageUrls[currentImageIndex]} 
            alt="Journal entry" 
            className="w-full h-40 object-cover rounded-lg" 
          />
          {imageUrls.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
              >
                ←
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
              >
                →
              </button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {currentImageIndex + 1} / {imageUrls.length}
              </div>
            </>
          )}
        </div>
      )}
      
      <div className="mb-3">
        <p className="text-sm text-gray-500">Date: {date}</p>
        <p className="text-sm text-pink-600 font-medium">{trimester}</p>
      </div>
      
      {todos && todos.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Todos:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {todos.slice(0, 3).map((todo, index) => (
              <li key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={completedTodos[index]}
                  onChange={(e) => {
                    const newCompleted = [...completedTodos];
                    newCompleted[index] = e.target.checked;
                    setCompletedTodos(newCompleted);
                    if (onToggleTodo) {
                      onToggleTodo(id, newCompleted);
                    } else {
                      onEdit(id, { date, trimester, todos, notes, completedTodos: newCompleted });
                    }
                  }}
                  className="mr-2 text-pink-500"
                />
                <span className={completedTodos[index] ? 'line-through text-gray-400' : ''}>
                  {todo}
                </span>
              </li>
            ))}
            {todos.length > 3 && (
              <li className="text-xs text-gray-400">+{todos.length - 3} more items</li>
            )}
          </ul>
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
        <p className="text-sm text-gray-600 line-clamp-3">{notes}</p>
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-400">
          {new Date(createdAt).toLocaleDateString()}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(id)}
            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalCard;