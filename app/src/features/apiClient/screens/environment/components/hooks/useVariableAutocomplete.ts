import { useState, useCallback, useMemo, useRef, RefObject } from "react";
import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { getClosingBraces } from "componentsV2/CodeEditor/components/EditorV2/plugins/generateAutoCompletions";

/**
 * Represents the current state of the autocomplete popup
 */
interface AutocompleteState {
  show: boolean; // Whether the autocomplete dropdown is visible
  position: { x: number; y: number }; // Screen coordinates where the popup should appear
  filter: string; // The text typed after '{{' used to filter variable suggestions
  from: number; // Starting position in the document where replacement should begin
  to: number; // Ending position in the document where replacement should end
}

/**
 * Options for configuring the variable autocomplete hook
 */
interface UseVariableAutocompleteOptions {
  editorViewRef?: RefObject<EditorView | null>; // Optional external editor view reference for cases where the editor is managed externally
}

/**
 * Custom React hook that provides intelligent variable autocomplete functionality for CodeMirror editors.
 *
 * Purpose:
 * - Enables IntelliSense-style suggestions when users type '{{' to reference environment variables
 * - Improves user experience by reducing errors and speeding up variable insertion
 * - Supports dynamic variables with '$' prefix
 *
 * How it works:
 * - Monitors editor input in real-time for the '{{' pattern
 * - Shows a popup with filtered variable suggestions
 * - Auto-completes selected variables with proper closing braces
 *
 * @param variables - The scoped variables available for autocomplete suggestions
 * @param options - Configuration options including optional external editor reference
 * @returns Object containing autocomplete state, handlers, and CodeMirror extension
 */
export const useVariableAutocomplete = (variables?: ScopedVariables, options?: UseVariableAutocompleteOptions) => {
  // Create internal ref to hold the editor view instance
  // This is used when no external ref is provided
  const internalEditorViewRef = useRef<EditorView | null>(null);

  // Use external ref if provided, otherwise use internal ref
  // This allows flexibility for both self-managed and externally-managed editors
  const editorViewRef = options?.editorViewRef || internalEditorViewRef;

  // Track the current state of the autocomplete popup
  // Initialized with default values when the popup is hidden
  const [autocompleteState, setAutocompleteState] = useState<AutocompleteState>({
    show: false,
    position: { x: 0, y: 0 },
    filter: "",
    from: 0,
    to: 0,
  });

  /**
   * CodeMirror extension that monitors document changes and cursor movement.
   *
   * Purpose:
   * - Detects when user types the '{{' pattern to trigger autocomplete
   * - Calculates the popup position based on cursor location
   * - Extracts the filter text to narrow down suggestions
   * - Automatically hides popup when pattern no longer matches
   *
   * Why useMemo?
   * - Extension creation is expensive and should only happen when dependencies change
   * - Prevents unnecessary re-renders and maintains stable reference
   */
  const autocompleteExtension = useMemo((): Extension => {
    return EditorView.updateListener.of((update) => {
      // Early exit if editor view is not available
      if (!editorViewRef.current) return;

      // Only process changes when document content changes or selection (cursor) moves
      if (update.docChanged || update.selectionSet) {
        // Hide autocomplete if editor loses focus
        // Why? User is likely interacting with something else and doesn't need suggestions
        if (!update.view.hasFocus) {
          if (autocompleteState.show) setAutocompleteState((prev) => ({ ...prev, show: false }));
          return;
        }

        // Get the full document text and current cursor position
        const doc = update.state.doc.toString();
        const cursorPos = update.state.selection.main.head;

        // Get all text before the cursor to search for the '{{' pattern
        const beforeCursor = doc.slice(0, cursorPos);

        // Match pattern: {{ followed by zero or more non-closing-brace characters
        // Example matches: "{{", "{{api", "{{user.name"
        // Does not match: "}} {{" (would only match the second {{)
        const match = beforeCursor.match(/\{\{([^}]*)$/);

        if (match) {
          // If the cursor is inside an already-closed variable (e.g., {{var}}),
          // do not show autocomplete to avoid overlapping popovers.
          const afterCursor = doc.slice(cursorPos);
          const nextClose = afterCursor.indexOf("}}");
          const nextOpen = afterCursor.indexOf("{{");
          const isInsideCompletedVariable = nextClose !== -1 && (nextOpen === -1 || nextClose < nextOpen);

          if (isInsideCompletedVariable) {
            if (autocompleteState.show) setAutocompleteState((prev) => ({ ...prev, show: false }));
            return;
          }

          // Pattern found - show autocomplete popup

          // Get screen coordinates at cursor position for popup placement
          const coords = update.view.coordsAtPos(cursorPos);
          if (coords) {
            setAutocompleteState({
              show: true,
              position: { x: coords.left, y: coords.bottom }, // Position below cursor
              filter: match[1] || "", // Text after '{{' used to filter suggestions
              from: cursorPos - (match[1]?.length || 0), // Start position (right after '{{')
              to: cursorPos, // End position (current cursor)
            });
          }
        } else {
          // Pattern not found - hide autocomplete
          setAutocompleteState((prev) => ({ ...prev, show: false }));
        }
      }
    });
  }, [autocompleteState.show, editorViewRef]);

  /**
   * Callback invoked when the CodeMirror editor is fully initialized.
   *
   * Purpose:
   * - Stores the editor view reference for later use in variable insertion
   * - Only sets internal ref if no external ref was provided
   *
   * @param view - The initialized CodeMirror EditorView instance
   */
  const handleEditorReady = useCallback(
    (view: EditorView) => {
      if (!options?.editorViewRef) {
        internalEditorViewRef.current = view;
      }
    },
    [options?.editorViewRef]
  );

  /**
   * Handles variable selection from the autocomplete popup.
   *
   * Purpose:
   * - Inserts the selected variable into the editor at the correct position
   * - Automatically adds closing '}}' braces if they're missing
   * - Adds '$' prefix for dynamic variables
   * - Positions cursor after the inserted text for continued editing
   *
   * @param variableKey - The variable name to insert (e.g., "apiKey" or "$dynamic")
   * @param isDynamic - Whether this is a dynamic variable requiring '$' prefix
   */
  const handleSelectVariable = useCallback(
    (variableKey: string) => {
      if (!editorViewRef.current) return;

      const view = editorViewRef.current;

      // Check if closing '}}' braces are needed
      // Why? Prevents duplicate braces if user already typed them
      const closingChars = getClosingBraces(view, autocompleteState.to);

      // Replace the text between 'from' and 'to' with the selected variable
      view.dispatch({
        changes: { from: autocompleteState.from, to: autocompleteState.to, insert: variableKey + closingChars },
        selection: { anchor: autocompleteState.from + variableKey.length + closingChars.length },
      });

      // Hide the autocomplete popup
      setAutocompleteState((prev) => ({ ...prev, show: false }));

      // Return focus to the editor for continued typing
      view.focus();
    },
    [autocompleteState.from, autocompleteState.to, editorViewRef]
  );

  /**
   * Manually closes the autocomplete popup.
   *
   * Purpose:
   * - Allows external components to hide the popup (e.g., on Escape key, click outside)
   * - Provides explicit control over popup visibility
   */
  const handleCloseAutocomplete = useCallback(() => {
    setAutocompleteState((prev) => ({ ...prev, show: false }));
  }, []);

  // Return all necessary values and handlers for the consuming component
  return {
    autocompleteState, // Current state of the autocomplete popup
    autocompleteExtension, // CodeMirror extension to monitor editor changes
    handleEditorReady, // Callback to initialize editor reference
    handleSelectVariable, // Handler for variable selection
    handleCloseAutocomplete, // Handler to close popup
    editorViewRef: internalEditorViewRef, // Editor view reference (for external access if needed)
  };
};
