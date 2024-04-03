import { Checkbox, Col, Row } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { MdOutlineScience } from "@react-icons/all-files/md/MdOutlineScience";
import { TestReportsTable } from "./components/TestReportsTable";
import "./TestThisRuleV2.scss";

export const TestThisRuleV2 = () => {
  return (
    <Col className="test-this-rule-container">
      <Row align="middle" gutter={[8, 8]}>
        <Col>
          <RQInput className="test-rule-input" placeholder="Enter the URL you want to test" />
        </Col>
        <Col>
          <RQButton type="primary" className="test-rule-btn" icon={<MdOutlineScience />}>
            Test Rule
          </RQButton>
        </Col>
      </Row>
      <Checkbox checked className="test-rule-checkbox">
        Save the test session with video, console & network logs
      </Checkbox>
      <div className="mt-16 test-results-header">Results</div>
      <Col className="mt-8 test-reports-container">
        <TestReportsTable />
      </Col>
    </Col>
  );
};
