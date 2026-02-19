import { useState, useCallback, useMemo, useRef, RefObject } from "react";
import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { getClosingBraces } from "componentsV2/CodeEditor/components/EditorV2/plugins/generateAutoCompletions";

interface AutocompleteState {
  show: boolean;
  position: { x: number; y: number };
  filter: string;
  from: number;
  to: number;
}

/**
 * Hook to manage variable autocompletion within a CodeMirror 6 editor.
 *
 * Behavior Summary:
 * - TRIGGERS: When user types '{{' or clicks into braces '{{...}}'.
 * - FILTERS: As the user types characters after '{{'.
 * - HIDES: When the cursor leaves the braces or when the editor loses focus.
 */
export const useVariableAutocomplete = (options?: { editorViewRef?: RefObject<EditorView | null> }) => {
  const internalEditorViewRef = useRef<EditorView | null>(null);
  const editorViewRef = options?.editorViewRef || internalEditorViewRef;

  const [autocompleteState, setAutocompleteState] = useState<AutocompleteState>({
    show: false,
    position: { x: 0, y: 0 },
    filter: "",
    from: 0,
    to: 0,
  });

  // Ref to always have latest state without recreating callbacks
  const autocompleteStateRef = useRef(autocompleteState);
  autocompleteStateRef.current = autocompleteState;

  /**
   * CodeMirror Extension: UpdateListener
   *
   * Listens to every editor change (typing, clicking, scrolling).
   * Wrapped in useMemo so the extension reference is stable, preventing
   * CodeMirror from re-configuring the editor unnecessarily on every render.
   */
  const autocompleteExtension = useMemo((): Extension => {
    return EditorView.updateListener.of((update) => {
      // Only re-calculate if the text changed OR the cursor (selection) moved
      if (update.docChanged || update.selectionSet) {
        // If editor loses focus, hide the popup to avoid "ghost" menus
        if (!update.view.hasFocus) {
          setAutocompleteState((prev) => (prev.show ? { ...prev, show: false } : prev));
          return;
        }

        const state = update.state;
        const cursorPos = state.selection.main.head;
        const docText = state.doc.toString();

        const textBefore = docText.slice(0, cursorPos);
        const textAfter = docText.slice(cursorPos);

        // Find the most recent '{{' before the cursor
        const lastOpen = textBefore.lastIndexOf("{{");

        if (lastOpen !== -1) {
          // Text between '{{' and the cursor (potential variable name)
          const filterText = textBefore.slice(lastOpen + 2);

          // 1. Is it closed behind us? (e.g., {{abc}} |) -> HIDE
          const isClosedBefore = filterText.includes("}}");

          // 2. Are we touching a brace boundary? (e.g., {{abc}}| or {{abc}|} ) -> HIDE
          const isAtTrailingBoundary = textBefore.endsWith("}");

          // 3. Look ahead for a closing '}}' belonging to this expression.
          const nextClose = textAfter.indexOf("}}");
          const nextOpen = textAfter.indexOf("{{");

          // isInsideBraces: There is a '}}' ahead, and no new '{{' starts before it.
          const isInsideBraces = nextClose !== -1 && (nextOpen === -1 || nextClose < nextOpen);

          let shouldShow = false;

          if (!isClosedBefore && !isAtTrailingBoundary) {
            if (isInsideBraces) {
              // Braces are closed: only show autocomplete if content is empty (e.g., {{|}}).
              // When populated (e.g., {{$random|}}), the "Variable Not Found" popover
              // handles that case instead.
              const wholeContent = (filterText + textAfter.slice(0, nextClose)).trim();
              shouldShow = wholeContent === "";
            } else {
              // No closing braces yet — user is typing a new variable (e.g., {{api|)
              shouldShow = true;
            }
          }

          if (shouldShow) {
            const coords = update.view.coordsAtPos(cursorPos);
            if (coords) {
              setAutocompleteState({
                show: true,
                position: { x: coords.left, y: coords.bottom },
                filter: filterText,
                from: lastOpen + 2,
                to: cursorPos,
              });
              return;
            }
          }
        }

        // Default: ensure popup is hidden if none of the 'show' conditions are met.
        setAutocompleteState((prev) => (prev.show ? { ...prev, show: false } : prev));
      }
    });
  }, []);

  const handleEditorReady = useCallback(
    (view: EditorView) => {
      if (!options?.editorViewRef) internalEditorViewRef.current = view;
    },
    [options?.editorViewRef]
  );

  /**
   * Inserts a selected variable into the document.
   * Uses a ref for state to avoid recreating the callback on every state change.
   */
  const handleSelectVariable = useCallback(
    (variableKey: string) => {
      const view = editorViewRef.current;
      if (!view) return;

      const { from, to } = autocompleteStateRef.current;
      const closingChars = getClosingBraces(view, to);

      view.dispatch({
        changes: {
          from,
          to,
          insert: variableKey + closingChars,
        },
        selection: {
          anchor: from + variableKey.length + closingChars.length,
        },
      });

      setAutocompleteState((prev) => ({ ...prev, show: false }));
      view.focus();
    },
    [editorViewRef]
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
