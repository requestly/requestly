import { MockType } from "components/features/mocksV2/types";
import { ReactNode } from "react";
import { RuleType } from "types";

export enum EditorLanguage {
  JAVASCRIPT = "javascript",
  JSON = "json",
  HTML = "html",
  CSS = "css",
}

export type EditorCustomToolbar = {
  title: string;
  options: ReactNode[];
};

export const getEditorLanguageFromContentType = (contentType: string): EditorLanguage => {
  if (!contentType) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return EditorLanguage.JSON;
  }

  if (contentType.includes("text/html")) {
    return EditorLanguage.HTML;
  }

  if (contentType.includes("application/javascript")) {
    return EditorLanguage.JAVASCRIPT;
  }

  if (contentType.includes("text/css")) {
    return EditorLanguage.CSS;
  }
};

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
