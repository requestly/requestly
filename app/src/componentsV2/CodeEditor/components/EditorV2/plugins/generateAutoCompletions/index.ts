import {
  autocompletion,
  Completion,
  CompletionResult,
  CompletionSource,
  insertCompletionText,
} from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";

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
  };
}

// Helper to calculate closing braces - exported for reuse
export function getClosingBraces(view: EditorView, to: number): string {
  const LOOK_AHEAD_BUFFER = 10;
  const lookahead = view.state.doc.sliceString(to, to + LOOK_AHEAD_BUFFER);
  const nextChars = lookahead.trimStart().slice(0, 2);
  return nextChars.startsWith("}}") ? "" : nextChars.startsWith("}") ? "}" : "}}";
}

// Helper to apply variable completion - exported for reuse
export function applyVariableCompletion(view: EditorView, variableLabel: string, from: number, to: number): void {
  const closingChars = getClosingBraces(view, to);
  const finalCompletion = variableLabel + closingChars;
  view.dispatch(insertCompletionText(view.state, finalCompletion, from, to));
}

// Variable pattern constant - exported for reuse
export const VARIABLE_COMPLETION_PATTERN = /\{\{.*?/g;
export const VARIABLE_PATTERN_OFFSET = 2; // Number of chars to skip from start ({{)

// VARIABLE COMPLETIONS
function varCompletionSource(envVariables: ScopedVariables): CompletionSource {
  const varCompletions = Object.keys(envVariables).map((key) => {
    const envId = key;
    const value = envVariables[key]!;
    const [variable] = value;
    return {
      label: envId.toString(),
      detail:
        variable.type === "secret"
          ? "•".repeat(String(variable.localValue ?? variable.syncValue).length)
          : ((variable.localValue ?? variable.syncValue) as string),
      type: variable.localValue ? "local variable" : "sync variable",
      apply: (view: EditorView, completion: Completion, from: number, to: number): void => {
        applyVariableCompletion(view, completion.label, from, to);
      },
    };
  });
  return generateCompletionSource(VARIABLE_COMPLETION_PATTERN, varCompletions, VARIABLE_PATTERN_OFFSET);
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
