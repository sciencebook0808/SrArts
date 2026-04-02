/**
 * components/editor/config/extensions.ts
 *
 * Unified extension configuration — organizes all Tiptap extensions
 * into logical bundles: core, formatting, style, lists, media, tables.
 * Import `getExtensions(mode)` to get the correct set for each editor context.
 */
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import Focus from '@tiptap/extension-focus';
import Typography from '@tiptap/extension-typography';
import ListKeymap from '@tiptap/extension-list-keymap';
import Link from '@tiptap/extension-link';
import YouTube from '@tiptap/extension-youtube';

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
    // Do NOT configure codeBlock here — we use CodeBlockLowlight separately
    // but for now keep it simple without lowlight for zero-config
    codeBlock: {},
    history: { depth: 200 },
    dropcursor: { color: '#6366f1', width: 3 },
    gapcursor: true,
  }),

  // Correct Enter/Shift-Enter behavior is built into StarterKit
  // HardBreak from StarterKit handles Shift+Enter → <br>

  Placeholder.configure({
    placeholder,
    emptyEditorClass: 'is-editor-empty',
    emptyNodeClass: 'is-empty',
  }),

  CharacterCount.configure({ limit: null }),

  Focus.configure({ className: 'has-focus', mode: 'all' }),

  ListKeymap,
];

// ── FORMATTING bundle ──────────────────────────────────────────────────────────
const FORMATTING_EXTENSIONS = [
  Underline,
  Subscript,
  Superscript,
  Typography,
];

// ── STYLE bundle (color / font) ────────────────────────────────────────────────
const STYLE_EXTENSIONS = [
  TextStyle,
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
