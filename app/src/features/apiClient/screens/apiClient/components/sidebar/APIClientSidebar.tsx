import React, { useCallback, useEffect, useState } from "react";
import { RQAPI } from "../../../../types";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { Tabs, TabsProps, Tooltip } from "antd";
import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { CollectionsList } from "./components/collectionsList/CollectionsList";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { HistoryList } from "./components/historyList/HistoryList";
import { ApiClientSidebarHeader } from "./components/apiClientSidebarHeader/ApiClientSidebarHeader";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { EnvironmentsList } from "../../../environment/components/environmentsList/EnvironmentsList";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToApiClientCollection, redirectToNewEnvironment, redirectToRequest } from "utils/RedirectionUtils";
import { trackCreateEnvironmentClicked } from "features/apiClient/screens/environment/analytics";
import { useApiClientContext } from "features/apiClient/contexts";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import "./apiClientSidebar.scss";

interface Props {}

export enum ApiClientSidebarTabKey {
  HISTORY = "history",
  COLLECTIONS = "collections",
  ENVIRONMENTS = "environments",
}

const APIClientSidebar: React.FC<Props> = () => {
  const { requestId, collectionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(getUserAuthDetails);
  const [activeKey, setActiveKey] = useState<ApiClientSidebarTabKey>(null);
  const { getCurrentEnvironment } = useEnvironmentManager();
  const { currentEnvironmentId } = getCurrentEnvironment();
  const [isNewRecordNameInputVisible, setIsNewRecordNameInputVisible] = useState(false);
  const [recordTypeToBeCreated, setRecordTypeToBeCreated] = useState<RQAPI.RecordType>();

  const { history, clearHistory, onNewClick, onImportClick, onSelectionFromHistory } = useApiClientContext();
  const { openTab } = useTabsLayoutContext();

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
          const recordId = "request/new";

          openTab(recordId, {
            title: "Untitled request",
            url: `${PATHS.API_CLIENT.ABSOLUTE}/request/new`,
          });

          onNewClick(analyticEventSource, RQAPI.RecordType.API);
          redirectToRequest(navigate);
          return;
        }

        case RQAPI.RecordType.COLLECTION: {
          onNewClick(analyticEventSource, RQAPI.RecordType.COLLECTION);
          redirectToApiClientCollection(navigate);
          return;
        }

        case RQAPI.RecordType.ENVIRONMENT: {
          const recordId = "environments/new";

          openTab(recordId, {
            title: "New environment",
            url: `${PATHS.API_CLIENT.ABSOLUTE}/environments/new`,
          });

          redirectToNewEnvironment(navigate);
          trackCreateEnvironmentClicked(analyticEventSource);
          return;
        }

        default:
          return;
      }
    },
    [onNewClick, navigate, openTab]
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

  useEffect(() => {
    if (location.pathname.includes(PATHS.API_CLIENT.HISTORY.ABSOLUTE)) {
      setActiveKey(ApiClientSidebarTabKey.HISTORY);
    } else if (location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.INDEX)) {
      setActiveKey(ApiClientSidebarTabKey.ENVIRONMENTS);
    } else {
      setActiveKey(ApiClientSidebarTabKey.COLLECTIONS);
    }
  }, [location.pathname]);

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
          <NavLink
            to={PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE + `${user.loggedIn ? `/${currentEnvironmentId}` : ""}`}
            className={({ isActive }) => `${isActive ? "active" : ""} api-client-tab-link`}
          >
            <MdHorizontalSplit />
          </NavLink>
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
      children: <HistoryList history={history} onSelectionFromHistory={onSelectionFromHistory} />,
    },
  ];

  const handleActiveTabChange = (activeKey: ApiClientSidebarTabKey) => {
    setActiveKey(activeKey);
  };

  return (
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
        onChange={handleActiveTabChange}
      />
    </div>
  );
};

export default APIClientSidebar;
