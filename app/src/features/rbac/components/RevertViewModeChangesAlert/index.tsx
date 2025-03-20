import React from "react";
import { MdOutlineInfo } from "@react-icons/all-files/md/MdOutlineInfo";
import { MdOutlineRefresh } from "@react-icons/all-files/md/MdOutlineRefresh";
import { RQButton } from "lib/design-system-v2/components";
import "./revertViewModeChangesAlert.scss";

interface Props {
  title: string;
  callback: () => void;
}

export const RevertViewModeChangesAlert: React.FC<Props> = ({ title, callback }) => {
  // TODO: Use RQAlert component

  return (
    <div className="revert-view-mode-changes-alert">
      <div className="content">
        <MdOutlineInfo className="icon" />
        <div className="title">{title}</div>
      </div>

      <RQButton className="revert-btn" type="secondary" size="small" onClick={callback} icon={<MdOutlineRefresh />}>
        Revert changes
      </RQButton>
    </div>
  );
};
