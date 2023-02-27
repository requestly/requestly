import { ReactNode } from "react";

export interface Option {
  title: string;
}

export interface PageConfig {
  pageId: number;
  title: string;
  subTitle: string;
  render?: ReactNode;
  action?: () => void;
  condition?: (answer: string) => Boolean;
  options?: Option[];
}

export interface FooterProps {
  page: number;
  handleNextPage: () => void;
}
