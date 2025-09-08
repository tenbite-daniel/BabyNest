"use client";

import React, { useState } from "react";
import JournalForm from "../components/journal-form";
import Modal from "../components/Modal";
import { createJournalEntry } from "../lib/api";

const JournalFormPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  }>({ isOpen: false, title: "", message: "", type: "success" });

  // Function to handle form submission
  const handleJournalSubmit = async (data: any) => {
    try {
      const newEntry = await createJournalEntry(data);
      setEntries((prev) => [...prev, newEntry]);
      setModal({
        isOpen: true,
        title: "Success!",
        message: "Your journal entry has been saved successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to save journal:", error);
      setModal({
        isOpen: true,
        title: "Error!",
        message: "Failed to save your journal entry. Please try again.",
        type: "error",
      });
    }
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">My Journal</h1>
      {/* ✅ Pass the onSubmit prop */}
      <JournalForm onSubmit={handleJournalSubmit} />
      
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      <section className="mt-6 space-y-4">
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center">No entries yet. Write your first one!</p>
        ) : (
          entries.map((item, index) => (
            <div key={item._id || index} className="bg-white p-4 rounded-md shadow">
              <p className="text-gray-800">{item.notes}</p>
              <p className="text-sm text-gray-500">Date: {item.date}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default JournalFormPage;
