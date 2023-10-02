import React from "react";

export enum FeatureReleaseTag {
  NEW = "NEW",
  BETA = "BETA",
}

export type Feature = {
  id: string;
  icon: React.FC;
  title: string;
  subTitle: string;
  link?: string;
  disabled?: boolean;
  tag?: FeatureReleaseTag;
};

export type FeatureSection = {
  section: string;
  features: Feature[];
};
