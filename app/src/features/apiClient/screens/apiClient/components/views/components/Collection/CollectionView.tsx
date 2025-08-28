import { notification, Result, Tabs, Tooltip } from "antd";
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
import { useApiRecord } from "features/apiClient/hooks/useApiRecord.hook";
import { isEmpty } from "lodash";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { useCommand } from "features/apiClient/commands";
import { useApiClientFeatureContext, useApiClientRepository } from "features/apiClient/contexts/meta";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import {
  ApiClientViewMode,
  useApiClientMultiWorkspaceView,
} from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { truncateString } from "features/apiClient/screens/apiClient/utils";
import { LuFolderCog } from "@react-icons/all-files/lu/LuFolderCog";

const TAB_KEYS = {
  OVERVIEW: "overview",
  VARIABLES: "variables",
  AUTHORIZATION: "authorization",
};

interface CollectionViewProps {
  collectionId: string;
}

interface BreadcrumbProps {
  collectionId: string;
  collectionName: string;
  handleCollectionNameChange: (name: string) => Promise<void>;
  isNewCollection: boolean;
}

const MultiviewBreadCrumb: React.FC<BreadcrumbProps> = ({ ...props }) => {
  const { collectionId, collectionName, handleCollectionNameChange, isNewCollection } = props;
  const [getSelectedWorkspace] = useApiClientMultiWorkspaceView((s) => [s.getSelectedWorkspace]);

  const ctx = useApiClientFeatureContext();

  const currentWorkspace = useMemo(() => getSelectedWorkspace(ctx.workspaceId), [
    getSelectedWorkspace,
    ctx.workspaceId,
  ]);

  const [getParentChain, getData] = useAPIRecords((s) => [s.getParentChain, s.getData]);

  const localWsPath = currentWorkspace.getState().rawWorkspace.rootPath;
  const truncatePath = truncateString(localWsPath, 40);

  const parentCollectionNames = useMemo(() => {
    const collections = getParentChain(collectionId);

    const parentRecords = collections
      .slice()
      .reverse()
      .map((id) => {
        return {
          label: getData(id).name,
          pathname: "",
          isEditable: false,
        };
      });

    return parentRecords;
  }, [collectionId, getData, getParentChain]);

  return (
    <RQBreadcrumb
      placeholder="New Collection"
      recordName={collectionName}
      onBlur={(newName) => handleCollectionNameChange(newName)}
      autoFocus={isNewCollection}
      defaultBreadcrumbs={[
        {
          label: (
            <div>
              <Tooltip trigger="hover" title={localWsPath} color="var(--requestly-color-black)" placement="bottom">
                <span className="api-client-local-workspace-path-breadcrumb">
                  <LuFolderCog className="api-client-local-workspace-icon" />
                  {truncatePath + "/" + currentWorkspace.getState().name}
                </span>
              </Tooltip>
            </div>
          ),
          pathname: PATHS.API_CLIENT.INDEX,
          isEditable: false,
        },
        ...parentCollectionNames,
        {
          isEditable: true,
          pathname: window.location.pathname,
          label: collectionName,
        },
      ]}
    />
  );
};

export const CollectionView: React.FC<CollectionViewProps> = ({ collectionId }) => {
  const { apiClientRecordsRepository } = useApiClientRepository();
  const { onSaveRecord } = useNewApiClientContext();
  const {
    api: { forceRefreshRecords: forceRefreshApiClientRecords },
  } = useCommand();
  const contextId = useContextId();

  const closeTab = useTabServiceWithSelector((state) => state.closeTab);

  const { setTitle, getIsNew } = useGenericState();
  const isNewCollection = getIsNew();

  const collection = useApiRecord(collectionId) as RQAPI.CollectionRecord;
  const [getViewMode] = useApiClientMultiWorkspaceView((s) => [s.getViewMode]);

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
            {getViewMode() === ApiClientViewMode.SINGLE ? (
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
            ) : (
              <MultiviewBreadCrumb
                collectionId={collectionId}
                collectionName={collectionName}
                handleCollectionNameChange={handleCollectionNameChange}
                isNewCollection={isNewCollection}
              />
            )}
          </div>
          <div className="collection-view-content">
            <Tabs defaultActiveKey={TAB_KEYS.OVERVIEW} items={tabItems} animated={false} moreIcon={null} />
          </div>
        </>
      )}
    </div>
  );
};
