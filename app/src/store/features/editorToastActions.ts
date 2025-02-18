import { PayloadAction } from "@reduxjs/toolkit";

export const removeToastForEditor = (prevState: any, action: PayloadAction<{ id: string }>) => {
  const editorId = action.payload.id;
  const newEditorToast = { ...prevState.editorToast };
  delete newEditorToast[editorId];
  return {
    ...prevState,
    editorToast: newEditorToast,
  };
};

export const triggerToastForEditor = (
  prevState: any,
  action: PayloadAction<{
    id: string;
    message: string;
    type: string;
    autoClose?: number;
  }>
) => {
  const editorId = action.payload.id;
  const toastOverlay = action.payload;
  return {
    ...prevState,
    editorToast: {
      ...prevState.editorToast,
      [editorId]: toastOverlay,
    },
  };
};
