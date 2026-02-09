import { useState, useCallback, useMemo, useRef, RefObject } from "react";
import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { getClosingBraces } from "componentsV2/CodeEditor/components/EditorV2/plugins/generateAutoCompletions";

interface AutocompleteState {
  show: boolean;
  position: { x: number; y: number };
  filter: string;
  from: number;
  to: number;
}

interface UseVariableAutocompleteOptions {
  editorViewRef?: RefObject<EditorView | null>;
}

export const useVariableAutocomplete = (variables?: ScopedVariables, options?: UseVariableAutocompleteOptions) => {
  const internalEditorViewRef = useRef<EditorView | null>(null);
  const editorViewRef = options?.editorViewRef || internalEditorViewRef;

  const [autocompleteState, setAutocompleteState] = useState<AutocompleteState>({
    show: false,
    position: { x: 0, y: 0 },
    filter: "",
    from: 0,
    to: 0,
  });

  const autocompleteExtension = useMemo((): Extension => {
    return EditorView.updateListener.of((update) => {
      if (!editorViewRef.current) return;

      if (update.docChanged || update.selectionSet) {
        if (!update.view.hasFocus) {
          if (autocompleteState.show) setAutocompleteState((prev) => ({ ...prev, show: false }));
          return;
        }

        const doc = update.state.doc.toString();
        const cursorPos = update.state.selection.main.head;
        const beforeCursor = doc.slice(0, cursorPos);
        const match = beforeCursor.match(/\{\{([^}]*)$/);

        if (match) {
          const coords = update.view.coordsAtPos(cursorPos);
          if (coords) {
            setAutocompleteState({
              show: true,
              position: { x: coords.left, y: coords.bottom },
              filter: match[1] || "",
              from: cursorPos - (match[1]?.length || 0),
              to: cursorPos,
            });
          }
        } else {
          setAutocompleteState((prev) => ({ ...prev, show: false }));
        }
      }
    });
  }, [autocompleteState.show, editorViewRef]);

  const handleEditorReady = useCallback(
    (view: EditorView) => {
      if (!options?.editorViewRef) {
        internalEditorViewRef.current = view;
      }
    },
    [options?.editorViewRef]
  );

  const handleSelectVariable = useCallback(
    (variableKey: string) => {
      if (!editorViewRef.current) return;
      const view = editorViewRef.current;
      const closingChars = getClosingBraces(view, autocompleteState.to);
      view.dispatch({
        changes: { from: autocompleteState.from, to: autocompleteState.to, insert: variableKey + closingChars },
        selection: { anchor: autocompleteState.from + variableKey.length + closingChars.length },
      });
      setAutocompleteState((prev) => ({ ...prev, show: false }));
      view.focus();
    },
    [autocompleteState.from, autocompleteState.to, editorViewRef]
  );

  const handleCloseAutocomplete = useCallback(() => {
    setAutocompleteState((prev) => ({ ...prev, show: false }));
  }, []);

  return {
    autocompleteState,
    autocompleteExtension,
    handleEditorReady,
    handleSelectVariable,
    handleCloseAutocomplete,
    editorViewRef: internalEditorViewRef,
  };
};
