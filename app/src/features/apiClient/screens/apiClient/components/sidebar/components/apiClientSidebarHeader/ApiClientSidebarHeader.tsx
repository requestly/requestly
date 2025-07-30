import React, { useEffect, useMemo, useState } from "react";
import { Dropdown, DropdownProps } from "antd";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { BsCollection } from "@react-icons/all-files/bs/BsCollection";
import { RQButton } from "lib/design-system-v2/components";
import { ClearOutlined, CodeOutlined } from "@ant-design/icons";
import { ApiClientSidebarTabKey } from "../../APIClientSidebar";
import { ApiClientImporterType, RQAPI } from "features/apiClient/types";
import { EnvironmentSwitcher } from "./components/environmentSwitcher/EnvironmentSwitcher";
import { trackImportStarted } from "modules/analytics/events/features/apiClient";
import { ApiClientImportModal } from "../../../modals/importModal/ApiClientImportModal";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { trackCreateEnvironmentClicked } from "features/apiClient/screens/environment/analytics";
import { SiPostman } from "@react-icons/all-files/si/SiPostman";
import { SiBruno } from "@react-icons/all-files/si/SiBruno";
import { PostmanImporterModal } from "../../../modals/postmanImporterModal/PostmanImporterModal";
import { GrGraphQl } from "@react-icons/all-files/gr/GrGraphQl";
import { MdOutlineTerminal } from "@react-icons/all-files/md/MdOutlineTerminal";
import { BrunoImporterModal } from "features/apiClient/screens/BrunoImporter";
import { useLocation } from "react-router-dom";
import { RoleBasedComponent } from "features/rbac";

interface Props {
  activeTab: ApiClientSidebarTabKey;
  // TODO: FIX THIS
  onNewClick: (recordType: RQAPI.RecordType, entryType?: RQAPI.ApiEntryType) => void;
  onImportClick: () => void;
  history: RQAPI.ApiEntry[];
  onClearHistory: () => void;
}

enum DropdownOption {
  HTTP_REQUEST = "http_request",
  GRAPHQL_REQUEST = "graphql_request",
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
  const { state } = useLocation();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPostmanImporterModalOpen, setIsPostmanImporterModalOpen] = useState(false);
  const [isBrunoImporterModalOpen, setIsBrunoImporterModalOpen] = useState(false);

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
        onClick: () => {
          onImportClick();
        },
      },
      {
        key: "2",
        label: (
          <div className="new-btn-option">
            <BsCollection />
            Requestly Collection and Environments
          </div>
        ),
        onClick: () => {
          trackImportStarted(ApiClientImporterType.REQUESTLY);
          setIsImportModalOpen(true);
        },
      },
      {
        key: "3",
        label: (
          <div className="new-btn-option">
            <SiPostman /> Postman Collections and Environments
          </div>
        ),
        onClick: () => {
          trackImportStarted(ApiClientImporterType.POSTMAN);
          setIsPostmanImporterModalOpen(true);
        },
      },
      {
        key: "4",
        label: (
          <div className="new-btn-option">
            <SiBruno /> Bruno Collections and Variables
          </div>
        ),
        onClick: () => {
          trackImportStarted(ApiClientImporterType.BRUNO);
          setIsBrunoImporterModalOpen(true);
        },
      },
    ],
    [onImportClick]
  );

  const items: DropdownProps["menu"]["items"] = [
    {
      key: DropdownOption.HTTP_REQUEST,
      label: (
        <div className="new-btn-option">
          <MdOutlineSyncAlt />
          <span>HTTP Request</span>
        </div>
      ),
      onClick: () => {
        onNewClick(RQAPI.RecordType.API, RQAPI.ApiEntryType.HTTP);
      },
    },
    {
      key: DropdownOption.GRAPHQL_REQUEST,
      label: (
        <div className="new-btn-option">
          <GrGraphQl />
          <span>GraphQL Request</span>
        </div>
      ),
      onClick: () => {
        onNewClick(RQAPI.RecordType.API, RQAPI.ApiEntryType.GRAPHQL);
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
        trackCreateEnvironmentClicked("api_client_sidebar_header");
        onNewClick(RQAPI.RecordType.ENVIRONMENT);
      },
    },
  ];

  useEffect(() => {
    if (state?.modal) {
      switch (state?.modal) {
        case ApiClientImporterType.BRUNO:
          setIsBrunoImporterModalOpen(true);
          break;
        case ApiClientImporterType.POSTMAN:
          setIsPostmanImporterModalOpen(true);
          break;
        case ApiClientImporterType.REQUESTLY:
          setIsImportModalOpen(true);
          break;
        default:
          break;
      }
    }
  }, [state?.modal]);

  return (
    <>
      <div className="api-client-sidebar-header">
        {activeTab === ApiClientSidebarTabKey.COLLECTIONS || activeTab === ApiClientSidebarTabKey.ENVIRONMENTS ? (
          <RoleBasedComponent resource="api_client_request" permission="create">
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
          </RoleBasedComponent>
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

        <EnvironmentSwitcher />
      </div>

      {isImportModalOpen && (
        <ApiClientImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      )}
      {isPostmanImporterModalOpen && (
        <PostmanImporterModal
          isOpen={isPostmanImporterModalOpen}
          onClose={() => setIsPostmanImporterModalOpen(false)}
        />
      )}
      {isBrunoImporterModalOpen && (
        <BrunoImporterModal isOpen={isBrunoImporterModalOpen} onClose={() => setIsBrunoImporterModalOpen(false)} />
      )}
    </>
  );
};
