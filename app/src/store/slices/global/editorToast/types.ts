export interface EditorToastState {
  editorToast: {
    [key: string]: {
      id?: string;
      message?: string;
      type?: string;
      autoClose?: number;
      scriptId?: string;
    };
  };
}
