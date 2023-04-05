import React from "react";

export type Feature = {
  icon: React.FC;
  title: string;
  subTitle: string;
  link?: string;
};

export type FeatureSection = {
  section: string;
  features: Feature[];
};
