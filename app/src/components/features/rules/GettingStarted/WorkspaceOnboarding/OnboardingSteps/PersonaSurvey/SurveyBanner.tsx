import WelcomeAnimation from "components/misc/LottieAnimation/WelcomeAnimation";
import "components/misc/PersonaSurvey/index.css";
import { Typography } from "antd";

export const GettingStartedWithSurvey = () => {
  return (
    <div className="persona-survey-banner">
      <Typography.Title className="onboarding-banner-title">Welcome to Requestly!</Typography.Title>
      <Typography.Paragraph className="survey-banner-subtitle">
        Help us personalise your experience by answering the following questionnaire
      </Typography.Paragraph>
      <div className="survey-lottie-animation-container">
        <WelcomeAnimation className="survey-lottie-animation" animationName="persona-survey-welcome" />
      </div>
      <div className="survey-banner-footer">😄 We are excited to see you here </div>
    </div>
  );
};
