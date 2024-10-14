import React from "react";
import { Dropdown, Tooltip } from "antd";
import { DropdownProps } from "reactstrap";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { BsCollection } from "@react-icons/all-files/bs/BsCollection";
import { RQButton } from "lib/design-system-v2/components";
import { ClearOutlined, CodeOutlined } from "@ant-design/icons";
import { ApiClientSidebarTabKey } from "../APIClientSidebar";
import { RQAPI } from "features/apiClient/types";

interface Props {
  activeTab: ApiClientSidebarTabKey;
  onNewClick: () => void;
  onImportClick: () => void;
  history: RQAPI.Entry[];
  onClearHistory: () => void;
}

enum DropdownOption {
  COLLECTION = "collection",
  REQUEST = "request",
}

export const ApiClientSidebarHeader: React.FC<Props> = ({
  activeTab,
  onNewClick,
  onImportClick,
  history,
  onClearHistory,
}) => {
  const items: DropdownProps["menu"]["items"] = [
    {
      key: DropdownOption.REQUEST,
      onClick: onNewClick,
      label: (
        <div className="new-btn-option">
          <MdOutlineSyncAlt />
          <span>Request</span>
        </div>
      ),
    },
    {
      disabled: true,
      key: DropdownOption.COLLECTION,
      label: (
        <Tooltip title="Coming soon!" placement="right">
          <div className="new-btn-option">
            <BsCollection />
            <span>Collection</span>
          </div>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="api-client-sidebar-header">
      {activeTab === ApiClientSidebarTabKey.COLLECTIONS ? (
        <div>
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            className="api-client-new-btn-dropdown"
            overlayClassName="api-client-new-btn-dropdown-overlay"
          >
            <RQButton type="transparent" size="small" icon={<MdAdd />}>
              New
            </RQButton>
          </Dropdown>

          <RQButton type="transparent" size="small" onClick={onImportClick} icon={<CodeOutlined />}>
            Import
          </RQButton>
        </div>
      ) : activeTab === ApiClientSidebarTabKey.HISTORY ? (
        <RQButton
          disabled={!history?.length}
          type="transparent"
          size="small"
          onClick={onClearHistory}
          icon={<ClearOutlined />}
        >
          Clear history
        </RQButton>
      ) : null}
    </div>
  );
};
