import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { Checkbox, Col, Row } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { MdOutlineScience } from "@react-icons/all-files/md/MdOutlineScience";
import { TestReportsTable } from "./components/TestReportsTable";
import { prefixUrlWithHttps } from "utils/URLUtils";
import { isValidUrl } from "utils/FormattingHelper";
import { testRuleOnUrl } from "actions/ExtensionActions";
import { useBottomSheetContext } from "componentsV2/BottomSheet";
import "./TestThisRuleV2.scss";

export const TestThisRuleV2 = () => {
  const [pageUrl, setPageUrl] = useState("");
  const [error, setError] = useState(null);
  const [doCaptureSession, setDoCaptureSession] = useState(true);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const { viewAsPanel } = useBottomSheetContext();

  const handleStartTestRule = useCallback(() => {
    if (!pageUrl.length) {
      setError("Enter a page URL");
      return;
    }
    const urlToTest = prefixUrlWithHttps(pageUrl);

    if (!isValidUrl(urlToTest)) {
      setError("Enter a valid page URL");
      return;
    }
    if (error) {
      setError(null);
    }

    // trackTestRuleClicked(currentlySelectedRuleData.ruleType, recordTestPage);
    setPageUrl(urlToTest);
    testRuleOnUrl({ url: urlToTest, ruleId: currentlySelectedRuleData.id, record: doCaptureSession });
  }, [pageUrl, error, doCaptureSession, currentlySelectedRuleData]);

  return (
    <Col className="test-this-rule-container">
      <Row align="middle" gutter={[8, 8]}>
        <Col>
          <RQInput
            className="test-rule-input"
            placeholder="Enter the URL you want to test"
            value={pageUrl}
            onChange={(event) => setPageUrl(event.target.value)}
            style={{
              width: viewAsPanel ? "280px" : "388px",
            }}
          />
        </Col>
        <Col>
          <RQButton type="primary" className="test-rule-btn" icon={<MdOutlineScience />} onClick={handleStartTestRule}>
            Test Rule
          </RQButton>
        </Col>
      </Row>
      <Checkbox
        checked={doCaptureSession}
        onChange={(event) => setDoCaptureSession(event.target.checked)}
        className="test-rule-checkbox"
      >
        Save the test session with video, console & network logs
      </Checkbox>
      <div className="mt-16 test-results-header">Results</div>
      <Col className="mt-8 test-reports-container">
        <TestReportsTable />
      </Col>
    </Col>
  );
};
