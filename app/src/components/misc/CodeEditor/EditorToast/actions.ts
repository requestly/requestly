import EditorToastOverlay, { toastType } from ".";

type toastFunction = (id: string, message: string, autoClose?: number) => void;

interface IEditorToast {
  success: toastFunction;
  error: toastFunction;
  info: toastFunction;
  warning: toastFunction;
}

const editorToOverlayIdMap: Record<string, EditorToastOverlay> = {};

export const editorToast: IEditorToast = {
  success: (id: string, message: string, autoClose?: number) => {
    const widget = getEditorOverlayWidget(id);
    if (!widget) {
      console.error("EditorToastOverlay not found for id: ", id);
      return;
    }
    widget.show({
      message,
      type: toastType.SUCCESS,
      autoClose,
      closable: true,
    });
  },
  error: (id: string, message: string, autoClose?: number) => {
    const widget = getEditorOverlayWidget(id);
    if (!widget) {
      console.error("EditorToastOverlay not found for id: ", id);
      return;
    }
    widget.show({
      message,
      type: toastType.ERROR,
      autoClose,
      closable: true,
    });
  },
  info: (id: string, message: string, autoClose?: number) => {
    const widget = getEditorOverlayWidget(id);
    if (!widget) {
      console.error("EditorToastOverlay not found for id: ", id);
      return;
    }
    widget.show({
      message,
      type: toastType.INFO,
      autoClose,
      closable: true,
    });
  },
  warning: (id: string, message: string, autoClose?: number) => {
    const widget = getEditorOverlayWidget(id);
    if (!widget) {
      console.error("EditorToastOverlay not found for id: ", id);
      return;
    }
    widget.show({
      message,
      type: toastType.WARNING,
      autoClose,
      closable: true,
    });
  },
};

export function getEditorOverlayWidget(id: string, createIfNotExists: boolean = false) {
  const widget = editorToOverlayIdMap[id];
  if (!widget && createIfNotExists) {
    console.log("Creating new EditorToastOverlay for id: ", id);
    return createEditorOverlayWidget(id);
  }
  return widget ?? null;
}

export function createEditorOverlayWidget(id: string) {
  const widget = new EditorToastOverlay(id);
  editorToOverlayIdMap[id] = widget;
  return widget;
}

export function removeEdtiroOverlayWidget(id: string) {
  delete editorToOverlayIdMap[id];
}
