import React from "react";
import animationData from "./team-wide.json";
import LottieAnimation from "../LottieAnimation";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  animationName: string;
}

const TeamWideAnimation: React.FC<Props> = (props) => {
  return <LottieAnimation animationData={animationData} {...props} />;
};

export default TeamWideAnimation;
