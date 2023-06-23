import { useEffect } from "react";
import welcomeAnimation from "assets/lottie/welcome.json";
import lottie from "lottie-web/build/player/lottie_light";
import Logger from "lib/logger";
import "../../../../../../misc/PersonaSurvey/index.css";
import { Typography } from "antd";

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
    <div className="persona-survey-banner">
      <Typography.Title className="onboarding-banner-title">Welcome to Requestly!</Typography.Title>
      <Typography.Paragraph className="survey-banner-subtitle">
        Help us personalise your experience by answering the following questionnaire
      </Typography.Paragraph>
      <div className="survey-lottie-animation-container">
        <div className="survey-lottie-animation" id="PersonaSurvey-welcomeAnimation" />
      </div>
      <div className="survey-banner-footer">😄 We are excited to see you here </div>
    </div>
  );
};
