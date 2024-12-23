import { Result, Tabs } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import { useCallback, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { VariablesList } from "features/apiClient/screens/environment/components/VariablesList/VariablesList";
import { RQAPI } from "features/apiClient/types";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { upsertApiRecord } from "backend/apiClient";
import { EnvironmentVariables } from "backend/environment/types";
import { CollectionOverview } from "./components/CollectionOverview/CollectionOverview";
import { variablesActions } from "store/features/variables/slice";
import { getCollectionVariables } from "store/features/variables/selectors";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import "./collectionView.scss";
import { getActiveWorkspaceIds } from "store/slices/workspaces/selectors";
import { getActiveWorkspaceId } from "features/workspaces/utils";

const TAB_KEYS = {
  OVERVIEW: "overview",
  VARIABLES: "variables",
};

export const CollectionView = () => {
  const dispatch = useDispatch();
  const { collectionId } = useParams();
  const { apiClientRecords, onSaveRecord } = useApiClientContext();
  const { replaceTab } = useTabsLayoutContext();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = getActiveWorkspaceId(useSelector(getActiveWorkspaceIds));
  const collectionVariables = useSelector(getCollectionVariables);
  const location = useLocation();

  const collection = apiClientRecords.find((record) => record.id === collectionId) as RQAPI.CollectionRecord;

  const handleSetVariables = useCallback(
    async (variables: EnvironmentVariables) => {
      const updatedVariables = Object.fromEntries(
        Object.entries(variables).map(([key, value]) => {
          const { localValue, ...rest } = value;
          return [key, rest];
        })
      );
      const record = { ...collection, data: { ...collection?.data, variables: updatedVariables } };
      return upsertApiRecord(user.details?.profile?.uid, record, activeWorkspaceId).then((result) => {
        onSaveRecord(result.data);
        dispatch(variablesActions.setCollectionVariables({ collectionId, variables }));
      });
    },
    [collection, activeWorkspaceId, user.details?.profile?.uid, onSaveRecord, dispatch, collectionId]
  );

  const handleRemoveVariable = useCallback(
    async (key: string) => {
      const updatedVariables = { ...collection?.data?.variables };
      delete updatedVariables[key];
      const record = { ...collection, data: { ...collection?.data, variables: updatedVariables } };
      return upsertApiRecord(user.details?.profile?.uid, record, activeWorkspaceId).then((result) => {
        onSaveRecord(result.data);
      });
    },
    [collection, activeWorkspaceId, user.details?.profile?.uid, onSaveRecord]
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
        children: (
          <VariablesList
            variables={collectionVariables[collectionId]?.variables || {}}
            setVariables={handleSetVariables}
            removeVariable={handleRemoveVariable}
          />
        ),
      },
    ];
  }, [handleRemoveVariable, handleSetVariables, collectionVariables, collectionId, collection]);

  const handleCollectionNameChange = useCallback(
    async (name: string) => {
      const record = { ...collection, name };
      return upsertApiRecord(user.details?.profile?.uid, record, activeWorkspaceId).then((result) => {
        onSaveRecord(result.data);
        replaceTab(result.data.id, {
          id: result.data.id,
          title: result.data.name,
          url: `${PATHS.API_CLIENT.ABSOLUTE}/collection/${result.data.id}`,
        });
      });
    },
    [collection, activeWorkspaceId, user.details?.profile?.uid, onSaveRecord, replaceTab]
  );

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
