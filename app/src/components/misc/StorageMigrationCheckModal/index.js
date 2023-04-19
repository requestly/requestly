import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Modal } from "antd";
//FUNCTIONS
import {
  checkIfStorageMigrationStepsAreAlreadyPerformed,
  executeStorageMigrationSteps,
  setStorageMigrationStepsDone,
} from "utils/StorageMigration";
//ACTIONS
import SpinnerColumn from "../SpinnerColumn";
// UTILS
import { getAppMode } from "../../../store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

const StorageMigrationCheckModal = () => {
  //GLOBAL STATE
  const appMode = useSelector(getAppMode);

  //Component State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderLoader = () => <SpinnerColumn message="Verifying storage integrity, just a sec" />;

  useEffect(() => {
    // Check if appMode is extension
    if (appMode !== GLOBAL_CONSTANTS.APP_MODES.EXTENSION) return;

    // Check if migration steps are already performed
    checkIfStorageMigrationStepsAreAlreadyPerformed(appMode).then((result) => {
      if (!result) {
        setIsModalOpen(true);
        executeStorageMigrationSteps(appMode).then(() => {
          setStorageMigrationStepsDone(appMode).then(() => {
            setIsModalOpen(false);
          });
        });
      } else {
        return;
      }
    });
  }, [appMode]);

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

export default StorageMigrationCheckModal;
