import React, { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { keymap } from "@codemirror/view";
import { json } from "@codemirror/lang-json";
import { graphql } from "cm6-graphql";
import { buildClientSchema } from "graphql";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import "./graphQLEditor.css";
import { IntrospectionData } from "features/apiClient/helpers/introspectionQuery";
import { indentWithTab } from "@codemirror/commands";
import { customKeyBinding } from "componentsV2/CodeEditor/components/EditorV2/plugins";

interface BaseEditorProps {
  initialDoc?: string;
  className?: string;
  onChange?: (doc: string) => void;
}

interface OperationEditorProps extends BaseEditorProps {
  type: "operation";
  introspectionData: IntrospectionData | null;
}

interface VariablesEditorProps extends BaseEditorProps {
  type: "variables";
}

type EditorProps = OperationEditorProps | VariablesEditorProps;

const basicExtensions = [basicSetup, vscodeDark, keymap.of([indentWithTab])];

const normalizeDocValue = (doc: any): string => {
  if (typeof doc === "object" && doc !== null) {
    return JSON.stringify(doc, null, 2);
  }
  return typeof doc === "string" ? doc : "";
};

export const GraphQLEditor: React.FC<EditorProps> = (props) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(props.onChange);
  const initialDocRef = useRef(props.initialDoc);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const myTheme = EditorView.theme({
    ".cm-activeLine": {
      backgroundColor: "#ffffff0f",
    },
    "&.cm-editor:not(.cm-focused) .cm-activeLine": {
      backgroundColor: "transparent",
    },
    ".cm-tooltip-autocomplete": {
      padding: "var(--space-4, 8px)",
      borderRadius: "4px",
      border: "1px solid var(--requestly-color-white-t-10, rgba(255, 255, 255, 0.06))",
      background: "var(--requestly-color-surface-1, #282828)",
      color: "var(--requestly-color-text-default)",
    },
    ".cm-tooltip-autocomplete li": {
      padding: "var(--space-2, 4px) !important",
      fontSize: "12px",
    },
    '.cm-tooltip-autocomplete li[aria-selected="true"]': {
      background: "var(--requestly-color-white-t-10, rgba(255, 255, 255, 0.06)) !important",
    },
    ".cm-tooltip-autocomplete .cm-completionLabel": {
      color: "var(--requestly-color-text-default)",
    },
    ".cm-tooltip-autocomplete .cm-completionDetail": {
      color: "var(--requestly-color-text-subtle)",
      fontSize: "11px",
      letterSpacing: "0.25px",
      marginLeft: "8px",
    },
    ".cm-tooltip.cm-completionInfo": {
      backgroundColor: "#000",
      color: "var(--requestly-color-text-default)",
      padding: "0.5em",
      fontSize: "12px",
    },
    ".cm-diagnostic": {
      background: "#000",
      fontSize: "12px",
    },
  });

  useEffect(() => {
    onChangeRef.current = props.onChange;
  }, [props.onChange]);

  useEffect(() => {
    initialDocRef.current = props.initialDoc;
  }, [props.initialDoc]);

  useEffect(() => {
    if (viewRef.current && props.initialDoc !== undefined) {
      // Clear any pending update
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      const docValue = normalizeDocValue(props.initialDoc);

      // Debounce the update to avoid rapid successive updates
      updateTimeoutRef.current = setTimeout(() => {
        const currentDoc = viewRef.current?.state.doc.toString();
        if (currentDoc !== docValue) {
          // Only update if the content is actually different
          const transaction = viewRef.current!.state.update({
            changes: {
              from: 0,
              to: viewRef.current!.state.doc.length,
              insert: docValue,
            },
          });
          viewRef.current!.dispatch(transaction);
        }
      }, 50);
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [props.initialDoc]);

  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const doc = update.state.doc.toString();
        onChangeRef.current?.(doc);
      }
    });

    let extensions = [...basicExtensions, updateListener, myTheme, customKeyBinding];

    if (props.type === "operation") {
      const introspectionData = (props as OperationEditorProps).introspectionData;
      if (introspectionData) {
        const clientSchema = buildClientSchema(introspectionData);
        extensions.push(graphql(clientSchema));
      }
    } else if (props.type === "variables") {
      extensions.push(json());
    }

    const docValue = normalizeDocValue(initialDocRef.current);

    const state = EditorState.create({
      doc: docValue,
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
  }, [props.type, props.type === "operation" ? props.introspectionData : null]); // Only recreate when type or schema changes

  return <div ref={editorRef} className={`gql-editor ${props?.className || ""}`} />;
};
