import React, { useState, useEffect } from "react";
import { Row, Col, Input, Radio, Popconfirm } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import { getCurrentlySelectedRuleConfig } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { InfoTag } from "components/misc/InfoTag";
import { MoreInfo } from "components/misc/MoreInfo";
import { RedirectDestinationType } from "types/rules";
import { HiOutlineExternalLink } from "@react-icons/all-files/hi/HiOutlineExternalLink";
import isEmpty from "is-empty";
import { isValidUrl } from "utils/FormattingHelper";
import MockPickerModal from "components/features/mocksV2/MockPickerModal";
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
import "./index.css";

const DestinationURLRow = ({ rowIndex, pair, pairIndex, isInputDisabled }) => {
  const dispatch = useDispatch();
  const [destinationType, setDestinationType] = useState(pair.destinationType);
  const [destinationTypePopupVisible, setDestinationTypePopupVisible] = useState(false);
  const [destinationPopupSelection, setDestinationPopupSelection] = useState(null);

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
      actions.updateRulePairAtGivenPath({
        pairIndex,
        updates: { destination: url },
      })
    );
  };

  const handleFileSelectCallback = (filePath) => {
    trackSelectMapLocalFile(filePath);
    dispatch(
      actions.updateRulePairAtGivenPath({
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
          actions.updateRulePairAtGivenPath({
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
      return RedirectDestinationType.MAP_LOCAL;
    } else if (
      /* check for both new and old mocks */
      destination.includes("requestly.dev/api/mockv2/") ||
      destination.includes("requestly.me")
    ) {
      return RedirectDestinationType.MOCK_OR_FILE_PICKER;
    } else {
      return RedirectDestinationType.URL;
    }
  };

  const showPopup = (e) => {
    setDestinationPopupSelection(e.target.value);
    setDestinationTypePopupVisible(true);
  };

  const handleDestinationTypeChange = () => {
    dispatch(
      actions.updateRulePairAtGivenPath({
        pairIndex,
        updates: {
          destination: "",
          destinationType: destinationPopupSelection,
        },
      })
    );

    setDestinationType(destinationPopupSelection);
  };

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
            actions.updateRulePairAtGivenPath({
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
          {pair.destination ? "Change file" : " Select mock/file"}
        </RQButton>
        <span className="destination-file-path">
          {pair.destination.length ? pair.destination : " No mock or file chosen"}
        </span>
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
          {pair.destination.length ? pair.destination : " No file chosen"}
        </span>{" "}
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
      case RedirectDestinationType.URL:
        return renderRedirectURLInput();
      case RedirectDestinationType.MOCK_OR_FILE_PICKER:
        return renderMockOrFilePicker();
      case RedirectDestinationType.MAP_LOCAL:
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
        <Col span={3} className="redirect-rule-destination-label">
          <MoreInfo
            showIcon
            text="Define the destination URL where you want to redirect the original request."
            analyticsContext="redirect_to_icon"
            source={currentlySelectedRuleConfig.TYPE}
          >
            <span className="white text-bold">Redirect to</span>
          </MoreInfo>
        </Col>
        <Col span={24}>
          <Row className="redirect-destination-container">
            <Col span={24} className="destination-options">
              <Popconfirm
                title="This will clear the existing changes"
                okText="Confirm"
                cancelText="Cancel"
                onConfirm={() => {
                  handleDestinationTypeChange();
                  setDestinationTypePopupVisible(false);
                }}
                onCancel={() => setDestinationTypePopupVisible(false)}
                open={destinationTypePopupVisible}
              >
                <Radio.Group value={destinationType} onChange={showPopup} disabled={isInputDisabled}>
                  <MoreInfo
                    text="Redirect URL to another URL"
                    analyticsContext="url_destination"
                    source={currentlySelectedRuleConfig.TYPE}
                  >
                    <Radio value={RedirectDestinationType.URL}>URL</Radio>
                  </MoreInfo>
                  <MoreInfo
                    trigger={!isFeatureCompatible(FEATURES.REDIRECT_MAP_LOCAL)}
                    tooltipOpenedCallback={() => trackDesktopActionInterestCaptured("map_local")}
                    analyticsContext="map_local"
                    source={currentlySelectedRuleConfig.TYPE}
                    keepActive={true}
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
                      value={RedirectDestinationType.MAP_LOCAL}
                      disabled={!isFeatureCompatible(FEATURES.REDIRECT_MAP_LOCAL)}
                    >
                      Local file
                    </Radio>
                  </MoreInfo>
                  <MoreInfo
                    text=" Redirect to endpoint from Requestly Mock Server or File Server"
                    analyticsContext="pick_mock_or_file_destination"
                    source={currentlySelectedRuleConfig.TYPE}
                  >
                    <Radio value={RedirectDestinationType.MOCK_OR_FILE_PICKER}>Pick from Files/Mock server</Radio>
                  </MoreInfo>
                </Radio.Group>
              </Popconfirm>
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
