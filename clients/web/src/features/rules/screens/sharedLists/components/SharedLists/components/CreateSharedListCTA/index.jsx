import React, { useState } from "react";
import { Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

//UTILS
import { redirectToRules } from "utils/RedirectionUtils";
import { getAppMode } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { FeatureBanner } from "components/common/featureBanner";
import ImportSharedListFromURLModal from "../../modals/ImportSharedListFromURLModal";

//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";

const CreateSharedListCTA = () => {
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);

  // Component State
  const [isImportSharedListFromURLModalVisible, setIsImportSharedListFromURLModalVisible] = useState(false);

  const renderEmptyListDescription = () => {
    return (
      <>
        <p>To create a Shared List, go to Rules page, select the required rules & click Share Rules button</p>
        <Row justify="center" gutter={[8, 0]}>
          <Col>
            {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP && (
              <RQButton
                type="primary"
                onClick={() => {
                  setIsImportSharedListFromURLModalVisible(true);
                }}
              >
                Import from URL
              </RQButton>
            )}
          </Col>
          <Col>
            <RQButton
              type={appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? "default" : "primary"}
              onClick={() => redirectToRules(navigate)}
            >
              Go to Rules
            </RQButton>
          </Col>
        </Row>
      </>
    );
  };

  return (
    <>
      <FeatureBanner
        title="Share Rules with other users"
        bannerImg={"/assets/media/common/file.svg"}
        bannerTitle="Shared lists"
        description={renderEmptyListDescription()}
      />
      {isImportSharedListFromURLModalVisible ? (
        <ImportSharedListFromURLModal
          isOpen={isImportSharedListFromURLModalVisible}
          toggle={() => setIsImportSharedListFromURLModalVisible(!isImportSharedListFromURLModalVisible)}
        />
      ) : null}
    </>
  );
};

export default CreateSharedListCTA;
