import Image from "@tiptap/extension-image";
import type { Editor } from "@tiptap/react";
import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";

export function isImageNodeSelected(editor: Editor): boolean {
  const { selection } = editor.state;
  return (
    selection instanceof NodeSelection && selection.node.type.name === "image"
  );
}

export function getSelectedImageAlt(editor: Editor): string {
  const { selection } = editor.state;
  if (!(selection instanceof NodeSelection)) return "";
  if (selection.node.type.name !== "image") return "";
  const alt = selection.node.attrs.alt;
  return typeof alt === "string" ? alt : "";
}

/** Image node with reliable alt attribute + click-to-select for in-editor alt editing. */
export const EditableImage = Image.extend({
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => {
          if (!attributes.alt) return {};
          return { alt: attributes.alt };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("editableImageClickSelect"),
        props: {
          handleClickOn(view, pos, node) {
            if (node.type.name !== "image") return false;
            const tr = view.state.tr.setSelection(
              NodeSelection.create(view.state.doc, pos)
            );
            view.dispatch(tr);
            return true;
          },
        },
      }),
    ];
  },
});

export function suggestAltFromImageSrc(src: string): string {
  const fileName = src.split("/").pop() ?? "";
  const base = fileName.replace(/\.[a-z0-9]+$/i, "");
  const words = base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!words) return "";
  return words.charAt(0).toUpperCase() + words.slice(1);
}
