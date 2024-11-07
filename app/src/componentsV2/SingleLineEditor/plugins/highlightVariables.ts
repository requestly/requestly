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

// export const highlightVariablesPlugin = (
//   setters: VariableSetters,
//   currentEnvironmentVariables: Record<string, any> = {}
// ) => {
//   return ViewPlugin.fromClass(
//     class {
//       decorations: DecorationSet;

//       private view: EditorView;
//       private variablePositions: { start: number; end: number; variable: string }[] = [];
//       private mousemove: (event: MouseEvent) => void;

//       constructor(view: EditorView) {
//         this.decorations = this.createDecorations(view);
//         this.view = view;
//         this.mousemove = (event: MouseEvent) => this.handleMousemove(event);
//         view.dom.addEventListener("mousemove", this.mousemove);
//       }

//       update(update: ViewUpdate) {
//         if (update.docChanged || update.viewportChanged) {
//           this.decorations = this.createDecorations(update.view);
//         }
//       }

//       createDecorations(view: EditorView) {
//         const decorations = [];
//         this.variablePositions = []; // Clear previous variable positions
//         const regex = /{{.*?}}/g;
//         const text = view.state.doc.toString(); // Get the document text as a string
//         let match;
//         // Use regex to find {{variable}} patterns and apply decorations
//         while ((match = regex.exec(text)) !== null) {
//           const startIndex = match.index;
//           const endIndex = match.index + match[0].length;

//           const variable = match[0].slice(2, -2); // Extract the variable name

//           this.variablePositions.push({
//             start: startIndex,
//             end: endIndex,
//             variable,
//           });

//           decorations.push(
//             Decoration.mark({
//               class: `highlight-${variable in currentEnvironmentVariables ? "defined" : "undefined"}-variable`,
//             }).range(match.index, match.index + match[0].length)
//           );
//         }
//         return Decoration.set(decorations);
//       }

//       handleMousemove(event: MouseEvent) {
//         const { clientX, clientY } = event;
//         const pos = this.view.posAtCoords({ x: clientX, y: clientY }, false);

//         if (pos > 0 && pos < this.view.state.doc.toString().length) {
//           const doc = this.view.state.doc;

//           // Check if cursor is over any stored variable positions
//           const hoveredVar = this.variablePositions.find((variable) => pos >= variable.start && pos <= variable.end);

//           if (hoveredVar) {
//             // If hovering over a variable, show popup
//             const token = doc.sliceString(hoveredVar.start, hoveredVar.end);
//             const coords = this.view.coordsAtPos(hoveredVar.start);

//             const variable = token.slice(2, -2);
//             setters.setHoveredVariable(variable);
//             setters.setPopupPosition({
//               x: coords.left,
//               y: coords.top,
//             });
//           } else {
//             setters.setHoveredVariable(null); // Hide popup if not hovering over a variable
//           }
//         } else {
//           setters.setHoveredVariable(null);
//         }
//       }

//       destroy() {
//         this.view.dom.removeEventListener("mousemove", this.mousemove); // Clean up event listener
//       }
//     },
//     { decorations: (v) => v.decorations }
//   );
// };
