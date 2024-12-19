import { Result, Tabs } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import { useCallback, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { VariablesList } from "features/apiClient/screens/environment/components/VariablesList/VariablesList";
import { RQAPI } from "features/apiClient/types";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { upsertApiRecord } from "backend/apiClient";
import { EnvironmentVariables } from "backend/environment/types";
import { CollectionOverview } from "./components/CollectionOverview/CollectionOverview";
import { variablesActions } from "store/features/variables/slice";
import { getCollectionVariables } from "store/features/variables/selectors";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import "./collectionView.scss";
import AuthorizationView from "../request/components/AuthorizationView";
import { debounce } from "lodash";

const TAB_KEYS = {
  OVERVIEW: "overview",
  VARIABLES: "variables",
  AUTHORIZATION: "authorization",
};

export const CollectionView = () => {
  const dispatch = useDispatch();
  const { collectionId } = useParams();
  const { apiClientRecords, onSaveRecord } = useApiClientContext();
  const { replaceTab } = useTabsLayoutContext();
  const user = useSelector(getUserAuthDetails);
  const teamId = useSelector(getCurrentlyActiveWorkspace);
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
      return upsertApiRecord(user.details?.profile?.uid, record, teamId).then((result) => {
        onSaveRecord(result.data);
        dispatch(variablesActions.setCollectionVariables({ collectionId, variables }));
      });
    },
    [collection, teamId, user.details?.profile?.uid, onSaveRecord, dispatch, collectionId]
  );

  const handleRemoveVariable = useCallback(
    async (key: string) => {
      const updatedVariables = { ...collection?.data?.variables };
      delete updatedVariables[key];
      const record = { ...collection, data: { ...collection?.data, variables: updatedVariables } };
      return upsertApiRecord(user.details?.profile?.uid, record, teamId).then((result) => {
        onSaveRecord(result.data);
      });
    },
    [collection, teamId, user.details?.profile?.uid, onSaveRecord]
  );

  const updateCollectionAuthData = useCallback(
    async (newAuthOptions: RQAPI.AuthOptions) => {
      const record = {
        ...collection,
        data: {
          ...collection?.data,
          auth: newAuthOptions,
        },
      };
      return upsertApiRecord(user.details?.profile?.uid, record, teamId)
        .then((result) => {
          // fix-me: to verify new change are broadcasted to child entries that are open in tabs
          onSaveRecord(result.data);
        })
        .catch(console.error);
    },
    [collection, onSaveRecord, teamId, user.details?.profile?.uid]
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
      {
        label: "Authorization",
        key: TAB_KEYS.AUTHORIZATION,
        children: (
          <AuthorizationView
            defaultValues={collection?.data?.auth}
            onAuthUpdate={debounce(updateCollectionAuthData, 500)}
          />
        ),
      },
    ];
  }, [
    collection,
    collectionVariables,
    collectionId,
    handleSetVariables,
    handleRemoveVariable,
    updateCollectionAuthData,
  ]);

  const handleCollectionNameChange = useCallback(
    async (name: string) => {
      const record = { ...collection, name };
      return upsertApiRecord(user.details?.profile?.uid, record, teamId).then((result) => {
        onSaveRecord(result.data);
        replaceTab(result.data.id, {
          id: result.data.id,
          title: result.data.name,
          url: `${PATHS.API_CLIENT.ABSOLUTE}/collection/${result.data.id}`,
        });
      });
    },
    [collection, teamId, user.details?.profile?.uid, onSaveRecord, replaceTab]
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
