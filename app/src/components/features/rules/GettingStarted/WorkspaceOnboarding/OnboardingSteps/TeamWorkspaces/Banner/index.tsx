import { Typography } from "antd";
import { HiArrowRight } from "react-icons/hi";
import underlineIcon from "../../../../../../../../assets/img/icons/common/underline.svg";

export const WorkspaceOnboardingBanner = () => {
  const teamBenefits = [
    "Common Repository of Rules, Mocks & Sessions",
    "Collaborate with your QAs, Product & Customers faster",
    "Troubleshoot Issues faster",
  ];
  return (
    <div>
      <div className="onboarding-banner-title">Use Team workspace to use Requestly with your teammates 🚀</div>
      <div className="text-bold header" style={{ marginTop: "2.4rem" }}>
        <span className="work-email-highlight-wrapper">
          Teams use <img src={underlineIcon} alt="work email" />
        </span>{" "}
        Requestly to create
      </div>

      {teamBenefits.map((benefit, index) => (
        <div className="work-email-benefit-item" key={index}>
          <HiArrowRight />
          <Typography.Text>{benefit}</Typography.Text>
        </div>
      ))}
    </div>
  );
};
