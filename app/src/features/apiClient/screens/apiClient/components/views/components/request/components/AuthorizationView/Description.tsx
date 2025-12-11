import { isEmpty } from "lodash";
import { BiLinkExternal } from "@react-icons/all-files/bi/BiLinkExternal";
import { LABEL_TEXT } from "./authConstants";
import React from "react";
import { AuthForm } from "./AuthorizationForm/formStructure/types";
interface DescriptionProps {
  data: AuthForm.Description.Data;
}

const Description: React.FC<DescriptionProps> = ({ data }) => {
  const { img, heading, subHeading, note, externalLink, steps = [] } = data;

  const renderSteps = (descriptionSteps: AuthForm.Description.Step[]) => {
    if (isEmpty(descriptionSteps)) {
      return;
    }

    return descriptionSteps.map((item, index) => {
      return (
        <div key={`item-${index}`}>
          <li className="step-item">{item.value}</li>
          {item.steps && !isEmpty(item.steps) && <ul className="steps">{renderSteps(item.steps)}</ul>}
        </div>
      );
    });
  };

  return (
    <div className={`auth-description no-auth`}>
      {img && <img src={img} alt="auth" width={80} height={80} />}
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
