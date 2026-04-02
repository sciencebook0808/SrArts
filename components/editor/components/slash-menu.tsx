'use client';
/**
 * components/editor/components/slash-menu.tsx
 *
 * Floating slash-command picker — shown when the suggestion plugin
 * triggers (user types "/" at line start). Grouped by category.
 */
import { forwardRef, useEffect, useImperativeHandle, useState, useCallback } from 'react';
import type { SuggestionProps } from '@tiptap/suggestion';
import type { SlashCommandItem } from '../extensions/slash-command';

export interface SlashMenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

interface SlashMenuProps extends SuggestionProps<SlashCommandItem> {}

export const SlashMenu = forwardRef<SlashMenuHandle, SlashMenuProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Reset selection when items change
    useEffect(() => setSelectedIndex(0), [items]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) command(item);
      },
      [items, command]
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex(i => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex(i => (i + 1) % items.length);
          return true;
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (!items.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 text-sm text-gray-400">
          No commands found
        </div>
      );
    }

    // Group items by their group property
    const groups = items.reduce<Record<string, SlashCommandItem[]>>((acc, item) => {
      (acc[item.group] ??= []).push(item);
      return acc;
    }, {});

    let globalIdx = 0;

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden w-72 max-h-80 overflow-y-auto">
        <div className="px-2 pt-2 pb-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
            Commands
          </p>
        </div>

        {Object.entries(groups).map(([groupName, groupItems]) => (
          <div key={groupName} className="mb-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-1">
              {groupName}
            </p>
            {groupItems.map((item) => {
              const idx = globalIdx++;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => selectItem(idx)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 text-left transition-colors rounded-lg mx-1 pr-3
                    ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                  style={{ width: 'calc(100% - 8px)' }}
                >
                  {/* Icon */}
                  <span
                    className={`
                      w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                      text-sm font-bold font-mono
                      ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                    `}
                  >
                    {item.icon}
                  </span>

                  {/* Text */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 truncate">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
);

SlashMenu.displayName = 'SlashMenu';
