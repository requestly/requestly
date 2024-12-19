import { isEmpty } from "lodash";
import { BiLinkExternal } from "@react-icons/all-files/bi/BiLinkExternal";
import { LABEL_TEXT } from "./authConstants";
import { AuthDescriptionData, AuthDescriptionStep } from "./types";
import React from "react";
interface DescriptionProps {
  data: AuthDescriptionData;
  wrapperClass: string;
}

const Description: React.FC<DescriptionProps> = ({ data, wrapperClass = "" }) => {
  const { img, heading, subHeading, note, externalLink, steps = [] } = data;

  const renderSteps = (descriptionSteps: AuthDescriptionStep[]) => {
    if (isEmpty(descriptionSteps)) {
      return;
    }

    return descriptionSteps.map((item, index) => {
      return (
        <div key={`item-${index}`}>
          <li className="step-item">{item.value}</li>
          {!isEmpty(item.steps) && <ul className="steps">{renderSteps(item.steps)}</ul>}
        </div>
      );
    });
  };

  return (
    <div className={`auth-description ${wrapperClass}`}>
      {img && <img src={img} alt="auth" />}
      <h1>{heading}</h1>
      <h2>{subHeading}</h2>
      {!isEmpty(steps) && <ul>{renderSteps(steps)}</ul>}
      {note && <p className="note">{note}</p>}
      {externalLink && (
        <a href={externalLink} target="__blank" className="link-text">
          <BiLinkExternal size={"12px"} />
          <span>{LABEL_TEXT.LEARN_MORE}</span>
        </a>
      )}
    </div>
  );
};

export default Description;
