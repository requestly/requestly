import React from "react";
import { Tooltip } from "antd";
import { SessionTitle } from "../components/SessionsTitle/SessionTitle";
import { RQButton } from "lib/design-system/components";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import { MdOutlinePublic } from "@react-icons/all-files/md/MdOutlinePublic";
import { MdOutlineLink } from "@react-icons/all-files/md/MdOutlineLink";
import { DownloadSessionButton } from "../components/DownloadSessionButton/DownloadSessionButton";
import "./savedSessionViewer.scss";

export const SavedSessionViewer: React.FC = () => {
  return (
    <div className="saved-session-viewer-container">
      <div className="saved-session-header">
        <SessionTitle />
        <div className="saved-session-actions">
          <Tooltip title="Delete session">
            <RQButton className="delete-session-btn" iconOnly icon={<RiDeleteBin6Line />} />
          </Tooltip>
          <RQButton className="share-session-btn" icon={<MdOutlinePublic />}>
            Share session
          </RQButton>
          <RQButton className="share-session-btn" icon={<MdOutlineLink />}>
            Copy link
          </RQButton>
          <DownloadSessionButton />
        </div>
      </div>
    </div>
  );
};
