import { Diagnostic, linter } from "@codemirror/lint";
import * as eslint from "eslint-linter-browserify";
import { Diagnostic as JsonDiagnostic, getLanguageService } from "vscode-json-languageservice";
import { TextDocument } from "vscode-languageserver-textdocument";
import { DiagnosticSeverity as JsonDiagnosticSeverity } from "vscode-languageserver-types";

const jsonLanguageService = getLanguageService({});

const eslintLinter = new eslint.Linter();

const eslintConfig = {
  rules: {
    "no-undef": "off",
    "no-unreachable": "warn",
    "no-dupe-keys": "error",
    "no-unused-vars": "warn",
  },
} as const;

function getOffsetFromLocation(doc: any, line: number, column: number): number {
  const totalLines = doc.lines;
  const clampedLine = Math.min(Math.max(line, 1), totalLines);
  const lineInfo = doc.line(clampedLine);
  const colIndex = Math.max(column - 1, 0);
  return lineInfo.from + colIndex;
}

export function jsonLinter() {
  const uri = "inmemory://request-body.json";

  return linter(async (view) => {
    const text = view.state.doc.toString();
    if (!text.trim()) return [];

    // Using jsonc to support comments
    // Trailing commas and single quotes for string literals will
    // be flagged as errors by the linter
    const document = TextDocument.create(uri, "jsonc", 0, text);
    const jsonDoc = jsonLanguageService.parseJSONDocument(document);
    const diagnostics: JsonDiagnostic[] = await jsonLanguageService.doValidation(document, jsonDoc);

    return diagnostics.map((d: JsonDiagnostic) => {
      const from = document.offsetAt(d.range.start);
      const to = document.offsetAt(d.range.end);

      const severity: Diagnostic["severity"] = d.severity === JsonDiagnosticSeverity.Warning ? "warning" : "error";

      return {
        from,
        to,
        severity,
        message: d.message,
      } as Diagnostic;
    });
  });
}

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
