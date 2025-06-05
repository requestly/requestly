import { MdMoveDown } from "@react-icons/all-files/md/MdMoveDown";
import { IoCloseSharp } from "@react-icons/all-files/io5/IoCloseSharp";
import { CgTrash } from "@react-icons/all-files/cg/CgTrash";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { IoDuplicateOutline } from "@react-icons/all-files/io5/IoDuplicateOutline";
import React from "react";
import { BulkActions } from "features/apiClient/types";
import { Checkbox, Tooltip } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import "./bulkActionsMenu.scss";

interface Props {
  isAllRecordsSelected: boolean;
  toggleSelection: () => void;
  bulkActionsHandler: (arg: BulkActions) => void;
}

const ActionMenu: React.FC<Props> = ({ isAllRecordsSelected, toggleSelection, bulkActionsHandler }) => {
  const actionsItems = [
    {
      title: "Duplicate",
      icon: <IoDuplicateOutline />,
      onClick: () => bulkActionsHandler(BulkActions.DUPLICATE),
    },
    {
      title: "Move",
      icon: <MdMoveDown />,
      onClick: () => bulkActionsHandler(BulkActions.MOVE),
    },
    {
      title: "Export",
      icon: <MdOutlineFileDownload />,
      onClick: () => bulkActionsHandler(BulkActions.EXPORT),
    },
    {
      title: "Delete",
      icon: <CgTrash height={"14px"} />,
      onClick: () => bulkActionsHandler(BulkActions.DELETE),
    },
    {
      title: "Close",
      icon: <IoCloseSharp height={"14px"} />,
      onClick: toggleSelection,
    },
  ];

  return (
    <div className="api-client-actions-menu">
      <div className="api-client-select-all-container">
        <label>
          <Checkbox checked={isAllRecordsSelected} onChange={() => bulkActionsHandler(BulkActions.SELECT_ALL)} /> Select
          all
        </label>
      </div>
      <div className="api-client-actions-container">
        {actionsItems.map((item, index) => (
          <Tooltip key={index} title={item.title} placement="top">
            <RQButton type="transparent" size="small" className="api-client-action-btn" onClick={item.onClick}>
              {item.icon}
            </RQButton>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default ActionMenu;
