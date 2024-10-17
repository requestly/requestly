import React from "react";
import { Dropdown } from "antd";
import { DropdownProps } from "reactstrap";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { BsCollection } from "@react-icons/all-files/bs/BsCollection";
import { RQButton } from "lib/design-system-v2/components";
import { ClearOutlined, CodeOutlined } from "@ant-design/icons";
import { ApiClientSidebarTabKey } from "../APIClientSidebar";
import { RQAPI } from "features/apiClient/types";
import { trackNewCollectionClicked, trackNewRequestClicked } from "modules/analytics/events/features/apiClient";

interface Props {
  activeTab: ApiClientSidebarTabKey;
  onNewClick: (recordType: RQAPI.RecordType) => void;
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
      onClick: () => {
        trackNewCollectionClicked("api_client_sidebar_header");
        onNewClick(RQAPI.RecordType.COLLECTION);
      },
      key: DropdownOption.COLLECTION,
      label: (
        <div className="new-btn-option">
          <BsCollection />
          <span>Collection</span>
        </div>
      ),
    },
    {
      key: DropdownOption.REQUEST,
      onClick: () => {
        trackNewRequestClicked("api_client_sidebar_header");
        onNewClick(RQAPI.RecordType.API);
      },
      label: (
        <div className="new-btn-option">
          <MdOutlineSyncAlt />
          <span>Request</span>
        </div>
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
