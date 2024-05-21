import React from "react";
import { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";
import Logger from "lib/logger";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  animationName: string;
  animationData: unknown;
  loop?: boolean;
}

const LottieAnimation: React.FC<Props> = ({ animationName, animationData, loop = true, ...props }) => {
  const lottieContainerRef = useRef();

  useEffect(() => {
    try {
      lottie.destroy(animationName);
      lottie.loadAnimation({
        name: animationName,
        container: lottieContainerRef.current,
        animationData: animationData,
        renderer: "svg", // "canvas", "html"
        loop, // boolean
        autoplay: true, // boolean
      });
    } catch (e) {
      Logger.log("Failed to load animation", animationName, e);
    }
  }, [animationName, animationData, loop]);

  return <div {...props} ref={lottieContainerRef} />;
};

export default LottieAnimation;
