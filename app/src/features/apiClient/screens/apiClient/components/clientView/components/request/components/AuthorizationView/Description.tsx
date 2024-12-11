import { isEmpty } from "lodash";
import { BiLinkExternal } from "@react-icons/all-files/bi/BiLinkExternal";
import { LABEL_TEXT } from "./authConstants";

const Description = ({ data, wrapperClass = "" }) => {
  const { img, heading, subHeading, note, externalLink, steps = [] } = data;

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
    <div className={`auth-description ${wrapperClass}`}>
      {img && <img src={img} alt="auth" />}
      <h1>{heading}</h1>
      <h2>{subHeading}</h2>
      <ul>{renderSteps(steps)}</ul>
      <p className="note">{note}</p>
      <a href={externalLink} className="link-text">
        <BiLinkExternal size={"12px"} />
        <span>{LABEL_TEXT.LEARN_MORE}</span>
      </a>
    </div>
  );
};

export default Description;
