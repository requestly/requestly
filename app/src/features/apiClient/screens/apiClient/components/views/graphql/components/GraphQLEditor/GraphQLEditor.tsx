import React, { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { json } from "@codemirror/lang-json";
import { graphql } from "cm6-graphql";
import { buildClientSchema, GraphQLSchema } from "graphql";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

interface BaseEditorProps {
  initialDoc?: string;
  onChange?: (doc: string) => void;
}

interface OperationEditorProps extends BaseEditorProps {
  type: "operation";
  schema: GraphQLSchema;
}

interface VariablesEditorProps extends BaseEditorProps {
  type: "variables";
}

type EditorProps = OperationEditorProps | VariablesEditorProps;

const basicExtensions = [basicSetup, vscodeDark];

export const GraphQLEditor: React.FC<EditorProps> = (props) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(props.onChange);
  const initialDocRef = useRef(props.initialDoc);

  useEffect(() => {
    onChangeRef.current = props.onChange;
  }, [props.onChange]);

  useEffect(() => {
    initialDocRef.current = props.initialDoc;
  }, [props.initialDoc]);

  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const doc = update.state.doc.toString();
        onChangeRef.current?.(doc);
      }
    });

    let extensions = [...basicExtensions, updateListener];

    if (props.type === "operation") {
      const schema = (props as OperationEditorProps).schema;
      // @ts-ignore
      const clientSchema = buildClientSchema(schema.data);
      extensions.push(graphql(clientSchema));
    } else if (props.type === "variables") {
      extensions.push(json());
    }

    const state = EditorState.create({
      doc: initialDocRef.current || "",
      extensions,
    });

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.type, props.type === "operation" ? props.schema : null]); // Only recreate when type or schema changes

  return <div ref={editorRef} style={{ height: "200px" }} />;
};
