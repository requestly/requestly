export const removeToastForEditor = (prevState, action) => {
  console.log("removeToastForEditor", action);
  const editorId = action.payload.id;
  console.log("prevState.editorToast", prevState.editorToast);
  const newEditorToast = { ...prevState.editorToast };
  delete newEditorToast[editorId];
  return {
    ...prevState,
    editorToast: newEditorToast,
  };
};

export const triggerToastForEditor = (prevState, action) => {
  console.log("triggerToastForEditor", action);
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

/* selector */
export const getToastForEditor = (state, id) => {
  return state.global.editorToast[id];
};

export const getAllEditorToast = (state) => {
  return state.global.editorToast;
};
