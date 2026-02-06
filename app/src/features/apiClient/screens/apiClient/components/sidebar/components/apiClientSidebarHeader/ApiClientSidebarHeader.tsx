import React, { useEffect, useMemo, useState } from "react";
import { Dropdown, MenuProps } from "antd";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { BsCollection } from "@react-icons/all-files/bs/BsCollection";
import { RQButton } from "lib/design-system-v2/components";
import { ClearOutlined, CodeOutlined } from "@ant-design/icons";
import { RQAPI, ApiClientImporterType } from "@requestly/shared/types/entities/apiClient";
import { EnvironmentSwitcher } from "./components/environmentSwitcher/EnvironmentSwitcher";
import { trackImportStarted } from "modules/analytics/events/features/apiClient";
import { ApiClientImportModal } from "../../../modals/importModal/ApiClientImportModal";
import { SiPostman } from "@react-icons/all-files/si/SiPostman";
import { SiBruno } from "@react-icons/all-files/si/SiBruno";
import { PostmanImporterModal } from "../../../modals/postmanImporterModal/PostmanImporterModal";
import { MdOutlineTerminal } from "@react-icons/all-files/md/MdOutlineTerminal";
import { BrunoImporterModal } from "features/apiClient/screens/BrunoImporter";
import { useLocation } from "react-router-dom";
import { RoleBasedComponent } from "features/rbac";
import { NewApiRecordDropdown } from "../NewApiRecordDropdown/NewApiRecordDropdown";
import { ApiClientSidebarTabKey } from "../../SingleWorkspaceSidebar/SingleWorkspaceSidebar";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { SiOpenapiinitiative } from "@react-icons/all-files/si/SiOpenapiinitiative";
import { CommonApiClientImportModal } from "../../../modals/CommonApiClientImportModal/CommonApiClientImportModal";
import { ApiClientImporterMethod, openApiImporter } from "@requestly/alternative-importers";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import LINKS from "config/constants/sub/links";

interface Props {
  activeTab: ApiClientSidebarTabKey;
  // TODO: FIX THIS
  onNewClick: (recordType: RQAPI.RecordType, entryType?: RQAPI.ApiEntryType) => void;
  onImportClick: () => void;
  history: RQAPI.ApiEntry[];
  onClearHistory: () => void;
}

interface ImportModalConfig {
  productName: string;
  supportedFileTypes: string[];
  importer: ApiClientImporterMethod<any>;
  importerType: ApiClientImporterType;
  docsLink?: string;
}

export const ApiClientSidebarHeader: React.FC<Props> = ({
  activeTab,
  onNewClick,
  onImportClick,
  history,
  onClearHistory,
}) => {
  const viewMode = useApiClientMultiWorkspaceView((s) => s.viewMode);
  const { state } = useLocation();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPostmanImporterModalOpen, setIsPostmanImporterModalOpen] = useState(false);
  const [isBrunoImporterModalOpen, setIsBrunoImporterModalOpen] = useState(false);
  const [commonImportModalConfig, setCommonImportModalConfig] = useState<ImportModalConfig | null>(null);
  const isOpenApiSupportEnabled = useFeatureIsOn("openapi-import-support");

  const importItems: MenuProps["items"] = useMemo(
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
        hidden: !isOpenApiSupportEnabled,
        label: (
          <div className="new-btn-option">
            <SiOpenapiinitiative /> OpenAPI Specifications
          </div>
        ),
        onClick: () => {
          trackImportStarted(ApiClientImporterType.OPENAPI);
          setCommonImportModalConfig({
            productName: "OpenAPI Specifications",
            supportedFileTypes: ["application/yaml", "application/json", "application/x-yaml", "application/x-json"],
            importer: openApiImporter,
            importerType: ApiClientImporterType.OPENAPI,
            docsLink: LINKS.REQUESTLY_API_CLIENT_IMPORT_OPENAPI_DOCS,
          });
        },
      },
      {
        key: "3",
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
        key: "4",
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
        key: "5",
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
    [onImportClick, isOpenApiSupportEnabled]
  );

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
        case ApiClientImporterType.OPENAPI:
          setCommonImportModalConfig({
            productName: "OpenAPI Specifications",
            supportedFileTypes: ["application/yaml", "application/json", "application/x-yaml", "application/x-json"],
            importer: openApiImporter,
            importerType: ApiClientImporterType.OPENAPI,
            docsLink: LINKS.REQUESTLY_API_CLIENT_IMPORT_OPENAPI_DOCS,
          });
          break;
        default:
          break;
      }
    }
  }, [state?.modal]);

  return (
    <>
      <div className="api-client-sidebar-header">
        {activeTab === ApiClientSidebarTabKey.COLLECTIONS ||
        activeTab === ApiClientSidebarTabKey.ENVIRONMENTS ||
        activeTab === ApiClientSidebarTabKey.RUNTIME_VARIABLES ? (
          <RoleBasedComponent resource="api_client_request" permission="create">
            <div className="actions">
              <NewApiRecordDropdown
                onSelect={(params) => {
                  onNewClick(params.recordType, params.entryType);
                }}
              >
                <RQButton type="transparent" size="small" icon={<MdAdd />}>
                  New
                </RQButton>
              </NewApiRecordDropdown>
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

        {viewMode === ApiClientViewMode.SINGLE ? <EnvironmentSwitcher /> : null}
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

      {commonImportModalConfig && (
        <CommonApiClientImportModal
          productName={commonImportModalConfig.productName}
          supportedFileTypes={commonImportModalConfig.supportedFileTypes}
          importer={commonImportModalConfig.importer}
          isOpen={Boolean(commonImportModalConfig)}
          importerType={commonImportModalConfig.importerType}
          docsLink={commonImportModalConfig.docsLink}
          onClose={() => setCommonImportModalConfig(null)}
        />
      )}
    </>
  );
};
