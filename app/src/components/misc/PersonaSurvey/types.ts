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
  skip?: boolean; // If skip true then don't show the page in survey
  render?: QuestionnaireType | (() => ReactNode);
}

export interface SurveyOptionsConfig {
  action?: (dispatch: any, value: string, doClear: boolean) => void;
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

export const OldSurveyPageMap = {
  0: SurveyPage.GETTING_STARTED,
  1: SurveyPage.PERSONA,
  2: SurveyPage.RECOMMENDATIONS,
};
