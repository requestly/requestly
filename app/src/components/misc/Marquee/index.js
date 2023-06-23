import Marquee from "react-fast-marquee";

import "./marquee.css";

export const CompanyMarquee = () => {
  const companies = [
    "adobe",
    "indeed",
    "amazon",
    "atlassian",
    "wix",
    "atnt",
    "sendx",
    "hubspot",
    "pushowl",
    "verizon",
    "cbs",
    "salesforce",
    "pearson",
  ];

  return (
    <div className="marquee-container">
      <Marquee gradientWidth={200} gradientColor={["33", "33", "37"]} className="marquee">
        {companies.map((company, index) => {
          return (
            <img
              key={index}
              src={require(`../../../assets/img/icons/common/${company}.svg`)}
              alt={company}
              className="marquee-icons"
            />
          );
        })}
      </Marquee>
    </div>
  );
};
