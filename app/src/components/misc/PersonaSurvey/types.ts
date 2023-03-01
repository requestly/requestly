import { ReactNode } from "react";

export interface Option {
  type: string;
  title: string;
}

interface Conditional {
  condition: (answer: string) => boolean;
  options: Option[];
}

export interface PageConfig {
  pageId: number;
  title: string;
  subTitle: string;
  render?: ReactNode;
  questionType?: "single" | "multiple";
  action?: (dispatch: any, value: string, clear: boolean) => void;
  isActive?: (props: ActiveProps) => boolean;
  conditional?: Conditional[];
  options?: Option[];
}

export interface FooterProps {
  page: number;
  handleNextPage: () => void;
}

export interface ActiveProps {
  persona?: string;
  referralChannel?: string;
  useCase?: string[];
  title: string;
}

export enum SurveyConstants {
  FRONTEND = "💻 Front end developer",
  BACKEND = "⌨️ Back end developer",
  MARKETER = "🖌 Product manager",
  FOUNDER = "👑 Founder",
  QUALITY = "🏗 QA engineer",
  PRODUCT = "📈 Digital Marketer",
}
