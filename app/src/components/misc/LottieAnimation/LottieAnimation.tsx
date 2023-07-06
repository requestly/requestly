import React from "react";
import { useEffect, useRef } from "react";
import lottie from "lottie-web/build/player/lottie_light";
import Logger from "lib/logger";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  animationName: string;
  animationData: unknown;
}

const LottieAnimation: React.FC<Props> = ({ animationName, animationData, ...props }) => {
  const lottieContainerRef = useRef();

  useEffect(() => {
    try {
      lottie.destroy(animationName);
      lottie.loadAnimation({
        name: animationName,
        container: lottieContainerRef.current,
        animationData: animationData,
        renderer: "svg", // "canvas", "html"
        loop: true, // boolean
        autoplay: true, // boolean
      });
    } catch (e) {
      Logger.log("Failed to load animation", animationName, e);
    }
  }, [animationName, animationData]);

  return <div {...props} ref={lottieContainerRef} />;
};

export default LottieAnimation;
