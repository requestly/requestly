import { PayloadAction } from "@reduxjs/toolkit";
import { GlobalSliceState } from "store/slices/global/types";

interface toastOverlay {
  id: string;
  message?: string;
  type?: string;
  autoClose?: number;
  scriptId?: string;
}

export const removeToastForEditor = (
  prevState: GlobalSliceState,
  action: PayloadAction<{ id?: string; scriptId?: string }>
) => {
  const editorId = action.payload.id;
  const newEditorToast = { ...prevState.editorToast };
  delete newEditorToast[editorId];
  return {
    ...prevState,
    editorToast: newEditorToast,
  };
};

export const triggerToastForEditor = (
  prevState: GlobalSliceState,
  action: PayloadAction<{ id: string; message: string; type: string; toastOverlay?: toastOverlay }>
) => {
  const editorId = action.payload.id;
  const toastOverlay = action.payload.toastOverlay!;
  return {
    ...prevState,
    editorToast: {
      ...prevState.editorToast,
      [editorId]: toastOverlay,
    },
  };
};
