import React, { ReactNode } from "react";
import { Row, Col } from "antd";
import "./index.css";

interface BannerProps {
  title: string;
  subTitle?: string;
  bannerTitle?: string;
  bannerImg: string;
  featureName?: string;
  description?: ReactNode;
}
export const FeatureBanner: React.FC<BannerProps> = ({
  title,
  subTitle,
  bannerTitle,
  featureName,
  bannerImg,
  description,
}) => {
  return (
    <Row className="feature-banner-container">
      <Col
        xs={{ offset: 1, span: 22 }}
        sm={{ offset: 1, span: 22 }}
        md={{ offset: 2, span: 20 }}
        lg={{ offset: 3, span: 18 }}
        xl={{ offset: 4, span: 16 }}
        flex="1 1 820px"
      >
        <div className="title text-bold">{title}</div>
        <p className="text-dark-gray feature-banner-caption">{subTitle}</p>
        <div className="feature-banner">
          <img alt={bannerTitle} className="hero-img" src={bannerImg} />
          <div className="header">{bannerTitle}</div>
          {/* remove this inline style */}
          <div className="text-dark-gray" style={{ color: "#b0b0b5b3" }}>
            {description}
          </div>
        </div>
      </Col>
    </Row>
  );
};
