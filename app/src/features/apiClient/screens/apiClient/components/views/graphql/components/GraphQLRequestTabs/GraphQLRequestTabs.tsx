import { RQAPI } from "features/apiClient/types";
import { ApiClientRequestTabs } from "../../../components/request/components/ApiClientRequestTabs/ApiClientRequestTabs";
import React, { useMemo } from "react";
import { RequestTabLabel } from "../../../components/request/components/ApiClientRequestTabs/components/RequestTabLabel/RequestTabLabel";
import { QueryView } from "../QueryView/QueryView";
import { RequestHeaders } from "./components/RequestHeaders/RequestHeaders";
import { GraphQLAuthView } from "./components/GraphQLAuthView/GraphQLAuthView";
import { GraphQLScripts } from "./components/GraphQLAuthView/GraphQLScripts";
import { RQButton } from "lib/design-system/components";
import { MdOutlineBallot } from "@react-icons/all-files/md/MdOutlineBallot";

enum GraphQLRequestTab {
  QUERY = "query",
  HEADERS = "headers",
  AUTHORIZATION = "authorization",
  SCRIPTS = "scripts",
}

interface Props {
  requestId: RQAPI.ApiRecord["id"];
  collectionId: RQAPI.ApiRecord["collectionId"];
  isSchemaBuilderOpen: boolean;
  setIsSchemaBuilderOpen: (isOpen: boolean) => void;
  focusPostResponseScriptEditor?: boolean;
  scriptEditorVersion?: number;
}

export const GraphQLRequestTabs: React.FC<Props> = ({
  requestId,
  collectionId,
  isSchemaBuilderOpen,
  setIsSchemaBuilderOpen,
  focusPostResponseScriptEditor,
  scriptEditorVersion,
}) => {
  const tabItems = useMemo(() => {
    return [
      {
        key: GraphQLRequestTab.QUERY,
        label: <RequestTabLabel label="Query" />,
        children: (
          <QueryView isSchemaBuilderOpen={isSchemaBuilderOpen} setIsSchemaBuilderOpen={setIsSchemaBuilderOpen} />
        ),
      },
      {
        key: GraphQLRequestTab.HEADERS,
        label: <RequestTabLabel label="Headers" />,
        children: (
          <div className="non-scrollable-tab-content">
            <RequestHeaders requestId={requestId} />
          </div>
        ),
      },
      {
        key: GraphQLRequestTab.AUTHORIZATION,
        label: <RequestTabLabel label="Authorization" />,
        children: <GraphQLAuthView recordId={requestId} collectionId={collectionId} />,
      },
      {
        key: GraphQLRequestTab.SCRIPTS,
        label: <RequestTabLabel label="Scripts" />,
        children: <GraphQLScripts key={`${scriptEditorVersion}`} focusPostResponse={focusPostResponseScriptEditor} />,
      },
    ];
  }, [
    requestId,
    collectionId,
    setIsSchemaBuilderOpen,
    isSchemaBuilderOpen,
    scriptEditorVersion,
    focusPostResponseScriptEditor,
  ]);
  return (
    <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
      <ApiClientRequestTabs requestId={requestId} items={tabItems} defaultActiveKey={GraphQLRequestTab.QUERY} />
      {!isSchemaBuilderOpen && (
        <RQButton
          className="schema-builder-toggle-button"
          icon={<MdOutlineBallot />}
          size="small"
          onClick={() => setIsSchemaBuilderOpen(true)}
        >
          Schema
        </RQButton>
      )}
    </div>
  );
};
