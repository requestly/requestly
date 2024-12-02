import { MockType } from "components/features/mocksV2/types";
import { ReactNode } from "react";
import { RuleType } from "types";

export enum EditorLanguage {
  JAVASCRIPT = "javascript",
  JSON = "json",
  HTML = "html",
  CSS = "css",
}

const contentTypeToLanguageMap: { regex: RegExp; language: EditorLanguage }[] = [
  // HTML
  { regex: /^text\/html(\+.*)?$/, language: EditorLanguage.HTML },
  { regex: /^application\/xhtml\+xml$/, language: EditorLanguage.HTML },

  // JavaScript
  { regex: /^application\/javascript$/, language: EditorLanguage.JAVASCRIPT },
  { regex: /^text\/javascript$/, language: EditorLanguage.JAVASCRIPT },
  { regex: /^application\/ecmascript$/, language: EditorLanguage.JAVASCRIPT },
  { regex: /^text\/ecmascript$/, language: EditorLanguage.JAVASCRIPT },

  // CSS
  { regex: /^text\/css$/, language: EditorLanguage.CSS },

  // JSON
  { regex: /^application\/json$/, language: EditorLanguage.JSON },
  { regex: /^application\/manifest\+json$/, language: EditorLanguage.JSON },
  { regex: /^application\/ld\+json$/, language: EditorLanguage.JSON },
  { regex: /^text\/json$/, language: EditorLanguage.JSON },
];

export type EditorCustomToolbar = {
  title: string;
  options: ReactNode[];
};

export function getEditorLanguageFromContentType(contentType: string) {
  if (!contentType || typeof contentType !== "string") return null;

  const sanitizedContentType = contentType.split(";")[0].trim().toLowerCase();

  return contentTypeToLanguageMap.find((mapping) => mapping.regex.test(sanitizedContentType))?.language;
}

export type AnalyticEventProperties =
  | {
      source: "rule_editor";
      rule_type: RuleType;
    }
  | {
      source: "mocks";
      mock_type: MockType;
    }
  | {
      source: "api_client";
    }
  | { source: "traffic_table" }
  | Record<string, unknown>;
