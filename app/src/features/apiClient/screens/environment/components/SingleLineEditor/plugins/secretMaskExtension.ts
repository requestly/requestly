import { Range } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";

class MaskCharWidget extends WidgetType {
  toDOM(): HTMLElement {
    const el = document.createElement("span");
    el.textContent = "•";
    el.style.userSelect = "none";
    return el;
  }

  eq(widget: WidgetType): boolean {
    return widget instanceof MaskCharWidget;
  }
}

export function maskInput(hidden: boolean) {
  const maskWidget = new MaskCharWidget();

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = hidden ? this.createMask(view) : Decoration.none;
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = hidden ? this.createMask(update.view) : Decoration.none;
        }
      }

      createMask(view: EditorView) {
        const widget: Range<Decoration>[] = [];

        for (let { from, to } of view.visibleRanges) {
          const text = view.state.doc.sliceString(from, to);
          for (let i = 0; i < text.length; i++) {
            if (text[i] === "\n") continue;

            const deco = Decoration.replace({
              widget: maskWidget,
            }).range(from + i, from + i + 1);

            widget.push(deco);
          }
        }

        return Decoration.set(widget);
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}
