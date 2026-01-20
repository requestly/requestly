import { Card } from "antd";
import { FaQuoteLeft } from "@react-icons/all-files/fa/FaQuoteLeft";
import "./index.css";

const CustomerReviewCard = ({ name, title, mugshot, testimonial, companyName }) => {
  const mugshotAlt = `${name}, ${title}`;

  return (
    <Card className="shadow testimonial-card">
      <div className="testimonial-content-wrapper">
        <FaQuoteLeft className="testimonial-quote-icon" />
        <div>
          <p className="testimonial-content">{testimonial}</p>
          <div className="testimonial-user-container">
            <img src={mugshot} alt={mugshotAlt} />
            <span>
              <div className="author-name">{name}</div>
              <div className="author-role">{title}</div>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CustomerReviewCard;
