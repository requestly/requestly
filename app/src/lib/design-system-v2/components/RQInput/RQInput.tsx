import React, { useRef, useEffect, useState } from "react";
import CodeMirror from "codemirror";
import { EditorView, Decoration, DecorationSet, ViewPlugin } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import "./RQInput.scss";

export const RQInput1 = () => {
  const editorRef = useRef(null);

  useEffect(() => {
    // Define an overlay to highlight environment variables {{variable}}
    const envVariableOverlay = {
      token: function (stream) {
        let ch;
        if (stream.match("{{")) {
          while ((ch = stream.next()) != null) {
            if (ch === "}" && stream.peek() === "}") {
              stream.next(); // Consume the closing }}
              return "env-variable"; // Style environment variables
            }
          }
        }
        stream.next();
        return null;
      },
    };

    // Initialize CodeMirror
    const editor = CodeMirror(editorRef.current, {
      lineNumbers: false, // Disable line numbers
      lineWrapping: false, // Disable line wrapping
      mode: "text", // Optional: Set language mode if necessary
      viewportMargin: Infinity, // Ensure no vertical expansion
      scrollbarStyle: "null", // Disable vertical scrollbars
    });

    // Add the overlay mode to highlight environment variables
    editor.addOverlay(envVariableOverlay);

    // Ensure single-line input behavior by intercepting the Enter key
    editor.on("beforeChange", (cm, changeObj) => {
      var typedNewLine =
        changeObj.origin == "+input" && typeof changeObj.text == "object" && changeObj.text.join("") == "";
      if (typedNewLine) {
        return changeObj.cancel();
      }

      var pastedNewLine = changeObj.origin == "paste" && typeof changeObj.text == "object" && changeObj.text.length > 1;
      if (pastedNewLine) {
        var newText = changeObj.text.join(" ");

        // trim
        //newText = $.trim(newText);

        return changeObj.update(null, null, [newText]);
      }

      return null;
    });

    // Set the size to prevent vertical expansion
    editor.setSize("100%", "auto");

    // return () => {
    //   editor.toTextArea(); // Clean up on unmount
    // };
  }, []);

  return <div ref={editorRef} className="single-line-editor-container ant-input"></div>;
};

export const RQInput = () => {
  const editorRef = useRef(null);
  const [hoveredVariable, setHoveredVariable] = useState(null); // Track hovered variable
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const highlightVariables = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      mousemove: (event: MouseEvent) => void;
      view: EditorView;
      variablePositions: { start: number; end: number; variable: string }[] = [];

      constructor(view) {
        this.decorations = this.createDecorations(view);
        this.mousemove = this.handleMousemove.bind(this); // Bind the mousemove handler
        view.dom.addEventListener("mousemove", this.mousemove);
        this.view = view;
      }

      update(update) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.createDecorations(update.view);
        }
      }

      createDecorations(view) {
        const decorations = [];
        this.variablePositions = []; // Clear previous variable positionsF
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

      handleMousemove(event) {
        const { clientX, clientY } = event;
        const pos = this.view.posAtCoords({ x: clientX, y: clientY });
        if (pos !== null) {
          const doc = this.view.state.doc;

          // Check if cursor is over any stored variable positions
          console.log("!!!debug", "var positions", {
            pos,
            variablePositions: this.variablePositions,
          });
          const hoveredVar = this.variablePositions.find((variable) => pos >= variable.start && pos <= variable.end);

          if (hoveredVar) {
            // If hovering over a variable, show popup
            const token = doc.sliceString(hoveredVar.start, hoveredVar.end);
            const coords = this.view.coordsAtPos(hoveredVar.start);
            setHoveredVariable(token);
            setPopupPosition({
              x: coords.left,
              y: coords.bottom,
            });
          } else {
            setHoveredVariable(null); // Hide popup if not hovering over a variable
          }
        }
      }

      destroy(view) {
        view.dom.removeEventListener("mousemove", this.mousemove); // Clean up event listener
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );

  useEffect(() => {
    new EditorView({
      parent: editorRef.current,
      extensions: [
        EditorView.lineWrapping, // Keep the editor single line
        EditorState.transactionFilter.of((tr) => {
          return tr.newDoc.lines > 1 ? [] : [tr]; // Prevent new lines
        }),
        highlightVariables, // Apply variable highlighting
      ],
    });
  }, [highlightVariables]);

  return (
    // <div style={{ position: "relative" }}>
    <>
      <div ref={editorRef} className="single-line-editor-container ant-input"></div>
      {hoveredVariable && (
        <div className="n-popup" style={{ top: `${popupPosition.y}px`, left: `${popupPosition.x}px` }}>
          {hoveredVariable} {/* This is the popup content */}
        </div>
      )}
    </>
    // </div>
  );
};
