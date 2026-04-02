'use client';
/**
 * components/editor/components/color-picker.tsx
 * Compact swatchpad + custom hex input for text/highlight color selection.
 */
import { useState } from 'react';
import { Pipette, RotateCcw } from 'lucide-react';
import type { ColorPreset } from '../config/types';

interface ColorPickerProps {
  colors: ColorPreset[];
  value: string;
  onChange: (color: string) => void;
  onClear?: () => void;
  label?: string;
}

export function ColorPicker({ colors, value, onChange, onClear, label }: ColorPickerProps) {
  const [custom, setCustom] = useState('');

  return (
    <div className="p-3 space-y-3 w-56">
      {label && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>}

      {/* Swatches */}
      <div className="grid grid-cols-10 gap-1">
        {colors.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.name}
            onClick={() => c.value ? onChange(c.value) : onClear?.()}
            className="group relative w-5 h-5 rounded-sm border border-gray-200 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400"
            style={{ backgroundColor: c.value || 'transparent' }}
          >
            {!c.value && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="block w-0.5 h-4 bg-red-400 rotate-45 rounded-full" />
              </span>
            )}
            {value === c.value && c.value && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="block w-2 h-1 border-b-2 border-l-2 border-white -rotate-45 translate-y-[-1px]" />
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Custom hex */}
      <div className="flex items-center gap-2">
        <Pipette className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <div className="flex items-center gap-1.5 flex-1">
          <input
            type="color"
            value={value || '#000000'}
            onChange={e => onChange(e.target.value)}
            className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5"
          />
          <input
            type="text"
            placeholder="#000000"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const val = custom.startsWith('#') ? custom : `#${custom}`;
                if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                  onChange(val);
                  setCustom('');
                }
              }
            }}
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            title="Clear color"
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
