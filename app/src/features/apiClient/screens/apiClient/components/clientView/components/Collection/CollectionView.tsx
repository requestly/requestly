import { Result, Skeleton, Tabs } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import { useCallback, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { RQAPI } from "features/apiClient/types";
import { CollectionOverview } from "./components/CollectionOverview/CollectionOverview";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import "./collectionView.scss";
import { CollectionsVariablesView } from "./components/CollectionsVariablesView/CollectionsVariablesView";
import CollectionAuthorizationView from "./components/CollectionAuthorizationView/CollectionAuthorizationView";
import { toast } from "utils/Toast";

const TAB_KEYS = {
  OVERVIEW: "overview",
  VARIABLES: "variables",
  AUTHORIZATION: "authorization",
};

export const CollectionView = () => {
  const { collectionId } = useParams();
  const {
    apiClientRecords,
    onSaveRecord,
    isLoadingApiClientRecords,
    apiClientRecordsRepository,
  } = useApiClientContext();
  const { replaceTab } = useTabsLayoutContext();
  const location = useLocation();

  const collection = useMemo(() => {
    return apiClientRecords.find((record) => record.id === collectionId) as RQAPI.CollectionRecord;
  }, [apiClientRecords, collectionId]);

  const updateCollectionAuthData = useCallback(
    async (newAuthOptions: RQAPI.AuthOptions) => {
      const record = {
        ...collection,
        data: {
          ...collection?.data,
          auth: newAuthOptions,
        },
      };
      return apiClientRecordsRepository
        .updateRecord(record, record.id)
        .then((result) => {
          // fix-me: to verify new change are broadcasted to child entries that are open in tabs
          onSaveRecord(result.data);
        })
        .catch(console.error);
    },
    [collection, onSaveRecord, apiClientRecordsRepository]
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
            authOptions={collection?.data?.auth}
            updateAuthData={updateCollectionAuthData}
            rootLevelRecord={!collection?.collectionId}
          />
        ),
      },
    ];
  }, [collection, updateCollectionAuthData]);

  const handleCollectionNameChange = useCallback(
    async (name: string) => {
      return apiClientRecordsRepository
        .renameCollection(collectionId, name)
        .then((result) => {
          onSaveRecord(result.data);
          replaceTab(result.data.id, {
            id: result.data.id,
            title: result.data.name,
            url: `${PATHS.API_CLIENT.ABSOLUTE}/collection/${encodeURIComponent(result.data.id)}`,
          });
        })
        .catch((error) => {
          toast.error(error.message || "Could not update collection name.");
        });
    },
    [onSaveRecord, replaceTab, apiClientRecordsRepository, collectionId]
  );

  if (isLoadingApiClientRecords) {
    return (
      <div className="collection-view-container__loading">
        <Skeleton />
      </div>
    );
  }

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
          <RQBreadcrumb
            placeholder="New Collection"
            recordName={collection?.name || "New Collection"}
            onBlur={(newName) => handleCollectionNameChange(newName)}
            autoFocus={location.search.includes("new")}
          />
          <div className="collection-view-content">
            <Tabs defaultActiveKey={TAB_KEYS.OVERVIEW} items={tabItems} animated={false} />
          </div>
        </>
      )}
    </div>
  );
};
