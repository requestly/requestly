import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";

interface VariableSetters {
  setHoveredVariable: (token: string | null) => void;
  setPopupPosition: (position: { x: number; y: number }) => void;
}

export const highlightVariablesPlugin = (setters: VariableSetters) => {
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
        view.dom.addEventListener("mouseleave", () => setters.setHoveredVariable(null));
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

          this.variablePositions.push({
            start: startIndex,
            end: endIndex,
            variable: match[0].slice(2, -2), // Extract the variable name
          });

          decorations.push(
            Decoration.mark({
              class: "highlight-variable",
            }).range(match.index, match.index + match[0].length)
          );
        }
        return Decoration.set(decorations);
      }

      handleMousemove(event: MouseEvent) {
        const { clientX, clientY } = event;
        const pos = this.view.posAtCoords({ x: clientX, y: clientY });

        if (pos !== null) {
          const doc = this.view.state.doc;

          // Check if cursor is over any stored variable positions
          const hoveredVar = this.variablePositions.find((variable) => pos >= variable.start && pos <= variable.end);

          if (hoveredVar) {
            // If hovering over a variable, show popup
            const token = doc.sliceString(hoveredVar.start, hoveredVar.end);
            const coords = this.view.coordsAtPos((hoveredVar.start + hoveredVar.end) / 2);
            setters.setHoveredVariable(token);
            setters.setPopupPosition({
              x: coords.left,
              y: coords.bottom,
            });
          } else {
            setters.setHoveredVariable(null); // Hide popup if not hovering over a variable
          }
        }
      }

      destroy() {
        this.view.dom.removeEventListener("mousemove", this.mousemove); // Clean up event listener
      }
    },
    { decorations: (v) => v.decorations }
  );
};
