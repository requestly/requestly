import { Button, Col, Row } from "antd";
import "./ruleTemplate.css";

const RuleTemplate = () => {
  return (
    <Row wrap={false} align="middle" justify="space-between" className="rule-template-container">
      <Col span={12} className="caption line-clamp">
        Bypass CORS
      </Col>
      <Col span={12} className="caption rule-template-item-link">
        <Row align="middle" justify="end">
          <Button type="link">Use</Button>
        </Row>
      </Col>
    </Row>
  );
};

export default RuleTemplate;
