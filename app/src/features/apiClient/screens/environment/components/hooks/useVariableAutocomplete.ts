import { useState, useCallback, useMemo, useRef, RefObject } from "react";
import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { getClosingBraces } from "componentsV2/CodeEditor/components/EditorV2/plugins/generateAutoCompletions";

/**
 * State object representing the UI and data requirements for the variable popup.
 */
interface AutocompleteState {
  show: boolean; // Control visibility of the suggestion dropdown
  position: { x: number; y: number }; // Screen coordinates for absolute positioning
  filter: string; // The partial variable name used to filter the suggestion list
  from: number; // Document position where the variable name starts (after '{{')
  to: number; // Current document position where the variable name ends
}

/**
 * Hook to manage variable autocompletion within a CodeMirror 6 editor.
 * * Behavior Summary:
 * - TRIGGERS: When user types '{{' or clicks into empty braces '{{}}'.
 * - FILTERS: As the user types characters after '{{'.
 * - HIDES: When the cursor leaves the braces, when the variable is already "populated"
 * (e.g., {{abc|}}), or when the editor loses focus.
 */
export const useVariableAutocomplete = (
  variables?: ScopedVariables,
  options?: { editorViewRef?: RefObject<EditorView | null> }
) => {
  // Use a local ref if an external one isn't provided to track the EditorView instance
  const internalEditorViewRef = useRef<EditorView | null>(null);
  const editorViewRef = options?.editorViewRef || internalEditorViewRef;

  const [autocompleteState, setAutocompleteState] = useState<AutocompleteState>({
    show: false,
    position: { x: 0, y: 0 },
    filter: "",
    from: 0,
    to: 0,
  });

  /**
   * CodeMirror Extension: UpdateListener
   * * This listens to every editor change (typing, clicking, scrolling).
   * We wrap it in useMemo so the extension reference is stable, preventing
   * CodeMirror from re-configuring the editor unnecessarily on every render.
   */
  const autocompleteExtension = useMemo((): Extension => {
    return EditorView.updateListener.of((update) => {
      if (!editorViewRef.current) return;

      // Only re-calculate if the text changed OR the cursor (selection) moved
      if (update.docChanged || update.selectionSet) {
        // Safety: If editor loses focus, we must hide the popup to avoid "ghost" menus
        if (!update.view.hasFocus) {
          setAutocompleteState((prev) => (prev.show ? { ...prev, show: false } : prev));
          return;
        }

        const state = update.state;
        const cursorPos = state.selection.main.head;
        const docText = state.doc.toString();

        // Split doc into context relative to cursor
        const textBefore = docText.slice(0, cursorPos);
        const textAfter = docText.slice(cursorPos);

        // Find the most recent '{{' before the cursor
        const lastOpen = textBefore.lastIndexOf("{{");

        if (lastOpen !== -1) {
          // Text between '{{' and the cursor (potential variable name)
          const filterText = textBefore.slice(lastOpen + 2);

          // VALIDATION LOGIC:

          // 1. Is it closed behind us? (e.g., {{abc}} |) -> HIDE
          const isClosedBefore = filterText.includes("}}");

          // 2. Are we touching a brace boundary? (e.g., {{abc}}| or {{abc}|} ) -> HIDE
          // This prevents the popup from showing when moving past variables.
          const isAtTrailingBoundary = textBefore.endsWith("}");

          // 3. Look ahead for a closing brace '}}' belonging to this expression.
          const nextClose = textAfter.indexOf("}}");
          const nextOpen = textAfter.indexOf("{{");

          // isInsidePopulated: There is a '}}' ahead, and no new '{{' starts before it.
          const isInsidePopulated = nextClose !== -1 && (nextOpen === -1 || nextClose < nextOpen);

          let shouldShow = false;

          // Process visibility if we aren't outside or at a boundary
          if (!isClosedBefore && !isAtTrailingBoundary) {
            if (isInsidePopulated) {
              /**
               * EDGE CASE: Handling existing braces
               * - Show if empty: {{|}}
               * - Hide if populated: {{abc|}}
               * We check if the combined content inside the braces is effectively empty.
               */
              const wholeContent = (filterText + textAfter.slice(0, nextClose)).trim();
              shouldShow = wholeContent === "";
            } else {
              /**
               * CASE: Typing a new variable (e.g., {{api|)
               * No closing braces exist yet, so we always show the suggestions.
               */
              shouldShow = true;
            }
          }

          if (shouldShow) {
            // Convert document position to screen coordinates (pixels)
            const coords = update.view.coordsAtPos(cursorPos);
            if (coords) {
              setAutocompleteState({
                show: true,
                position: { x: coords.left, y: coords.bottom },
                filter: filterText,
                from: lastOpen + 2, // The start of the replacement range
                to: cursorPos, // The end of the replacement range
              });
              return; // Exit listener; show state is handled
            }
          }
        }

        /**
         * DEFAULT: If none of the 'show' conditions are met, ensure popup is hidden.
         * Functional update (prev => ...) prevents unnecessary re-renders if show is already false.
         */
        setAutocompleteState((prev) => (prev.show ? { ...prev, show: false } : prev));
      }
    });
  }, [editorViewRef]);

  /**
   * Callback for the editor component to register its view instance.
   */
  const handleEditorReady = useCallback(
    (view: EditorView) => {
      if (!options?.editorViewRef) internalEditorViewRef.current = view;
    },
    [options?.editorViewRef]
  );

  /**
   * Core logic for inserting a selected variable into the document.
   * Handles both partial text replacement and smart brace closing.
   */
  const handleSelectVariable = useCallback(
    (variableKey: string) => {
      const view = editorViewRef.current;
      if (!view) return;

      // Determine if we need to append '}}' (avoids duplicates if cursor was in '{{}}')
      const closingChars = getClosingBraces(view, autocompleteState.to);

      view.dispatch({
        changes: {
          from: autocompleteState.from,
          to: autocompleteState.to,
          insert: variableKey + closingChars,
        },
        // Move the cursor to the end of the newly inserted variable string
        selection: {
          anchor: autocompleteState.from + variableKey.length + closingChars.length,
        },
      });

      // Cleanup: Hide popup and return focus to editor so user can keep typing
      setAutocompleteState((prev) => ({ ...prev, show: false }));
      view.focus();
    },
    [autocompleteState, editorViewRef]
  );

  /**
   * Allows manual closing of the popup (e.g., clicking outside or hitting Escape).
   */
  const handleCloseAutocomplete = useCallback(() => {
    setAutocompleteState((prev) => ({ ...prev, show: false }));
  }, []);

  return {
    autocompleteState, // Consumed by the UI popup component
    autocompleteExtension, // Consumed by the CodeMirror extension list
    handleEditorReady, // Consumed by the EditorV2 onReady prop
    handleSelectVariable, // Consumed by the suggestion list click handler
    handleCloseAutocomplete, // Consumed by global click-away listeners
    editorViewRef: internalEditorViewRef,
  };
};
