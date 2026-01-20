import React from "react";
import Split from "react-split";
import { OperationEditor } from "../GraphQLEditor/components/OperationEditor/OperationEditor";
import { VariablesEditor } from "../GraphQLEditor/components/VariablesEditor/VariablesEditor";
import { SchemaBuilder } from "../SchemaBuilder/SchemaBuilder";
import "./queryView.scss";

interface Props {
  setIsSchemaBuilderOpen: (isOpen: boolean) => void;
  isSchemaBuilderOpen: boolean;
}

export const QueryView: React.FC<Props> = ({ setIsSchemaBuilderOpen, isSchemaBuilderOpen }) => {
  return (
    <Split
      className="gql-split-horizontal"
      sizes={isSchemaBuilderOpen ? [55, 45] : [100, 0]}
      direction="horizontal"
      gutterSize={isSchemaBuilderOpen ? 6 : 0}
      minSize={isSchemaBuilderOpen ? 290 : 0}
    >
      <Split className="gql-split-vertical" sizes={[60, 40]} direction="vertical" gutterSize={6}>
        <div className="pane gql-operation-editor">
          <div className="gql-editor-header">OPERATIONS</div>
          <OperationEditor />
        </div>
        <div className="pane gql-variables-editor">
          <div className="gql-editor-header">VARIABLES</div>
          <VariablesEditor />
        </div>
      </Split>
      {isSchemaBuilderOpen && (
        <div className="pane">
          <SchemaBuilder setIsSchemaBuilderOpen={setIsSchemaBuilderOpen} />
        </div>
      )}
    </Split>
  );
};
