import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";

export interface SingleLineEditorProps {
  defaultValue?: string;
  className?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onPressEnter?: (event: KeyboardEvent, text: string) => void;
  onBlur?: (text: string) => void;
  onPaste?: (text: string) => boolean | void;
  variables?: ScopedVariables;
}
