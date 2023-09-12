import { ReactNode } from "react";

export interface UserPersona {
  page: number | SurveyPage;
  isSurveyCompleted: boolean;
  persona: string;
  referralChannel?: string;
  useCases?: string[];
  numberOfEmployees?: string;
  industry?: string | OtherOption;
}

export type OtherOption = {
  type: "other";
  value: string;
};

export interface Option {
  type?: "other" | "select";
  title: string | null;
  icon?: string | ReactNode;
}

export interface Visibility {
  userPersona: UserPersona;
}
export interface PageConfig {
  page?: number;
  pageId: SurveyPage;
  title: string;
  subTitle: string;
  /**
   *  If skip true then don't show the page in survey
   */
  skip?: boolean;
  render?: QuestionnaireType | (() => ReactNode);
  visibility: ({ userPersona }: Visibility) => boolean;
}

export interface SurveyOptionsConfig {
  questionResponseAction?: (dispatch: any, value: string | OtherOption, doClear: boolean) => void;
  options?: Option[];
}

export enum PersonaType {
  FRONTEND = "Front-end developer",
  BACKEND = "Back-end developer",
  FULLSTACK = "Full-stack developer",
  MARKETER = "Digital Marketer",
  QUALITY = "QA engineer",
  PRODUCT = "Product manager",
  SALES = "Sales",
}

export enum QuestionnaireType {
  PERSONA = "persona",
  INDUSTRY = "industry",
}

export enum SurveyPage {
  GETTING_STARTED = "getting_started",
  PERSONA = "persona",
  INDUSTRY = "industry",
  RECOMMENDATIONS = "recommendations",
}
