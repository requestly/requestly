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
import { EnvironmentSwitcher } from "./components/environmentSwitcher/EnvironmentSwitcher";
import { trackNewCollectionClicked, trackNewRequestClicked } from "modules/analytics/events/features/apiClient";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { getUserAuthDetails } from "store/selectors";

interface Props {
  activeTab: ApiClientSidebarTabKey;
  // TODO: FIX THIS
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
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  const items: DropdownProps["menu"]["items"] = [
    {
      onClick: () => {
        if (!user.loggedIn) {
          dispatch(
            // @ts-ignore
            actions.toggleActiveModal({
              modalName: "authModal",
              newValue: true,
              newProps: {
                src: APP_CONSTANTS.FEATURES.API_CLIENT,
                authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
                eventSource: "api_client_sidebar_header",
              },
            })
          );

          return;
        }

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
        if (!user.loggedIn) {
          dispatch(
            // @ts-ignore
            actions.toggleActiveModal({
              modalName: "authModal",
              newValue: true,
              newProps: {
                src: APP_CONSTANTS.FEATURES.API_CLIENT,
                authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
                eventSource: "api_client_sidebar_header",
              },
            })
          );

          return;
        }

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
      ) : activeTab === ApiClientSidebarTabKey.ENVIRONMENTS ? (
        <RQButton
          type="transparent"
          size="small"
          icon={<MdAdd />}
          onClick={() => onNewClick(RQAPI.RecordType.ENVIRONMENT)}
        >
          New
        </RQButton>
      ) : null}

      {user.loggedIn && <EnvironmentSwitcher />}
    </div>
  );
};
