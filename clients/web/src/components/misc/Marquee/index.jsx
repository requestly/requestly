import React, { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import "./marquee.css";

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

export const CompanyMarquee = () => {
  const [icons, setIcons] = useState([]);

  useEffect(() => {
    Promise.all(
      companies.map((company) =>
        import(`../../../assets/img/icons/common/${company}.svg`).then((module) => module.default)
      )
    )
      .then(setIcons)
      .catch(() => setIcons([]));
  }, []);

  return (
    <div className="marquee-container">
      <Marquee gradientWidth={200} gradientColor={["33", "33", "37"]} speed={20}>
        {icons.map((companyIcon, index) => (
          <img key={index} src={companyIcon} alt={companies[index]} className="marquee-icons" />
        ))}
      </Marquee>
    </div>
  );
};
