import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getCurrentlySelectedRuleConfig } from "store/selectors";
import { Row, Col, Input, Tooltip, Dropdown } from "antd";
import {
  FolderOpenOutlined,
  CaretDownOutlined,
  FileSyncOutlined,
  WarningFilled,
} from "@ant-design/icons";
import InfoOutlinedIcon from "../../../../../../../../assets/icons/info-outlined.svg";
import isEmpty from "is-empty";
import FilePickerModal from "../../../../../../filesLibrary/FilePickerModal";
import { isValidUrl } from "utils/FormattingHelper";
import MockPickerModal from "components/features/mocksV2/MockPickerModal";
import { displayFileSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import {
  trackSelectMapLocalFile,
  trackClickMapLocalFile,
  trackClickMock,
  trackSelectMock,
} from "modules/analytics/events/features/rules/redirectDestinationOptions";
import { trackMoreInfoViewed } from "modules/analytics/events/misc/moreInfo";
import { isDesktopMode } from "utils/AppUtils";
import Logger from "lib/logger";
import "./index.css";

const DestinationURLRow = ({
  rowIndex,
  pair,
  pairIndex,
  helperFunctions,
  isInputDisabled,
}) => {
  const { generatePlaceholderText, modifyPairAtGivenPath } = helperFunctions;
  //Component State
  const [isFilePickerModalActive, setIsFilePickerModalActive] = useState(false);
  const currentlySelectedRuleConfig = useSelector(
    getCurrentlySelectedRuleConfig
  );
  const showInfoToolTipWithABTest = true; // temp flag for info icon experiment

  /** TODO: Remove this once MocksV2 Released */
  const toggleFilePickerModal = () => {
    setIsFilePickerModalActive(!isFilePickerModalActive);
  };

  const handleFilePickerAction = (url) => {
    setIsFilePickerModalActive(false);
    modifyPairAtGivenPath(undefined, pairIndex, "destination", url);
  };
  /** TODO: Remove till here */

  const [isMockPickerVisible, setIsMockPickerVisible] = useState(false);

  const handleMockPickerVisibilityChange = (visible) => {
    // seems like an unnecessary abstraction
    setIsMockPickerVisible(visible);
  };

  const handleMockPickerSelectionCallback = (url) => {
    trackSelectMock(url);
    setIsMockPickerVisible(false);
    modifyPairAtGivenPath(undefined, pairIndex, "destination", url);
  };

  const handleFileSelectCallback = (filePath) => {
    trackSelectMapLocalFile(filePath);
    modifyPairAtGivenPath(
      undefined,
      pairIndex,
      "destination",
      `file://${filePath}`
    );
  };

  const handleInputOptionSelect = (e) => {
    switch (e.key) {
      case "mock": {
        trackClickMock();
        setIsMockPickerVisible(true);
        break;
      }
      case "local": {
        trackClickMapLocalFile();
        displayFileSelector(handleFileSelectCallback);
        break;
      }
      default: {
        Logger.error("Added menu item without click handler");
      }
    }
  };

  const inputOptions = () => {
    const items = [
      {
        label: (
          <Tooltip
            title="Redirect to endpoint from Requestly Mock Server or File Server"
            placement="left"
            trigger={showInfoToolTipWithABTest ? ["hover", "focus"] : [null]}
            onOpenChange={(open) => {
              if (open)
                trackMoreInfoViewed(
                  currentlySelectedRuleConfig.TYPE,
                  "pick_from_mock_server"
                );
            }}
          >
            Pick from Mock Server
          </Tooltip>
        ),
        key: "mock",
        icon: <FolderOpenOutlined />,
      },
      {
        label: (
          <Tooltip
            title="Serve content from a local file on your device for matching network request URL"
            placement="left"
            trigger={showInfoToolTipWithABTest ? ["hover", "focus"] : [null]}
            onOpenChange={(open) => {
              if (open)
                trackMoreInfoViewed(
                  currentlySelectedRuleConfig.TYPE,
                  "map_local"
                );
            }}
          >
            Map Local File
          </Tooltip>
        ),
        key: "local",
        disabled: !isFeatureCompatible(FEATURES.REDIRECT_MAP_LOCAL),
        icon: <FileSyncOutlined />,
      },
    ];

    return (
      <Dropdown.Button
        menu={{ items, onClick: handleInputOptionSelect }}
        placement="bottom"
        icon={<CaretDownOutlined />}
        onClick={() => setIsMockPickerVisible(true)}
      >
        Pick from Mock Server
      </Dropdown.Button>
    );
  };

  const preValidateURL = () => {
    const currentDestinationURL = pair.destination;
    if (isEmpty(currentDestinationURL)) return;
    if (
      !isValidUrl(currentDestinationURL) &&
      !currentDestinationURL.startsWith("$")
    ) {
      // Try auto-fixing
      if (
        !currentDestinationURL.startsWith("$") &&
        !currentDestinationURL.startsWith("http://") &&
        !currentDestinationURL.startsWith("https://") &&
        !currentDestinationURL.startsWith("file://")
      ) {
        modifyPairAtGivenPath(
          {
            target: {
              value: "http://" + currentDestinationURL,
            },
          },
          pairIndex,
          "destination"
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

  return (
    <React.Fragment>
      <Row
        className=" margin-top-one"
        key={rowIndex}
        span={24}
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Col span={3}>
          <span className="redirect-rule-destination-label">
            Redirect to{" "}
            {showInfoToolTipWithABTest && (
              <Tooltip
                title={
                  "Define the destination URL where you want to redirect the original request."
                }
                onOpenChange={(open) => {
                  if (open)
                    trackMoreInfoViewed(
                      currentlySelectedRuleConfig.TYPE,
                      "destination_url"
                    );
                }}
              >
                <img src={InfoOutlinedIcon} alt="info" />
              </Tooltip>
            )}
          </span>
        </Col>
        <Col span={21}>
          <Input
            data-tour-id="rule-editor-destination-url"
            className="display-inline-block has-dark-text"
            placeholder={generatePlaceholderText(
              pair.source.operator,
              "destination"
            )}
            type="text"
            onChange={(event) =>
              modifyPairAtGivenPath(event, pairIndex, "destination")
            }
            onBlur={preValidateURL}
            style={{ cursor: "pointer" }}
            value={pair.destination}
            disabled={isInputDisabled}
            addonAfter={
              isInputDisabled ? null : isFeatureCompatible(
                  FEATURES.REDIRECT_MAP_LOCAL
                ) ? (
                inputOptions()
              ) : (
                <Tooltip
                  title="Redirect to endpoint from Requestly Mock Server or File Server"
                  trigger={
                    showInfoToolTipWithABTest ? ["hover", "focus"] : [null]
                  }
                  onClick={() => {
                    trackClickMock();
                    setIsMockPickerVisible(true);
                  }}
                  onOpenChange={(open) => {
                    if (open)
                      trackMoreInfoViewed(
                        currentlySelectedRuleConfig.TYPE,
                        "pick_from_mock_server"
                      );
                  }}
                >
                  <FolderOpenOutlined />
                  &nbsp; Pick from Mock Server
                </Tooltip>
              )
            }
            status={showInputWarning() ? "warning" : null}
            suffix={
              showInputWarning() ? (
                <Tooltip
                  title={
                    isDesktopMode()
                      ? "Update to latest version to redirect to Local File"
                      : "Map Local File is not supported in Extension. Use Requestly Desktop App instead."
                  }
                >
                  <WarningFilled />
                </Tooltip>
              ) : null
            }
          />
        </Col>
      </Row>
      {/* MODALS */}
      {/* Remove this once MocksV2 Released */}
      {isFilePickerModalActive ? (
        <FilePickerModal
          isOpen={isFilePickerModalActive}
          toggle={toggleFilePickerModal}
          callback={handleFilePickerAction}
        />
      ) : null}
      {/* Till here */}
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
