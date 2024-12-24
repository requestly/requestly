import { autocompletion, Completion, CompletionResult, CompletionSource } from "@codemirror/autocomplete";
import { EnvironmentVariables } from "backend/environment/types";

/**
 * CORE UNDERLYING GENERATOR FUNCTION
 *
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
    console.log(`DBG: ${matchPattern} context: `, context);
    const match = context.matchBefore(matchPattern);
    if (match) {
      return {
        from: lengthOfStartingChars,
        options: completions,
        filter: false,
      } as CompletionResult;
    }
  };
}

// VARIABLE COMPLETIONS
function varCompletionSource(envVariables: EnvironmentVariables): CompletionSource {
  const varCompletions = Object.keys(envVariables).map((key) => {
    return {
      label: key,
      detail: (envVariables[key].localValue ?? envVariables[key].syncValue) as string,
      type: envVariables[key].localValue ? "local variable" : "sync variable",
    } as Completion;
  });
  return generateCompletionSource(/\{\{.*?/g, varCompletions, 2);
}

/* CORE PLUGIN */
export default function generateAutoCompletions(
  envVariables?: EnvironmentVariables,
  extendedCompletions: CompletionSource | null = null
) {
  const customCompletions = [];
  if (envVariables) {
    customCompletions.push(varCompletionSource(envVariables));
  }

  if (extendedCompletions) {
    customCompletions.push(extendedCompletions);
  }

  if (!customCompletions.length) return null;
  return autocompletion({
    activateOnTyping: true,
    override: customCompletions,
  });
}
