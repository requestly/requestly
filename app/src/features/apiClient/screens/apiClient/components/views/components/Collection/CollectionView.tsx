import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { notification, Tabs } from "antd";
import { CollectionOverview } from "./components/CollectionOverview/CollectionOverview";
import { CollectionsVariablesView } from "./components/CollectionsVariablesView/CollectionsVariablesView";
import CollectionAuthorizationView from "./components/CollectionAuthorizationView/CollectionAuthorizationView";
import "./collectionView.scss";
import { useBufferByReferenceId, useEntity } from "features/apiClient/slices/entities/hooks";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { useApiClientRepository } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry";
import { ApiClientBreadCrumb, BreadcrumbType } from "../ApiClientBreadCrumb/ApiClientBreadCrumb";
import { trackCollectionRunnerViewed } from "modules/analytics/events/features/apiClient";
import { CollectionRowOptionsCustomEvent } from "../../../sidebar/components/collectionsList/collectionRow/utils";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { CollectionRunnerView } from "./components/CollectionRunnerView/CollectionRunnerView";

export const TAB_KEYS = {
  OVERVIEW: "overview",
  VARIABLES: "variables",
  AUTHORIZATION: "authorization",
  RUNNER: "runner",
};

interface CollectionViewProps {
  collectionId: string;
}

export const CollectionView: React.FC<CollectionViewProps> = ({ collectionId }) => {
  const { apiClientRecordsRepository } = useApiClientRepository();
  const [activeTabKey, setActiveTabKey] = useState(TAB_KEYS.OVERVIEW);
  const dispatch = useApiClientDispatch();
  const entity = useEntity({
    id: collectionId,
    type: ApiClientEntityType.COLLECTION_RECORD,
  });

  const collectionName = useApiClientSelector((s) => entity.getName(s));
  const collectionBuffer = useBufferByReferenceId(collectionId);

  const tabItems = useMemo(() => {
    return [
      {
        label: "Overview",
        key: TAB_KEYS.OVERVIEW,
        children: <CollectionOverview collectionId={collectionId} />,
      },
      {
        label: "Variables",
        key: TAB_KEYS.VARIABLES,
        children: <CollectionsVariablesView collectionId={collectionId} activeTabKey={activeTabKey} />,
      },
      {
        label: "Authorization",
        key: TAB_KEYS.AUTHORIZATION,
        children: <CollectionAuthorizationView collectionId={collectionId} activeTabKey={activeTabKey} />,
      },
      {
        label: "Runner",
        key: TAB_KEYS.RUNNER,
        children: <CollectionRunnerView collectionId={collectionId} activeTabKey={activeTabKey} />,
      },
    ];
  }, [collectionId, activeTabKey]);

  useEffect(() => {
    const handler = () => {
      setActiveTabKey(TAB_KEYS.RUNNER);
    };

    window.addEventListener(CollectionRowOptionsCustomEvent.OPEN_RUNNER_TAB, handler);
    return () => {
      window.removeEventListener(CollectionRowOptionsCustomEvent.OPEN_RUNNER_TAB, handler);
    };
  }, []);

  const handleCollectionNameChange = useCallback(
    async (name: string) => {
      const result = await apiClientRecordsRepository.renameCollection(collectionId, name);

      if (!result.success) {
        notification.error({
          message: "Could not rename collection.",
          description: result?.message,
          placement: "bottomRight",
        });
        return;
      }

      entity.setName(name);
    },
    [apiClientRecordsRepository, collectionId, entity]
  );

  return (
    <div className="collection-view-container">
      <>
        <div className="collection-view-breadcrumb-container">
          <ApiClientBreadCrumb
            id={collectionId}
            placeholder="New Collection"
            name={collectionName}
            onBlur={(newName) => {
              handleCollectionNameChange(newName);
            }}
            autoFocus={collectionBuffer.isNew}
            breadCrumbType={BreadcrumbType.COLLECTION}
          />
        </div>
        <div className="collection-view-content">
          <Tabs
            destroyInactiveTabPane={false}
            activeKey={activeTabKey}
            onChange={(key) => setActiveTabKey(key)}
            items={tabItems}
            animated={false}
            moreIcon={null}
            onTabClick={(key) => {
              if (key === TAB_KEYS.RUNNER) {
                trackCollectionRunnerViewed({
                  collection_id: collectionId,
                  source: "collection_overview",
                });
              }
            }}
          />
        </div>
      </>
    </div>
  );
};
