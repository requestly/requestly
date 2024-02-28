import Marquee from "react-fast-marquee";
import adobe from "assets/img/icons/common/adobe.svg";
import indeed from "assets/img/icons/common/indeed.svg";
import amazon from "assets/img/icons/common/amazon.svg";
import atlassian from "assets/img/icons/common/atlassian.svg";
import wix from "assets/img/icons/common/wix.svg";
import atnt from "assets/img/icons/common/atnt.svg";
import sendx from "assets/img/icons/common/sendx.svg";
import hubspot from "assets/img/icons/common/hubspot.svg";
import pushowl from "assets/img/icons/common/pushowl.svg";
import verizon from "assets/img/icons/common/verizon.svg";
import cbs from "assets/img/icons/common/cbs.svg";
import salesforce from "assets/img/icons/common/salesforce.svg";
import pearson from "assets/img/icons/common/pearson.svg";

import "./marquee.css";

export const CompanyMarquee = () => {
  const companies = {
    adobe: adobe,
    indeed: indeed,
    amazon: amazon,
    atlassian: atlassian,
    wix: wix,
    atnt: atnt,
    sendx: sendx,
    hubspot: hubspot,
    pushowl: pushowl,
    verizon: verizon,
    cbs: cbs,
    salesforce: salesforce,
    pearson: pearson,
  };

  return (
    <div className="marquee-container">
      <Marquee gradientWidth={200} gradientColor={["33", "33", "37"]} speed={50} className="åmarquee">
        {Object.entries(companies).map(([company, image], index) => (
          <img key={index} src={image} alt={company} className="marquee-icons" />
        ))}
      </Marquee>
    </div>
  );
};
