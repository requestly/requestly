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
  key: string | null;
  subTitle: string;
  render?: ReactNode;
  questionType?: "single" | "multiple";
  action?: (
    dispatch: any,
    value: string,
    clear: boolean,
    optionType?: string
  ) => void;
  isActive?: (props: ActiveProps) => boolean;
  conditional?: Conditional[];
  options?: Option[];
}

export interface useCaseOptions {
  optionType: "select" | "other";
  value: "string";
}
export interface ActiveProps {
  key: string | useCaseOptions[];
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
