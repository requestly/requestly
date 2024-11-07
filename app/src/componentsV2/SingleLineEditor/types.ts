import React from "react";

export interface Position {
  x: number;
  y: number;
}

export interface HighlightConfig {
  definedVariableClass?: string;
  undefinedVariableClass?: string;
  pattern?: RegExp;
  extractVariable?: (matchedVariable: string) => string;
}

export interface RQSingleLineEditorProps {
  editorRef?: React.RefObject<HTMLDivElement>;
  defaultValue?: string;
  className?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  onPressEnter?: (event: KeyboardEvent, text: string) => void;
  onBlur?: (text: string) => void;
  variables?: Record<string, any>;
  highlightConfig?: HighlightConfig;
  renderPopover?: (props: { variable: string; position: Position; variables?: Record<string, any> }) => React.ReactNode;
}
