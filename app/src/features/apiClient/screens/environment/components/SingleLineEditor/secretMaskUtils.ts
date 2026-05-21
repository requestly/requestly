import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";

export const getSecretToggleAriaLabel = (isSecretRevealed: boolean) =>
  isSecretRevealed ? "Hide secret" : "Reveal secret";

export const shouldResetSecretReveal = (isSecret: boolean) => isSecret;

export const shouldUseSecretMask = ({ isSecret, isSecretRevealed }: { isSecret: boolean; isSecretRevealed: boolean }) =>
  isSecret && !isSecretRevealed;

export const supportsTextSecurity = () =>
  typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("-webkit-text-security", "disc");

class SecretMaskWidget extends WidgetType {
  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-secret-mask-bullet";
    span.textContent = "•";
    return span;
  }
}

const buildSecretMaskDecorations = (view: EditorView) => {
  const builder = new RangeSetBuilder<Decoration>();
  const docLength = view.state.doc.length;

  for (let position = 0; position < docLength; position++) {
    builder.add(position, position + 1, Decoration.replace({ widget: new SecretMaskWidget() }));
  }

  return builder.finish();
};

export const secretMaskExtension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildSecretMaskDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildSecretMaskDecorations(update.view);
      }
    }
  },
  {
    decorations: (value) => value.decorations,
  }
);
