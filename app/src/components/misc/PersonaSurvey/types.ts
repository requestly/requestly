import { ReactNode } from "react";

export interface Option {
  type: string;
  title: string;
}

interface Conditional {
  condition: (answer: string) => Boolean;
  options: Option[];
}

export interface PageConfig {
  pageId: number;
  title: string;
  subTitle: string;
  render?: ReactNode;
  action?: () => void;
  conditional?: Conditional[];
  options?: Option[];
}

export interface FooterProps {
  page: number;
  handleNextPage: () => void;
}
