import React, { useCallback, useEffect, useState } from "react";
import { ApiClientImporterType, RQAPI } from "../../../../../types";
import { useLocation, useParams } from "react-router-dom";
import { notification, Tabs, TabsProps, Tooltip } from "antd";
import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { CollectionsList } from "../components/collectionsList/CollectionsList";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { HistoryList } from "../components/historyList/HistoryList";
import { ApiClientSidebarHeader } from "../components/apiClientSidebarHeader/ApiClientSidebarHeader";
import { EnvironmentsList } from "features/apiClient/screens/environment/components/environmentsList/EnvironmentsList";
import { useApiClientContext } from "features/apiClient/contexts";
import { DeleteApiRecordModal, ImportFromCurlModal } from "../../modals";
import { getEmptyApiEntry } from "../../../utils";
import { ErrorFilesList } from "../components/ErrorFilesList/ErrorFileslist";
import { useApiClientRepository } from "features/apiClient/contexts/meta";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import "./singleWorkspaceSidebar.scss";
import { useApiClientFeatureContext } from "features/apiClient/contexts/meta";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { MdOutlineSpaceDashboard } from "@react-icons/all-files/md/MdOutlineSpaceDashboard";
import { RuntimeVariables } from "features/apiClient/screens/environment/components/RuntimeVariables/runtimevariables";

interface Props {}

export enum ApiClientSidebarTabKey {
  HISTORY = "history",
  COLLECTIONS = "collections",
  ENVIRONMENTS = "environments",
  RUNTIME_VARIABLES = "runtime_variables",
}

export const SingleWorkspaceSidebar: React.FC<Props> = () => {
  const { state } = useLocation();
  const { requestId, collectionId } = useParams();
  const [activeKey, setActiveKey] = useState<ApiClientSidebarTabKey>(ApiClientSidebarTabKey.COLLECTIONS);
  const [recordTypeToBeCreated, setRecordTypeToBeCreated] = useState<RQAPI.RecordType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    history,
    clearHistory,
    onNewClick,
    onImportClick,
    setCurrentHistoryIndex,
    selectedHistoryIndex,
    isImportModalOpen,
    onImportRequestModalClose,
    setIsImportModalOpen,
    deleteHistoryItem,
    deleteHistoryByDate,
  } = useApiClientContext();

  const { onSaveRecord } = useNewApiClientContext();
  const { apiClientRecordsRepository } = useApiClientRepository();
  const context = useApiClientFeatureContext();

  const [recordsToBeDeleted, setRecordsToBeDeleted] = useState<RQAPI.ApiClientRecord[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleRecordsToBeDeleted = useCallback((records: RQAPI.ApiClientRecord[]) => {
    setRecordsToBeDeleted(records);
    setIsDeleteModalOpen(true);
  }, []);

  const onDeleteModalClose = useCallback(() => {
    setRecordsToBeDeleted([]);
    setIsDeleteModalOpen(false);
  }, []);

  const handleNewRecordClick = useCallback(
    (recordType: RQAPI.RecordType, analyticEventSource: RQAPI.AnalyticsEventSource, entryType?: RQAPI.ApiEntryType) => {
      setRecordTypeToBeCreated(recordType);

      switch (recordType) {
        case RQAPI.RecordType.API: {
          setActiveKey(ApiClientSidebarTabKey.COLLECTIONS);
          onNewClick(analyticEventSource, RQAPI.RecordType.API, "", entryType);
          return;
        }

        case RQAPI.RecordType.COLLECTION: {
          setActiveKey(ApiClientSidebarTabKey.COLLECTIONS);
          onNewClick(analyticEventSource, RQAPI.RecordType.COLLECTION);
          return;
        }

        case RQAPI.RecordType.ENVIRONMENT: {
          setActiveKey(ApiClientSidebarTabKey.ENVIRONMENTS);
          onNewClick(analyticEventSource, RQAPI.RecordType.ENVIRONMENT);
          return;
        }

        default:
          return;
      }
    },
    [onNewClick]
  );

  useEffect(() => {
    if (requestId === "new") {
      setRecordTypeToBeCreated(RQAPI.RecordType.API);
    } else if (collectionId === "new") {
      setRecordTypeToBeCreated(RQAPI.RecordType.COLLECTION);
    }
  }, [requestId, collectionId]);

  const items: TabsProps["items"] = [
    {
      key: ApiClientSidebarTabKey.COLLECTIONS,
      label: (
        <Tooltip title="Collections" placement="right">
          <div
            onClick={() => setActiveKey(ApiClientSidebarTabKey.COLLECTIONS)}
            className={`api-client-tab-link ${activeKey === ApiClientSidebarTabKey.COLLECTIONS ? "active" : ""}`}
          >
            <CgStack />
          </div>
        </Tooltip>
      ),
      children: (
        <CollectionsList
          onNewClick={onNewClick}
          recordTypeToBeCreated={recordTypeToBeCreated}
          handleRecordsToBeDeleted={handleRecordsToBeDeleted}
        />
      ),
    },
    {
      key: ApiClientSidebarTabKey.ENVIRONMENTS,
      label: (
        <Tooltip title="Environments" placement="right">
          <div className={`api-client-tab-link ${activeKey === ApiClientSidebarTabKey.ENVIRONMENTS ? "active" : ""}`}>
            <MdHorizontalSplit />
          </div>
        </Tooltip>
      ),
      children: <EnvironmentsList />,
    },
    {
      key: ApiClientSidebarTabKey.HISTORY,
      label: (
        <Tooltip title="History" placement="right">
          <div
            onClick={() => setActiveKey(ApiClientSidebarTabKey.HISTORY)}
            className={`api-client-tab-link ${activeKey === ApiClientSidebarTabKey.HISTORY ? "active" : ""}`}
          >
            <MdOutlineHistory />
          </div>
        </Tooltip>
      ),
      children: (
        <HistoryList
          history={history}
          selectedHistoryIndex={selectedHistoryIndex}
          onSelectionFromHistory={setCurrentHistoryIndex}
          onDeleteHistoryItem={deleteHistoryItem}
          onDeleteHistoryByDate={deleteHistoryByDate}
        />
      ),
    },
    {
      key: ApiClientSidebarTabKey.RUNTIME_VARIABLES,
      label: (
        <>
          <Tooltip title="Runtime variables" placement="right">
            <div
              onClick={() => setActiveKey(ApiClientSidebarTabKey.RUNTIME_VARIABLES)}
              className={`api-client-tab-link ${
                activeKey === ApiClientSidebarTabKey.RUNTIME_VARIABLES ? "active" : ""
              }`}
            >
              <MdOutlineSpaceDashboard />
            </div>
          </Tooltip>
        </>
      ),
      children: <RuntimeVariables />,
    },
  ];

  const handleActiveTabChange = (activeKey: ApiClientSidebarTabKey) => {
    setActiveKey(activeKey);
  };

  const handleImportRequest = useCallback(
    async (request: RQAPI.Request) => {
      setIsLoading(true);

      try {
        const apiEntry = getEmptyApiEntry(RQAPI.ApiEntryType.HTTP, request);

        const record: Partial<RQAPI.ApiRecord> = {
          type: RQAPI.RecordType.API,
          data: apiEntry,
        };

        const result = await apiClientRecordsRepository.createRecord(record);

        if (result.success) {
          onSaveRecord(result.data, "open");

          setIsImportModalOpen(false);
        } else {
          throw new Error(result.message);
        }
        return result.data;
      } catch (error) {
        console.error("Error importing request", error);
        notification.error({
          message: `Error importing request`,
          description: error?.message,
          placement: "bottomRight",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [onSaveRecord, setIsImportModalOpen, apiClientRecordsRepository]
  );

  useEffect(() => {
    if (state?.modal === ApiClientImporterType.CURL) {
      setIsImportModalOpen(true);
    }
  }, [state?.modal, setIsImportModalOpen]);

  const getSelectedRecords = useCallback((): {
    context: ApiClientFeatureContext | undefined;
    records: RQAPI.ApiClientRecord[];
  }[] => {
    return [{ context, records: recordsToBeDeleted }];
  }, [context, recordsToBeDeleted]);

  return (
    <>
      <div className="api-client-sidebar">
        <div className="api-client-sidebar-content">
          <ApiClientSidebarHeader
            activeTab={activeKey}
            history={history}
            onClearHistory={clearHistory}
            onImportClick={onImportClick}
            onNewClick={(recordType, entryType) =>
              handleNewRecordClick(recordType, "api_client_sidebar_header", entryType)
            }
          />

          <Tabs
            items={items}
            size="small"
            tabPosition="left"
            className="api-client-sidebar-tabs"
            activeKey={activeKey}
            defaultActiveKey={ApiClientSidebarTabKey.COLLECTIONS}
            onChange={handleActiveTabChange}
          />
        </div>
        <ErrorFilesList />
      </div>

      {isDeleteModalOpen ? (
        <DeleteApiRecordModal
          open={isDeleteModalOpen}
          onClose={onDeleteModalClose}
          getRecordsToDelete={getSelectedRecords}
        />
      ) : null}

      <ImportFromCurlModal
        initialCurlCommand={state?.curlCommand}
        source={state?.source || ""}
        pageURL={state?.pageURL || ""}
        isRequestLoading={isLoading}
        isOpen={isImportModalOpen}
        handleImportRequest={handleImportRequest}
        onClose={onImportRequestModalClose}
      />
    </>
  );
};
