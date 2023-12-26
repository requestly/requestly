import React, { useMemo } from "react";
import { Col, Row, Typography } from "antd";
import { ruleIcons } from "components/common/RuleIcon/ruleIcons";
import APP_CONSTANTS from "config/constants";
import templatesMap from "../../../landing/ruleTemplates/templates.json";
import { RuleType } from "types";
import "./index.scss";

export const Templates: React.FC = () => {
  const filteredTemplates = useMemo(() => templatesMap.templates.filter((template: any) => template.isFeatured), []);
  console.log({ filteredTemplates });

  return (
    <Col className="home-templates-wrapper">
      <Typography.Title level={5} className="home-templates-title">
        Start with a template
      </Typography.Title>
      <Col span={24} className="home-templates-row">
        {filteredTemplates.map((template: any) => {
          const ruleType = template.data.ruleDefinition.ruleType;
          return (
            <div className="homepage-primary-card home-templates-row-card">
              <Typography.Text className="home-templates-row-card-title">{template.name}</Typography.Text>
              <Row gutter={8} align="middle" className="home-templates-row-card-tag">
                <Col className="home-templates-row-card-icon">{ruleIcons[ruleType as RuleType]}</Col>
                <Col className="home-templates-row-card-ruletype">
                  {APP_CONSTANTS.RULE_TYPES_CONFIG[ruleType]?.NAME}
                </Col>
              </Row>
            </div>
          );
        })}
      </Col>
    </Col>
  );
};
