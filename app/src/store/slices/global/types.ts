import { EditorToastState } from "./editorToast/types";
import { GlobalModals } from "./modals/types";
import { RulesState } from "./rules/types";

export interface GlobalSliceState {
  activeModals: GlobalModals;
  editorToast: EditorToastState["editorToast"];
  rules: RulesState;
  [key: string]: any;
}
