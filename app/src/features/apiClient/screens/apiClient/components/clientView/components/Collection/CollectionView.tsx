import { Result, Tabs } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import { useCallback, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { VariablesList } from "features/apiClient/screens/environment/components/VariablesList/VariablesList";
import { RQAPI } from "features/apiClient/types";
import { useSelector } from "react-redux";
import { CollectionOverview } from "./components/CollectionOverview/CollectionOverview";
import { getCollectionVariables } from "store/features/variables/selectors";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import "./collectionView.scss";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { upsertApiRecord } from "backend/apiClient";

const TAB_KEYS = {
  OVERVIEW: "overview",
  VARIABLES: "variables",
};

export const CollectionView = () => {
  const { collectionId } = useParams();
  const { setCollectionVariables, removeCollectionVariable } = useEnvironmentManager();
  const { apiClientRecords, onSaveRecord } = useApiClientContext();
  const { replaceTab } = useTabsLayoutContext();
  const user = useSelector(getUserAuthDetails);
  const teamId = useSelector(getCurrentlyActiveWorkspace);
  const collectionVariables = useSelector(getCollectionVariables);
  const location = useLocation();

  const collection = useMemo(() => {
    return apiClientRecords.find((record) => record.id === collectionId) as RQAPI.CollectionRecord;
  }, [apiClientRecords, collectionId]);

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
            setVariables={(variables) => setCollectionVariables(variables, collectionId)}
            removeVariable={(key) => removeCollectionVariable(key, collectionId)}
          />
        ),
      },
    ];
  }, [setCollectionVariables, removeCollectionVariable, collectionVariables, collectionId, collection]);

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
