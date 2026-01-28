import { Diagnostic, linter } from "@codemirror/lint";
import * as eslint from "eslint-linter-browserify";
import { getOffsetFromLocation } from "../utils";

const eslintLinter = new eslint.Linter();

const eslintConfig = {
  rules: {
    "no-undef": "off",
    "no-unreachable": "warn",
    "no-dupe-keys": "error",
    "no-unused-vars": "warn",
  },
} as const;

export function javascriptLinter() {
  return linter((view) => {
    const text = view.state.doc.toString();
    if (!text.trim()) return [];

    const messages = eslintLinter.verify(text, eslintConfig as any, { filename: "script.js" });

    return messages.map((msg: any) => {
      const line = msg.line ?? 1;
      const column = msg.column ?? 1;
      const endLine = msg.endLine ?? line;
      const endColumn = msg.endColumn ?? column + 1;

      const from = getOffsetFromLocation(view.state.doc, line, column);
      const to = getOffsetFromLocation(view.state.doc, endLine, endColumn);

      const severity: Diagnostic["severity"] = msg.severity === 1 ? "warning" : "error";

      return {
        from,
        to,
        severity,
        message: msg.message,
      } as Diagnostic;
    });
  });
}
