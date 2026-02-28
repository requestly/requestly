import { ViewPlugin, EditorView, ViewUpdate } from "@codemirror/view";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";

interface VariableCompletionSetters {
  setShowCompletion: (show: boolean) => void;
  setCompletionPosition: (position: { x: number; y: number }) => void;
  setFilterText: (text: string) => void;
  // setCursorPosition: (pos: number) => void;
}

export const variableCompletionPlugin = (setters: VariableCompletionSetters, variables: ScopedVariables) => {
  return ViewPlugin.fromClass(
    class {
      private view: EditorView;
      private currentCompletion: {
        startPos: number;
        endPos: number;
        filterText: string;
      } | null = null;

      constructor(view: EditorView) {
        this.view = view;
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) {
          this.checkForCompletion();
        }
      }

      private checkForCompletion() {
        const state = this.view.state;
        const cursor = state.selection.main.head;
        const doc = state.doc.toString();

        // Find the nearest {{ before cursor
        let openBracePos = -1;
        const textBeforeCursor = doc.slice(0, cursor);

        // Find the last occurrence of {{ before cursor
        let lastOpenBrace = textBeforeCursor.lastIndexOf("{{");

        console.log("checkForCompletion", { state, cursor, doc, textBeforeCursor, lastOpenBrace });

        if (lastOpenBrace !== -1) {
          // Check if there's any }} or newline between {{ and cursor
          const textBetween = textBeforeCursor.slice(lastOpenBrace + 2);
          console.log({ textBetween });
          if (!textBetween.includes("}}") && !textBetween.includes("\n")) {
            openBracePos = lastOpenBrace + 2; // Position after {{
          }
        }
        console.log({ openBracePos });
        if (openBracePos !== -1) {
          // Check if we have }} after cursor (completion should close)
          const textAfterCursor = doc.slice(cursor);
          const closeBraceMatch = textAfterCursor.match(/^[^}]*}}/);
          console.log({ textAfterCursor, closeBraceMatch });
          if (closeBraceMatch) {
            // We found }}, close completion
            this.closeCompletion();
            return;
          }

          // Extract the filter text between {{ and cursor
          const filterText = doc.slice(openBracePos, cursor);

          // Only show completion if we don't have invalid characters
          console.log({ filterText });
          if (!/[{}]/.test(filterText)) {
            this.showCompletion(openBracePos, cursor, filterText);
            return;
          }
        }
        console.log("no valid completion context found");
        // No valid completion context found
        this.closeCompletion();
      }

      private showCompletion(startPos: number, endPos: number, filterText: string) {
        const coords = this.view.coordsAtPos(startPos);
        console.log("showCompletion", { startPos, endPos, filterText, coords });
        if (coords) {
          this.currentCompletion = { startPos, endPos, filterText };

          setters.setCompletionPosition({
            x: coords.left,
            y: coords.top,
          });
          setters.setFilterText(filterText);
          setters.setShowCompletion(true);
        }
      }

      private closeCompletion() {
        console.log("closeCompletion", this.currentCompletion);
        if (this.currentCompletion) {
          this.currentCompletion = null;
          setters.setShowCompletion(false);
        }
      }
    }
  );
};
