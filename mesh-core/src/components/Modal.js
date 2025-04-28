// mesh-core/src/components/Modal.js
import React from 'react';
import { useRouter } from 'next/router';

const Modal = ({ children, onClose }) => {
  const router = useRouter();

  // Close modal on clicking outside (optional)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle closing with Escape key
  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" // justify-end for sidebar on right
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-gray-800 w-1/3 h-full shadow-lg p-6 overflow-y-auto"> {/* w-1/3 for sidebar width */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Modal Content</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            &times; {/* Close button */}
          </button>
        </div>
        <div>
          {children} {/* Render content passed to modal */}
        </div>
      </div>
    </div>
  );
};

export default Modal;
