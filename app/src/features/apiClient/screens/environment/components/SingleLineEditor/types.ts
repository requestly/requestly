import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";

export interface SingleLineEditorProps {
  defaultValue?: string;
  className?: string;
  onChange: (value: string) => void;
  onPaste?: (pastedValue: string) => boolean;
  placeholder?: string;
  onPressEnter?: (event: KeyboardEvent, text: string) => void;
  onBlur?: (text: string) => void;
  variables?: ScopedVariables;
}
