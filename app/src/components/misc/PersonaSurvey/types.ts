import { ReactNode } from "react";

export interface Option {
  type: string;
  title: string;
  icon?: string | ReactNode;
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

export interface ActiveProps {
  persona?: string;
  referralChannel?: string;
  useCase?: string[];
  title: string;
}

export interface Feature {
  id: string;
  title: string;
  icon: () => ReactNode | ReactNode;
  description: string;
  action: (navigate: any) => void;
}

export enum SurveyConstants {
  FRONTEND = "Front end developer",
  BACKEND = "Back end developer",
  MARKETER = "Product manager",
  FOUNDER = "Founder",
  QUALITY = "QA engineer",
  PRODUCT = "Digital Marketer",
}
