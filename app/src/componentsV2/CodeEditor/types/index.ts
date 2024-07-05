import { ReactNode } from "react";

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
