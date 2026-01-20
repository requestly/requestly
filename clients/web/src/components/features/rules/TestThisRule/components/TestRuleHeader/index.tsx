import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Checkbox, Col, Row } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { BottomSheetPlacement, useBottomSheetContext } from "componentsV2/BottomSheet";
import { trackTestRuleClicked } from "../../analytics";
import { getCurrentlySelectedRuleData, getIsCurrentlySelectedRuleHasUnsavedChanges } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { prefixUrlWithHttps } from "utils/URLUtils";
import { isValidUrl } from "utils/FormattingHelper";
import { testRuleOnUrl } from "actions/ExtensionActions";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { MdOutlineScience } from "@react-icons/all-files/md/MdOutlineScience";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { SOURCE } from "modules/analytics/events/common/constants";
import { getAllRecordsMap } from "store/features/rules/selectors";
import { useRBAC } from "features/rbac";
import "./index.scss";

export const TestRuleHeader = () => {
  const user = useSelector(getUserAuthDetails);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const allRecordsMap = useSelector(getAllRecordsMap);
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("http_rule", "create");

  const [pageUrl, setPageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [doCaptureSession, setDoCaptureSession] = useState(user.loggedIn);
  const { sheetPlacement } = useBottomSheetContext();

  const handleStartTestRule = useCallback(() => {
    trackTestRuleClicked(currentlySelectedRuleData.ruleType, pageUrl);

    if (!pageUrl.length) {
      setError("Enter a page URL");
      return;
    }
    const urlToTest = prefixUrlWithHttps(pageUrl);

    if (!isValidUrl(urlToTest)) {
      setError("Enter a valid page URL");
      return;
    }

    if (isCurrentlySelectedRuleHasUnsavedChanges) {
      setError("You have unsaved changes, please save the rule before testing it");
      return;
    }

    if (currentlySelectedRuleData.status === GLOBAL_CONSTANTS.RULE_STATUS.INACTIVE) {
      setError("Rule is inactive, please activate the rule before testing it");
      return;
    }

    if (
      currentlySelectedRuleData.groupId &&
      allRecordsMap[currentlySelectedRuleData.groupId]?.status === GLOBAL_CONSTANTS.RULE_STATUS.INACTIVE
    ) {
      setError("Rule group is inactive, please activate the rule group before testing the rule");
      return;
    }

    if (error) {
      setError(null);
    }

    setPageUrl(urlToTest);
    testRuleOnUrl({ url: urlToTest, ruleId: currentlySelectedRuleData.id, record: doCaptureSession });
  }, [
    pageUrl,
    error,
    doCaptureSession,
    currentlySelectedRuleData.id,
    currentlySelectedRuleData.ruleType,
    currentlySelectedRuleData.status,
    isCurrentlySelectedRuleHasUnsavedChanges,
    allRecordsMap,
    currentlySelectedRuleData.groupId,
  ]);

  useEffect(() => {
    if (!user.loggedIn || !isValidPermission) {
      setDoCaptureSession(false);
    }
  }, [user.loggedIn, isValidPermission]);

  return (
    <>
      {error && (
        <div className="test-rule-error-message">
          <MdOutlineWarningAmber />
          <span>{error}</span>
        </div>
      )}
      <Row align="middle" gutter={[8, 8]}>
        <Col>
          <RQInput
            className="test-rule-input"
            placeholder="Enter the URL you want to test"
            value={pageUrl}
            onChange={(event) => setPageUrl(event.target.value)}
            onPressEnter={handleStartTestRule}
            style={{
              width: sheetPlacement === BottomSheetPlacement.RIGHT ? "280px" : "388px",
            }}
          />
        </Col>
        <Col>
          <RQButton type="primary" className="test-rule-btn" icon={<MdOutlineScience />} onClick={handleStartTestRule}>
            Test Rule
          </RQButton>
        </Col>
      </Row>
      <AuthConfirmationPopover
        placement="topRight"
        title="You need to signup to capture your test session"
        source={SOURCE.TEST_THIS_RULE}
      >
        <Checkbox
          disabled={!isValidPermission}
          checked={doCaptureSession}
          onClick={() => {
            if (user.loggedIn) setDoCaptureSession(!doCaptureSession);
          }}
          className="test-rule-checkbox"
        >
          Save the test session with video, console & network logs
        </Checkbox>
      </AuthConfirmationPopover>
    </>
  );
};
