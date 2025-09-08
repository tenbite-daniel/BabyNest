"use client";

import React, { useState } from "react";

interface JournalFormProps {
    onSubmit: (data: any) => void;
}

const JournalForm: React.FC<JournalFormProps> = ({ onSubmit }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [trimester, setTrimester] = useState("");
    const [todos, setTodos] = useState<string[]>([]);
    const [newTodo, setNewTodo] = useState("");
    const [notes, setNotes] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                setImages(prev => [...prev, file]);
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };


    const addTodo = () => {
        if (newTodo.trim()) {
            setTodos([...todos, newTodo.trim()]);
            setNewTodo("");
        }
    };

    const removeTodo = (index: number) => {
        setTodos(todos.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ date, trimester, todos, notes, images });
        setDate("");
        setTrimester("");
        setTodos([]);
        setNotes("");
        setImages([]);
        setImagePreviews([]);

    };

    return (
        <section className="bg-pink-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-center mb-4">
                My Journal
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-2">How far along are you?</p>
                        <div className="flex gap-2 mb-4">
                            {["1st trimester", "2nd trimester", "3rd trimester"].map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setTrimester(option)}
                                    className={`px-3 py-1 rounded-md text-sm ${
                                        trimester === option
                                            ? "bg-pink-500 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        <div className="mb-4">
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                    placeholder="Add todo item"
                                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={addTodo}
                                    className="bg-pink-500 text-white px-3 py-2 rounded-md text-sm hover:bg-pink-600"
                                >
                                    Add
                                </button>
                            </div>
                            <ul className="space-y-1">
                                {todos.map((todo, index) => (
                                    <li key={index} className="flex justify-between items-center bg-white p-2 rounded text-sm">
                                        <span>{todo}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeTodo(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                rows={4}
                                placeholder="Add your notes here..."
                            />
                        </div>
                    </div>

                    <div className="lg:w-48 bg-gray-100 p-4 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="w-full text-sm"
                        />
                        <div className="mt-2 space-y-2">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-md border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600"
                    >
                        Save Entry
                    </button>
                </div>
            </form>
        </section>
    );
};

export default JournalForm;
