import React, { useCallback, useEffect, useState } from "react";
import { RQAPI } from "../../../../types";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { Tabs, TabsProps, Tooltip } from "antd";
import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { CollectionsList } from "./collectionsList/CollectionsList";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { HistoryList } from "./historyList/HistoryList";
import { ApiClientSidebarHeader } from "./apiClientSidebarHeader/ApiClientSidebarHeader";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { EnvironmentsList } from "../../../environment/components/environmentsList/EnvironmentsList";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { redirectToApiClientCollection, redirectToNewEnvironment, redirectToRequest } from "utils/RedirectionUtils";
import { trackCreateEnvironmentClicked } from "features/apiClient/screens/environment/analytics";
import "./apiClientSidebar.scss";

interface Props {
  history?: RQAPI.Entry[];
  onSelectionFromHistory?: (index: number) => void;
  clearHistory?: () => void;
  onNewClick?: (src: RQAPI.AnalyticsEventSource, recordType?: RQAPI.RecordType) => void;
  onImportClick?: () => void;
}

export enum ApiClientSidebarTabKey {
  HISTORY = "history",
  COLLECTIONS = "collections",
  ENVIRONMENTS = "environments",
}

const APIClientSidebar: React.FC<Props> = ({
  history,
  onSelectionFromHistory,
  clearHistory,
  onImportClick,
  onNewClick = () => {},
}) => {
  const { requestId, collectionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(getUserAuthDetails);
  const [activeKey, setActiveKey] = useState<ApiClientSidebarTabKey>(null);
  const { getCurrentEnvironment } = useEnvironmentManager();
  const { currentEnvironmentId } = getCurrentEnvironment();
  const [isNewRecordNameInputVisible, setIsNewRecordNameInputVisible] = useState(false);
  const [recordTypeToBeCreated, setRecordTypeToBeCreated] = useState<RQAPI.RecordType>();

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
          redirectToNewEnvironment(navigate);
          trackCreateEnvironmentClicked(analyticEventSource);
          return;
        }
        default:
          return;
      }
    },
    [onNewClick, navigate]
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
          <NavLink
            to={PATHS.API_CLIENT.ABSOLUTE}
            className={({ isActive }) => `${isActive ? "active" : ""} api-client-tab-link`}
          >
            <CgStack />
          </NavLink>
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
          <NavLink
            to={PATHS.API_CLIENT.HISTORY.ABSOLUTE}
            className={({ isActive }) => `${isActive ? "active" : ""} api-client-tab-link`}
          >
            <MdOutlineHistory />
          </NavLink>
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
