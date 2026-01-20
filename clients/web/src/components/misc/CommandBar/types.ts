import { Rule } from "@requestly/shared/types/entities/rules";
import { ReactNode } from "react";

export enum CommandItemType {
  DIVIDER,
  GROUP,
}

export enum Page {
  HOME = "Home",
  NEW_RULES = "New Rule",
  MY_RULES = "My Rules",
}

export interface CommandBarItem {
  id: string; // Unique, Id is used for searching
  type?: CommandItemType;
  icon?: ReactNode;
  title: ReactNode | string | ((props: TitleProps) => ReactNode | string);
  data?: any; // Maybe add more content in future
  children?: CommandBarItem[];
  action?: (props: ActionProps) => void;
  nextPage?: Page;
}

export interface PageConfig {
  id: Page;
  items: CommandBarItem[];
  itemsFetcher?: ({ rules }: any) => CommandBarItem[];
}

export interface TitleProps {
  user?: any;
  appMode?: string;
  rules?: any;
  num_sessions?: number;
}

export interface ActionProps {
  navigate?: any;
  dispatch?: any;
  user?: any;
  appMode?: string;
  rules?: Rule[];
}
