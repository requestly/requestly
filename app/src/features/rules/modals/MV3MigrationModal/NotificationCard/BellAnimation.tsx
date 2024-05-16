import React from "react";
import animationData from "./bell-animation.json";
import LottieAnimation from "componentsV2/LottieAnimation/LottieAnimation";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  animationName: string;
}

const BellAnimation: React.FC<Props> = (props) => {
  return <LottieAnimation animationData={animationData} {...props} />;
};

export default BellAnimation;
