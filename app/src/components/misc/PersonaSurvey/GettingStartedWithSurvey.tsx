import WelcomeAnimation from "../LottieAnimation/WelcomeAnimation";
import "./index.css";

export const GettingStartedWithSurvey = () => {
  return (
    <div className="survey-lottie-animation-container">
      <WelcomeAnimation className="survey-lottie-animation" animationName="welcome-animation" />
    </div>
  );
};
