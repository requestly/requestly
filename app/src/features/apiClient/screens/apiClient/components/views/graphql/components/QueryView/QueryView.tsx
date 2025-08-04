import Split from "react-split";
import { OperationEditor } from "../GraphQLEditor/components/OperationEditor/OperationEditor";
import { VariablesEditor } from "../GraphQLEditor/components/VariablesEditor/VariablesEditor";
import { SchemaBuilder } from "../SchemaBuilder/SchemaBuilder";
import "./queryView.scss";

export const QueryView = () => {
  return (
    <Split className="gql-split-horizontal" sizes={[65, 35]} direction="horizontal" gutterSize={6}>
      <Split className="gql-split-vertical" sizes={[50, 50]} direction="vertical" gutterSize={6}>
        <div className="pane gql-operation-editor">
          <div className="gql-editor-header">OPERATIONS</div>
          <OperationEditor />
        </div>
        <div className="pane gql-variables-editor">
          <div className="gql-editor-header">VARIABLES</div>
          <VariablesEditor />
        </div>
      </Split>
      <div className="pane">
        <SchemaBuilder />
      </div>
    </Split>
  );
};
