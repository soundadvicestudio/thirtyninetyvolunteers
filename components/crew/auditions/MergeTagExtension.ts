import { Node, mergeAttributes } from '@tiptap/core'

// Extend TipTap's Commands interface to include the custom insertMergeTag
// command. Without this declaration, editor.commands.insertMergeTag() is
// a TypeScript error. Must appear before Node.create() — this is a
// TypeScript module augmentation, not a runtime import or type import.
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mergeTag: {
      insertMergeTag: (tag: string) => ReturnType
    }
  }
}

export const MergeTagExtension = Node.create({
  name: 'mergeTag',

  // Inline: appears within text, not as a block
  group: 'inline',
  inline: true,

  // Atom: cannot be partially selected or split. The whole node is
  // selected as a unit.
  atom: true,

  // Not draggable — keep it simple
  draggable: false,

  addAttributes() {
    return {
      tag: {
        default: null,
        // How to read the attribute from HTML
        parseHTML: (element) => element.getAttribute('data-merge-tag'),
        // How to write the attribute to HTML
        renderHTML: (attributes) => ({
          'data-merge-tag': attributes.tag,
        }),
      },
    }
  },

  // How to detect this node in pasted/loaded HTML
  parseHTML() {
    return [{ tag: 'span[data-merge-tag]' }]
  },

  // How to serialize this node to HTML. Returns [tagName, attributes,
  // textContent] — the text content IS the tag string (e.g.
  // {{auditioner_name}}) so the pill shows the tag name visually in the
  // editor.
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'merge-tag-pill',
        contenteditable: 'false',
      }),
      HTMLAttributes['data-merge-tag'] ?? '',
    ]
  },

  addCommands() {
    return {
      insertMergeTag:
        (tag: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { tag },
          })
        },
    }
  },
})
