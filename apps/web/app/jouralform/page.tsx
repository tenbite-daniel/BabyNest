import React from 'react';
import JournalForm from "../components/journal-form";

const JournalFormPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">My Journal</h1>
      <JournalForm />
      {/* Additional journal entries or content can be added here */}
    </div>
  );
};

export default JournalFormPage;