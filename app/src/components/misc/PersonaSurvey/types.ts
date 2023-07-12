import { ReactNode } from "react";

export interface UserPersona {
  page: number;
  isSurveyCompleted: boolean;
  persona: string;
  referralChannel?: string;
  useCases: multipleChoiceOption[];
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
  key: string;
  questionType: "single" | "multiple";
  isActive?: (props: ActiveProps) => boolean;
  action?: (dispatch: any, value: string, clear: boolean, optionType?: string) => void;
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
