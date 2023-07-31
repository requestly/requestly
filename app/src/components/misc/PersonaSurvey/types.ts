import { ReactNode } from "react";

export interface UserPersona {
  page: number | SurveyPage;
  isSurveyCompleted: boolean;
  persona: string;
  referralChannel?: string;
  useCases?: string[];
  numberOfEmployees?: string;
}

export interface Option {
  type?: string;
  title: string;
  icon?: string | ReactNode;
}

export interface PageConfig {
  page: number;
  pageId: SurveyPage;
  title: string;
  subTitle: string;
  /**
   *  If skip true then don't show the page in survey
   */
  skip?: boolean;
  render?: QuestionnaireType | (() => ReactNode);
}

export interface SurveyOptionsConfig {
  questionResponseAction?: (dispatch: any, value: string, doClear: boolean) => void;
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
}

export enum SurveyPage {
  GETTING_STARTED = "getting_started",
  PERSONA = "persona",
  RECOMMENDATIONS = "recommendations",
}
