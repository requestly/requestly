import "./companiesSection.scss";

export const CompaniesSection = () => {
  const companyLogos = [
    "/assets/media/common/indeed.svg",
    "/assets/media/pricing/amazon.svg",
    "/assets/media/pricing/atlassian.svg",
    "/assets/media/common/intuit.svg",
    "/assets/media/pricing/wix.svg",
  ];

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
