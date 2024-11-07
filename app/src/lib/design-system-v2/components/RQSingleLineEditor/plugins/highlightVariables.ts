import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { HighlightConfig, Position } from "../types";

interface HighlightPluginConfig {
  variables?: Record<string, any>;
  highlightConfig: HighlightConfig;
  onVariableHover: (variable: string | null, position: Position) => void;
}

export const createHighlightPlugin = ({ variables = {}, highlightConfig, onVariableHover }: HighlightPluginConfig) => {
  const {
    definedVariableClass: definedClass = "highlight-defined-variable",
    undefinedVariableClass: undefinedClass = "highlight-undefined-variable",
    pattern = /{{.*?}}/g,
    extractVariable = (match: string) => match.slice(2, -2),
  } = highlightConfig;

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      private view: EditorView;
      private variablePositions: Array<{
        start: number;
        end: number;
        variable: string;
      }> = [];
      private mousemove: (event: MouseEvent) => void;

      constructor(view: EditorView) {
        this.view = view;
        this.decorations = this.createDecorations(view);
        this.mousemove = this.handleMousemove.bind(this);
        view.dom.addEventListener("mousemove", this.mousemove);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.createDecorations(update.view);
        }
      }

      createDecorations(view: EditorView) {
        const decorations = [];
        this.variablePositions = [];
        const text = view.state.doc.toString();
        let match;

        while ((match = pattern.exec(text)) !== null) {
          const startIndex = match.index;
          const endIndex = startIndex + match[0].length;
          const variable = extractVariable(match[0]);

          this.variablePositions.push({
            start: startIndex,
            end: endIndex,
            variable,
          });

          decorations.push(
            Decoration.mark({
              class: variable in variables ? definedClass : undefinedClass,
            }).range(startIndex, endIndex)
          );
        }

        return Decoration.set(decorations);
      }

      handleMousemove(event: MouseEvent) {
        const pos = this.view.posAtCoords({ x: event.clientX, y: event.clientY }, false);

        if (!pos || pos > this.view.state.doc.length) {
          onVariableHover(null, { x: 0, y: 0 });
          return;
        }

        const hoveredVar = this.variablePositions.find((v) => pos >= v.start && pos <= v.end);

        if (hoveredVar) {
          const coords = this.view.coordsAtPos(hoveredVar.start);
          onVariableHover(hoveredVar.variable, {
            x: coords.left,
            y: coords.top,
          });
        } else {
          onVariableHover(null, { x: 0, y: 0 });
        }
      }

      destroy() {
        this.view.dom.removeEventListener("mousemove", this.mousemove);
      }
    },
    { decorations: (v) => v.decorations }
  );
};
