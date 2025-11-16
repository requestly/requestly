import {
  autocompletion,
  Completion,
  CompletionResult,
  CompletionSource,
  insertCompletionText,
} from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import React from "react";
import ReactDOM from "react-dom";
import { Popover } from "antd";
import { EnvironmentVariableType, VariableScope } from "backend/environment/types";
import { capitalize } from "lodash";

// Variable suggestions popover component with two-column layout
const VariableSuggestionsPopover: React.FC<{
  variables: ScopedVariables;
  onSelect: (variableKey: string) => void;
  query: string;
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
}> = ({ variables, onSelect, query, selectedIndex, onSelectionChange }) => {
  const filteredVariables = Array.from(variables.entries()).filter(([key]) =>
    key.toLowerCase().includes(query.toLowerCase())
  );

  const activeVariable = filteredVariables[selectedIndex] || filteredVariables[0];

  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        overflow: "hidden",
        width: "450px",
        height: "150px",
        borderRadius: "4px",
        border: "1px solid var(--requestly-color-white-t-10)",
      },
    },
    [
      // Left column - Variables list
      React.createElement(
        "div",
        {
          key: "list",
          style: {
            minWidth: "180px",
            height: "100%",
            padding: "8px",
            background: "#212121",
            borderRight: "1px solid var(--requestly-color-white-t-10)",
            overflowY: "auto",
            flexShrink: 0,
          },
        },
        filteredVariables.map(([key, [variable, source]], index) =>
          React.createElement(
            "div",
            {
              key: key,
              style: {
                width: "100%",
                padding: "4px 8px",
                border: "none",
                background: "transparent",
                textAlign: "left",
                color: "var(--requestly-color-text-default)",
                fontSize: "var(--requestly-font-size-xs)",
                cursor: "pointer",
                userSelect: "none",
                outline: "none",
                borderRadius: "4px",
                backgroundColor: index === selectedIndex ? "rgba(255, 255, 255, 0.04)" : "transparent",
              },
              onClick: () => onSelect(key),
              onMouseEnter: () => onSelectionChange(index),
            },
            key
          )
        )
      ),

      // Right column - Variable details
      React.createElement(
        "div",
        {
          key: "details",
          style: {
            flex: 1,
            height: "100%",
            padding: "8px",
            background: "var(--requestly-color-background)",
            minWidth: "200px",
            overflowX: "auto",
            overflowY: "auto",
            wordWrap: "break-word",
            whiteSpace: "normal",
          },
        },
        activeVariable
          ? (() => {
              const [, [variable, source]] = activeVariable;

              const sanitizeValue = (value: any) => {
                if (variable.type === EnvironmentVariableType.Secret) {
                  return "•".repeat(String(value || "").length);
                }
                return value === undefined || value === null ? "" : `${value}`;
              };

              const syncValue = sanitizeValue(variable.syncValue);
              const localValue = sanitizeValue(variable.localValue);
              const isPersisted = `${variable.isPersisted}`;

              const infoFields =
                source.scope === VariableScope.RUNTIME
                  ? [
                      { label: "Type", value: capitalize(variable.type) },
                      { label: "Current Value", value: localValue },
                      { label: "Is persistent", value: isPersisted },
                    ]
                  : [
                      { label: "Type", value: capitalize(variable.type) },
                      { label: "Initial Value", value: syncValue },
                      { label: "Current Value", value: localValue },
                    ];

              return [
                // Content with info fields
                React.createElement(
                  "div",
                  {
                    key: "content",
                    style: {
                      display: "flex",
                      padding: "6px 12px 12px 12px",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      alignSelf: "stretch",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      key: "info-content",
                      style: {
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        gap: "4px 12px",
                        alignItems: "start",
                        width: "100%",
                      },
                    },
                    infoFields.flatMap(({ label, value }) => [
                      React.createElement(
                        "div",
                        {
                          key: `title-${label}`,
                          style: {
                            color: "var(--requestly-color-text-subtle)",
                            fontSize: "var(--requestly-font-size-xs)",
                            fontWeight: 500,
                            padding: "2px 8px 2px 0",
                          },
                        },
                        label
                      ),
                      React.createElement(
                        "div",
                        {
                          key: `value-${label}`,
                          style: {
                            color: "var(--requestly-color-text-default)",
                            fontSize: "var(--requestly-font-size-xs)",
                            padding: "2px 0",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            overflowWrap: "break-word",
                          },
                        },
                        value
                      ),
                    ])
                  )
                ),
              ];
            })()
          : React.createElement(
              "div",
              {
                style: {
                  padding: "20px",
                  textAlign: "center",
                  color: "var(--requestly-color-text-subtle)",
                  fontSize: "var(--requestly-font-size-sm)",
                },
              },
              "No variables found"
            )
      ),
    ]
  );
};

/**
 * Creates a custom completion source that returns a set of suggestions
 * when the typed text matches a specified pattern.
 *
 * @param matchPattern A regular expression to identify when completions should appear.
 * @param completions An array of Completion items to display as suggestions.
 * @param lengthOfStartingChars Number of initial characters that remain untouched by the completion.
 * @returns A CompletionSource that provides suggestions whenever the text matches matchPattern.
 */
export function generateCompletionSource(
  matchPattern: RegExp,
  completions: Completion[],
  lengthOfStartingChars: number
): CompletionSource {
  return (context) => {
    const match = context.matchBefore(matchPattern);
    if (match) {
      return {
        from: match.from + lengthOfStartingChars,
        to: match.to,
        options: completions,
        filter: true,
      } as CompletionResult;
    }
    return null;
  };
}

// VARIABLE COMPLETIONS
function varCompletionSource(envVariables: ScopedVariables): CompletionSource {
  const varCompletions = Array.from(envVariables.entries()).map(([envId, [variable, source]]) => {
    return {
      label: envId,
      detail:
        variable.type === "secret"
          ? "•".repeat(String(variable.localValue ?? variable.syncValue).length)
          : ((variable.localValue ?? variable.syncValue) as string),
      type: variable.localValue ? "local variable" : "sync variable",
      apply: (view: EditorView, completion: Completion, from: number, to: number): void => {
        // Look ahead up to 10 characters, skip spaces, then check for and add closing braces
        const LOOK_AHEAD_BUFFER = 10;
        const lookahead = view.state.doc.sliceString(to, to + LOOK_AHEAD_BUFFER);
        const nextChars = lookahead.trimStart().slice(0, 2);
        const closingChars = nextChars.startsWith("}}") ? "" : nextChars.startsWith("}") ? "}" : "}}";
        const finalCompletion = completion.label + closingChars;
        view.dispatch(insertCompletionText(view.state, finalCompletion, from, to));
      },
    };
  });
  return generateCompletionSource(/\{\{.*?/g, varCompletions, 2);
}

/* NEW PLUGIN WITH ANT DESIGN POPOVER */
export function generateCompletionsWithPopover(envVariables?: ScopedVariables) {
  if (!envVariables) return [];

  let popoverContainer: HTMLElement | null = null;
  let currentRange: { from: number; to: number } | null = null;
  let selectedIndex = 0;
  let filteredVariables: [string, any][] = [];

  const updateFilteredVariables = (query: string) => {
    filteredVariables = Array.from(envVariables.entries()).filter(([key]) =>
      key.toLowerCase().includes(query.toLowerCase())
    );
    selectedIndex = 0; // Reset selection when filtering changes
  };

  const showPopover = (
    view: EditorView,
    position: { x: number; y: number },
    query: string,
    range: { from: number; to: number }
  ) => {
    hidePopover();

    currentRange = range;
    updateFilteredVariables(query);

    popoverContainer = document.createElement("div");
    popoverContainer.style.position = "fixed";
    popoverContainer.style.left = `${position.x}px`;
    popoverContainer.style.top = `${position.y - 16}px`;
    popoverContainer.style.zIndex = "10000";
    document.body.appendChild(popoverContainer);

    const handleSelect = (variableKey: string) => {
      insertVariable(view, variableKey);
      hidePopover();
    };

    const handleSelectionChange = (index: number) => {
      selectedIndex = index;
      rerenderPopover(view, query);
    };

    const rerenderPopover = (view: EditorView, query: string) => {
      if (!popoverContainer) return;

      ReactDOM.render(
        React.createElement(
          Popover,
          {
            content: React.createElement(VariableSuggestionsPopover, {
              variables: envVariables,
              query,
              onSelect: handleSelect,
              selectedIndex,
              onSelectionChange: handleSelectionChange,
            }),
            open: true,
            placement: "bottomLeft",
            trigger: [],
            destroyTooltipOnHide: true,
            showArrow: false,
            overlayStyle: { background: "transparent", boxShadow: "none", border: "none" },
            onOpenChange: (open: boolean) => {
              if (!open) hidePopover();
            },
          },
          React.createElement("span")
        ),
        popoverContainer
      );
    };

    rerenderPopover(view, query);
  };

  const insertVariable = (view: EditorView, variableKey: string) => {
    if (!currentRange) return;

    const state = view.state;
    const { from, to } = currentRange;

    // Look ahead for closing braces
    const LOOK_AHEAD_BUFFER = 10;
    const lookahead = state.doc.sliceString(to, to + LOOK_AHEAD_BUFFER);
    const nextChars = lookahead.trimStart().slice(0, 2);
    const closingChars = nextChars.startsWith("}}") ? "" : nextChars.startsWith("}") ? "}" : "}}";

    view.dispatch({
      changes: {
        from,
        to,
        insert: `{{${variableKey}${closingChars}`,
      },
      selection: { anchor: from + `{{${variableKey}${closingChars}`.length },
    });
  };

  const rerenderCurrentPopover = (view: EditorView) => {
    if (!popoverContainer) return;

    const line = view.state.doc.lineAt(view.state.selection.main.head);
    const textBefore = line.text.slice(0, view.state.selection.main.head - line.from);
    const match = /\{\{([^{}]*)$/.exec(textBefore);
    const query = match ? match[1] || "" : "";

    const handleSelect = (variableKey: string) => {
      insertVariable(view, variableKey);
      hidePopover();
    };

    const handleSelectionChange = (index: number) => {
      selectedIndex = index;
      rerenderCurrentPopover(view);
    };

    ReactDOM.render(
      React.createElement(
        Popover,
        {
          content: React.createElement(VariableSuggestionsPopover, {
            variables: envVariables,
            query,
            onSelect: handleSelect,
            selectedIndex,
            onSelectionChange: handleSelectionChange,
          }),
          open: true,
          placement: "bottomLeft",
          trigger: [],
          destroyTooltipOnHide: true,
          showArrow: false,
          overlayStyle: { background: "transparent", boxShadow: "none", border: "none" },
          onOpenChange: (open: boolean) => {
            if (!open) hidePopover();
          },
        },
        React.createElement("span")
      ),
      popoverContainer
    );
  };

  const hidePopover = () => {
    if (popoverContainer) {
      ReactDOM.unmountComponentAtNode(popoverContainer);
      popoverContainer.remove();
      popoverContainer = null;
    }
    currentRange = null;
  };

  return [
    EditorView.updateListener.of((update) => {
      if (!update.docChanged && !update.selectionSet) return;

      const state = update.state;
      const pos = state.selection.main.head;

      // Check if we're in a {{...}} pattern
      const line = state.doc.lineAt(pos);
      const textBefore = line.text.slice(0, pos - line.from);
      const match = /\{\{([^{}]*)$/.exec(textBefore);

      if (match) {
        const query = match[1] || "";
        const coords = update.view.coordsAtPos(pos);

        if (coords) {
          const filteredVariables = Array.from(envVariables.entries()).filter(([key]) =>
            key.toLowerCase().includes(query.toLowerCase())
          );

          if (filteredVariables.length > 0) {
            showPopover(update.view, { x: coords.left, y: coords.bottom + 2 }, query, {
              from: line.from + match.index,
              to: pos,
            });
          } else {
            hidePopover();
          }
        }
      } else {
        hidePopover();
      }
    }),
    EditorView.domEventHandlers({
      blur: () => {
        // Hide popover when editor loses focus
        setTimeout(hidePopover, 100); // Small delay to allow popover clicks
      },
      keydown: (event, view) => {
        if (!popoverContainer || filteredVariables.length === 0) return false;

        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            selectedIndex = (selectedIndex + 1) % filteredVariables.length;
            rerenderCurrentPopover(view);
            return true;

          case "ArrowUp":
            event.preventDefault();
            selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredVariables.length - 1;
            rerenderCurrentPopover(view);
            return true;

          case "Enter":
            event.preventDefault();
            if (filteredVariables[selectedIndex]) {
              const [variableKey] = filteredVariables[selectedIndex];
              insertVariable(view, variableKey);
              hidePopover();
            }
            return true;

          case "Escape":
            event.preventDefault();
            hidePopover();
            return true;
        }

        return false;
      },
    }),
  ];
}

/* CORE PLUGIN */
export default function generateCompletionsForVariables(envVariables?: ScopedVariables) {
  const customCompletions = [];
  if (envVariables) {
    customCompletions.push(varCompletionSource(envVariables));
  }

  if (!customCompletions.length) return null;
  return autocompletion({
    activateOnTyping: true,
    override: customCompletions,
    tooltipClass: () => "popup-tooltip",
    optionClass: () => "popup-option",
  });
}
