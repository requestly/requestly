import React, { useEffect } from "react";
import { toastType } from ".";
import "./editorToast.scss";
interface IEditorToastProps {
  message: string;
  type: toastType;
  isVisible: boolean;
  autoClose?: number;
  onClose?: () => void;
}

export const EditorToastContainer: React.FC<IEditorToastProps> = ({ message, type, onClose, autoClose, isVisible }) => {
  console.log("EditorToastContainer", message, type, autoClose);
  //   const [isVisible, setIsVisible] = useState(true);

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
