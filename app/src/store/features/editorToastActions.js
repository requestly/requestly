export const removeToastForEditor = (prevState, action) => {
  const editorId = action.payload.id;
  const newEditorToast = { ...prevState.editorToast };
  delete newEditorToast[editorId];
  return {
    ...prevState,
    editorToast: newEditorToast,
  };
};

export const triggerToastForEditor = (prevState, action) => {
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
