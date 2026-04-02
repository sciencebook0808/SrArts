/**
 * components/editor/config/types.ts
 *
 * Shared TypeScript types for the unified editor system.
 */

export type EditorMode = 'blog' | 'community' | 'minimal';

export type RibbonTab = 'home' | 'insert' | 'layout' | 'review' | 'view';

export type AICommand =
  | 'improve'
  | 'rewrite'
  | 'summarize'
  | 'expand'
  | 'shorten'
  | 'tone-professional'
  | 'tone-casual'
  | 'tone-friendly'
  | 'seo-optimize'
  | 'caption-instagram'
  | 'caption-youtube'
  | 'caption-facebook'
  | 'fix-grammar';

export interface AIRequest {
  command: AICommand;
  selectedText: string;
  fullContent?: string;
  context?: string;
}

export interface AIResponse {
  result: string;
  error?: string;
}

export interface EditorConfig {
  mode: EditorMode;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  showRibbon?: boolean;
  showBubbleMenu?: boolean;
  showCharCount?: boolean;
  showAiPanel?: boolean;
  uploadFolder?: string;
  onUploadImage?: (file: File) => Promise<string>;
}

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (editor: import('@tiptap/core').Editor) => void;
}

export interface ColorPreset {
  name: string;
  value: string;
}

export const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: 'Default', value: '' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Roboto Mono', value: '"Roboto Mono", monospace' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
];

export const FONT_SIZES = [
  '10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px',
  '24px', '28px', '32px', '36px', '40px', '48px', '56px', '64px',
];

export const LINE_HEIGHTS = [
  { label: 'Single', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: 'Double', value: '2' },
  { label: '2.5', value: '2.5' },
  { label: '3', value: '3' },
];

export const TEXT_COLORS: ColorPreset[] = [
  { name: 'Default', value: '' },
  { name: 'Black', value: '#000000' },
  { name: 'Dark Gray', value: '#374151' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Light Gray', value: '#9CA3AF' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'White', value: '#FFFFFF' },
];

export const HIGHLIGHT_COLORS: ColorPreset[] = [
  { name: 'None', value: '' },
  { name: 'Yellow', value: '#FEF08A' },
  { name: 'Lime', value: '#D9F99D' },
  { name: 'Sky', value: '#BAE6FD' },
  { name: 'Pink', value: '#FBCFE8' },
  { name: 'Orange', value: '#FED7AA' },
  { name: 'Purple', value: '#E9D5FF' },
  { name: 'Red', value: '#FECACA' },
  { name: 'Gray', value: '#E5E7EB' },
];

export const AI_COMMANDS: { value: AICommand; label: string; icon: string; group: string }[] = [
  { value: 'improve', label: 'Improve writing', icon: '✨', group: 'Edit' },
  { value: 'fix-grammar', label: 'Fix grammar', icon: '✓', group: 'Edit' },
  { value: 'rewrite', label: 'Rewrite', icon: '↺', group: 'Edit' },
  { value: 'expand', label: 'Make longer', icon: '↕', group: 'Edit' },
  { value: 'shorten', label: 'Make shorter', icon: '↑', group: 'Edit' },
  { value: 'summarize', label: 'Summarize', icon: '≡', group: 'Edit' },
  { value: 'tone-professional', label: 'Professional tone', icon: '👔', group: 'Tone' },
  { value: 'tone-casual', label: 'Casual tone', icon: '😊', group: 'Tone' },
  { value: 'tone-friendly', label: 'Friendly tone', icon: '🤝', group: 'Tone' },
  { value: 'seo-optimize', label: 'SEO optimize', icon: '🔍', group: 'Generate' },
  { value: 'caption-instagram', label: 'Instagram caption', icon: '📷', group: 'Social' },
  { value: 'caption-youtube', label: 'YouTube description', icon: '▶', group: 'Social' },
  { value: 'caption-facebook', label: 'Facebook post', icon: 'f', group: 'Social' },
];
