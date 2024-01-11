import React from "react";
import animationData from "./astronaut.json";
import LottieAnimation from "../LottieAnimation";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  animationName: string;
}

const AstronautAnimation: React.FC<Props> = (props) => {
  return <LottieAnimation animationData={animationData} {...props} />;
};

export default AstronautAnimation;
