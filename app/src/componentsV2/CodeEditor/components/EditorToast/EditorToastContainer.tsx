import React, { useEffect } from "react";
import "./editorToast.scss";
import { ToastType } from "./types";

interface IEditorToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  autoClose?: number;
  onClose?: () => void;
}

export const EditorToastContainer: React.FC<IEditorToastProps> = ({ message, type, onClose, autoClose, isVisible }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        // setIsVisible(false);
        onClose && onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`editor-toast-container ${isVisible ? "" : `hidden-editor-toast`}`}>
      <div className={`editor-toast editor-toast-${type}`}>
        <span className="editor-toast-message">{message}</span>
        <button className="editor-toast-close" onClick={onClose}>
          x
        </button>
      </div>
    </div>
  );
};
