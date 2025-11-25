import {
  autocompletion,
  Completion,
  CompletionResult,
  CompletionSource,
  insertCompletionText,
} from "@codemirror/autocomplete";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { ScopedVariables, ScopedVariable } from "features/apiClient/helpers/variableResolver/variable-resolver";

interface AutocompleteSetters {
  setShowAutocomplete: (show: boolean) => void;
  setAutocompleteQuery: (query: string) => void;
  setAutocompletePosition: (position: { x: number; y: number }) => void;
  setSelectedIndex: (index: number) => void;
  setAutocompleteRange: (range: { from: number; to: number } | null) => void;
  insertVariable: (view: EditorView, variableKey: string, range: { from: number; to: number }) => void;
}

/**
 * Creates a custom completion source that returns a set of suggestions
 * when the typed text matches a specified pattern.
 *
 * @param matchPattern A regular expression to identify when completions should appear.
 * @param completions An array of Completion items to display as suggestions.
 * @param lengthOfStartingChars Number of initial characters that remain untouched by the completion.
 * @returns A CompletionSource that provides suggestions whenever the text matches matchPattern.
 */
export function generateCompletionSource(
  matchPattern: RegExp,
  completions: Completion[],
  lengthOfStartingChars: number
): CompletionSource {
  return (context) => {
    const match = context.matchBefore(matchPattern);
    if (match) {
      return {
        from: match.from + lengthOfStartingChars,
        to: match.to,
        options: completions,
        filter: true,
      } as CompletionResult;
    }
    return null;
  };
}

// VARIABLE COMPLETIONS
function varCompletionSource(envVariables: ScopedVariables): CompletionSource {
  const varCompletions = Array.from(envVariables.entries()).map(([envId, [variable, source]]) => {
    return {
      label: envId,
      detail:
        variable.type === "secret"
          ? "•".repeat(String(variable.localValue ?? variable.syncValue).length)
          : ((variable.localValue ?? variable.syncValue) as string),
      type: variable.localValue ? "local variable" : "sync variable",
      apply: (view: EditorView, completion: Completion, from: number, to: number): void => {
        // Look ahead up to 10 characters, skip spaces, then check for and add closing braces
        const LOOK_AHEAD_BUFFER = 10;
        const lookahead = view.state.doc.sliceString(to, to + LOOK_AHEAD_BUFFER);
        const nextChars = lookahead.trimStart().slice(0, 2);
        const closingChars = nextChars.startsWith("}}") ? "" : nextChars.startsWith("}") ? "}" : "}}";
        const finalCompletion = completion.label + closingChars;
        view.dispatch(insertCompletionText(view.state, finalCompletion, from, to));
      },
    };
  });
  return generateCompletionSource(/\{\{.*?/g, varCompletions, 2);
}

/* NEW PLUGIN WITH CALLBACK-BASED PATTERN */
export function generateCompletionsWithPopover(setters: AutocompleteSetters, envVariables?: ScopedVariables) {
  if (!envVariables) return [];

  return ViewPlugin.fromClass(
    class {
      private view: EditorView;
      private selectedIndex = 0;
      private filteredVariables: [string, ScopedVariable][] = [];
      private currentRange: { from: number; to: number } | null = null;

      private updateFilteredVariables(query: string) {
        this.filteredVariables = Array.from(envVariables.entries()).filter(([key]) =>
          key.toLowerCase().includes(query.toLowerCase())
        );
        this.selectedIndex = 0; // Reset selection when filtering changes
        setters.setSelectedIndex(0);
      }

      private handleKeydown = (event: KeyboardEvent) => {
        if (this.filteredVariables.length === 0) return false;

        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            this.selectedIndex = (this.selectedIndex + 1) % this.filteredVariables.length;
            setters.setSelectedIndex(this.selectedIndex);
            return true;

          case "ArrowUp":
            event.preventDefault();
            this.selectedIndex = this.selectedIndex > 0 ? this.selectedIndex - 1 : this.filteredVariables.length - 1;
            setters.setSelectedIndex(this.selectedIndex);
            return true;

          case "Enter":
            event.preventDefault();
            if (this.filteredVariables[this.selectedIndex] && this.currentRange) {
              const [variableKey] = this.filteredVariables[this.selectedIndex];
              setters.insertVariable(this.view, variableKey, this.currentRange);
              setters.setShowAutocomplete(false);
            }
            return true;

          case "Escape":
            event.preventDefault();
            setters.setShowAutocomplete(false);
            return true;
        }

        return false;
      };

      private handleBlur = () => {
        // Small delay to allow popover clicks
        setTimeout(() => setters.setShowAutocomplete(false), 100);
      };

      constructor(view: EditorView) {
        this.view = view;
        view.dom.addEventListener("keydown", this.handleKeydown);
        view.dom.addEventListener("blur", this.handleBlur);
      }

      update(update: ViewUpdate) {
        // Pattern detection logic (moved from EditorView.updateListener)
        if (!update.docChanged && !update.selectionSet) return;

        const state = update.state;
        const pos = state.selection.main.head;

        // Check if we're in a {{...}} pattern
        const line = state.doc.lineAt(pos);
        const textBefore = line.text.slice(0, pos - line.from);
        const match = /\{\{([^{}]*)$/.exec(textBefore);

        if (match) {
          const query = match[1] || "";
          this.updateFilteredVariables(query);

          // Defer coordsAtPos call to avoid "Reading the editor layout isn't allowed during an update" error
          requestAnimationFrame(() => {
            const coords = this.view.coordsAtPos(pos);

            if (coords && this.filteredVariables.length > 0) {
              this.currentRange = {
                from: line.from + match.index,
                to: pos,
              };

              setters.setShowAutocomplete(true);
              setters.setAutocompleteQuery(query);
              setters.setAutocompletePosition({
                x: coords.left,
                y: coords.bottom + 2,
              });
              setters.setAutocompleteRange(this.currentRange);
            } else {
              setters.setShowAutocomplete(false);
              this.currentRange = null;
            }
          });
        } else {
          setters.setShowAutocomplete(false);
          this.currentRange = null;
        }
      }

      destroy() {
        setters.setShowAutocomplete(false);
        this.view.dom.removeEventListener("keydown", this.handleKeydown);
        this.view.dom.removeEventListener("blur", this.handleBlur);
      }
    }
  );
}

/* CORE PLUGIN */
export default function generateCompletionsForVariables(envVariables?: ScopedVariables) {
  const customCompletions = [];
  if (envVariables) {
    customCompletions.push(varCompletionSource(envVariables));
  }

  if (!customCompletions.length) return null;
  return autocompletion({
    activateOnTyping: true,
    override: customCompletions,
    tooltipClass: () => "popup-tooltip",
    optionClass: () => "popup-option",
  });
}
