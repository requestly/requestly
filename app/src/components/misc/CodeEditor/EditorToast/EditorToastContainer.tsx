import React, { useEffect } from "react";
import "./editorToast.scss";

export enum toastType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}
interface IEditorToastProps {
  message: string;
  type: toastType;
  isVisible: boolean;
  autoClose?: number;
  onClose?: () => void;
}

export const EditorToastContainer: React.FC<IEditorToastProps> = ({ message, type, onClose, autoClose, isVisible }) => {
  console.log("autoClose", autoClose);
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
