import { Col, Row, Space, Typography } from "antd";
import "./index.scss";

export const CompaniesSection = () => {
  const companies = [
    { src: "/assets/media/pricing/atlassian.svg", alt: "atlassian" },
    { src: "/assets/media/common/indeed.svg", alt: "indeed" },
    { src: "/assets/media/common/verizon.svg", alt: "verizon" },
    { src: "/assets/media/pricing/zalando.svg", alt: "zalando" },
  ];

  return (
    <Row justify="center" align="middle" className="w-full companies-row">
      <Space direction="vertical" className="companies-wrapper">
        <Typography.Text className="companies-section-header">
          Trusted by developer & QA teams from 50,000+ organizations
        </Typography.Text>
        <Col>
          <Space direction="horizontal" size={24}>
            {companies.map((company) => (
              <img className="company-logo" key={company.alt} src={company.src} alt={company.alt} />
            ))}
          </Space>
        </Col>
      </Space>
    </Row>
  );
};
