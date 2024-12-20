import { Result, Tabs } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { VariablesList } from "features/apiClient/screens/environment/components/VariablesList/VariablesList";
import { RQAPI } from "features/apiClient/types";
import { useSelector } from "react-redux";
import { CollectionOverview } from "./components/CollectionOverview/CollectionOverview";
import { getCollectionVariables } from "store/features/variables/selectors";
import "./collectionView.scss";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";

const TAB_KEYS = {
  OVERVIEW: "overview",
  VARIABLES: "variables",
};

export const CollectionView = () => {
  const { collectionId } = useParams();
  const { apiClientRecords } = useApiClientContext();
  const collectionVariables = useSelector(getCollectionVariables);
  const { setCollectionVariables, removeCollectionVariable } = useEnvironmentManager();

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
          <RQBreadcrumb recordName={collection?.name || "New Collection"} disabled={true} />
          <div className="collection-view-content">
            <Tabs defaultActiveKey={TAB_KEYS.OVERVIEW} items={tabItems} animated={false} />
          </div>
        </>
      )}
    </div>
  );
};
