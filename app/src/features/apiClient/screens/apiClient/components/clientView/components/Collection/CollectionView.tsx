import { Result, Tabs } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { VariablesList } from "features/apiClient/screens/environment/components/VariablesList/VariablesList";
import { RQAPI } from "features/apiClient/types";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { upsertApiRecord } from "backend/apiClient";
import { EnvironmentVariables } from "backend/environment/types";
import { CollectionOverview } from "./components/CollectionOverview/CollectionOverview";
import "./collectionView.scss";
import { environmentVariablesActions } from "store/features/environment/slice";
import { getCollectionVariables } from "store/features/environment/selectors";

const TAB_KEYS = {
  OVERVIEW: "overview",
  VARIABLES: "variables",
};

export const CollectionView = () => {
  const dispatch = useDispatch();
  const { collectionId } = useParams();
  const { apiClientRecords, onSaveRecord } = useApiClientContext();
  const user = useSelector(getUserAuthDetails);
  const teamId = useSelector(getCurrentlyActiveWorkspace);
  const collectionVariables = useSelector(getCollectionVariables);

  const collection = apiClientRecords.find((record) => record.id === collectionId) as RQAPI.CollectionRecord;

  const handleSetVariables = useCallback(
    async (variables: EnvironmentVariables) => {
      dispatch(environmentVariablesActions.setCollectionVariables({ collectionId, variables }));
      const updatedVariables = Object.fromEntries(
        Object.entries(variables).map(([key, value]) => {
          const { localValue, ...rest } = value;
          return [key, rest];
        })
      );
      const record = { ...collection, data: { ...collection?.data, variables: updatedVariables } };
      return upsertApiRecord(user.details?.profile?.uid, record, teamId).then((result) => {
        onSaveRecord(result.data);
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

  return (
    <div className="collection-view-container">
      {!collection ? (
        <Result
          status="error"
          title="Collection not found"
          subTitle="Oops! Looks like this collection doesn't exist."
        />
      ) : (
        <>
          <RQBreadcrumb recordName={collection.name} disabled={true} />
          <div className="collection-view-content">
            <Tabs defaultActiveKey={TAB_KEYS.OVERVIEW} items={tabItems} animated={false} />
          </div>
        </>
      )}
    </div>
  );
};
