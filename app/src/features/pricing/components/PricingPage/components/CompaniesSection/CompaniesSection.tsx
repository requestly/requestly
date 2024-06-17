import indeedLogo from "assets/img/icons/common/indeed.svg";
import amazon from "assets/img/icons/common/amazon.svg";
import atlassian from "assets/img/icons/common/atlassian.svg";
import intuitLogo from "assets/img/icons/common/intuit.svg";
import wixLogo from "assets/img/icons/common/wix.svg";
import "./companiesSection.scss";

export const CompaniesSection = () => {
  const companyLogos = [indeedLogo, amazon, atlassian, intuitLogo, wixLogo];

  return (
    <div className="companies-section-container">
      <div className="companies-section-title">Trusted by developer & QA teams from 50,000+ global organizations</div>
      <div className="companies-section-logos">
        {companyLogos.map((logo, index) => (
          <img key={index} src={logo} alt={`company-logo-${index}`} />
        ))}
      </div>
    </div>
  );
};
