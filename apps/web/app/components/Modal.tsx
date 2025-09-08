"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: "success" | "error";
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center mb-4">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
            type === "success" ? "bg-green-100" : "bg-red-100"
          }`}>
            {type === "success" ? (
              <span className="text-green-600 text-sm">✓</span>
            ) : (
              <span className="text-red-600 text-sm">✕</span>
            )}
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-gray-600 mb-4">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Modal;