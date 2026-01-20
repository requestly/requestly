import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Input, Radio, Popconfirm, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { getCurrentlySelectedRuleConfig } from "store/selectors";
import { RQButton } from "lib/design-system-v2/components";
import { InfoTag } from "components/misc/InfoTag";
import { MoreInfo } from "components/misc/MoreInfo";
import { HiOutlineExternalLink } from "@react-icons/all-files/hi/HiOutlineExternalLink";
import isEmpty from "is-empty";
import { isValidUrl } from "utils/FormattingHelper";
import {
  displayFileSelector,
  handleOpenLocalFileInBrowser,
} from "components/mode-specific/desktop/misc/FileDialogButton";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import {
  trackSelectMapLocalFile,
  trackClickMapLocalFile,
  trackClickMock,
  trackSelectMock,
} from "modules/analytics/events/features/rules/redirectDestinationOptions";
import { trackDesktopActionInterestCaptured } from "modules/analytics/events/misc/interestCaptured";
import { trackMoreInfoClicked } from "modules/analytics/events/misc/moreInfo";
import LINKS from "config/constants/sub/links";
import { generatePlaceholderText } from "components/features/rules/RulePairs/utils";
import { MockPickerModal } from "features/mocks/modals";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import "./index.css";
import { RedirectRule } from "@requestly/shared/types/entities/rules";

const DestinationURLRow = ({ rowIndex, pair, pairIndex, isInputDisabled }) => {
  const dispatch = useDispatch();
  const [destinationType, setDestinationType] = useState(pair.destinationType);
  const [destinationTypePopupVisible, setDestinationTypePopupVisible] = useState(false);
  const [destinationPopupSelection, setDestinationPopupSelection] = useState(null);
  const [isSelectedFileInputVisible, setIsSelectedFileInputVisible] = useState(false);

  const [isMockPickerVisible, setIsMockPickerVisible] = useState(false);

  const currentlySelectedRuleConfig = useSelector(getCurrentlySelectedRuleConfig);

  const handleMockPickerVisibilityChange = (visible) => {
    // seems like an unnecessary abstraction
    setIsMockPickerVisible(visible);
  };

  const handleMockPickerSelectionCallback = (url) => {
    trackSelectMock(url);
    setIsMockPickerVisible(false);
    dispatch(
      globalActions.updateRulePairAtGivenPath({
        pairIndex,
        updates: { destination: url },
      })
    );
  };

  const handleFileSelectCallback = (file) => {
    const filePath = file?.path;
    trackSelectMapLocalFile(filePath);
    dispatch(
      globalActions.updateRulePairAtGivenPath({
        pairIndex,
        updates: {
          destination: `file://${filePath}`,
        },
      })
    );
  };

  const preValidateURL = () => {
    const currentDestinationURL = pair.destination;
    if (isEmpty(currentDestinationURL)) return;
    if (!isValidUrl(currentDestinationURL) && !currentDestinationURL.startsWith("$")) {
      // Try auto-fixing
      if (
        !currentDestinationURL.startsWith("$") &&
        !currentDestinationURL.startsWith("http://") &&
        !currentDestinationURL.startsWith("https://") &&
        !currentDestinationURL.startsWith("file://")
      ) {
        dispatch(
          globalActions.updateRulePairAtGivenPath({
            pairIndex,
            updates: {
              destination: "http://" + currentDestinationURL,
            },
          })
        );
      }
    }
  };

  // toggle warning for destination urls starting with `file://`
  const showInputWarning = () => {
    if (
      pair.destination &&
      pair.destination.startsWith("file://") &&
      !isFeatureCompatible(FEATURES.REDIRECT_MAP_LOCAL)
    ) {
      return true;
    }
    return false;
  };

  const getDestinationTypeForExistingRule = (destination) => {
    if (destination.startsWith("file://")) {
      return RedirectRule.DestinationType.MAP_LOCAL;
    } else if (
      /* check for both new and old mocks */
      destination.includes("requestly.dev/api/mockv2/") ||
      destination.includes("requestly.me") ||
      destination.includes("requestly.tech/api/mockv2/")
    ) {
      return RedirectRule.DestinationType.MOCK_OR_FILE_PICKER;
    } else {
      return RedirectRule.DestinationType.URL;
    }
  };

  const showPopup = (e) => {
    setDestinationPopupSelection(e.target.value);
    setDestinationTypePopupVisible(true);
  };

  const handleDestinationTypeChange = useCallback(
    (destinationPopupSelection) => {
      dispatch(
        globalActions.updateRulePairAtGivenPath({
          pairIndex,
          triggerUnsavedChangesIndication: false,
          updates: {
            destination: "",
            destinationType: destinationPopupSelection,
          },
        })
      );
      setDestinationType(destinationPopupSelection);
    },
    [pairIndex, dispatch]
  );

  const renderRedirectURLInput = () => {
    return (
      <Input
        data-tour-id="rule-editor-destination-url"
        data-selectionid="destination-url"
        className="display-inline-block"
        placeholder={generatePlaceholderText(pair.source.operator, "destination")}
        type="text"
        onChange={(event) =>
          dispatch(
            globalActions.updateRulePairAtGivenPath({
              pairIndex,
              updates: {
                destination: event?.target?.value,
              },
            })
          )
        }
        onBlur={preValidateURL}
        value={pair.destination}
        disabled={isInputDisabled}
        status={showInputWarning() ? "warning" : null}
      />
    );
  };

  const renderMockOrFilePicker = () => {
    return (
      <Col span={24} className="picker-container">
        <RQButton
          className="white text-bold"
          type="default"
          onClick={() => {
            setIsMockPickerVisible(true);
            trackClickMock();
          }}
          disabled={isInputDisabled}
        >
          {pair.destination ? "Change file" : " Select file"}
        </RQButton>
        <span className="destination-file-path">{pair.destination.length ? pair.destination : " No file chosen"}</span>
        {pair.destination && (
          <a href={pair.destination} target="_blank" rel="noreferrer">
            <HiOutlineExternalLink className="external-link-icon" />
          </a>
        )}
      </Col>
    );
  };

  const renderLocalFileSelector = () => {
    return (
      <Col span={24} className="picker-container">
        <RQButton
          onPointerEnter={() => trackDesktopActionInterestCaptured("map_local")}
          disabled={!isFeatureCompatible(FEATURES.REDIRECT_MAP_LOCAL) || isInputDisabled}
          type="default"
          onClick={() => {
            displayFileSelector(handleFileSelectCallback);
            trackClickMapLocalFile();
          }}
        >
          {pair.destination ? "Change file" : " Select file"}
        </RQButton>
        <span
          className={`${
            !isFeatureCompatible(FEATURES.REDIRECT_MAP_LOCAL) && "highlight-file-path"
          } destination-file-path`}
        >
          {" "}
        </span>{" "}
        {pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES ||
        pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES ? (
          <>
            {isSelectedFileInputVisible ? (
              <Input
                autoFocus
                onBlur={() => setIsSelectedFileInputVisible(false)}
                style={{
                  width: 350,
                }}
                value={pair.destination}
                onChange={(e) => {
                  dispatch(
                    globalActions.updateRulePairAtGivenPath({
                      pairIndex,
                      updates: { destination: e.target.value },
                    })
                  );
                }}
              />
            ) : (
              <>
                <span className="file-path">{pair.destination.length ? pair.destination : " No file chosen"}</span>
                {pair.destination ? (
                  <>
                    {isFeatureCompatible(FEATURES.EDIT_LOCAL_FILE_PATH) ? (
                      <Tooltip
                        color={"#000"}
                        placement="top"
                        title={
                          <>
                            You can use the captured group expressions from the request to dynamically set the file path
                            (using $1, $2, etc).
                            <br />
                            <a
                              href="https://docs.requestly.com/general/http-rules/advanced-usage/source-conditions#testing-url-with-wildcard-condition"
                              target="_blank"
                              rel="noreferrer"
                            >
                              click here
                            </a>{" "}
                            to learn more.
                          </>
                        }
                      >
                        <RQButton
                          size="small"
                          type="link"
                          onClick={() => {
                            setIsSelectedFileInputVisible(true);
                          }}
                          icon={<MdOutlineEdit />}
                        />
                      </Tooltip>
                    ) : null}
                  </>
                ) : null}
              </>
            )}
          </>
        ) : (
          <span className="file-path"> {pair.destination.length ? pair.destination : " No file chosen"}</span>
        )}
        {pair.destination && isFeatureCompatible(FEATURES.REDIRECT_MAP_LOCAL) && (
          <HiOutlineExternalLink
            className="external-link-icon"
            onClick={() => handleOpenLocalFileInBrowser(pair.destination)}
          />
        )}
        <span>
          {!isFeatureCompatible(FEATURES.REDIRECT_MAP_LOCAL) && (
            <InfoTag
              title="DESKTOP ONLY RULE"
              tooltipWidth="400px"
              description={
                <>
                  This rule cannot be executed using Extension because the request redirects to a local file that cannot
                  be accessed by the browser.{" "}
                  <a className="tooltip-link" href={LINKS.REQUESTLY_DOWNLOAD_PAGE} target="_blank" rel="noreferrer">
                    Use this on Desktop App!
                  </a>
                </>
              }
            />
          )}
        </span>
      </Col>
    );
  };

  const renderDestinationRow = () => {
    switch (pair.destinationType) {
      case RedirectRule.DestinationType.URL:
        return renderRedirectURLInput();
      case RedirectRule.DestinationType.MOCK_OR_FILE_PICKER:
        return renderMockOrFilePicker();
      case RedirectRule.DestinationType.MAP_LOCAL:
        return renderLocalFileSelector();
      default:
        return renderRedirectURLInput();
    }
  };

  useEffect(() => {
    if (!pair.destinationType) {
      const destinationType = getDestinationTypeForExistingRule(pair.destination);
      setDestinationType(destinationType);
    }
  }, [pair.destination, pair.destinationType]);

  return (
    <React.Fragment>
      <Row
        className="margin-top-one"
        key={rowIndex}
        span={24}
        style={{
          alignItems: "center",
        }}
      >
        <Col className="redirect-rule-destination-label">
          <MoreInfo
            showIcon
            text="Define the destination URL where you want to redirect the original request."
            analyticsContext="redirect_to_icon"
            source={currentlySelectedRuleConfig.TYPE}
          >
            <span className="white text-bold">Redirects to</span>
          </MoreInfo>
        </Col>
        <Col span={24}>
          <Row className="redirect-destination-container">
            <Col span={24} className="destination-options">
              {pair.destination ? (
                <Popconfirm
                  title="This will clear the existing changes"
                  okText="Confirm"
                  cancelText="Cancel"
                  onConfirm={() => {
                    handleDestinationTypeChange(destinationPopupSelection);
                    setDestinationTypePopupVisible(false);
                  }}
                  onCancel={() => setDestinationTypePopupVisible(false)}
                  open={destinationTypePopupVisible}
                >
                  <Radio.Group value={destinationType} onChange={showPopup} disabled={isInputDisabled}>
                    <Radio value={RedirectRule.DestinationType.URL}>Another URL</Radio>
                    <MoreInfo
                      trigger={!isFeatureCompatible(FEATURES.REDIRECT_MAP_LOCAL)}
                      tooltipOpenedCallback={() => trackDesktopActionInterestCaptured("map_local")}
                      analyticsContext="map_local"
                      source={currentlySelectedRuleConfig.TYPE}
                      text={
                        <>
                          Map Local file option is available only in desktop app.{" "}
                          <a
                            href={LINKS.REQUESTLY_DOWNLOAD_PAGE}
                            target="_blank"
                            rel="noreferrer"
                            className="tooltip-link"
                            onClick={() => trackMoreInfoClicked("map_local", currentlySelectedRuleConfig.TYPE)}
                          >
                            Download now
                          </a>
                        </>
                      }
                    >
                      <Radio
                        value={RedirectRule.DestinationType.MAP_LOCAL}
                        disabled={!isFeatureCompatible(FEATURES.REDIRECT_MAP_LOCAL)}
                      >
                        Local file
                      </Radio>
                    </MoreInfo>
                    <Radio value={RedirectRule.DestinationType.MOCK_OR_FILE_PICKER}>Pick from Files/Mock server</Radio>
                  </Radio.Group>
                </Popconfirm>
              ) : (
                <Radio.Group
                  value={destinationType}
                  onChange={(e) => {
                    handleDestinationTypeChange(e.target.value);
                  }}
                  disabled={isInputDisabled}
                >
                  <Radio value={RedirectRule.DestinationType.URL}>Another URL</Radio>
                  <MoreInfo
                    trigger={!isFeatureCompatible(FEATURES.REDIRECT_MAP_LOCAL)}
                    tooltipOpenedCallback={() => trackDesktopActionInterestCaptured("map_local")}
                    analyticsContext="map_local"
                    source={currentlySelectedRuleConfig.TYPE}
                    text={
                      <>
                        Map Local file option is available only in desktop app.{" "}
                        <a
                          href={LINKS.REQUESTLY_DOWNLOAD_PAGE}
                          target="_blank"
                          rel="noreferrer"
                          className="tooltip-link"
                          onClick={() => trackMoreInfoClicked("map_local", currentlySelectedRuleConfig.TYPE)}
                        >
                          Download now
                        </a>
                      </>
                    }
                  >
                    <Radio
                      value={RedirectRule.DestinationType.MAP_LOCAL}
                      disabled={!isFeatureCompatible(FEATURES.REDIRECT_MAP_LOCAL)}
                    >
                      Local file
                    </Radio>
                  </MoreInfo>
                  <Radio value={RedirectRule.DestinationType.MOCK_OR_FILE_PICKER}>Pick from File server</Radio>
                </Radio.Group>
              )}
            </Col>
            <Col span={24} className="destination-action">
              {renderDestinationRow()}
            </Col>
          </Row>
        </Col>
      </Row>
      {/* MODALS */}
      {isMockPickerVisible ? (
        <MockPickerModal
          isVisible={isMockPickerVisible}
          onVisibilityChange={handleMockPickerVisibilityChange}
          mockSelectionCallback={handleMockPickerSelectionCallback}
        />
      ) : null}
    </React.Fragment>
  );
};

export default DestinationURLRow;
