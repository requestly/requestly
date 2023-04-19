import { Card } from "antd";
import "./index.css";

const CustomerStory = ({ name, title, mugshot, testimonial, companyLogo, companyName }) => {
  const mugshotAlt = `${name}, ${title}`;
  const companyLogoAlt = `${companyName} logo`;

  return (
    <Card className="shadow testimonial-card">
      <div className="testimonial-user-meta-container">
        <img src={mugshot} alt={mugshotAlt} />
        <span>
          <div className="text-bold text-white title">{name}</div>
          <div className="text-gray caption">{title}</div>
        </span>
      </div>
      <p className="mb-0 text-left text-gray mt-1 testimonial-content">{testimonial}</p>
      {companyLogo && <img className="testimonial-company-logo" src={companyLogo} alt={companyLogoAlt} />}
    </Card>
  );
};

export default CustomerStory;
