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
