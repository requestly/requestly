import { isEmpty } from "lodash";
import { AuthDescriptionData, AuthDescriptionStep } from "./types";
import React from "react";
interface DescriptionProps {
  data: AuthDescriptionData;
}

const Description: React.FC<DescriptionProps> = ({ data }) => {
  const { heading, subHeading, steps = [] } = data;

  const renderSteps = (descriptionSteps: AuthDescriptionStep[]) => {
    if (isEmpty(descriptionSteps)) {
      return;
    }

    return descriptionSteps.map((step) => {
      return (
        <>
          <li className="step-item">{step.value}</li>
          {!isEmpty(step.steps) && <ul className="steps">{renderSteps(step.steps)}</ul>}
        </>
      );
    });
  };

  return (
    <div className="auth-description">
      <h1>{heading}</h1>
      <h2>{subHeading}</h2>
      <ul>{renderSteps(steps)}</ul>
    </div>
  );
};

export default Description;
