import React, { useMemo, useState } from "react";
import { Dropdown, DropdownProps } from "antd";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { BsCollection } from "@react-icons/all-files/bs/BsCollection";
import { RQButton } from "lib/design-system-v2/components";
import { ClearOutlined, CodeOutlined } from "@ant-design/icons";
import { ApiClientSidebarTabKey } from "../../APIClientSidebar";
import { RQAPI } from "features/apiClient/types";
import { EnvironmentSwitcher } from "./components/environmentSwitcher/EnvironmentSwitcher";
import {
  trackImportApiCollectionsClicked,
  trackImportFromPostmanClicked,
  trackNewCollectionClicked,
  trackNewRequestClicked,
} from "modules/analytics/events/features/apiClient";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { ImportCollectionsModal } from "../../../modals/importCollectionsModal/ImportCollectionsModal";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { trackCreateEnvironmentClicked } from "features/apiClient/screens/environment/analytics";
import { SiPostman } from "@react-icons/all-files/si/SiPostman";
import { PostmanImporterModal } from "../../../modals/postmanImporterModal/PostmanImporterModal";
import { useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { MdOutlineTerminal } from "@react-icons/all-files/md/MdOutlineTerminal";

interface Props {
  activeTab: ApiClientSidebarTabKey;
  // TODO: FIX THIS
  onNewClick: (recordType: RQAPI.RecordType) => void;
  onImportClick: () => void;
  history: RQAPI.Entry[];
  onClearHistory: () => void;
}

enum DropdownOption {
  REQUEST = "request",
  COLLECTION = "collection",
  ENVIRONMENT = "environment",
}

export const ApiClientSidebarHeader: React.FC<Props> = ({
  activeTab,
  onNewClick,
  onImportClick,
  history,
  onClearHistory,
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(getUserAuthDetails);
  const [isImportCollectionsModalOpen, setIsImportCollectionsModalOpen] = useState(false);
  const [isPostmanImporterModalOpen, setIsPostmanImporterModalOpen] = useState(false);

  const importItems: DropdownProps["menu"]["items"] = useMemo(
    () => [
      {
        key: "1",
        label: (
          <div className="new-btn-option">
            <MdOutlineTerminal />
            cURL
          </div>
        ),
        onClick: onImportClick,
        disabled: location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.INDEX),
      },
      {
        key: "2",
        label: (
          <div className="new-btn-option">
            <BsCollection />
            Requestly Collection
          </div>
        ),
        disabled: location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.INDEX),
        onClick: () => {
          if (!user.loggedIn) {
            dispatch(
              globalActions.toggleActiveModal({
                modalName: "authModal",
                newValue: true,
                newProps: {
                  eventSource: "api_client_sidebar",
                  authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
                  warningMessage: `Please log in to import collections`,
                },
              })
            );
          } else {
            trackImportApiCollectionsClicked();
            setIsImportCollectionsModalOpen(true);
          }
        },
      },
      {
        key: "3",
        label: (
          <div className="new-btn-option">
            <SiPostman /> Postman
          </div>
        ),
        onClick: () => {
          trackImportFromPostmanClicked();
          setIsPostmanImporterModalOpen(true);
        },
      },
    ],
    [user.loggedIn, dispatch, location.pathname, onImportClick]
  );

  const items: DropdownProps["menu"]["items"] = [
    {
      key: DropdownOption.REQUEST,
      label: (
        <div className="new-btn-option">
          <MdOutlineSyncAlt />
          <span>Request</span>
        </div>
      ),
      onClick: () => {
        if (!user.loggedIn) {
          dispatch(
            // @ts-ignore
            globalActions.toggleActiveModal({
              modalName: "authModal",
              newValue: true,
              newProps: {
                eventSource: "api_client_sidebar_header",
                authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
                src: APP_CONSTANTS.FEATURES.API_CLIENT,
                warningMessage: "Please log in to create a new request!",
              },
            })
          );

          return;
        }

        trackNewRequestClicked("api_client_sidebar_header");
        onNewClick(RQAPI.RecordType.API);
      },
    },
    {
      key: DropdownOption.COLLECTION,
      label: (
        <div className="new-btn-option">
          <BsCollection />
          <span>Collection</span>
        </div>
      ),
      onClick: () => {
        if (!user.loggedIn) {
          dispatch(
            // @ts-ignore
            globalActions.toggleActiveModal({
              modalName: "authModal",
              newValue: true,
              newProps: {
                src: APP_CONSTANTS.FEATURES.API_CLIENT,
                authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
                eventSource: "api_client_sidebar_header",
                warningMessage: "Please log in to create a new collection!",
              },
            })
          );

          return;
        }

        trackNewCollectionClicked("api_client_sidebar_header");
        onNewClick(RQAPI.RecordType.COLLECTION);
      },
    },
    {
      key: DropdownOption.ENVIRONMENT,
      label: (
        <div className="new-btn-option">
          <MdHorizontalSplit />
          <span>Environment</span>
        </div>
      ),
      onClick: () => {
        if (!user.loggedIn) {
          dispatch(
            globalActions.toggleActiveModal({
              modalName: "authModal",
              newValue: true,
              newProps: {
                src: APP_CONSTANTS.FEATURES.API_CLIENT,
                eventSource: "api_client_sidebar_header",
                authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
                warningMessage: "Please log in to create a new environment!",
              },
            })
          );

          return;
        }
        trackCreateEnvironmentClicked("api_client_sidebar_header");
        onNewClick(RQAPI.RecordType.ENVIRONMENT);
      },
    },
  ];

  return (
    <>
      <div className="api-client-sidebar-header">
        {activeTab === ApiClientSidebarTabKey.COLLECTIONS || activeTab === ApiClientSidebarTabKey.ENVIRONMENTS ? (
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
            <Dropdown
              menu={{ items: importItems }}
              trigger={["click"]}
              className="api-client-new-btn-dropdown"
              overlayClassName="api-client-new-btn-dropdown-overlay"
            >
              <RQButton type="transparent" size="small" icon={<CodeOutlined />}>
                Import
              </RQButton>
            </Dropdown>
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

        {user.loggedIn && <EnvironmentSwitcher />}
      </div>

      {isImportCollectionsModalOpen && (
        <ImportCollectionsModal
          isOpen={isImportCollectionsModalOpen}
          onClose={() => setIsImportCollectionsModalOpen(false)}
        />
      )}
      {isPostmanImporterModalOpen && (
        <PostmanImporterModal
          isOpen={isPostmanImporterModalOpen}
          onClose={() => setIsPostmanImporterModalOpen(false)}
        />
      )}
    </>
  );
};
