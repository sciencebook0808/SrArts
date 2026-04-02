'use client';
/**
 * components/editor/components/ribbon/view-tab.tsx
 */
import { Monitor, Maximize2 } from 'lucide-react';
import { useTheme } from 'next-themes';

interface Props {
  onToggleFocus?: () => void;
  isFocused?: boolean;
}

export function ViewTab({ onToggleFocus, isFocused }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-y-1 py-1 px-2">
      <div className="flex items-center gap-0.5 px-2 border-r border-gray-200">
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
        >
          <Monitor className="w-3.5 h-3.5" />
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      {onToggleFocus && (
        <div className="px-2">
          <button
            type="button"
            onClick={onToggleFocus}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              isFocused
                ? 'border-blue-400 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Focus Mode
          </button>
        </div>
      )}
    </div>
  );
}
