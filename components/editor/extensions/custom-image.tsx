'use client';
/**
 * components/editor/extensions/custom-image.tsx
 *
 * Advanced Image extension — adds resizing, caption, alignment,
 * and drag positioning on top of the base @tiptap/extension-image.
 * Renders as a React NodeView for interactive controls.
 */
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useState, useRef, useCallback } from 'react';
import { AlignLeft, AlignCenter, AlignRight, Type, Trash2, GripHorizontal } from 'lucide-react';

// ─── Node View Component ───────────────────────────────────────────────────────
function ImageNodeView({ node, updateAttributes, deleteNode, selected }: {
  node: { attrs: Record<string, unknown> };
  updateAttributes: (attrs: Record<string, unknown>) => void;
  deleteNode: () => void;
  selected: boolean;
}) {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const resizeRef = useRef<{ startX: number; startW: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const { src, alt, title, width, align, caption } = node.attrs as {
    src: string; alt?: string; title?: string;
    width?: string; align?: string; caption?: string;
  };

  const currentWidth = width ?? '100%';
  const currentAlign = align ?? 'center';

  // ── Resize via drag handle ──
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = imgRef.current?.offsetWidth ?? 400;
    resizeRef.current = { startX, startW };

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const delta = ev.clientX - resizeRef.current.startX;
      const newW = Math.max(80, resizeRef.current.startW + delta);
      updateAttributes({ width: `${newW}px` });
    };
    const onMouseUp = () => {
      resizeRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [updateAttributes]);

  const alignClass = currentAlign === 'left'
    ? 'mr-auto ml-0'
    : currentAlign === 'right'
    ? 'ml-auto mr-0'
    : 'mx-auto';

  return (
    <NodeViewWrapper
      className={`relative my-4 group ${alignClass}`}
      style={{ width: currentWidth, maxWidth: '100%' }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Floating control bar */}
      {(showControls || selected) && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-gray-900 text-white rounded-lg px-2 py-1 shadow-xl text-xs whitespace-nowrap">
          {/* Alignment */}
          <button
            type="button"
            onClick={() => updateAttributes({ align: 'left' })}
            className={`p-1 rounded hover:bg-white/20 transition-colors ${currentAlign === 'left' ? 'bg-white/30' : ''}`}
            title="Align left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ align: 'center' })}
            className={`p-1 rounded hover:bg-white/20 transition-colors ${currentAlign === 'center' ? 'bg-white/30' : ''}`}
            title="Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => updateAttributes({ align: 'right' })}
            className={`p-1 rounded hover:bg-white/20 transition-colors ${currentAlign === 'right' ? 'bg-white/30' : ''}`}
            title="Align right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-white/20 mx-1" />

          {/* Width presets */}
          {['25%', '50%', '75%', '100%'].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => updateAttributes({ width: w })}
              className={`px-1.5 py-0.5 rounded hover:bg-white/20 transition-colors text-[10px] font-mono ${currentWidth === w ? 'bg-white/30' : ''}`}
            >
              {w}
            </button>
          ))}

          <span className="w-px h-4 bg-white/20 mx-1" />

          <button
            type="button"
            onClick={() => setIsEditingCaption(v => !v)}
            className={`p-1 rounded hover:bg-white/20 transition-colors ${isEditingCaption ? 'bg-white/30' : ''}`}
            title="Add caption"
          >
            <Type className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={deleteNode}
            className="p-1 rounded hover:bg-red-500/60 transition-colors"
            title="Delete image"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Image */}
      <div className={`relative rounded-xl overflow-hidden shadow-md ${selected ? 'ring-2 ring-blue-500' : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src as string}
          alt={alt ?? ''}
          title={title ?? ''}
          className="w-full h-auto block"
          style={{ maxWidth: '100%' }}
          draggable={false}
        />

        {/* Resize handle */}
        {(showControls || selected) && (
          <div
            className="absolute bottom-2 right-2 w-6 h-6 bg-gray-900/80 text-white rounded cursor-se-resize flex items-center justify-center hover:bg-gray-900 transition-colors"
            onMouseDown={startResize}
            title="Drag to resize"
          >
            <GripHorizontal className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Caption */}
      {(isEditingCaption || caption) && (
        <div className="mt-1">
          <input
            type="text"
            placeholder="Add a caption…"
            defaultValue={caption ?? ''}
            onBlur={(e) => updateAttributes({ caption: e.target.value })}
            className="w-full text-center text-sm text-gray-500 italic bg-transparent border-0 border-b border-dashed border-gray-300 focus:outline-none focus:border-blue-400 py-1 px-2"
          />
        </div>
      )}

      {caption && !isEditingCaption && (
        <p
          className="text-center text-sm text-gray-500 italic mt-1 cursor-pointer"
          onClick={() => setIsEditingCaption(true)}
        >
          {caption}
        </p>
      )}
    </NodeViewWrapper>
  );
}

// ─── Tiptap Node Definition ────────────────────────────────────────────────────
export const CustomImage = Node.create({
  name: 'customImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: '100%' },
      align: { default: 'center' },
      caption: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="image"]',
        getAttrs: (el) => {
          const img = (el as HTMLElement).querySelector('img');
          return {
            src: img?.getAttribute('src'),
            alt: img?.getAttribute('alt'),
            title: img?.getAttribute('title'),
            width: (el as HTMLElement).style.width || '100%',
            align: (el as HTMLElement).dataset.align || 'center',
            caption: (el as HTMLElement).querySelector('figcaption')?.textContent || null,
          };
        },
      },
      { tag: 'img[src]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'figure',
      { 'data-type': 'image', 'data-align': HTMLAttributes.align, style: `width: ${HTMLAttributes.width}` },
      ['img', mergeAttributes(HTMLAttributes, { src: HTMLAttributes.src, alt: HTMLAttributes.alt })],
      HTMLAttributes.caption ? ['figcaption', {}, HTMLAttributes.caption] : ['span'],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },

  addCommands() {
    return {
      setCustomImage:
        (options: { src: string; alt?: string; title?: string; width?: string; align?: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    } as ReturnType<typeof this.addCommands>;
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customImage: {
      setCustomImage: (options: {
        src: string; alt?: string; title?: string;
        width?: string; align?: string;
      }) => ReturnType;
    };
  }
}
