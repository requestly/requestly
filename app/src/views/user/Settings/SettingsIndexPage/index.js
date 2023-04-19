import { useSelector } from "react-redux";
import { Col, Row } from "antd";
import GlobalSettings from "../GlobalSettings";
import DesktopPreference from "../DesktopPreferences";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./SettingsIndexPage.css";

const SettingsIndexPage = () => {
  const appMode = useSelector(getAppMode);

  return (
    <Row>
      <Col
        xs={{ offset: 1, span: 22 }}
        sm={{ offset: 1, span: 22 }}
        md={{ offset: 2, span: 20 }}
        lg={{ offset: 3, span: 18 }}
        xl={{ offset: 4, span: 16 }}
        flex="1 1 820px"
      >
        {/* {
          // Hardcoded `confirmationOptions` for now,
          // can later be changed to component state that is updated
          // based on the changes in attribute values
          appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
            <SettingsHeader
              handleUpdateClick={handleUpdateClick}
              confirmationOptions={{
                shouldConfirm: true,
                message:
                  "Browsers launched from Requestly will be closed. Do you want to proceed?",
                confirmCTAText: "Continue",
                handleConfirmDeny: trackUserDeniedClosingLaunchedApps,
              }}
            />
          ) : (
            !!storageType && (
              <SettingsHeader handleUpdateClick={handleUpdateClick} />
            )
          )
        } */}
        <Col span={24} className="settings-container">
          {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP && <DesktopPreference appMode={appMode} />}

          <GlobalSettings appMode={appMode} />
        </Col>
      </Col>
    </Row>
  );
};
export default SettingsIndexPage;
