import { Diagnostic, linter } from "@codemirror/lint";
import JSON5 from "json5";
import * as ts from "typescript";
import { Diagnostic as JsonDiagnostic, getLanguageService } from "vscode-json-languageservice";
import { TextDocument } from "vscode-languageserver-textdocument";
import { DiagnosticSeverity as JsonDiagnosticSeverity } from "vscode-languageserver-types";

const jsonLanguageService = getLanguageService({});

function getOffsetFromLineCol(text: string, line: number, column: number): number {
  const lines = text.split(/\r?\n/);
  const l = Math.max(1, Math.min(line, lines.length));
  const c = Math.max(1, column);
  let offset = 0;
  for (let i = 0; i < l - 1; i++) {
    offset += lines[i].length + 1;
  }
  return offset + Math.min(c - 1, lines[l - 1]?.length ?? 0);
}

function extractErrorPosition(text: string, err: any): { from: number; to: number } | null {
  const line = err?.lineNumber || err?.line || err?.lineNo;
  const column = err?.columnNumber || err?.column || err?.col;
  if (typeof line === "number" && typeof column === "number") {
    const from = getOffsetFromLineCol(text, line, column);
    return { from, to: from + 1 };
  }

  const msg: string = String(err?.message || "");
  let m = msg.match(/line\s+(\d+)\s*(?:[, ]+column\s+(\d+))?/i);
  if (m) {
    const l = parseInt(m[1], 10) || 1;
    const c = m[2] ? parseInt(m[2], 10) : 1;
    const from = getOffsetFromLineCol(text, l, c);
    return { from, to: from + 1 };
  }

  m = msg.match(/position\s+(\d+)/i);
  if (m) {
    const posNum = Math.max(0, parseInt(m[1], 10) || 0);
    const from = Math.min(posNum, Math.max(0, text.length - 1));
    return { from, to: Math.min(from + 1, text.length) };
  }

  const from = Math.max(0, text.search(/\S|$/));
  return { from, to: Math.min(from + 1, text.length) };
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
