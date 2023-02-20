import React, { useMemo } from "react";
import { Button, Col, Collapse, Row } from "antd";
import { RQCollapse } from "lib/design-system/components";
import { RuleType } from "types/rules";
import { getRuleDetails } from "../../utils";
import { RuleFAQ } from "../../types";
import "./ruleFaqs.css";

interface RuleFaqsProps {
  selectedRuleType: RuleType;
}

const RuleFaqs: React.FC<RuleFaqsProps> = ({ selectedRuleType }) => {
  const { faqs } = useMemo(() => getRuleDetails(selectedRuleType), [
    selectedRuleType,
  ]);

  return (
    faqs?.length > 0 && (
      <div>
        <Row className="title text-bold rules-faq-title">
          Frequently Asked Questions
        </Row>
        <Row align="middle">
          <Col span={24}>
            <RQCollapse accordion>
              {faqs.map((faq: RuleFAQ, index: number) => (
                <Collapse.Panel
                  key={index}
                  header={faq.question}
                  className="rule-faq-header"
                >
                  {faq.answer}{" "}
                  {faq.link && (
                    <Button
                      type="link"
                      target="_blank"
                      href={faq.link}
                      className="faq-read-more-link"
                    >
                      Read more about this.
                    </Button>
                  )}
                </Collapse.Panel>
              ))}
            </RQCollapse>
          </Col>
        </Row>
      </div>
    )
  );
};

export default RuleFaqs;
