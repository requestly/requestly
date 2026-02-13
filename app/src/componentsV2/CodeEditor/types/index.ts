import { RuleType } from "@requestly/shared/types/entities/rules";
import { MockType } from "components/features/mocksV2/types";
import { ReactNode } from "react";

export enum EditorLanguage {
  JAVASCRIPT = "javascript",
  JSON = "json",
  JSON5 = "json5",
  HTML = "html",
  XML = "xml",
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
  // Vendor-specific JSON types (e.g., application/vnd.api+json)
  { regex: /^application\/[\w.-]+\+json$/, language: EditorLanguage.JSON },

  // XML
  { regex: /^text\/xml$/, language: EditorLanguage.XML },
  { regex: /^application\/xml$/, language: EditorLanguage.XML },
  { regex: /^application\/soap\+xml$/, language: EditorLanguage.XML },
  // Vendor-specific XML types (Catch-all for anything ending in +xml, e.g., atom+xml)
  { regex: /^application\/[\w.-]+\+xml$/, language: EditorLanguage.XML },
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
