import { Result, Skeleton, Tabs } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import React, { useCallback, useEffect, useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import { CollectionOverview } from "./components/CollectionOverview/CollectionOverview";
import PATHS from "config/constants/sub/paths";
import { CollectionsVariablesView } from "./components/CollectionsVariablesView/CollectionsVariablesView";
import CollectionAuthorizationView from "./components/CollectionAuthorizationView/CollectionAuthorizationView";
import { toast } from "utils/Toast";
import { useGenericState } from "hooks/useGenericState";
import "./collectionView.scss";

const TAB_KEYS = {
  OVERVIEW: "overview",
  VARIABLES: "variables",
  AUTHORIZATION: "authorization",
};

interface CollectionViewProps {
  collectionId: string;
}

export const CollectionView: React.FC<CollectionViewProps> = ({ collectionId }) => {
  const { apiClientRecords, onSaveRecord, isLoadingApiClientRecords, apiClientRecordsRepository } =
    useApiClientContext();

  const { setTitle, getIsNew } = useGenericState();
  const isNewCollection = getIsNew();

  const collection = useMemo(() => {
    return apiClientRecords.find((record) => record.id === collectionId) as RQAPI.CollectionRecord;
  }, [apiClientRecords, collectionId]);

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
            onSaveRecord(result.data, "open");
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
          toast.error(result.message || "Could not rename collection!");
          return;
        }

        onSaveRecord(result.data, "open");
        setTitle(result.data.name);
      });
    },
    [collection, setTitle, apiClientRecordsRepository, onSaveRecord]
  );

  if (isLoadingApiClientRecords) {
    return (
      <div className="collection-view-container__loading">
        <Skeleton />
      </div>
    );
  }

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
