import { useEffect } from "react";
import welcomeAnimation from "assets/lottie/welcome.json";
import lottie from "lottie-web/build/player/lottie_light";
import Logger from "lib/logger";
import "./index.css";

export const GettingStartedWithSurvey = () => {
  useEffect(() => {
    try {
      lottie.destroy("PersonaSurvey-welcomeAnimation");
    } catch (_e) {
      Logger.log("loading welcome animation");
    }
    lottie.loadAnimation({
      name: "PersonaSurvey-welcomeAnimation",
      container: document.querySelector("#PersonaSurvey-welcomeAnimation"),
      animationData: welcomeAnimation,
      renderer: "svg", // "canvas", "html"
      loop: true, // boolean
      autoplay: true, // boolean
    });
  }, []);
  return (
    <div className="survey-lottie-animation-container">
      <div className="survey-lottie-animation" id="PersonaSurvey-welcomeAnimation" />
    </div>
  );
};
