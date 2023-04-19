import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Modal } from "antd";
//FUNCTIONS
import {
  checkIfSourceFilterMigrationStepsAreAlreadyPerformed,
  executeMigrationForSourceFilterFormat,
  setSourceFilterMigrationStepsDone,
  executeV2MigrationForHeaderRules,
  checkIfHeadersV2MigrationStepsAreAlreadyPerformed,
  setHeadersV2MigrationStepsDone,
} from "../../../utils/MigrationSteps";
//ACTIONS
import SpinnerColumn from "../SpinnerColumn";
import FEATURES from "../../../config/constants/sub/features";
// UTILS
import { getAppMode } from "../../../store/selectors";
import { isFeatureCompatible } from "../../../utils/CompatibilityUtils";
import { trackHeaderRulesMigratedToV2 } from "modules/analytics/events/misc/migration";

const MigrationCheckModal = () => {
  //GLOBAL STATE
  const appMode = useSelector(getAppMode);

  //Component State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderLoader = () => (
    // Dummy message to identify the type of migration
    <SpinnerColumn message="Verifying integrity, just a sec" />
  );

  useEffect(() => {
    // Check if migration steps are already performed
    checkIfSourceFilterMigrationStepsAreAlreadyPerformed(appMode).then((result) => {
      if (!result) {
        setIsModalOpen(true);
        executeMigrationForSourceFilterFormat(appMode).then(() => {
          setSourceFilterMigrationStepsDone(appMode).then(() => {
            setIsModalOpen(false);
          });
        });
      } else {
        return;
      }
    });
  }, [appMode]);

  useEffect(() => {
    if (isFeatureCompatible(FEATURES.HEADERS_V2_MIGRATION)) {
      checkIfHeadersV2MigrationStepsAreAlreadyPerformed(appMode).then((result) => {
        if (!result) {
          executeV2MigrationForHeaderRules(appMode).then(() => {
            setHeadersV2MigrationStepsDone(appMode);
            trackHeaderRulesMigratedToV2();
          });
        } else {
          return;
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Force kill after 4 seconds
  setTimeout(() => {
    if (isModalOpen) setIsModalOpen(false);
  }, 4000);

  return (
    <Modal className="modal-dialog-centered " visible={isModalOpen} onCancel={() => null} footer={null}>
      <div className="modal-body ">{renderLoader()}</div>
    </Modal>
  );
};

export default MigrationCheckModal;
