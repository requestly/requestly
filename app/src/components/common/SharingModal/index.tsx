import React, { useMemo } from "react";
import { RQModal } from "lib/design-system/components";
import { Tabs } from "antd";
import { ShareLinkView } from "./ShareLinkView";
import { HiOutlineShare } from "@react-icons/all-files/hi/HiOutlineShare";
import { PiWarningCircleBold } from "@react-icons/all-files/pi/PiWarningCircleBold";
import { DownloadRules } from "./DownloadRules";
import type { TabsProps } from "antd";
import { SharingOptions } from "./types";
import "./index.css";
import { trackSharingTabSwitched } from "modules/analytics/events/misc/sharing";

interface ModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  selectedRules: string[];
  source: string;
}

export const SharingModal: React.FC<ModalProps> = ({ isOpen, toggleModal, source, selectedRules = null }) => {
  const sharingOptions: TabsProps["items"] = useMemo(
    () => [
      // {
      //   key: SharingOptions.WORKSPACE,
      //   label: "Share in workspace",
      //   children: "SHARE WITHIN WORKSPACE HERE",
      // },
      {
        key: SharingOptions.SHARE_LINK,
        label: "Shared list",
        children: (
          <>
            {selectedRules?.length ? (
              <ShareLinkView selectedRules={selectedRules} source={source} />
            ) : (
              <EmptySelectionView />
            )}
          </>
        ),
      },
      {
        key: SharingOptions.DOWNLOAD,
        label: "Download",
        children: (
          <>
            {selectedRules?.length ? (
              <DownloadRules selectedRules={selectedRules} toggleModal={toggleModal} />
            ) : (
              <EmptySelectionView />
            )}
          </>
        ),
      },
    ],
    [selectedRules, toggleModal, source]
  );

  const handleSharingOptionsChange = (key: SharingOptions) => {
    trackSharingTabSwitched(key);
  };

  return (
    <RQModal
      wrapClassName="sharing-modal-wrapper"
      title="Share rule"
      open={isOpen}
      destroyOnClose
      onCancel={toggleModal}
      centered
    >
      <div className="rq-modal-content">
        <div className="sharing-modal-header">
          <HiOutlineShare /> Share rule
        </div>
        <Tabs
          defaultActiveKey={SharingOptions.SHARE_LINK}
          items={sharingOptions}
          onChange={handleSharingOptionsChange}
        />
      </div>
    </RQModal>
  );
};

const EmptySelectionView = () => {
  return (
    <div className="sharing-modal-empty-view sharing-modal-body">
      <PiWarningCircleBold />
      <div className="title text-white text-bold">Please select the rules that you want to share</div>
    </div>
  );
};
