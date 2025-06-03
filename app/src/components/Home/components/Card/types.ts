import React from "react";
import { DropDownProps } from "antd";

export enum CardType {
  RULES = "RULES",
  API_CLIENT = "API_CLIENT",
  API_MOCKING = "API_MOCKING",
}

export interface CardListItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  url?: string;
  type: unknown;
  modificationDate?: number;
}

export type EmptyCardOptions = {
  title: string;
  description: string;
  icon: string;
  features: string[];
  playDetails: { icon: React.ReactNode; label: string; url: string; onClick: () => void };
  primaryAction: React.ReactNode;
};

export type ImportOptions = {
  label: string;
  icon: string | React.ReactNode;
  menu: DropDownProps["menu"]["items"];
} | null;
