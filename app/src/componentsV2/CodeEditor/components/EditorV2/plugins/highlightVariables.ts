import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";

interface VariableSetters {
  handleSetVariable: (token: string | null) => void;
  setPopupPosition: (position: { x: number; y: number }) => void;
}

export const highlightVariablesPlugin = (setters: VariableSetters, variables: ScopedVariables) => {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      private view: EditorView;
      private variablePositions: { start: number; end: number; variable: string }[] = [];
      private mousemove: (event: MouseEvent) => void;

      constructor(view: EditorView) {
        this.decorations = this.createDecorations(view);
        this.view = view;
        this.mousemove = (event: MouseEvent) => this.handleMousemove(event);
        view.dom.addEventListener("mousemove", this.mousemove);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.createDecorations(update.view);
        }
      }

      createDecorations(view: EditorView) {
        const decorations = [];
        this.variablePositions = []; // Clear previous variable positions
        const regex = /{{.*?}}/g;
        const text = view.state.doc.toString(); // Get the document text as a string
        let match;
        // Use regex to find {{variable}} patterns and apply decorations
        while ((match = regex.exec(text)) !== null) {
          const startIndex = match.index;
          const endIndex = match.index + match[0].length;

          const variable = match[0].slice(2, -2); // Extract the variable name

          this.variablePositions.push({
            start: startIndex,
            end: endIndex,
            variable,
          });

          const isDefined = variables[variable];
          const cls = `highlight-${isDefined ? "defined" : "undefined"}-variable`;
          const colorVar = isDefined ? "var(--requestly-color-primary-text)" : "var(--requestly-color-error-text)";

          decorations.push(
            Decoration.mark({
              class: cls,
              attributes: { style: `color: ${colorVar} !important;` },
            }).range(match.index, match.index + match[0].length)
          );
        }
        return Decoration.set(decorations);
      }

      handleMousemove(event: MouseEvent) {
        const { clientX, clientY } = event;
        const pos = this.view.posAtCoords({ x: clientX, y: clientY }, false);

        if (pos > 0 && pos < this.view.state.doc.toString().length) {
          const doc = this.view.state.doc;

          // Check if cursor is over any stored variable positions
          const hoveredVar = this.variablePositions.find((variable) => pos >= variable.start && pos <= variable.end);

          if (hoveredVar) {
            // If hovering over a variable, show popup
            const token = doc.sliceString(hoveredVar.start, hoveredVar.end);
            const coords = this.view.coordsAtPos(hoveredVar.start);

            const variable = token.slice(2, -2);
            setters.handleSetVariable(variable);
            setters.setPopupPosition({
              x: coords.left,
              y: coords.top,
            });
          } else {
            setters.handleSetVariable(null); // Hide popup if not hovering over a variable
          }
        } else {
          setters.handleSetVariable(null);
        }
      }

      destroy() {
        this.view.dom.removeEventListener("mousemove", this.mousemove); // Clean up event listener
      }
    },
    { decorations: (v) => v.decorations }
  );
};
