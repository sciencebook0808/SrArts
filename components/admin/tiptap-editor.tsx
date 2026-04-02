'use client';
/**
 * components/admin/tiptap-editor.tsx
 *
 * Thin wrapper — delegates to the unified editor system.
 * Used in admin blog/artwork editor pages.
 * Preserves the original component API for backward compatibility.
 */
import { UnifiedEditor } from '@/components/editor/unified-editor';

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange, placeholder }: Props) {
  return (
    <UnifiedEditor
      content={content}
      onChange={onChange}
      mode="blog"
      placeholder={placeholder ?? 'Start writing your post…'}
      minHeight="480px"
      uploadFolder="sr_arts/admin"
      showRibbon={true}
      showBubbleMenu={true}
      showCharCount={true}
      enableAI={true}
    />
  );
}
