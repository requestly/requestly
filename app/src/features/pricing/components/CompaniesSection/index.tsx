import { Col, Row, Space, Typography } from "antd";
import adobeLogo from "../../assets/adobe.svg";
import atlassianLogo from "../../assets/atlassian.svg";
import indeedLogo from "../../assets/indeed.svg";
import verizonLogo from "../../assets/verizon.svg";
import zalandoLogo from "../../assets/zalando.svg";
import "./index.scss";

export const CompaniesSection = () => {
  return (
    <Row justify="center" align="middle" className="mt-16 w-full">
      <Space direction="vertical" className="companies-wrapper">
        <Typography.Text className="companies-section-header">
          Trusted by developer & QA teams from 5000+ organizations
        </Typography.Text>
        <Col>
          <Space direction="horizontal" size={24}>
            <img src={adobeLogo} alt="adobe" />
            <img src={atlassianLogo} alt="atlassian" />
            <img src={indeedLogo} alt="indeed" />
            <img src={verizonLogo} alt="verizon" />
            <img src={zalandoLogo} alt="zalando" />
          </Space>
        </Col>
      </Space>
    </Row>
  );
};
