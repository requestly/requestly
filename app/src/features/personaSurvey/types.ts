import { ReactNode } from "react";

export interface UserPersona {
  page: number | SurveyPage;
  isSurveyCompleted: boolean;
  persona: string | OtherOption;
  referralChannel?: string;
  useCases?: string[];
  numberOfEmployees?: string;
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
  subTitle?: string;
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
  FRONTEND = "Front-End Developer",
  BACKEND = "Back-End Developer",
  FOUNDER = "Founder/CEO",
  MANAGER = "Engineering Lead/Manager",
  IT = "IT Procurement/Administrator",
  QUALITY = "QA Engineer",
  PRODUCT = "Product Manager",
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
