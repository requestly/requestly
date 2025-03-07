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
    forceRefreshApiClientRecords,
  } = useApiClientContext();
  const { replaceTab, closeTab } = useTabsLayoutContext();
  const location = useLocation();

  const collection = useMemo(() => {
    return apiClientRecords.find((record) => record.id === collectionId) as RQAPI.CollectionRecord;
  }, [apiClientRecords, collectionId]);

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
            toast.error(result.message || "Could not update collection authorization changes!");
          }
        })
        .catch((e) => {
          toast.error(e.message || "Could not update collection authorization changes!");
        });
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
      const record = { ...collection, name };
      return apiClientRecordsRepository.renameCollection(record.id, name).then(async (result) => {
        if (!result.success) {
          toast.error(result.message || "Could not rename collection!");
          return;
        }

        onSaveRecord(result.data);

        const wasForceRefreshed = await forceRefreshApiClientRecords();
        if (wasForceRefreshed) {
          closeTab(record.id);
          return;
        }

        replaceTab(result.data.id, {
          id: result.data.id,
          title: result.data.name,
          url: `${PATHS.API_CLIENT.ABSOLUTE}/collection/${encodeURIComponent(result.data.id)}`,
        });
      });
    },
    [collection, apiClientRecordsRepository, onSaveRecord, forceRefreshApiClientRecords, replaceTab, closeTab]
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
