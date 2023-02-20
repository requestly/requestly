import React, { useMemo } from "react";
import { Col, Row } from "antd";
import { RuleType } from "types/rules";
import { getRuleDetails } from "../../utils";
import "./ruleExamples.css";

interface RuleExamplesProps {
  selectedRuleType: RuleType;
}

const RuleExamples: React.FC<RuleExamplesProps> = ({ selectedRuleType }) => {
  const { examples } = useMemo(() => getRuleDetails(selectedRuleType), [
    selectedRuleType,
  ]);

  return examples ? (
    <div className="rule-examples-container">
      <Row className="title text-bold rule-example-title">
        Examples - Use cases
      </Row>
      {/* <Row align="middle" gutter={[22, 20]}> */}
      <Row gutter={[0, 12]} className="rule-examples-usecases">
        {examples.useCases.map((item, index) => (
          <Col span={24} key={index}>
            <Row align="middle" gutter={10} wrap={false}>
              {item.logo && (
                <img
                  src={item.logo}
                  alt="logo"
                  width={40}
                  height={40}
                  className="rule-usecase-logo"
                />
              )}
              <a
                className="line-clamp"
                href={item.src}
                target="_blank"
                rel="noreferrer"
              >
                {item.title}
              </a>
            </Row>
          </Col>
        ))}
      </Row>

      {/* </Row> */}
    </div>
  ) : null;
};

export default RuleExamples;
