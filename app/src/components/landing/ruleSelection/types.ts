import { ReactElement } from "react";
import { RuleType } from "types/rules";

export type RuleTemplate = {
  name: string;
  link: string;
};

export type RuleUseCase = {
  src: string;
  title: string;
  logo?: string;
  description?: string;
};

export type RuleDemoVideo = {
  src: string;
  title: string;
  subtitle: string;
};

export type RuleFAQ = {
  logo?: string;
  link: string;
  answer?: string;
  question: string;
};

export type RuleDetail = {
  id: number;
  type: RuleType;
  name: string;
  subtitle: string;
  icon: ReactElement;
  header?: {
    description: string;
  };
  description: string;
  examples?: {
    templates?: RuleTemplate[];
    useCases?: RuleUseCase[];
  };
  image?: {
    src: string;
    link: string;
  };
  demoVideos?: RuleDemoVideo[];
  faqs?: RuleFAQ[];
};
