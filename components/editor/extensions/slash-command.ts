/**
 * components/editor/extensions/slash-command.ts
 *
 * Slash Command extension — shows a floating command menu when
 * the user types "/" at the start of a line.
 * Uses @tiptap/suggestion for the suggestion engine.
 */
import { Extension } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import { Editor, Range } from '@tiptap/core';

export interface SlashCommandItem {
  title: string;
  description: string;
  aliases?: string[];
  icon: string;
  group: string;
  command: ({ editor, range }: { editor: Editor; range: Range }) => void;
}

// ── All available slash commands ──────────────────────────────────────────────
export function getSlashCommands(): SlashCommandItem[] {
  return [
    // Text
    {
      title: 'Text',
      description: 'Plain paragraph',
      icon: 'T',
      group: 'Basic',
      aliases: ['paragraph', 'p'],
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setNode('paragraph').run(),
    },
    {
      title: 'Heading 1',
      description: 'Large section heading',
      icon: 'H1',
      group: 'Basic',
      aliases: ['h1', 'heading1', 'title'],
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run(),
    },
    {
      title: 'Heading 2',
      description: 'Medium heading',
      icon: 'H2',
      group: 'Basic',
      aliases: ['h2', 'heading2', 'subtitle'],
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run(),
    },
    {
      title: 'Heading 3',
      description: 'Small heading',
      icon: 'H3',
      group: 'Basic',
      aliases: ['h3', 'heading3'],
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run(),
    },
    // Lists
    {
      title: 'Bullet List',
      description: 'Unordered list',
      icon: '•',
      group: 'Lists',
      aliases: ['ul', 'bullets', 'list'],
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      title: 'Numbered List',
      description: 'Ordered list',
      icon: '1.',
      group: 'Lists',
      aliases: ['ol', 'numbered', 'ordered'],
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      title: 'Task List',
      description: 'Interactive checklist',
      icon: '☑',
      group: 'Lists',
      aliases: ['todo', 'task', 'check', 'checklist'],
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleTaskList().run(),
    },
    // Blocks
    {
      title: 'Blockquote',
      description: 'Highlight a quote',
      icon: '"',
      group: 'Blocks',
      aliases: ['quote', 'q'],
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setBlockquote().run(),
    },
    {
      title: 'Code Block',
      description: 'Syntax-highlighted code',
      icon: '</>',
      group: 'Blocks',
      aliases: ['code', 'pre', 'codeblock'],
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setCodeBlock().run(),
    },
    {
      title: 'Divider',
      description: 'Horizontal rule',
      icon: '—',
      group: 'Blocks',
      aliases: ['hr', 'rule', 'line', 'separator'],
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
    // Media
    {
      title: 'Table',
      description: 'Insert a table',
      icon: '▦',
      group: 'Media',
      aliases: ['table', 'grid'],
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    // Social
    {
      title: 'YouTube Block',
      description: 'YouTube video planning block',
      icon: '▶',
      group: 'Social',
      aliases: ['youtube', 'yt', 'video'],
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({ type: 'youtubeBlock', attrs: {} })
          .run(),
    },
    {
      title: 'Instagram Block',
      description: 'Instagram post planning block',
      icon: '📷',
      group: 'Social',
      aliases: ['instagram', 'ig', 'insta'],
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({ type: 'instagramBlock', attrs: {} })
          .run(),
    },
    {
      title: 'Facebook Block',
      description: 'Facebook post planning block',
      icon: 'f',
      group: 'Social',
      aliases: ['facebook', 'fb'],
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({ type: 'facebookBlock', attrs: {} })
          .run(),
    },
  ];
}

export function filterSlashCommands(query: string): SlashCommandItem[] {
  if (!query) return getSlashCommands();
  const q = query.toLowerCase();
  return getSlashCommands().filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.aliases?.some(a => a.includes(q))
  );
}

// ── Extension definition ───────────────────────────────────────────────────────
export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: {
          editor: Editor;
          range: Range;
          props: SlashCommandItem;
        }) => {
          props.command({ editor, range });
        },
      } as Partial<SuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
