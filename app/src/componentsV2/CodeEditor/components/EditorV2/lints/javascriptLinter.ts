import { Diagnostic, linter } from "@codemirror/lint";
import { parse } from "@babel/parser";
import { getOffsetFromLocation } from "../utils";

function normalizeBabelMessage(error: any): string {
  if (!error || typeof error.message !== "string") return "Syntax error";
  return error.message;
}

export function javascriptLinter() {
  return linter((view) => {
    const text = view.state.doc.toString();
    if (!text.trim()) return [];

    try {
      parse(text, {
        sourceType: "unambiguous",
        // Scripts wrap user code in: return (async () => { userScript })();
        // This allows return statements within the script context.
        allowReturnOutsideFunction: true,
        plugins: [
          "jsx",
          "classProperties",
          "objectRestSpread",
          "optionalChaining",
          "nullishCoalescingOperator",
          "topLevelAwait",
        ],
      });

      return [];
    } catch (error: any) {
      const loc = error?.loc || {};
      const line = typeof loc.line === "number" ? loc.line : 1;
      // Babel columns are 0-based; our helper expects 1-based.
      const column = typeof loc.column === "number" ? loc.column + 1 : 1;

      const from = getOffsetFromLocation(view.state.doc, line, column);
      const to = Math.min(from + 1, view.state.doc.length);

      const diagnostic: Diagnostic = {
        from,
        to,
        severity: "error",
        message: normalizeBabelMessage(error),
      };

      return [diagnostic];
    }
  });
}
