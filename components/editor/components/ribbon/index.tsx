'use client';
/**
 * components/editor/components/ribbon/index.tsx
 *
 * Microsoft Word-style ribbon — tabbed toolbar with grouped actions.
 * Tabs: Home · Insert · Layout · Review · View
 */
import { useState } from 'react';
import type { Editor } from '@tiptap/core';
import type { RibbonTab } from '../../config/types';
import { HomeTab } from './home-tab';
import { InsertTab } from './insert-tab';
import { LayoutTab } from './layout-tab';
import { ReviewTab } from './review-tab';
import { ViewTab } from './view-tab';

const TABS: { id: RibbonTab; label: string }[] = [
  { id: 'home',   label: 'Home'   },
  { id: 'insert', label: 'Insert' },
  { id: 'layout', label: 'Layout' },
  { id: 'review', label: 'Review' },
  { id: 'view',   label: 'View'   },
];

interface RibbonProps {
  editor: Editor;
  uploadFolder?: string;
  enableSocial?: boolean;
  enableTables?: boolean;
  onToggleAI?: () => void;
  isAIOpen?: boolean;
  onToggleFocus?: () => void;
  isFocused?: boolean;
}

export function EditorRibbon({
  editor,
  uploadFolder = 'sr_arts',
  enableSocial,
  enableTables,
  onToggleAI,
  isAIOpen,
  onToggleFocus,
  isFocused,
}: RibbonProps) {
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');

  return (
    <div className="border-b border-gray-200 bg-white select-none sticky top-0 z-30 shadow-sm">
      {/* Tab bar */}
      <div className="flex items-center border-b border-gray-100 px-2 gap-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 text-xs font-semibold transition-all relative
              ${activeTab === tab.id
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-800'
              }
            `}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content — tool groups */}
      <div className="flex items-stretch min-h-[44px] px-1 overflow-x-auto">
        {activeTab === 'home'   && <HomeTab editor={editor} />}
        {activeTab === 'insert' && (
          <InsertTab
            editor={editor}
            uploadFolder={uploadFolder}
            enableSocial={enableSocial}
            enableTables={enableTables}
          />
        )}
        {activeTab === 'layout' && <LayoutTab editor={editor} />}
        {activeTab === 'review' && (
          <ReviewTab
            editor={editor}
            onToggleAI={onToggleAI}
            isAIOpen={isAIOpen}
          />
        )}
        {activeTab === 'view'   && (
          <ViewTab
            onToggleFocus={onToggleFocus}
            isFocused={isFocused}
          />
        )}
      </div>
    </div>
  );
}
