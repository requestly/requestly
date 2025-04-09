import React, { useCallback, useEffect, useState } from "react";
import { ApiClientImporterType, RQAPI } from "../../../../types";
import { useLocation, useParams } from "react-router-dom";
import { Tabs, TabsProps, Tooltip } from "antd";
import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { CollectionsList } from "./components/collectionsList/CollectionsList";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { HistoryList } from "./components/historyList/HistoryList";
import { ApiClientSidebarHeader } from "./components/apiClientSidebarHeader/ApiClientSidebarHeader";
import { EnvironmentsList } from "../../../environment/components/environmentsList/EnvironmentsList";
import { useApiClientContext } from "features/apiClient/contexts";
import { DeleteApiRecordModal, ImportRequestModal } from "../modals";
import { getEmptyAPIEntry } from "../../utils";
import { toast } from "utils/Toast";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import "./apiClientSidebar.scss";

interface Props {}

export enum ApiClientSidebarTabKey {
  HISTORY = "history",
  COLLECTIONS = "collections",
  ENVIRONMENTS = "environments",
}

const APIClientSidebar: React.FC<Props> = () => {
  const user = useSelector(getUserAuthDetails);
  const { state } = useLocation();
  const { requestId, collectionId } = useParams();
  const [activeKey, setActiveKey] = useState<ApiClientSidebarTabKey>(ApiClientSidebarTabKey.COLLECTIONS);
  const [recordTypeToBeCreated, setRecordTypeToBeCreated] = useState<RQAPI.RecordType>();
  const [isLoading, setIsLoading] = useState(false);

  const { isImportModalOpen, onImportRequestModalClose, onSaveRecord, setIsImportModalOpen } = useApiClientContext();

  const {
    history,
    clearHistory,
    onNewClick,
    onImportClick,
    onSelectionFromHistory,
    recordsToBeDeleted,
    isDeleteModalOpen,
    onDeleteModalClose,
    selectedHistoryIndex,
    apiClientRecordsRepository,
  } = useApiClientContext();

  const handleNewRecordClick = useCallback(
    (recordType: RQAPI.RecordType, analyticEventSource: RQAPI.AnalyticsEventSource) => {
      setRecordTypeToBeCreated(recordType);

      switch (recordType) {
        case RQAPI.RecordType.API: {
          setActiveKey(ApiClientSidebarTabKey.COLLECTIONS);
          onNewClick(analyticEventSource, RQAPI.RecordType.API);
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
      children: <CollectionsList onNewClick={onNewClick} recordTypeToBeCreated={recordTypeToBeCreated} />,
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
          onSelectionFromHistory={onSelectionFromHistory}
        />
      ),
    },
  ];

  const handleActiveTabChange = (activeKey: ApiClientSidebarTabKey) => {
    setActiveKey(activeKey);
  };

  // TODO: Move this import logic and the import modal to the api client container which wraps all the routes.
  const handleImportRequest = useCallback(
    async (request: RQAPI.Request) => {
      if (!user?.loggedIn) {
        return;
      }
      setIsLoading(true);

      try {
        const apiEntry = getEmptyAPIEntry(request);

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
        toast.error(error.message || "Error importing request");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.loggedIn, onSaveRecord, setIsImportModalOpen, apiClientRecordsRepository]
  );

  useEffect(() => {
    if (state?.modal === ApiClientImporterType.CURL) {
      setIsImportModalOpen(true);
    }
  }, [state?.modal, setIsImportModalOpen]);

  return (
    <>
      <div className={`api-client-sidebar ${user.loggedIn ? "" : "api-client-sidebar-disabled"}`}>
        <ApiClientSidebarHeader
          activeTab={activeKey}
          history={history}
          onClearHistory={clearHistory}
          onImportClick={onImportClick}
          onNewClick={(recordType) => handleNewRecordClick(recordType, "api_client_sidebar_header")}
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

      <DeleteApiRecordModal open={isDeleteModalOpen} records={recordsToBeDeleted} onClose={onDeleteModalClose} />

      <ImportRequestModal
        isRequestLoading={isLoading}
        isOpen={isImportModalOpen}
        handleImportRequest={handleImportRequest}
        onClose={onImportRequestModalClose}
      />
    </>
  );
};

export default APIClientSidebar;
