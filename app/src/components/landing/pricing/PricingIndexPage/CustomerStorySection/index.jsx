import React from "react";
import { Row, Col, Layout } from "antd";
import CustomerStory from "../../CustomerStory";
import { customerStoryData } from "utils/PricingPageTestimonials";
import "./index.css";

const CustomerStorySection = () => {
  return (
    <Row>
      <Col span={12} offset={6}>
        <div>
          <div className="testimonials-container">
            {customerStoryData.map((data) => (
              <CustomerStory {...data} key={data.companyName} />
            ))}
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default CustomerStorySection;
