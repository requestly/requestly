import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RQAPI } from "../../../../types";
import { useParams } from "react-router-dom";
import { Tabs, TabsProps, Tooltip } from "antd";
import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { CollectionsList } from "./components/collectionsList/CollectionsList";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { HistoryList } from "./components/historyList/HistoryList";
import { ApiClientSidebarHeader } from "./components/apiClientSidebarHeader/ApiClientSidebarHeader";
import { EnvironmentsList } from "../../../environment/components/environmentsList/EnvironmentsList";
import { useApiClientContext } from "features/apiClient/contexts";
import { DeleteApiRecordModal } from "../modals";
import "./apiClientSidebar.scss";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";

interface Props {}

export enum ApiClientSidebarTabKey {
  HISTORY = "history",
  COLLECTIONS = "collections",
  ENVIRONMENTS = "environments",
}

const APIClientSidebar: React.FC<Props> = () => {
  const { requestId, collectionId } = useParams();
  const [activeKey, setActiveKey] = useState<ApiClientSidebarTabKey>(ApiClientSidebarTabKey.COLLECTIONS);
  const [isNewRecordNameInputVisible, setIsNewRecordNameInputVisible] = useState(false);
  const [recordTypeToBeCreated, setRecordTypeToBeCreated] = useState<RQAPI.RecordType>();

  const { addNewEnvironment, getAllEnvironments, isEnvironmentsDataLoaded } = useEnvironmentManager();
  const environments = getAllEnvironments();
  const isGlobalEnvironmentExists = useMemo(() => environments.some((env) => isGlobalEnvironment(env.id)), [
    environments,
  ]);

  useEffect(() => {
    if (!isGlobalEnvironmentExists && isEnvironmentsDataLoaded) {
      addNewEnvironment("Global variables", true);
    }
  }, [addNewEnvironment, isGlobalEnvironmentExists, isEnvironmentsDataLoaded]);

  const {
    history,
    clearHistory,
    onNewClick,
    onImportClick,
    onSelectionFromHistory,
    recordToBeDeleted,
    isDeleteModalOpen,
    onDeleteModalClose,
    selectedHistoryIndex,
  } = useApiClientContext();

  const hideNewRecordNameInput = () => {
    setIsNewRecordNameInputVisible(false);
    setRecordTypeToBeCreated(null);
  };

  const handleNewRecordClick = useCallback(
    (recordType: RQAPI.RecordType, analyticEventSource: RQAPI.AnalyticsEventSource) => {
      setIsNewRecordNameInputVisible(true);
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
      setIsNewRecordNameInputVisible(true);
      setRecordTypeToBeCreated(RQAPI.RecordType.API);
    } else if (collectionId === "new") {
      setIsNewRecordNameInputVisible(true);
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
          isNewRecordNameInputVisible={isNewRecordNameInputVisible}
          hideNewRecordNameInput={hideNewRecordNameInput}
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
          onSelectionFromHistory={onSelectionFromHistory}
        />
      ),
    },
  ];

  const handleActiveTabChange = (activeKey: ApiClientSidebarTabKey) => {
    setActiveKey(activeKey);
  };

  return (
    <>
      <div className="api-client-sidebar">
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

      <DeleteApiRecordModal open={isDeleteModalOpen} record={recordToBeDeleted} onClose={onDeleteModalClose} />
    </>
  );
};

export default APIClientSidebar;
