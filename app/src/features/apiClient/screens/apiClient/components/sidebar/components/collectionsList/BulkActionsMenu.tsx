import { MdMoveDown } from "@react-icons/all-files/md/MdMoveDown";
import { IoCloseSharp } from "@react-icons/all-files/io5/IoCloseSharp";
import { CgTrash } from "@react-icons/all-files/cg/CgTrash";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { IoDuplicateOutline } from "@react-icons/all-files/io5/IoDuplicateOutline";
import React from "react";
import { BulkActions } from "features/apiClient/types";

interface Props {
  toggleSelection: () => void;
  bulkActionsHandler: (arg: BulkActions) => void;
}

const ActionMenu: React.FC<Props> = ({ toggleSelection, bulkActionsHandler }) => {
  return (
    <div className="actions-menu">
      <div className="actions">
        <div className="action-item" onClick={() => bulkActionsHandler(BulkActions.DUPLICATE)}>
          <IoDuplicateOutline />
          <span>Duplicate</span>
        </div>
        <div className="action-item" onClick={() => bulkActionsHandler(BulkActions.MOVE)}>
          <MdMoveDown />
          <span>Move</span>
        </div>
        <div className="action-item" onClick={() => bulkActionsHandler(BulkActions.EXPORT)}>
          <MdOutlineFileDownload />
          <span>Export</span>
        </div>
      </div>
      <div className="cancel-actions">
        <CgTrash height={"14px"} onClick={() => bulkActionsHandler(BulkActions.DELETE)} />
        <IoCloseSharp height={"14px"} onClick={toggleSelection} />
      </div>
    </div>
  );
};

export default ActionMenu;
