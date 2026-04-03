/**
 * components/editor/config/extensions.ts
 *
 * Unified extension configuration for SR Arts.
 * Import `getExtensions(mode, opts)` to get the correct extension set per context.
 *
 * ─── TIPTAP v3 MIGRATION FIXES ───────────────────────────────────────────────
 *
 *  IMPORT CHANGES (all caused build errors or silent runtime failures):
 *
 *  ❌ OLD                                        ✅ NEW (v3)
 *  import TextStyle from '...-text-style'    →  import { TextStyle } from '...-text-style'
 *  import Table from '...-table'             →  import { Table, TableRow,
 *  import TableRow from '...-table-row'           TableCell, TableHeader }
 *  import TableCell from '...-table-cell'         from '@tiptap/extension-table'
 *  import TableHeader from '...-table-header'
 *  import TaskList from '...-task-list'      →  import { TaskList, TaskItem }
 *  import TaskItem from '...-task-item'           from '@tiptap/extension-list'
 *  import CharacterCount from '...-count'    →  import { CharacterCount,
 *  import Focus from '...-focus'                  Focus, Placeholder }
 *  import Placeholder from '...-placeholder'      from '@tiptap/extensions'
 *  import Underline from '...-underline'     →  REMOVED (built into StarterKit v3)
 *  import ListKeymap from '...-list-keymap'  →  REMOVED (built into StarterKit v3)
 *
 *  STARTERKITS CONFIG CHANGES:
 *  history: { depth: 200 }                  →  undoRedo: { depth: 200 }
 *  (StarterKit v3 renamed the history option to undoRedo)
 *  + Add link: false to disable StarterKit's built-in link so our custom
 *    Link.configure(...) takes precedence without schema conflicts.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
import StarterKit from '@tiptap/starter-kit';

// ✅ v3: TextStyle is a named export (default export removed)
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';

// ✅ v3: TaskList + TaskItem consolidated into @tiptap/extension-list
import { TaskList, TaskItem } from '@tiptap/extension-list';

// ✅ v3: Table, Row, Cell, Header all named exports from @tiptap/extension-table
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';

// ✅ v3: CharacterCount, Focus, Placeholder consolidated into @tiptap/extensions
import { CharacterCount, Focus, Placeholder } from '@tiptap/extensions';

import Typography from '@tiptap/extension-typography';
// ✅ v3: Link is still a separate package (StarterKit v3 includes it but we disable
//        StarterKit's copy so we can configure it ourselves)
import Link from '@tiptap/extension-link';
import YouTube from '@tiptap/extension-youtube';

// Custom extensions (unchanged)
import { FontSize } from '../extensions/font-size';
import { LineHeight } from '../extensions/line-height';
import { BackgroundColor } from '../extensions/background-color';
import { CustomImage } from '../extensions/custom-image';
import { YouTubeBlock, InstagramBlock, FacebookBlock } from '../extensions/social-block';
import type { EditorMode } from './types';

// ── CORE bundle (always loaded) ────────────────────────────────────────────────
const CORE_EXTENSIONS = (placeholder: string) => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
    codeBlock: {},
    // ✅ v3 FIX: 'history' renamed to 'undoRedo' in StarterKit v3
    undoRedo: { depth: 200 } as Parameters<typeof StarterKit.configure>[0]['undoRedo'],
    dropcursor: { color: '#6366f1', width: 3 },
    gapcursor: true,
    // ✅ v3 FIX: Disable StarterKit's built-in Link so our custom Link.configure wins
    link: false,
    // Note: Underline and ListKeymap are now auto-included in StarterKit v3 —
    // do NOT add them separately or you get duplicate extension schema conflicts.
  }),

  Placeholder.configure({
    placeholder,
    emptyEditorClass: 'is-editor-empty',
    emptyNodeClass: 'is-empty',
  }),

  CharacterCount.configure({ limit: null }),

  Focus.configure({ className: 'has-focus', mode: 'all' }),
  // ✅ ListKeymap is now built into StarterKit v3 — removed from here
];

// ── FORMATTING bundle ──────────────────────────────────────────────────────────
// ✅ v3: Underline removed — built into StarterKit v3 now
const FORMATTING_EXTENSIONS = [
  Subscript,
  Superscript,
  Typography,
];

// ── STYLE bundle (color / font) ────────────────────────────────────────────────
const STYLE_EXTENSIONS = [
  TextStyle,   // ✅ named import
  Color,
  BackgroundColor,
  FontFamily,
  FontSize,
  LineHeight,
  Highlight.configure({ multicolor: true }),
];

// ── ALIGNMENT bundle ───────────────────────────────────────────────────────────
const ALIGNMENT_EXTENSIONS = [
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
    defaultAlignment: 'left',
  }),
];

// ── LIST bundle ────────────────────────────────────────────────────────────────
// ✅ v3: TaskList and TaskItem now imported from @tiptap/extension-list
const LIST_EXTENSIONS = [
  TaskList,
  TaskItem.configure({ nested: true }),
];

// ── LINK bundle ────────────────────────────────────────────────────────────────
const LINK_EXTENSIONS = [
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: 'https',
    HTMLAttributes: {
      class: 'editor-link',
      rel: 'noopener noreferrer',
      target: '_blank',
    },
  }),
];

// ── TABLE bundle ───────────────────────────────────────────────────────────────
// ✅ v3: All table types now named exports from @tiptap/extension-table
const TABLE_EXTENSIONS = [
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
];

// ── MEDIA bundle ───────────────────────────────────────────────────────────────
const MEDIA_EXTENSIONS = [
  CustomImage,
  YouTube.configure({
    width: 640,
    height: 480,
    allowFullscreen: true,
    nocookie: true,
  }),
];

// ── SOCIAL bundle ──────────────────────────────────────────────────────────────
const SOCIAL_EXTENSIONS = [
  YouTubeBlock,
  InstagramBlock,
  FacebookBlock,
];

// ── PUBLIC API: getExtensions(mode, options) ───────────────────────────────────
export interface ExtensionOptions {
  placeholder?: string;
  uploadFolder?: string;
  charLimit?: number | null;
  enableSocial?: boolean;
  enableTables?: boolean;
}

export function getExtensions(mode: EditorMode, opts: ExtensionOptions = {}) {
  const {
    placeholder = 'Start writing… (type "/" for commands)',
    uploadFolder = 'sr_arts',
    enableSocial = mode === 'blog',
    enableTables = mode === 'blog' || mode === 'community',
  } = opts;

  const extensions = [
    ...CORE_EXTENSIONS(placeholder),
    ...FORMATTING_EXTENSIONS,
    ...STYLE_EXTENSIONS,
    ...ALIGNMENT_EXTENSIONS,
    ...LIST_EXTENSIONS,
    ...LINK_EXTENSIONS,
    ...MEDIA_EXTENSIONS,
  ];

  if (enableTables) {
    extensions.push(...TABLE_EXTENSIONS);
  }

  if (enableSocial) {
    extensions.push(...SOCIAL_EXTENSIONS);
  }

  return extensions;
}
