import React from "react";

export type Feature = {
  id: string;
  icon: React.FC;
  title: string;
  subTitle: string;
  link?: string;
  disabled?: boolean;
};

export type FeatureSection = {
  section: string;
  features: Feature[];
};
