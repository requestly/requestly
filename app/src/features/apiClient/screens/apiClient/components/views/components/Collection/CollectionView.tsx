import React, { useCallback, useEffect, useMemo, useState } from "react";
import { notification, Result, Tabs } from "antd";
import { RQAPI } from "features/apiClient/types";
import { CollectionOverview } from "./components/CollectionOverview/CollectionOverview";
import { CollectionsVariablesView } from "./components/CollectionsVariablesView/CollectionsVariablesView";
import CollectionAuthorizationView from "./components/CollectionAuthorizationView/CollectionAuthorizationView";
import { useGenericState } from "hooks/useGenericState";
import "./collectionView.scss";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { CollectionViewTabSource } from "./collectionViewTabSource";
import { useApiRecord } from "features/apiClient/hooks/useApiRecord.hook";
import { isEmpty } from "lodash";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { useCommand } from "features/apiClient/commands";
import { useApiClientRepository } from "features/apiClient/contexts/meta";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import { ApiClientBreadCrumb, BreadcrumbType } from "../ApiClientBreadCrumb/ApiClientBreadCrumb";
import { CollectionRunnerView } from "./components/CollectionRunnerView/CollectionRunnerView";
import { trackCollectionRunnerViewed } from "modules/analytics/events/features/apiClient";
import { CollectionRowOptionsCustomEvent } from "../../../sidebar/components/collectionsList/collectionRow/utils";

const TAB_KEYS = {
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
  const { onSaveRecord } = useNewApiClientContext();
  const {
    api: { forceRefreshRecords: forceRefreshApiClientRecords },
  } = useCommand();
  const contextId = useContextId();
  const [activeTabKey, setActiveTabKey] = useState(TAB_KEYS.OVERVIEW);

  const closeTab = useTabServiceWithSelector((state) => state.closeTab);

  const { setTitle, getIsNew, setIsNew } = useGenericState();

  const collection = useApiRecord(collectionId) as RQAPI.CollectionRecord;

  useEffect(() => {
    // To sync title for tabs opened from deeplinks
    if (!isEmpty(collection)) {
      setTitle(collection.name);
    }
  }, [collection, setTitle]);

  const updateCollectionAuthData = useCallback(
    async (newAuthOptions: RQAPI.Auth) => {
      const record = {
        ...collection,
        data: {
          ...collection?.data,
          auth: newAuthOptions,
        },
      };
      return apiClientRecordsRepository
        .updateCollectionAuthData(record)
        .then((result) => {
          if (result.success) {
            onSaveRecord(result.data);
          } else {
            notification.error({
              message: `Could not update collection authorization changes!`,
              description: result?.message,
              placement: "bottomRight",
            });
          }
        })
        .catch((e) => {
          notification.error({
            message: `Could not update collection authorization changes!`,
            description: e?.message,
            placement: "bottomRight",
          });
        });
    },
    [collection, apiClientRecordsRepository, onSaveRecord]
  );

  const tabItems = useMemo(() => {
    return [
      {
        label: "Overview",
        key: TAB_KEYS.OVERVIEW,
        children: <CollectionOverview collection={collection} />,
      },
      {
        label: "Variables",
        key: TAB_KEYS.VARIABLES,
        children: <CollectionsVariablesView collection={collection} />,
      },
      {
        label: "Authorization",
        key: TAB_KEYS.AUTHORIZATION,
        children: (
          <CollectionAuthorizationView
            collectionId={collectionId}
            authOptions={collection?.data?.auth}
            updateAuthData={updateCollectionAuthData}
            rootLevelRecord={!collection?.collectionId}
          />
        ),
      },
      {
        label: "Runner",
        key: TAB_KEYS.RUNNER,
        children: <CollectionRunnerView collectionId={collection.id} />,
      },
    ];
  }, [collection, collectionId, updateCollectionAuthData]);

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
      const record = { ...collection, name };
      return apiClientRecordsRepository.renameCollection(record.id, name).then(async (result) => {
        if (!result.success) {
          notification.error({
            message: `Could not rename collection.`,
            description: result?.message,
            placement: "bottomRight",
          });
          return;
        }

        onSaveRecord(result.data);
        const wasForceRefreshed = await forceRefreshApiClientRecords();
        if (wasForceRefreshed) {
          closeTab(
            new CollectionViewTabSource({
              id: record.id,
              title: "",
              context: {
                id: contextId,
              },
            })
          );
        }
        setTitle(result.data.name);
      });
    },
    [collection, contextId, setTitle, apiClientRecordsRepository, onSaveRecord, closeTab, forceRefreshApiClientRecords]
  );

  const collectionName = collection?.name || "New Collection";

  return (
    <div className="collection-view-container">
      {isEmpty(collection) && collectionId !== "new" ? (
        <Result
          status="error"
          title="Collection not found"
          subTitle="Oops! Looks like this collection doesn't exist."
        />
      ) : (
        <>
          <div className="collection-view-breadcrumb-container">
            <ApiClientBreadCrumb
              id={collection.id}
              placeholder="New Collection"
              name={collectionName}
              onBlur={(newName) => {
                handleCollectionNameChange(newName);
                setIsNew(false);
              }}
              autoFocus={getIsNew()}
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
                    collection_id: collection.id,
                    source: "collection_overview",
                  });
                }
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
