import React, { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { getAvailableTeams } from "store/features/teams/selectors";
import { RQModal } from "lib/design-system/components";
import { Tabs } from "antd";
import { ShareLinkView } from "./ShareLinkView";
import { HiOutlineShare } from "@react-icons/all-files/hi/HiOutlineShare";
import { PiWarningCircleBold } from "@react-icons/all-files/pi/PiWarningCircleBold";
import { DownloadRules } from "./DownloadRules";
import { ShareInWorkspaces } from "./Workspaces";
import type { TabsProps } from "antd";
import { SharingOptions } from "./types";
import { trackShareModalViewed, trackSharingTabSwitched } from "modules/analytics/events/misc/sharing";
import "./index.css";

interface ModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  selectedRules: string[];
  source: string;
}

export const SharingModal: React.FC<ModalProps> = ({ isOpen, toggleModal, source, selectedRules = null }) => {
  const availableTeams = useSelector(getAvailableTeams);
  const sharingOptions: TabsProps["items"] = useMemo(
    () => [
      {
        key: SharingOptions.WORKSPACE,
        label: "Share in workspaces",
        children: (
          <>
            {selectedRules?.length ? (
              <ShareInWorkspaces selectedRules={selectedRules} toggleModal={toggleModal} />
            ) : (
              <EmptySelectionView />
            )}
          </>
        ),
      },
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

  useEffect(() => {
    trackShareModalViewed(selectedRules?.length, source, availableTeams?.length);
  }, [availableTeams?.length, selectedRules?.length, source]);

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
          defaultActiveKey={SharingOptions.WORKSPACE}
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
