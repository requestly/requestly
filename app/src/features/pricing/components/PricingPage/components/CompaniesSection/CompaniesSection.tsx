import "./companiesSection.scss";

export const CompaniesSection = () => {
  const companyLogos = [
    "/media/common/indeed.svg",
    "/media/pricing/amazon.svg",
    "/media/pricing/atlassian.svg",
    "/media/common/intuit.svg",
    "/media/pricing/wix.svg",
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
