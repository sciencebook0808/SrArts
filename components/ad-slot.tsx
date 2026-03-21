'use client';

export interface AdSlotProps {
  slot: string;
  format?: 'banner' | 'square' | 'rectangle';
  className?: string;
}

export function AdSlot({ slot, format = 'rectangle', className = '' }: AdSlotProps) {
  const isEnabled = !!process.env.NEXT_PUBLIC_GOOGLE_AD_CLIENT;

  if (!isEnabled) {
    return null;
  }

  // Dimension mapping for different ad formats
  const dimensions = {
    banner: { width: '728', height: '90' },
    square: { width: '300', height: '300' },
    rectangle: { width: '300', height: '250' },
  };

  const dims = dimensions[format];

  return (
    <div
      className={`flex justify-center py-4 ${className}`}
      data-ad-slot={slot}
      data-ad-format={format}
    >
      {/* Google AdSense code would be injected here */}
      <div
        className="bg-accent-subtle border border-border rounded-lg flex items-center justify-center text-muted-foreground text-xs"
        style={{ width: dims.width, height: dims.height }}
      >
        Ad Space ({format})
      </div>
    </div>
  );
}

export default AdSlot;
