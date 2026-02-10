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
    if (match || context.explicit) {
      return {
        from: match ? match.from + lengthOfStartingChars : context.pos,
        to: match ? match.to : context.pos,
        options: completions,
        filter: true,
      } as CompletionResult;
    }
    return null;
  };
}

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

/* CORE PLUGIN */
export default function generateCompletionsForVariables(
  envVariables?: ScopedVariables,
  suggestions?: Array<{ value: string }>
) {
  const customCompletions = [];

  if (suggestions && suggestions.length > 0) {
    const suggestionsCompletions = suggestions.map((suggestion) => ({
      label: suggestion.value,
    }));

    const suggestionsSource: CompletionSource = (context) => {
      const before = context.matchBefore(/.*/);
      return {
        from: before ? before.from : context.pos,
        options: suggestionsCompletions,
      };
    };

    customCompletions.push(suggestionsSource);
  }

  if (envVariables) {
    customCompletions.push(varCompletionSource(envVariables));
  }

  if (!customCompletions.length) return null;
  return autocompletion({
    override: customCompletions,
    tooltipClass: () => "cm-autocomplete-custom",
    optionClass: () => "cm-autocomplete-option-custom",
  });
}
