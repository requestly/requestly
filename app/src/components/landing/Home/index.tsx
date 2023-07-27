import React from "react";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { HomeV2 } from "./HomeV2";
import HomeV1 from "./HomeV1";

export const Home: React.FC = () => {
  const ecosystemExperiment = useFeatureValue("ecosystem-experiment", null);

  if (!ecosystemExperiment) return null;

  return <>{ecosystemExperiment === "ecosystem" ? <HomeV2 /> : <HomeV1 />}</>;
};
