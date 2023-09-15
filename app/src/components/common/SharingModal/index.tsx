import React, { useMemo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAvailableTeams } from "store/features/teams/selectors";
import { RQModal } from "lib/design-system/components";
import { Tabs, Typography } from "antd";
import { ShareLinkView } from "./ShareLinkView";
import { HiOutlineShare } from "@react-icons/all-files/hi/HiOutlineShare";
import { PiWarningCircleBold } from "@react-icons/all-files/pi/PiWarningCircleBold";
import { InfoCircleOutlined } from "@ant-design/icons";
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
  const [activeTab, setActiveTab] = useState(SharingOptions.WORKSPACE);

  const sharingOptions: TabsProps["items"] = useMemo(
    () => [
      {
        key: SharingOptions.WORKSPACE,
        label: "Share in workspace",
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
    setActiveTab(key);
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
          activeKey={activeTab}
          items={sharingOptions}
          onChange={handleSharingOptionsChange}
        />
      </div>
      {activeTab !== SharingOptions.WORKSPACE && selectedRules?.length ? (
        <>
          <div className="sharing-modal-footer">
            <InfoCircleOutlined className="sharing-modal-footer-icon" />
            {activeTab === SharingOptions.DOWNLOAD && (
              <span className="sharing-modal-footer-text" style={{ maxWidth: "80%" }}>
                Downloaded rules don’t update when you share them with other users.{" "}
                <Typography.Link onClick={() => setActiveTab(SharingOptions.WORKSPACE)}>
                  Share in a workspace
                </Typography.Link>{" "}
                to collaborate with teammates with live updates.
              </span>
            )}

            {activeTab === SharingOptions.SHARE_LINK && (
              <span className="sharing-modal-footer-text">
                Sharing with URLs only share current state of rules, it does not update in realtime.{" "}
                <Typography.Link onClick={() => setActiveTab(SharingOptions.WORKSPACE)}>
                  Share in a workspace
                </Typography.Link>{" "}
                to collaborate with teammates with live updates.
              </span>
            )}
          </div>
        </>
      ) : null}
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
