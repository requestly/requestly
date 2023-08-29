import React, { useMemo } from "react";
import { RQModal } from "lib/design-system/components";
import { Tabs } from "antd";
import { ShareLinkView } from "./ShareLinkView";
import { HiOutlineShare } from "@react-icons/all-files/hi/HiOutlineShare";
import type { TabsProps } from "antd";
import { SharingOptions } from "./types";
import "./index.css";

interface ModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  rulesToShare: string[];
}

export const SharingModal: React.FC<ModalProps> = ({ isOpen, toggleModal, rulesToShare = null }) => {
  const sharingOptions: TabsProps["items"] = useMemo(
    () => [
      {
        key: SharingOptions.WORKSPACE,
        label: "Share in workspace",
        children: "SHARE WITHIN WORKSPACE HERE",
      },
      {
        key: SharingOptions.SHARE_LINK,
        label: "Shared list",
        children: <ShareLinkView rulesToShare={rulesToShare} />,
      },
      {
        key: SharingOptions.DOWNLOAD,
        label: "Download",
        children: "DOWNLOAD FROM HERE",
      },
    ],
    [rulesToShare]
  );

  console.log({ rulesToShare });
  const handleSharingOptionsChange = (key: SharingOptions) => {
    console.log({ key });
    //TODO: track share option tab clicked here
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
          defaultActiveKey={SharingOptions.WORKSPACE}
          items={sharingOptions}
          onChange={handleSharingOptionsChange}
        />
      </div>
      {/* <div className="rq-modal-footer">FOOTER</div> */}
    </RQModal>
  );
};
