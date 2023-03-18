import { ReactNode } from "react";

export interface Option {
  type?: string;
  title: string;
  icon?: string | ReactNode;
}

export interface Conditional {
  condition: (answer: string) => boolean;
  options: Option[];
}
interface renderProps {
  toggleImportRulesModal?: () => void;
  persona?: string;
}
export interface PageConfig {
  pageId: number;
  title: string;
  subTitle: string;
  render?: number | ((props: renderProps) => ReactNode);
}

export interface SurveyOptionsConfig {
  key: string;
  questionType: "single" | "multiple";
  isActive?: (props: ActiveProps) => boolean;
  action?: (
    dispatch: any,
    value: string,
    clear: boolean,
    optionType?: string
  ) => void;
  conditional?: any;
  options?: Option[];
}

export interface multipleChoiceOption {
  optionType: "select" | "other";
  value: "string";
}
export interface ActiveProps {
  key: string | multipleChoiceOption[];
  title: string;
  optionType?: "select" | "other";
}

export interface Feature {
  id: string;
  title: string;
  icon: () => ReactNode | ReactNode;
  description: string;
  action: (navigate: any) => void;
}

export enum PersonaType {
  FRONTEND = "Front-end developer",
  BACKEND = "Back-end developer",
  MARKETER = "Digital Marketer",
  FOUNDER = "Founder",
  QUALITY = "QA engineer",
  PRODUCT = "Product manager",
}
