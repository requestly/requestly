import React from "react";
import animationData from "./team-solving-puzzle.json";
import LottieAnimation from "../LottieAnimation";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  animationName: string;
}

const TeamSolvingPuzzleAnimation: React.FC<Props> = (props) => {
  return <LottieAnimation animationData={animationData} {...props} />;
};

export default TeamSolvingPuzzleAnimation;
