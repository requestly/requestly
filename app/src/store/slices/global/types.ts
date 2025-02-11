import { EditorToastState } from "./editorToast/types";
import { GlobalModals } from "./modals/types";

export interface GlobalSliceState {
  activeModals: GlobalModals;
  editorToast: EditorToastState["editorToast"];
  [key: string]: any;
}
