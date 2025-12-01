import { EditorView } from "@codemirror/view";
import {
  analyzeScriptImports,
  generateRequireStatement,
  getDefaultVariableName,
  isPackageImported,
} from "./scriptImportUtils";
import { ExternalPackage } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/scriptExecutionWorker/globals/packageTypes";

export interface InsertImportResult {
  success: boolean;
  message: string;
  alreadyImported?: boolean;
}

export function insertImportStatement(view: EditorView | undefined, pkg: ExternalPackage): InsertImportResult {
  if (!view) {
    return {
      success: false,
      message: "Editor not available",
    };
  }

  const currentCode = view.state.doc.toString();

  if (isPackageImported(currentCode, pkg.id)) {
    return {
      success: false,
      message: `${pkg.name} is already imported`,
      alreadyImported: true,
    };
  }

  const variableName = getDefaultVariableName(pkg.id, pkg);
  const importStyle = pkg.defaultImportStyle || "default";
  const requireStatement = generateRequireStatement(pkg.id, variableName, importStyle);

  const analysis = analyzeScriptImports(currentCode);

  let insertPosition: number;
  let insertText: string;

  if (analysis.hasRequires) {
    insertPosition = analysis.lastRequireEnd;

    const afterLastRequire = currentCode.slice(insertPosition, insertPosition + 2);
    const hasNewlineAfter = afterLastRequire.startsWith("\n");

    if (hasNewlineAfter) {
      insertText = "\n" + requireStatement;
    } else {
      insertText = "\n" + requireStatement;
    }
  } else {
    insertPosition = 0;

    const leadingMatch = currentCode.match(/^(\s*)/);
    if (leadingMatch && leadingMatch[1]) {
      insertPosition = leadingMatch[1].length;
    }

    const hasContent = currentCode.trim().length > 0;
    if (hasContent) {
      const restOfCode = currentCode.slice(insertPosition);
      const startsWithNewline = restOfCode.startsWith("\n");
      insertText = requireStatement + (startsWithNewline ? "\n" : "\n\n");
    } else {
      insertText = requireStatement + "\n";
    }
  }

  const transaction = view.state.update({
    changes: {
      from: insertPosition,
      to: insertPosition,
      insert: insertText,
    },
    selection: {
      anchor: insertPosition + insertText.length,
    },
  });

  view.dispatch(transaction);
  view.focus();

  return {
    success: true,
    message: `Added ${pkg.name}`,
  };
}

export function createPackageSelectHandler(
  editorView: EditorView | undefined,
  onSuccess?: (pkg: ExternalPackage, result: InsertImportResult) => void,
  onError?: (pkg: ExternalPackage, result: InsertImportResult) => void
) {
  return (pkg: ExternalPackage) => {
    const result = insertImportStatement(editorView, pkg);

    if (result.success) {
      onSuccess?.(pkg, result);
    } else {
      onError?.(pkg, result);
    }
  };
}
