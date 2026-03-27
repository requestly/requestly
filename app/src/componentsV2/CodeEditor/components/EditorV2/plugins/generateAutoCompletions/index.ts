import {
  autocompletion,
  Completion,
  CompletionResult,
  CompletionSource,
  insertCompletionText,
} from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";

export function getClosingBraces(view: EditorView, to: number): string {
  const LOOK_AHEAD_BUFFER = 10;
  const lookahead = view.state.doc.sliceString(to, to + LOOK_AHEAD_BUFFER);
  const nextChars = lookahead.trimStart().slice(0, 2);
  return nextChars.startsWith("}}") ? "" : nextChars.startsWith("}") ? "}" : "}}";
}

export function applyVariableCompletion(view: EditorView, variableLabel: string, from: number, to: number): void {
  const closingChars = getClosingBraces(view, to);
  const finalCompletion = variableLabel + closingChars;
  view.dispatch(insertCompletionText(view.state, finalCompletion, from, to));
}

function varCompletionSource(envVariables: ScopedVariables): CompletionSource {
  const varCompletions = Object.keys(envVariables).map((key) => {
    const value = envVariables[key]!;
    const [variable] = value;

    const displayValue =
      variable.type === "secret"
        ? "\u0000a5".repeat(String(variable.localValue ?? variable.syncValue).length)
        : ((variable.localValue ?? variable.syncValue) as string);

    return {
      label: key,
      detail: displayValue,
      type: variable.localValue ? "local variable" : "sync variable",
      info: `${key}: ${displayValue}`,
      apply: (view: EditorView, completion: Completion, from: number, to: number): void => {
        applyVariableCompletion(view, completion.label, from, to);
      },
    };
  });

  return (context) => {
    const match = context.matchBefore(/\{\{.*?/);
    if (!match) return null;

    return {
      from: match.from + 2, // Offset for '{{'
      to: match.to,
      options: varCompletions,
      filter: true,
    } as CompletionResult;
  };
}

/**
 * CORE PLUGIN EXPORT
 */
export default function generateCompletionsForVariables(
  envVariables?: ScopedVariables,
  suggestions?: Array<{ value: string }>
) {
  const customCompletions: CompletionSource[] = [];

  // 1. Static Suggestions (e.g. Header keys)
  if (suggestions && suggestions.length > 0) {
    const suggestionsCompletions = suggestions.map((s) => ({
      label: s.value,
      info: s.value,
    }));

    const suggestionsSource: CompletionSource = (context) => {
      const before = context.matchBefore(/.*/);
      const text = before ? before.text : "";

      // If user starts typing a variable, hide the static suggestions
      if (text.includes("{{")) return null;

      return {
        from: before ? before.from : context.pos,
        options: suggestionsCompletions,
      };
    };
    customCompletions.push(suggestionsSource);
  }

  // 2. Variable Suggestions
  if (envVariables) {
    customCompletions.push(varCompletionSource(envVariables));
  }

  if (!customCompletions.length) return null;
  return autocompletion({
    override: customCompletions,
    tooltipClass: () => "cm-autocomplete-custom",
    optionClass: () => "cm-autocomplete-option-custom",
    addToOptions: [
      {
        render: (completion) => {
          const span = document.createElement("span");
          span.title = completion.label;
          span.style.position = "absolute";
          span.style.inset = "0";
          span.style.display = "block";
          span.setAttribute("aria-hidden", "true");
          return span;
        },
        position: 0,
      },
    ],
  });
}
