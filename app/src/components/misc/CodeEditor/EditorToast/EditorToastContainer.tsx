import React, { useEffect, useState } from "react";
import { toastType } from ".";

interface IEditorToastProps {
  message: string;
  type: toastType;
  autoClose?: number;
  onClose?: () => void;
}
// moving to this now
export const EditorToastContainer: React.FC<IEditorToastProps> = ({ message, type, onClose, autoClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose && onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`toast ${type}`}>
      <span>{message}</span>
      <button onClick={() => setIsVisible(false)}>x</button>
    </div>
  );
};
