import { notification, Result, Tabs } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import React, { useCallback, useEffect, useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import { CollectionOverview } from "./components/CollectionOverview/CollectionOverview";
import PATHS from "config/constants/sub/paths";
import { CollectionsVariablesView } from "./components/CollectionsVariablesView/CollectionsVariablesView";
import CollectionAuthorizationView from "./components/CollectionAuthorizationView/CollectionAuthorizationView";
import { useGenericState } from "hooks/useGenericState";
import "./collectionView.scss";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { CollectionViewTabSource } from "./collectionViewTabSource";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";

const TAB_KEYS = {
  OVERVIEW: "overview",
  VARIABLES: "variables",
  AUTHORIZATION: "authorization",
};

interface CollectionViewProps {
  collectionId: string;
}

export const CollectionView: React.FC<CollectionViewProps> = ({ collectionId }) => {
  const { onSaveRecord, apiClientRecordsRepository, forceRefreshApiClientRecords } = useApiClientContext();
  const [getDataFromId] = useAPIRecords((state) => [state.getData]);

  const queueTriggerUpdate = useAPIRecords((s) => s.queueTriggerUpdate);

  const closeTab = useTabServiceWithSelector((state) => state.closeTab);

  const { setTitle, getIsNew } = useGenericState();
  const isNewCollection = getIsNew();

  const collection = useMemo(() => {
    return getDataFromId(collectionId) as RQAPI.CollectionRecord;
  }, [collectionId, getDataFromId]);

  useEffect(() => {
    // To sync title for tabs opened from deeplinks
    if (collection) {
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
            queueTriggerUpdate(collectionId);
            onSaveRecord(result.data, "open");
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
    [collection, apiClientRecordsRepository, onSaveRecord, queueTriggerUpdate, collectionId]
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
    ];
  }, [collection, collectionId, updateCollectionAuthData]);

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

        onSaveRecord(result.data, "open");
        const wasForceRefreshed = await forceRefreshApiClientRecords();
        if (wasForceRefreshed) {
          closeTab(
            new CollectionViewTabSource({
              id: record.id,
              title: "",
            })
          );
        }
        setTitle(result.data.name);
      });
    },
    [collection, setTitle, apiClientRecordsRepository, onSaveRecord, closeTab, forceRefreshApiClientRecords]
  );

  const collectionName = collection?.name || "New Collection";

  return (
    <div className="collection-view-container">
      {!collection && collectionId !== "new" ? (
        <Result
          status="error"
          title="Collection not found"
          subTitle="Oops! Looks like this collection doesn't exist."
        />
      ) : (
        <>
          <div className="collection-view-breadcrumb-container">
            <RQBreadcrumb
              placeholder="New Collection"
              recordName={collectionName}
              onBlur={(newName) => handleCollectionNameChange(newName)}
              autoFocus={isNewCollection}
              defaultBreadcrumbs={[
                { label: "API Client", pathname: PATHS.API_CLIENT.INDEX },
                {
                  isEditable: true,
                  pathname: window.location.pathname,
                  label: collectionName,
                },
              ]}
            />
          </div>
          <div className="collection-view-content">
            <Tabs defaultActiveKey={TAB_KEYS.OVERVIEW} items={tabItems} animated={false} moreIcon={null} />
          </div>
        </>
      )}
    </div>
  );
};
