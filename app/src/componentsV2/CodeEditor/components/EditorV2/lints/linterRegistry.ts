import { Extension } from "@codemirror/state";
import { lintGutter } from "@codemirror/lint";
import { EditorLanguage } from "componentsV2/CodeEditor/types";
import { javascriptLinter } from "./javascriptLinter";
import { jsonLinter } from "./jsonLinter";

const linterRegistry = new Map<EditorLanguage, () => Extension[]>([
  [EditorLanguage.JAVASCRIPT, () => [lintGutter(), javascriptLinter()]],
  [EditorLanguage.JSON, () => [lintGutter(), jsonLinter()]],
  [EditorLanguage.JSON5, () => [lintGutter(), jsonLinter()]],
]);

export function getLinterExtension(language: EditorLanguage | null): Extension[] {
  if (!language) return [];

  const factory = linterRegistry.get(language);
  if (!factory) return [];

  return factory();
}

export { linterRegistry };
