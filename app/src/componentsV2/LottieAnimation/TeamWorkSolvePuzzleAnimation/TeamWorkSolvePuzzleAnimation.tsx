import React from "react";
import animationData from "./teamwork-solve-puzzle.json";
import LottieAnimation from "../LottieAnimation";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  animationName: string;
}

const TeamWorkSolvePuzzleAnimation: React.FC<Props> = (props) => {
  return <LottieAnimation animationData={animationData} {...props} />;
};

export default TeamWorkSolvePuzzleAnimation;
