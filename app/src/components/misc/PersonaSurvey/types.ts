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
  action?: (dispatch: any, value: string) => void;
  conditional?: Conditional[];
  options?: Option[];
}

export interface FooterProps {
  page: number;
  handleNextPage: () => void;
}

export enum SurveyConstants {
  FRONTEND = "💻 Front end developer",
  BACKEND = "⌨️ Back end developer",
  MARKETER = "🖌 Product manager",
  FOUNDER = "👑 Founder",
  QUALITY = "🏗 QA engineer",
  PRODUCT = "📈 Digital Marketer",
}
