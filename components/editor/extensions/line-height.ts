/**
 * components/editor/extensions/line-height.ts
 *
 * Custom LineHeight extension — applies line-height to block nodes
 * (paragraph, heading) via a global attribute.
 */
import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      defaultLineHeight: null,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands, editor }) => {
          return this.options.types.every((type: string) => {
            if (editor.isActive(type)) {
              return commands.updateAttributes(type, { lineHeight });
            }
            return true;
          });
        },
      unsetLineHeight:
        () =>
        ({ commands, editor }) => {
          return this.options.types.every((type: string) => {
            if (editor.isActive(type)) {
              return commands.resetAttributes(type, 'lineHeight');
            }
            return true;
          });
        },
    };
  },
});
