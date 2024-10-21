import React from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Tooltip } from "antd";
import { DropdownProps } from "reactstrap";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { BsCollection } from "@react-icons/all-files/bs/BsCollection";
import { RQButton } from "lib/design-system-v2/components";
import { ClearOutlined, CodeOutlined } from "@ant-design/icons";
import { ApiClientSidebarTabKey } from "../APIClientSidebar";
import { RQAPI } from "features/apiClient/types";
import { EnvironmentSwitcher } from "./components/environmentSwitcher/EnvironmentSwitcher";
import { redirectToNewEnvironment } from "utils/RedirectionUtils";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import APP_CONSTANTS from "config/constants";
import { actions } from "store";

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
  const user = useSelector(getUserAuthDetails);
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      ) : activeTab === ApiClientSidebarTabKey.ENVIRONMENTS ? (
        <RQButton
          type="transparent"
          size="small"
          icon={<MdAdd />}
          onClick={() => {
            dispatch(
              actions.toggleActiveModal({
                modalName: "authModal",
                newValue: true,
                newProps: {
                  eventSource: "environments_list",
                  authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
                  warningMessage: "Please log in to create a new environment",
                },
              })
            );
            redirectToNewEnvironment(navigate);
          }}
        >
          New
        </RQButton>
      ) : null}

      {user.loggedIn && <EnvironmentSwitcher />}
    </div>
  );
};
