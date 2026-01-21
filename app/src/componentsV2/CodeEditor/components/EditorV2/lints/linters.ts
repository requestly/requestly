import { Diagnostic, linter } from "@codemirror/lint";
import * as ts from "typescript";
import { Diagnostic as JsonDiagnostic, getLanguageService } from "vscode-json-languageservice";
import { TextDocument } from "vscode-languageserver-textdocument";
import { DiagnosticSeverity as JsonDiagnosticSeverity } from "vscode-languageserver-types";

const jsonLanguageService = getLanguageService({});

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

    const fileName = "script.tsx";
    const result = ts.transpileModule(text, {
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        allowJs: true,
        checkJs: true,
        jsx: ts.JsxEmit.React,
        moduleResolution: ts.ModuleResolutionKind.Node10,
        noEmit: true,
      },
      fileName,
      reportDiagnostics: true,
    });

    const diagnostics = result.diagnostics || [];

    return diagnostics.map((diag) => {
      const start = diag.start ?? 0;
      const length = diag.length ?? 1;
      const message = ts.flattenDiagnosticMessageText(diag.messageText, "\n");

      const cmDiag: Diagnostic = {
        from: start,
        to: start + length,
        severity: "error",
        message,
      };

      return cmDiag;
    });
  });
}
