import { GlobalSliceState } from "store/slices/global/types";

interface toastOverlay {
  id: string;
  message?: string;
  type?: string;
  autoClose?: number;
  scriptId?: string;
}

interface Action {
  payload: toastOverlay & {
    toastOverlay?: toastOverlay;
  };
}

export const removeToastForEditor = (prevState: GlobalSliceState, action: Action) => {
  const editorId = action.payload.id;
  const newEditorToast = { ...prevState.editorToast };
  delete newEditorToast[editorId];
  return {
    ...prevState,
    editorToast: newEditorToast,
  };
};

export const triggerToastForEditor = (prevState: GlobalSliceState, action: Action) => {
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
