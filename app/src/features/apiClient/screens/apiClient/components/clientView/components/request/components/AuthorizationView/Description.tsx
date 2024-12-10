import { isEmpty } from "lodash";

const Description = ({ data }) => {
  const { heading, subHeading, steps = [] } = data;

  const renderSteps = (data) => {
    if (isEmpty(data)) {
      return;
    }

    return data.map((item) => {
      return (
        <>
          <li className="step-item">{item.value}</li>
          {!isEmpty(item.steps) && <ul className="steps">{renderSteps(item.steps)}</ul>}
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
