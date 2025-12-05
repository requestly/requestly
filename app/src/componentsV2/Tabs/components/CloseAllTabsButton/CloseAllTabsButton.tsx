import { Tooltip } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import React, { useState } from "react";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { CloseAllTabsModal } from "features/apiClient/screens/apiClient/components/modals/CloseAllTabsModal/CloseAllTabsModal";

interface Props {
  unSavedTabsCount: number;
  closeAllOpenTabs: (type: string) => void;
}

export const CloseAllTabsButton: React.FC<Props> = ({ unSavedTabsCount, closeAllOpenTabs }) => {
  const [showUnSavedModal, setShowUnSavedModal] = useState(false);

  const onToggleModal = (state: boolean) => {
    setShowUnSavedModal(state);
  };

  const onCloseAllButtonClick = () => {
    if (unSavedTabsCount > 1) {
      setShowUnSavedModal(true);
    } else {
      closeAllOpenTabs("normal");
    }
  };

  return (
    <>
      <Tooltip
        title="Close all opened tabs"
        mouseEnterDelay={0.5}
        overlayClassName="tab-title-tooltip"
        placement="bottomLeft"
      >
        <RQButton
          type="transparent"
          icon={<MdClose size={14} className="close-all-tabs-icon" />}
          size="small"
          className="close-all-tabs-button"
          onClick={onCloseAllButtonClick}
        >
          <span className="close-all-tabs-text">Close all</span>
        </RQButton>
      </Tooltip>
      {showUnSavedModal && unSavedTabsCount > 1 && (
        <CloseAllTabsModal
          open={true}
          onClose={() => onToggleModal(false)}
          unSavedTabsCount={unSavedTabsCount}
          closeAllOpenTabs={closeAllOpenTabs}
        />
      )}
    </>
  );
};
