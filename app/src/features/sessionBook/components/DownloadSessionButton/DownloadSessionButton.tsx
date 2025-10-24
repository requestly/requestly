import { RQButton } from "lib/design-system/components";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import DownArrow from "assets/icons/down-arrow.svg?react";
import "./downloadSessionButton.scss";

// TODO: add actions
export const DownloadSessionButton = () => {
  return (
    <div className="download-session-btn-container">
      <RQButton type="primary" className="download-session-btn" icon={<MdOutlineFileDownload />}>
        Download
      </RQButton>
      <RQButton type="primary" className="download-popup-button">
        <DownArrow />
      </RQButton>
    </div>
  );
};
