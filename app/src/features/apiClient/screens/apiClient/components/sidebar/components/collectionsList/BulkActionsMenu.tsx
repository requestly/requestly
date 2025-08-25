import { MdMoveDown } from "@react-icons/all-files/md/MdMoveDown";
import { IoCloseSharp } from "@react-icons/all-files/io5/IoCloseSharp";
import { CgTrash } from "@react-icons/all-files/cg/CgTrash";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { IoDuplicateOutline } from "@react-icons/all-files/io5/IoDuplicateOutline";
import React, { useMemo } from "react";
import { BulkActions } from "features/apiClient/types";
import { Checkbox, TooltipProps } from "antd";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import "./bulkActionsMenu.scss";

export interface ActionMenuProps {
  isAllRecordsSelected: boolean;
  toggleSelection: () => void;
  bulkActionsHandler: (arg: BulkActions) => void;
  disabledActions?: {
    [key in BulkActions]?: { value: boolean; tooltip: string };
  };
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  isAllRecordsSelected,
  toggleSelection,
  bulkActionsHandler,
  disabledActions,
}) => {
  const actionsItems = useMemo(
    () => [
      {
        title: "Duplicate",
        icon: <IoDuplicateOutline />,
        onClick: () => bulkActionsHandler(BulkActions.DUPLICATE),
        disable: disabledActions?.[BulkActions.DUPLICATE]?.value,
        disabledTooltipTitle: disabledActions?.[BulkActions.DUPLICATE]?.tooltip,
      },
      {
        title: "Move",
        icon: <MdMoveDown />,
        onClick: () => bulkActionsHandler(BulkActions.MOVE),
        disable: disabledActions?.[BulkActions.MOVE]?.value,
        disabledTooltipTitle: disabledActions?.[BulkActions.MOVE]?.tooltip,
      },
      {
        title: "Export",
        icon: <MdOutlineFileDownload />,
        onClick: () => bulkActionsHandler(BulkActions.EXPORT),
        disable: disabledActions?.[BulkActions.EXPORT]?.value,
        disabledTooltipTitle: disabledActions?.[BulkActions.EXPORT]?.tooltip,
      },
      {
        title: "Delete",
        icon: <CgTrash height={"14px"} />,
        onClick: () => bulkActionsHandler(BulkActions.DELETE),
        disable: disabledActions?.[BulkActions.DELETE]?.value,
        disabledTooltipTitle: disabledActions?.[BulkActions.DELETE]?.tooltip,
      },
      {
        title: "Close",
        icon: <IoCloseSharp height={"14px"} />,
        onClick: toggleSelection,
      },
    ],
    [bulkActionsHandler, disabledActions, toggleSelection]
  );

  return (
    <div className="api-client-actions-menu">
      <div className="api-client-select-all-container">
        <label>
          <Checkbox checked={isAllRecordsSelected} onChange={() => bulkActionsHandler(BulkActions.SELECT_ALL)} /> Select
          all
        </label>
      </div>
      <div className="api-client-actions-container">
        {actionsItems.map((item, index) => {
          const disable = item.disable ?? false;
          const tooltipTitle = item.disable ? item.disabledTooltipTitle : item.title;
          const tooltipPlacement: TooltipProps["placement"] = item.disable ? "bottom" : "top";

          return (
            <RQTooltip key={index} title={tooltipTitle} placement={tooltipPlacement}>
              <>
                <RQButton
                  size="small"
                  type="transparent"
                  className="api-client-action-btn"
                  disabled={disable}
                  onClick={item.onClick}
                >
                  {item.icon}
                </RQButton>
              </>
            </RQTooltip>
          );
        })}
      </div>
    </div>
  );
};

export default ActionMenu;
