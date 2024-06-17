import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, Col, Row } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { BottomSheetPlacement, useBottomSheetContext } from "componentsV2/BottomSheet";
import { trackTestRuleClicked } from "../../analytics";
import {
  getCurrentlySelectedRuleData,
  getIsCurrentlySelectedRuleHasUnsavedChanges,
  getUserAttributes,
  getUserAuthDetails,
} from "store/selectors";
import { prefixUrlWithHttps } from "utils/URLUtils";
import { isValidUrl } from "utils/FormattingHelper";
import { testRuleOnUrl } from "actions/ExtensionActions";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { MdOutlineScience } from "@react-icons/all-files/md/MdOutlineScience";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { IncentivizeEvent } from "features/incentivization/types";
import { incentivizationActions } from "store/features/incentivization/slice";
import { claimIncentiveRewards } from "backend/incentivization";
import { checkIncentivesEligibility } from "features/incentivization";
import { getLocalIncentivizationEventsState } from "store/features/incentivization/selectors";
import { IncentivizationModal } from "store/features/incentivization/types";
import "./index.scss";

export const TestRuleHeader = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const isCurrentlySelectedRuleHasUnsavedChanges = useSelector(getIsCurrentlySelectedRuleHasUnsavedChanges);
  const localIncentiveEvents = useSelector(getLocalIncentivizationEventsState);
  const [pageUrl, setPageUrl] = useState("");
  const [error, setError] = useState(null);
  const [doCaptureSession, setDoCaptureSession] = useState(true);
  const { sheetPlacement } = useBottomSheetContext();
  const isIncentivizationEnabled = useFeatureValue("incentivization_onboarding", false);

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

    if (!user.loggedIn && doCaptureSession) {
      setError("You need to login to capture your test session");
      return;
    }

    if (error) {
      setError(null);
    }

    setPageUrl(urlToTest);
    testRuleOnUrl({ url: urlToTest, ruleId: currentlySelectedRuleData.id, record: doCaptureSession });

    if (checkIncentivesEligibility(user.loggedIn, userAttributes, isIncentivizationEnabled, localIncentiveEvents)) {
      claimIncentiveRewards({
        dispatch,
        isUserloggedIn: user?.loggedIn,
        event: { type: IncentivizeEvent.RULE_TESTED },
      })?.then((response) => {
        // @ts-ignore
        if (response.data?.success) {
          dispatch(
            incentivizationActions.setUserMilestoneAndRewardDetails({
              // @ts-ignore
              userMilestoneAndRewardDetails: response.data?.data,
            })
          );

          dispatch(
            incentivizationActions.toggleActiveModal({
              modalName: IncentivizationModal.TASK_COMPLETED_MODAL,
              newValue: true,
              newProps: { event: IncentivizeEvent.RULE_TESTED },
            })
          );
        }
      });
    }
  }, [
    pageUrl,
    error,
    doCaptureSession,
    currentlySelectedRuleData.id,
    currentlySelectedRuleData.ruleType,
    currentlySelectedRuleData.status,
    user?.loggedIn,
    isCurrentlySelectedRuleHasUnsavedChanges,
    dispatch,
    isIncentivizationEnabled,
    localIncentiveEvents,
    userAttributes,
  ]);

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
      <Checkbox
        checked={doCaptureSession}
        onChange={(event) => setDoCaptureSession(event.target.checked)}
        className="test-rule-checkbox"
      >
        Save the test session with video, console & network logs
      </Checkbox>
    </>
  );
};
