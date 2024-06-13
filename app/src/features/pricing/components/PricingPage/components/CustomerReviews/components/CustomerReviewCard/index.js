import { Card } from "antd";
import "./index.css";

const CustomerReviewCard = ({ name, title, mugshot, testimonial, companyName }) => {
  const mugshotAlt = `${name}, ${title}`;

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
    </Card>
  );
};

export default CustomerReviewCard;
