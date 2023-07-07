import React from "react";
import animationData from "./invite-accept.json";
import LottieAnimation from "../LottieAnimation";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  animationName: string;
}

const InviteAcceptAnimation: React.FC<Props> = (props) => {
  return <LottieAnimation animationData={animationData} {...props} />;
};

export default InviteAcceptAnimation;
