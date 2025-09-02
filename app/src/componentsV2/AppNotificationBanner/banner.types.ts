import { ButtonType } from "antd/lib/button";

export enum BANNER_TYPE {
  WARNING = "warning",
}

export type BannerActionConfig = {
  label: string;
  type: ButtonType;
  onClick: () => void;
};

export enum BANNER_ACTIONS {
  UPGRADE = "upgrade",
  CLAIM_NOW = "claim_now",
  CONTACT_US = "contact_us",
  REQUEST_ACCESS = "request_access",
  REDIRECT_TO_ACCELERATOR_FORM = "redirect_to_accelerator_form",
  CONVERT_TO_ANNUAL_PLAN = "convert_to_annual_plan",
  SEE_PLANS = "see_plans",
  REDIRECT_TO_CHROME_STORE_REVIEWS = "redirect_to_chrome_store_reviews",
  REDIRECT_TO_LINKEDIN_FORM = "redirect_to_linkedin_form",
  REDIRECT_TO_NOTION_PAGE = "redirect_to_notion_page",
}

export enum BANNER_ID {
  ACCELERATOR_PROGRAM = "accelerator_program",
  COMMERCIAL_LICENSE = "commercial_license",
  REQUEST_TEAM_ACCESS = "request_team_access",
  BLACK_FRIDAY = "black_friday",
  CONVERT_TO_ANNUAL_PLAN = "convert_to_annual_plan",
  BILLING_TEAM_PLAN_REMINDER = "billing_team_plan_reminder",
  CHROME_STORE_REVIEWS = "chrome_store_reviews",
  SHARE_ON_LINKEDIN = "share_on_linkedin",
}

export interface Banner {
  id: string;
  short_text?: string; //Banner badge
  text: string; // Banner text
  cta?: string;
  createdTs: number;
  backgroundColor: string;
  badgeColor?: string;
  isDismissable?: boolean;
  actions?: BANNER_ACTIONS[];
  type?: BANNER_TYPE;
}
